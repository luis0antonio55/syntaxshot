import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { vitePrerenderPlugin } from 'vite-prerender-plugin'

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
    vitePrerenderPlugin({
      renderTarget: '#root',
      additionalPrerenderRoutes: ['/docs', '/support'],
    }),
    // Make the bundled CSS non-render-blocking.
    // vite-prerender-plugin writes HTML files directly to disk after all
    // transformIndexHtml hooks, so we patch the final files in closeBundle.
    {
      name: 'non-blocking-css',
      apply: 'build',
      enforce: 'post',
      closeBundle() {
        const outDir = path.join(__dirname, 'dist')

        function patchHtml(filePath: string) {
          let html = fs.readFileSync(filePath, 'utf-8')
          const original = html

          // Drop the modulepreload for the SSR/prerender-only chunk.
          // vite-prerender-plugin registers src/prerender.tsx as a build input,
          // so Vite emits a <link rel="modulepreload"> for its chunk in every
          // HTML file. That chunk bundles react-dom/server (renderToString) and
          // is never executed on the client, so preloading it only downloads
          // dead weight — it inflates "unused JavaScript" and steals bandwidth
          // from the LCP resource. Removing the tag does not affect hydration.
          html = html.replace(
            /\s*<link rel="modulepreload"(?:\s+crossorigin)?\s+href="\/assets\/prerender-[^"]+\.js"\s*>/g,
            '',
          )

          // Replace every blocking /assets/*.css with a non-blocking preload.
          // Idempotent — skip files that already have a preload for this href.
          html = html.replace(
            /<link rel="stylesheet"(?:\s+crossorigin)?\s+href="(\/assets\/[^"]+\.css)">/g,
            (_match: string, href: string) => {
              if (html.includes(`rel="preload" as="style" href="${href}"`)) return ''
              return (
                `<link rel="preload" as="style" href="${href}" onload="this.onload=null;this.rel='stylesheet'">` +
                `<noscript><link rel="stylesheet" href="${href}"></noscript>`
              )
            },
          )

          if (html !== original) fs.writeFileSync(filePath, html, 'utf-8')
        }

        function walk(dir: string) {
          for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name)
            if (entry.isDirectory()) walk(full)
            else if (entry.name === 'index.html') patchHtml(full)
          }
        }

        walk(outDir)
      },
    },
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
