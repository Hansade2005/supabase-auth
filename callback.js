// Framework: Node.js with Hono or Express

import { Hono } from 'hono'
import { logger } from 'hono/logger'
import fetch from 'node-fetch' // If not native

const app = new Hono()

app.use('*', logger())

app.get('/supabase-auth/oauth2/callback', async (c) => {
  const url = new URL(c.req.url)
  const code = url.searchParams.get('code')
  if (!code) return c.text('No code provided', 400)

  // Prepare OAuth token exchange
  const tokenRes = await fetch('https://api.supabase.com/v1/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'https://api.optimaai.cc/supabase-auth/oauth2/callback',
      client_id: '604f0920-a5bc-4d89-8994-32c10271c68e',
      client_secret: 'sba_7a12fa8c38087f21d43fca948814427cebc8505c',
    }),
  })

  if (!tokenRes.ok) {
    const error = await tokenRes.text()
    return c.text('Token error: ' + error, 500)
  }

  const data = await tokenRes.json()
  const accessToken = data.access_token
  const refreshToken = data.refresh_token
  const expiresIn = data.expires_in

  const deepLink = `trio://supabase-oauth-return?token=${encodeURIComponent(
    accessToken
  )}&refreshToken=${encodeURIComponent(refreshToken)}&expiresIn=${expiresIn}`

  return c.redirect(deepLink)
})

export default app
