import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store',
}

// Production origins only. For local development set the Edge Function secret
// ALLOWED_ORIGINS="https://adriancaleb1428-blip.github.io,http://localhost:5173".
const allowedOrigins = new Set((Deno.env.get('ALLOWED_ORIGINS') || 'https://adriancaleb1428-blip.github.io').split(',').map(value => value.trim()).filter(Boolean))
const emailPattern = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i

function passwordProblem(password: string) {
  if (password.length < 12 || new TextEncoder().encode(password).length > 72) return 'La contraseña debe tener entre 12 y 72 caracteres.'
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) return 'La contraseña debe incluir mayúsculas, minúsculas y números.'
  return ''
}

function response(body: unknown, status = 200, origin = '') {
  const headers = new Headers(corsHeaders)
  headers.set('Access-Control-Allow-Origin', allowedOrigins.has(origin) ? origin : 'null')
  headers.set('Content-Type', 'application/json')
  return new Response(JSON.stringify(body), { status, headers })
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin') || ''
  if (request.method === 'OPTIONS') return response('ok', 200, origin)
  if (request.method !== 'POST') return response({ error: 'Método no permitido.' }, 405, origin)
  if (!allowedOrigins.has(origin)) return response({ error: 'Origen no permitido.' }, 403, origin)

  try {
    const authorization = request.headers.get('authorization')
    if (!authorization?.startsWith('Bearer ')) return response({ error: 'Inicia sesión como administrador.' }, 401, origin)
    const url = Deno.env.get('SUPABASE_URL')!
    const publishableKeys = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}')
    const secretKeys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}')
    const publishableKey = publishableKeys.default
    const secretKey = secretKeys.default
    if (!publishableKey || !secretKey) return response({ error: 'Falta configurar las claves seguras de Supabase.' }, 500, origin)

    const callerClient = createClient(url, publishableKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } })
    const token = authorization.slice('Bearer '.length)
    const { data: authData, error: authError } = await callerClient.auth.getUser(token)
    if (authError || !authData.user) return response({ error: 'La sesión no es válida. Vuelve a iniciar sesión.' }, 401, origin)

    const adminClient = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data: callerProfile, error: profileError } = await adminClient.from('profiles').select('role').eq('id', authData.user.id).single()
    if (profileError || callerProfile?.role !== 'admin') return response({ error: 'Solo un administrador puede gestionar usuarios.' }, 403, origin)

    let payload: { action?: string; email?: unknown; full_name?: unknown; password?: unknown; role?: unknown; user_id?: unknown }
    try { payload = await request.json() } catch { return response({ error: 'Solicitud inválida.' }, 400, origin) }
    const action = payload.action
    const limit = action === 'create' ? 10 : action === 'role' ? 30 : action === 'list' ? 120 : 10
    const { data: allowed, error: limitError } = await adminClient.rpc('consume_edge_rate_limit', {
      p_actor_id: authData.user.id, p_action: `admin_users.${action || 'unknown'}`, p_limit: limit, p_window_seconds: 900,
    })
    if (limitError) throw limitError
    if (!allowed) {
      await adminClient.rpc('log_security_event', { p_event_type: 'rate_limit.admin_users', p_actor_id: authData.user.id, p_metadata: { action } })
      return response({ error: 'Demasiadas solicitudes. Inténtalo nuevamente en unos minutos.' }, 429, origin)
    }
    if (action === 'list') {
      const { data: authUsers, error: listError } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 })
      if (listError) throw listError
      const ids = authUsers.users.map(user => user.id)
      const { data: profiles, error: profilesError } = ids.length
        ? await adminClient.from('profiles').select('id, full_name, role, can_create_courses, created_at').in('id', ids)
        : { data: [], error: null }
      if (profilesError) throw profilesError
      const profilesById = new Map((profiles || []).map(profile => [profile.id, profile]))
      return response({ users: authUsers.users.map(user => ({
        id: user.id,
        email: user.email,
        full_name: profilesById.get(user.id)?.full_name || user.user_metadata?.full_name || '',
        role: profilesById.get(user.id)?.role || 'student',
        can_create_courses: profilesById.get(user.id)?.can_create_courses || false,
        created_at: user.created_at,
      })) }, 200, origin)
    }

    if (action === 'create') {
      const email = String(payload.email || '').trim().toLowerCase()
      const fullName = String(payload.full_name || '').trim()
      const password = String(payload.password || '')
      const role = String(payload.role || '')
      if (!emailPattern.test(email) || email.length > 254 || fullName.length < 2 || fullName.length > 120 || !['admin', 'teacher', 'student'].includes(role)) {
        return response({ error: 'Completa nombre, correo válido y rol válido.' }, 400, origin)
      }
      const weakPassword = passwordProblem(password)
      if (weakPassword) return response({ error: weakPassword }, 400, origin)
      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      })
      if (createError || !created.user) return response({ error: createError?.message || 'No se pudo crear el usuario.' }, 400, origin)
      const { error: updateError } = await adminClient.from('profiles').update({
        full_name: fullName,
        role,
        can_create_courses: role === 'teacher',
      }).eq('id', created.user.id)
      if (updateError) {
        await adminClient.auth.admin.deleteUser(created.user.id)
        throw updateError
      }
      await adminClient.rpc('log_security_event', { p_event_type: 'admin.user_created', p_actor_id: authData.user.id, p_metadata: { target_user_id: created.user.id, role } })
      return response({ user: { id: created.user.id, email, full_name: fullName, role } }, 201, origin)
    }

    if (action === 'role') {
      const userId = String(payload.user_id || '')
      const role = String(payload.role || '')
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId) || !['admin', 'teacher', 'student'].includes(role)) {
        return response({ error: 'Selecciona un usuario y un rol válido.' }, 400, origin)
      }
      if (userId === authData.user.id && role !== 'admin') return response({ error: 'No puedes quitarte tu propio acceso de administrador.' }, 400, origin)
      const { error: roleError } = await adminClient.from('profiles').update({ role, can_create_courses: role === 'teacher' }).eq('id', userId)
      if (roleError) throw roleError
      await adminClient.rpc('log_security_event', { p_event_type: 'admin.role_changed', p_actor_id: authData.user.id, p_metadata: { target_user_id: userId, role } })
      return response({ success: true }, 200, origin)
    }

    return response({ error: 'Acción no reconocida.' }, 400, origin)
  } catch (error) {
    console.error('admin-users failed', error)
    return response({ error: 'Ocurrió un error al gestionar el usuario.' }, 500, origin)
  }
})
