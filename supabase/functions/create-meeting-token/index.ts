import { createClient } from 'npm:@supabase/supabase-js@2'
import { AccessToken } from 'npm:livekit-server-sdk@2'

const cors = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...cors, 'Content-Type': 'application/json' },
})

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405)
  const authorization = req.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) return reply({ error: 'Authentication required' }, 401)

  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY')
  const livekitUrl = Deno.env.get('LIVEKIT_URL')
  const livekitKey = Deno.env.get('LIVEKIT_API_KEY')
  const livekitSecret = Deno.env.get('LIVEKIT_API_SECRET')
  if (!url || !key || !livekitUrl || !livekitKey || !livekitSecret) return reply({ error: 'Meeting service is not configured' }, 503)

  const db = createClient(url, key, { global: { headers: { Authorization: authorization } } })
  const jwt = authorization.slice('Bearer '.length)
  const { data: authData, error: authError } = await db.auth.getUser(jwt)
  if (authError || !authData.user) return reply({ error: 'Invalid session' }, 401)

  let payload: { meetingId?: string }
  try { payload = await req.json() } catch { return reply({ error: 'Invalid JSON' }, 400) }
  if (!payload.meetingId || !/^[0-9a-f-]{36}$/i.test(payload.meetingId)) return reply({ error: 'A valid meetingId is required' }, 400)

  // The caller-scoped Supabase client enforces meeting RLS before a token is minted.
  const { data: meeting, error } = await db.from('meetings')
    .select('id, room_name, starts_at, ends_at, status')
    .eq('id', payload.meetingId).single()
  if (error || !meeting) return reply({ error: 'Meeting not found or access denied' }, 403)
  if (meeting.status !== 'scheduled') return reply({ error: 'This meeting is not available' }, 403)
  const now = Date.now()
  if (now < new Date(meeting.starts_at).getTime() - 10 * 60_000 || now > new Date(meeting.ends_at).getTime()) {
    return reply({ error: 'The meeting is outside its access window' }, 403)
  }

  const { data: profile } = await db.from('profiles').select('full_name').eq('id', authData.user.id).single()
  const token = new AccessToken(livekitKey, livekitSecret, {
    identity: authData.user.id,
    name: profile?.full_name ?? authData.user.email ?? 'Participante',
    ttl: '2h',
  })
  token.addGrant({ roomJoin: true, room: meeting.room_name, canPublish: true, canSubscribe: true, canPublishData: true })
  return reply({ serverUrl: livekitUrl, token: await token.toJwt() })
})
