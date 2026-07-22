//src/app/pages/Support.tsx
import { useState } from "react";
import { Link } from "react-router";
import { useSeo } from "../hooks/useSeo";
import {
  ArrowRight,
  Check,
  Copy,
  Mail,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { Footer, Navbar } from "./Landing";
import Turnstile from "react-turnstile";

const SUPPORT_EMAIL = "support@syntaxshot.dev";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

const INITIAL_FORM = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="space-y-2 block">
      <div className="flex items-end justify-between gap-3">
        <span
          className="text-sm font-medium"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {label}
        </span>
        {hint ? (
          <span
            className="text-[11px] uppercase tracking-[0.18em]"
            style={{ color: "#9a9a9a" }}
          >
            {hint}
          </span>
        ) : null}
      </div>
      {children}
    </label>
  );
}

export default function Support() {
  useSeo({
    title: "Support — SyntaxShot",
    description:
      "Need help with SyntaxShot? Contact our support team for CLI issues, billing, or feature requests.",
    path: "/support",
  });
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const [token, setToken] = useState("");

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setStatusMessage("Sending your message...");

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          turnstileToken: token,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "We could not send your message.");
      }

      setForm(INITIAL_FORM);
      setStatus("success");
      setStatusMessage(
        payload.message || "Message sent. We will get back to you soon.",
      );
    } catch (error) {
      const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
        form.subject || "Support request",
      )}&body=${encodeURIComponent(
        `Name: ${form.name || "-"}\nEmail: ${form.email || "-"}\n\n${form.message || ""}`,
      )}`;

      setStatus("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "We could not send the form. Your email app was opened as a fallback.",
      );
      window.location.href = mailto;
    }
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Navbar activePath="/support" />

      <main className="pt-28 pb-16 px-6">
        <section className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <div className="space-y-8">
            <div className="space-y-4">
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border"
                style={{
                  color: "#00e676",
                  borderColor: "rgba(0,230,118,0.2)",
                  background: "rgba(0,230,118,0.05)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <ShieldCheck size={12} />
                Support
              </span>

              <h1
                className="text-5xl lg:text-[3.6rem] font-bold leading-[1.05] tracking-tight max-w-xl"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  letterSpacing: "-0.03em",
                }}
              >
                Need help with your syntax screenshots?
              </h1>

              <p
                className="text-lg leading-relaxed max-w-xl"
                style={{ color: "#a3a3a3" }}
              >
                Send a message, report an issue, or ask a billing question. We
                reply from
                <span
                  className="mx-1"
                  style={{ color: "#00e676" }}
                  dangerouslySetInnerHTML={{
                    __html: `<!-- email_off -->${SUPPORT_EMAIL}<!-- /email_off -->`,
                  }}
                />{" "}
                
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div
                className="rounded-2xl p-5 border"
                style={{
                  background: "#0a0a0a",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded flex items-center justify-center"
                    style={{
                      background: "rgba(0,230,118,0.07)",
                      color: "#00e676",
                    }}
                  >
                    <Mail size={16} />
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Direct email
                    </p>
                    <p className="text-xs" style={{ color: "#9a9a9a" }}>
                      Always available
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "#f0f0f0",
                  }}
                >
                  <span
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    dangerouslySetInnerHTML={{
                      __html: `<!-- email_off -->${SUPPORT_EMAIL}<!-- /email_off -->`,
                    }}
                  />
                  <span
                    className="inline-flex items-center gap-1 text-xs"
                    style={{ color: copied ? "#00e676" : "#9e9e9e" }}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Copied" : "Copy"}
                  </span>
                </button>
              </div>

              <div
                className="rounded-2xl p-5 border"
                style={{
                  background: "#0a0a0a",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded flex items-center justify-center"
                    style={{
                      background: "rgba(0,230,118,0.07)",
                      color: "#00e676",
                    }}
                  >
                    <MessageSquareText size={16} />
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Response time
                    </p>
                    <p className="text-xs" style={{ color: "#9a9a9a" }}>
                      Typical same-day reply
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-6" style={{ color: "#a3a3a3" }}>
                  Include your operating system, the exact command you ran, and
                  any error output. That gives us the fastest path to a useful
                  answer.
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-3xl border p-6 lg:p-7"
            style={{
              background:
                "radial-gradient(ellipse at top, rgba(0,230,118,0.08), transparent 60%), #0a0a0a",
              borderColor: "rgba(0,230,118,0.14)",
              boxShadow: "0 0 48px rgba(0,230,118,0.04)",
            }}
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p
                  className="text-xs uppercase tracking-[0.2em] mb-2"
                  style={{
                    color: "#00e676",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Contact form
                </p>
                <h2
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Reach the team
                </h2>
              </div>
           
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                name="website"
                autoComplete="off"
                tabIndex={-1}
                style={{
                  position: "absolute",
                  left: "-9999px",
                  opacity: 0,
                  pointerEvents: "none",
                }}
                value={(form as any).website || ""}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    website: e.target.value,
                  }))
                }
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Name" hint="optional">
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg px-4 py-3 text-sm"
                    style={{
                      background: "#111",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "#f0f0f0",
                    }}
                    placeholder="Your name"
                  />
                </Field>

                <Field label="Email" hint="required">
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg px-4 py-3 text-sm"
                    style={{
                      background: "#111",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "#f0f0f0",
                    }}
                    placeholder="you@example.com"
                  />
                </Field>
              </div>

              <Field label="Subject" hint="required">
                <input
                  required
                  value={form.subject}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      subject: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg px-4 py-3 text-sm"
                  style={{
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "#f0f0f0",
                  }}
                  placeholder="Bug report, billing question, feature request..."
                />
              </Field>

              <Field label="Message" hint="required">
                <textarea
                  required
                  rows={7}
                  value={form.message}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      message: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg px-4 py-3 text-sm resize-none"
                  style={{
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "#f0f0f0",
                  }}
                  placeholder="Tell us what happened, what you expected, and how we can help."
                />
              </Field>
              <div className="w-full overflow-hidden flex justify-center sm:justify-start">
                <div className="origin-top scale-[0.88] sm:scale-100">
                  <Turnstile
                    sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY!}
                    onVerify={(token) => setToken(token)}
                    theme="dark"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={status === "sending" || !token}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all disabled:opacity-60"
                style={{
                  background: "#00e676",
                  color: "#080808",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {status === "sending" ? "Sending..." : "Send message"}
                <ArrowRight size={14} />
              </button>

              {statusMessage ? (
                <div
                  className="rounded-lg px-4 py-3 text-sm leading-6"
                  style={{
                    background:
                      status === "success"
                        ? "rgba(0,230,118,0.08)"
                        : status === "error"
                          ? "rgba(255,180,0,0.06)"
                          : "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "#888",
                  }}
                >
                  {statusMessage}
                </div>
              ) : null}

              <div
                className="flex flex-wrap items-center gap-3 pt-1 text-xs"
                style={{ color: "#9e9e9e" }}
              >
                <span style={{ color: "#00e676" }}>→</span>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="transition-colors hover:text-foreground"
                  dangerouslySetInnerHTML={{
                    __html: `<!-- email_off -->Email directly at ${SUPPORT_EMAIL}<!-- /email_off -->`,
                  }}
                />
              </div>
            </form>
          </div>
        </section>

      <section className="px-6 pt-6 md:pt-10 pb-16">
        <div
          className="max-w-6xl mx-auto rounded-2xl border p-6 md:p-8"
          style={{
            background: "#0a0a0a",
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p
                className="text-xs uppercase tracking-[0.2em] mb-2"
                style={{
                  color: "#00e676",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                Support tips
              </p>
              <h2
                className="text-2xl font-bold mb-2"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  letterSpacing: "-0.02em",
                }}
              >
                The faster you share details, the faster we can help.
              </h2>
              <p className="text-sm max-w-2xl" style={{ color: "#a3a3a3" }}>
                If something failed in the CLI, send the command, terminal
                output, OS version, and the file path or folder you were trying
                to capture.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/docs"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "#f0f0f0",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Read the docs
              </Link>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                style={{
                  background: "#00e676",
                  color: "#080808",
                  fontFamily: "'Outfit', sans-serif",
                }}
                dangerouslySetInnerHTML={{
                  __html: `<!-- email_off -->Open email app<!-- /email_off -->`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Common questions ── */}
      <section className="px-6 pt-10 md:pt-14 pb-20 border-t border-border mt-4">
        <div className="max-w-6xl mx-auto">
          <p
            className="text-xs font-medium tracking-widest uppercase mb-3"
            style={{
              color: "#00e676",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Common questions
          </p>
          <h2
            className="text-2xl font-bold mb-8 tracking-tight"
            style={{
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Before you reach out, check these first.
          </h2>
          <div className="grid md:grid-cols-2 gap-6" style={{ color: "#888" }}>
            {[
              {
                q: "Where do I find my license key?",
                a: "Your license key is emailed to you immediately after purchase. Search your inbox for an email from support@syntaxshot.dev. If it hasn't arrived within a few minutes, check your spam folder.",
              },
              {
                q: "How do I activate Pro on a new machine?",
                a: "Run syntaxshot login SYNX-XXXX-XXXX-XXXX in your terminal. The key validates against the license server and caches the result locally. You can activate the same key on multiple machines for personal use.",
              },
              {
                q: "The CLI command is not found after install.",
                a: "Make sure your global npm bin directory is in your PATH. Run npm bin -g to find the path, then add it to your shell profile (~/.zshrc or ~/.bashrc) and restart your terminal.",
              },
              {
                q: "Does SyntaxShot work offline?",
                a: "Free plan features work fully offline. Pro features rely on a license check every 24 hours, but a previously validated license stays active for up to 7 days without a network connection.",
              },
            ].map(({ q, a }) => (
              <div
                key={q}
                className="rounded-xl p-6 space-y-2"
                style={{
                  background: "#0a0a0a",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p
                  className="text-sm font-semibold"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    color: "#f0f0f0",
                  }}
                >
                  {q}
                </p>
                <p className="text-sm leading-6">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
}
