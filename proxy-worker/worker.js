// ===== Cloudflare Worker: Typhoon API Proxy =====
// Key อยู่ใน Cloudflare env secret (ไม่ส่งไป browser)
// Deploy: npx wrangler deploy
// Set key: npx wrangler secret put TYPHOON_API_KEY

const TYPHOON_API_URL = 'https://api.opentyphoon.ai/v1/chat/completions'

// อนุญาตเฉพาะ domain ของเรา
const ALLOWED_ORIGINS = [
  'https://orapina.github.io',
  'http://localhost:3000',
  'http://localhost:8000',
]

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

// Simple in-memory rate limit (per worker instance)
const rateMap = new Map()
function checkRate(ip) {
  const now = Date.now()
  const window = 60_000 // 1 minute
  const maxReqs = 20     // 20 req/min per IP

  const entry = rateMap.get(ip) || { count: 0, start: now }
  if (now - entry.start > window) {
    entry.count = 1
    entry.start = now
  } else {
    entry.count++
  }
  rateMap.set(ip, entry)

  // Cleanup old entries periodically
  if (rateMap.size > 10000) {
    for (const [k, v] of rateMap) {
      if (now - v.start > window) rateMap.delete(k)
    }
  }

  return entry.count <= maxReqs
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''
    const cors = corsHeaders(origin)

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: cors })
    }

    // Check origin
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response('Forbidden', { status: 403, headers: cors })
    }

    // Rate limit
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    if (!checkRate(ip)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded — รอสักครู่' }), {
        status: 429,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    // Check API key is configured
    if (!env.TYPHOON_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    try {
      // Forward request to Typhoon (inject key server-side)
      const body = await request.json()

      // Sanitize: only allow expected fields
      const safeBody = {
        model: body.model || 'typhoon-v2-70b-instruct',
        messages: body.messages,
        temperature: Math.min(2, Math.max(0, Number(body.temperature) || 0.7)),
        max_tokens: Math.min(4096, Math.max(1, Number(body.max_tokens) || 1024)),
      }

      const typhoonRes = await fetch(TYPHOON_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.TYPHOON_API_KEY}`,
        },
        body: JSON.stringify(safeBody),
      })

      const data = await typhoonRes.text()
      return new Response(data, {
        status: typhoonRes.status,
        headers: {
          ...cors,
          'Content-Type': 'application/json',
        },
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Proxy error' }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }
  },
}
