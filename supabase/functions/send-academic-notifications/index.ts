import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  Vary: 'Origin',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store',
}

// Production origins only; see admin-users for the ALLOWED_ORIGINS secret.
const allowedOrigins = new Set((Deno.env.get('ALLOWED_ORIGINS') || 'https://adriancaleb1428-blip.github.io').split(',').map(value => value.trim()).filter(Boolean))

function respond(body: unknown, status = 200, origin = '') {
  const headers = new Headers(corsHeaders)
  headers.set('Access-Control-Allow-Origin', allowedOrigins.has(origin) ? origin : 'null')
  headers.set('Content-Type', 'application/json')
  return new Response(JSON.stringify(body), { status, headers })
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)
}

Deno.serve(async request => {
  const origin = request.headers.get('origin') || ''
  if (request.method === 'OPTIONS') return respond('ok', 200, origin)
  if (request.method !== 'POST') return respond({ error: 'Método no permitido.' }, 405, origin)
  if (!allowedOrigins.has(origin)) return respond({ error: 'Origen no permitido.' }, 403, origin)

  try {
    const authorization = request.headers.get('authorization')
    if (!authorization?.startsWith('Bearer ')) return respond({ error: 'Inicia sesión para enviar avisos del curso.' }, 401, origin)

    const url = Deno.env.get('SUPABASE_URL') || ''
    const publishableKey = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}').default
    const secretKey = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}').default
    const resendKey = Deno.env.get('RESEND_API_KEY')
    const sender = Deno.env.get('RESEND_FROM_EMAIL')
    if (!url || !publishableKey || !secretKey) return respond({ error: 'Falta configurar Supabase en la función.' }, 500, origin)
    if (!resendKey || !sender) return respond({ error: 'El correo institucional todavía no está configurado.' }, 503, origin)

    const callerClient = createClient(url, publishableKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } })
    const token = authorization.slice('Bearer '.length)
    const { data: authData, error: authError } = await callerClient.auth.getUser(token)
    if (authError || !authData.user) return respond({ error: 'La sesión no es válida.' }, 401, origin)

    const adminClient = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } })
    let payload: { resource_type?: unknown; resource_id?: unknown }
    try { payload = await request.json() } catch { return respond({ error: 'Solicitud inválida.' }, 400, origin) }
    const resourceType = payload.resource_type === 'material' ? 'material' : payload.resource_type === 'meeting' ? 'meeting' : null
    const resourceId = String(payload.resource_id || '')
    if (!resourceType || !/^[0-9a-f-]{36}$/i.test(resourceId)) return respond({ error: 'El recurso no es válido.' }, 400, origin)

    const table = resourceType === 'material' ? 'materials' : 'meetings'
    const fields = resourceType === 'material' ? 'id, course_id, title, is_published' : 'id, course_id, title, starts_at, status'
    const { data: resource, error: resourceError } = await adminClient.from(table).select(fields).eq('id', resourceId).single()
    if (resourceError || !resource || (resourceType === 'material' && !resource.is_published) || (resourceType === 'meeting' && resource.status !== 'scheduled')) {
      return respond({ error: 'No se encontró una publicación activa para enviar.' }, 404, origin)
    }

    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', authData.user.id).single()
    let canManage = profile?.role === 'admin'
    if (!canManage) {
      const { data: course } = await adminClient.from('courses').select('created_by').eq('id', resource.course_id).single()
      canManage = course?.created_by === authData.user.id
      if (!canManage) {
        const { data: instructor } = await adminClient.from('course_instructors').select('can_manage').eq('course_id', resource.course_id).eq('instructor_id', authData.user.id).maybeSingle()
        canManage = instructor?.can_manage === true
      }
    }
    if (!canManage) return respond({ error: 'No tienes permiso para enviar avisos de este curso.' }, 403, origin)
    const { data: allowed, error: limitError } = await adminClient.rpc('consume_edge_rate_limit', {
      p_actor_id: authData.user.id, p_action: 'notifications.send_email', p_limit: 20, p_window_seconds: 900,
    })
    if (limitError) throw limitError
    if (!allowed) {
      await adminClient.rpc('log_security_event', { p_event_type: 'rate_limit.notifications', p_actor_id: authData.user.id, p_metadata: { resource_type: resourceType } })
      return respond({ error: 'Demasiadas solicitudes. Inténtalo nuevamente en unos minutos.' }, 429, origin)
    }

    const kind = resourceType === 'material' ? 'material_published' : 'meeting_scheduled'
    const { data: notices, error: noticesError } = await adminClient.from('notifications').select('id, user_id, title, body').eq('resource_type', resourceType).eq('resource_id', resourceId).eq('kind', kind)
    if (noticesError) throw noticesError
    if (!notices?.length) return respond({ sent: 0 }, 200, origin)

    const deliveryLedger = adminClient.from('notification_email_deliveries')
    const { data: priorDeliveries, error: deliveriesError } = await deliveryLedger.select('notification_id').in('notification_id', notices.map(item => item.id))
    if (deliveriesError) throw deliveriesError
    const delivered = new Set((priorDeliveries || []).map(item => item.notification_id))
    const pending = notices.filter(item => !delivered.has(item.id))
    let sent = 0

    for (const notice of pending) {
      const { data: userResult, error: userError } = await adminClient.auth.admin.getUserById(notice.user_id)
      if (userError || !userResult.user.email) continue
      const subject = notice.title
      const text = notice.body || 'Hay una nueva actualización disponible en tu aula virtual.'
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: sender,
          to: [userResult.user.email],
          subject,
          text: `${text}\n\nIngresa al Aula Consulting para revisar el aviso.`,
          html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;color:#12304a"><p style="color:#1767bd;font-size:12px;font-weight:bold;letter-spacing:1px">AULA CONSULTING · PROTEQLIFE</p><h1 style="font-size:22px">${escapeHtml(subject)}</h1><p style="font-size:15px;line-height:1.6">${escapeHtml(text)}</p><p style="color:#718292;font-size:13px">Ingresa al Aula Consulting para revisar el aviso.</p></div>`,
        }),
      })
      if (!response.ok) continue
      const { error: saveError } = await deliveryLedger.upsert({ notification_id: notice.id, sent_at: new Date().toISOString() })
      if (saveError) throw saveError
      sent += 1
    }
    await adminClient.rpc('log_security_event', { p_event_type: 'notifications.email_sent', p_actor_id: authData.user.id, p_metadata: { resource_type: resourceType, sent, queued: notices.length } })
    return respond({ sent, queued: notices.length }, 200, origin)
  } catch (error) {
    console.error('send-academic-notifications failed', error)
    return respond({ error: 'No se pudieron enviar todos los correos.' }, 500, origin)
  }
})
