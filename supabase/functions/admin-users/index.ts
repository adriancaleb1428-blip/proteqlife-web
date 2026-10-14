import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
}

function response(body: unknown, status = 200, origin = '') {
  const allowedOrigins = new Set([
    'https://adriancaleb1428-blip.github.io',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ])
  const headers = new Headers(corsHeaders)
  headers.set('Access-Control-Allow-Origin', allowedOrigins.has(origin) ? origin : 'null')
  headers.set('Content-Type', 'application/json')
  return new Response(JSON.stringify(body), { status, headers })
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin') || ''
  if (request.method === 'OPTIONS') return response('ok', 200, origin)
  if (request.method !== 'POST') return response({ error: 'Método no permitido.' }, 405, origin)

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

    const payload = await request.json()
    if (payload.action === 'list') {
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

    if (payload.action === 'create') {
      const email = String(payload.email || '').trim().toLowerCase()
      const fullName = String(payload.full_name || '').trim()
      const password = String(payload.password || '')
      const role = payload.role
      if (!email || !fullName || password.length < 8 || !['admin', 'teacher', 'student'].includes(role)) {
        return response({ error: 'Completa nombre, correo, contraseña (mínimo 8 caracteres) y rol válido.' }, 400, origin)
      }
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
      return response({ user: { id: created.user.id, email, full_name: fullName, role } }, 201, origin)
    }

    if (payload.action === 'role') {
      const userId = String(payload.user_id || '')
      const role = payload.role
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId) || !['admin', 'teacher', 'student'].includes(role)) {
        return response({ error: 'Selecciona un usuario y un rol válido.' }, 400, origin)
      }
      if (userId === authData.user.id && role !== 'admin') return response({ error: 'No puedes quitarte tu propio acceso de administrador.' }, 400, origin)
      const { error: roleError } = await adminClient.from('profiles').update({ role, can_create_courses: role === 'teacher' }).eq('id', userId)
      if (roleError) throw roleError
      return response({ success: true }, 200, origin)
    }

    return response({ error: 'Acción no reconocida.' }, 400, origin)
  } catch (error) {
    console.error('admin-users failed', error)
    return response({ error: 'Ocurrió un error al gestionar el usuario.' }, 500, origin)
  }
})
