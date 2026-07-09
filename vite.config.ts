import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

type SupportPayload = {
  name?: string
  email?: string
  subject?: string
  message?: string
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

type ResendEnv = {
  apiKey?: string
  fromEmail?: string
  supportEmail?: string
}

async function handleSupportRequest(request: Request, env: ResendEnv) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, message: 'Method not allowed.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', Allow: 'POST' },
    })
  }

  const apiKey = env.apiKey
  const fromEmail = env.fromEmail
  const supportEmail = env.supportEmail || 'support@syntaxshot.dev'

  if (!apiKey || !fromEmail) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: 'Missing Resend configuration: RESEND_API_KEY or RESEND_FROM_EMAIL.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  let body: SupportPayload = {}
  try {
    body = (await request.json()) as SupportPayload
  } catch {
    body = {}
  }

  const name = (body.name || '').trim()
  const email = (body.email || '').trim()
  const subject = (body.subject || '').trim()
  const message = (body.message || '').trim()

  if (!email || !subject || !message) {
    return new Response(
      JSON.stringify({ ok: false, message: 'Email, subject and message are required.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: supportEmail,
      subject: `[Support] ${subject}`,
      reply_to: email,
      text: [`Name: ${name || '-'}`, `Email: ${email}`, '', message].join('\n'),
      html: `
        <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #111;">
          <p><strong>Name:</strong> ${escapeHtml(name || '-')}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
          <hr />
          <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
        </div>
      `,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown Resend error')
    return new Response(JSON.stringify({ ok: false, message: `Resend request failed: ${errorText}` }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ ok: true, message: `Message sent to ${supportEmail}.` }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const resendEnv: ResendEnv = {
    apiKey: env.RESEND_API_KEY,
    fromEmail: env.RESEND_FROM_EMAIL,
    supportEmail: env.SUPPORT_EMAIL,
  }

  return {
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    {
      name: 'support-api-dev-server',
      configureServer(server) {
        server.middlewares.use('/api/support', async (req, res, next) => {
          if (req.method !== 'POST') {
            next()
            return
          }

          const chunks: Buffer[] = []

          req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
          req.on('end', async () => {
            try {
              const request = new Request('http://localhost/api/support', {
                method: 'POST',
                headers: new Headers({ 'Content-Type': req.headers['content-type'] || 'application/json' }),
                body: Buffer.concat(chunks).toString('utf8'),
              })

              const response = await handleSupportRequest(request, resendEnv)
              res.statusCode = response.status
              response.headers.forEach((value, key) => res.setHeader(key, value))
              res.end(await response.text())
            } catch (error) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: false, message: error instanceof Error ? error.message : 'Unknown support error' }))
            }
          })
        })
      },
      configurePreviewServer(server) {
        server.middlewares.use('/api/support', async (req, res, next) => {
          if (req.method !== 'POST') {
            next()
            return
          }

          const chunks: Buffer[] = []

          req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
          req.on('end', async () => {
            try {
              const request = new Request('http://localhost/api/support', {
                method: 'POST',
                headers: new Headers({ 'Content-Type': req.headers['content-type'] || 'application/json' }),
                body: Buffer.concat(chunks).toString('utf8'),
              })

              const response = await handleSupportRequest(request, resendEnv)
              res.statusCode = response.status
              response.headers.forEach((value, key) => res.setHeader(key, value))
              res.end(await response.text())
            } catch (error) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: false, message: error instanceof Error ? error.message : 'Unknown support error' }))
            }
          })
        })
      },
    },
  ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
