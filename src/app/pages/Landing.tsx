import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import {
  Check,
  Camera,
  FolderOpen,
  Zap,
  ArrowRight,
  Clipboard,
  GitBranch,
  Shield,
  FileImage,
  Palette,
  Terminal,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Docs", to: "/docs" },
  { label: "GitHub", to: "https://github.com/luis0antonio55/syntaxshot" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Install",
    cmd: "npm install -g syntaxshot",
    desc: "One-time global install. Ships prebuilt binaries — no Cairo, GTK or Visual Studio Build Tools needed.",
  },
  {
    step: "02",
    title: "Configure",
    cmd: "syntaxshot init",
    desc: "Creates a .syntaxshotrc.json with your defaults: theme, format, output folder and font size.",
  },
  {
    step: "03",
    title: "Capture",
    cmd: "syntaxshot path/to/file.js",
    desc: "Pass a file and get a syntax-highlighted image in ./syntaxshots. On Pro, pass a folder instead.",
  },
];

const FEATURES_FREE = [
  "Individual file capture",
  "10 screenshots / month",
  "PNG + JPG export",
  "3 built-in themes",
  "Config via .syntaxshotrc.json",
];

const FEATURES_PRO = [
  "Unlimited screenshots",
  "Folder scan (syntaxshot ./src)",
  "Git auto-detection (--auto flag)",
  "PNG + JPG + SVG export",
  "All themes + future releases",
  "Commercial use",
  "Priority support",
];

const FEATURE_CARDS = [
  {
    icon: <Terminal size={18} />,
    title: "Single-file capture",
    body: "Pass any file path and get a pixel-perfect image instantly. Works with any language shiki supports.",
    badge: "Free + Pro",
  },
  {
    icon: <FolderOpen size={18} />,
    title: "Folder scan",
    body: "Run syntaxshot ./src to walk the entire folder, skip noise (node_modules, lockfiles, .env) and confirm before generating.",
    badge: "Pro",
  },
  {
    icon: <GitBranch size={18} />,
    title: "Git auto-detection",
    body: "Use --auto to screenshot only the files changed since the last commit. Perfect for reviews.",
    badge: "Pro",
  },
  {
    icon: <FileImage size={18} />,
    title: "Multiple formats",
    body: "Export to PNG or JPG on any plan. SVG (infinite scale, zero pixelation) is a Pro-only format.",
    badge: "Free + Pro",
  },
  {
    icon: <Palette size={18} />,
    title: "Built-in themes",
    body: "midnight (Dracula-style), nord (blue-gray) and solar (Solarized Light). Pro gets every new theme on release.",
    badge: "Free + Pro",
  },
  {
    icon: <Shield size={18} />,
    title: "Zero native deps",
    body: "Built on @napi-rs/canvas with prebuilt binaries for Windows, macOS and Linux. No painful native compilation.",
    badge: "Free + Pro",
  },
];

const PRO_BILLING = [
  { id: "monthly", label: "Monthly", price: "$7", sub: "per month" },
  { id: "quarterly", label: "Quarterly", price: "$18", sub: "per 3 months" },
  { id: "annual", label: "Annual", price: "$60", sub: "per year" },
] as const;

type BillingId = (typeof PRO_BILLING)[number]["id"];

// ─── Small components ─────────────────────────────────────────────────────────

function CodeWindow({ lines }: { lines: { tokens: { text: string; color: string }[] }[] }) {
  return (
    <div
      className="rounded-lg border border-border overflow-hidden text-xs"
      style={{ fontFamily: "'JetBrains Mono', monospace", background: "#0a0a0a" }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3 border-b border-border"
        style={{ background: "#111" }}
      >
        <span className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
        <span className="ml-3 text-[11px]" style={{ color: "#555" }}>
          src/components/Button.tsx
        </span>
      </div>
      <div className="p-5 space-y-1 leading-5">
        {lines.map((line, i) => (
          <div key={i} className="flex items-start gap-4">
            <span className="select-none w-5 text-right shrink-0" style={{ color: "#2a2a2a" }}>
              {i + 1}
            </span>
            <span>
              {line.tokens.map((tok, j) =>
                tok.text ? (
                  <span key={j} style={{ color: tok.color }}>
                    {tok.text}
                  </span>
                ) : null
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
      style={{ color: "#00e676", borderColor: "rgba(0,230,118,0.2)", background: "rgba(0,230,118,0.05)" }}
    >
      {children}
    </span>
  );
}

function BadgePill({ label }: { label: string }) {
  const isPro = label === "Pro";
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{
        background: isPro ? "rgba(0,230,118,0.12)" : "rgba(255,255,255,0.06)",
        color: isPro ? "#00e676" : "#666",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {label}
    </span>
  );
}

const CODE_LINES = [
  { tokens: [{ text: "import", color: "#c792ea" }, { text: " React ", color: "#82aaff" }, { text: "from", color: "#c792ea" }, { text: " 'react'", color: "#c3e88d" }] },
  { tokens: [{ text: "", color: "" }] },
  { tokens: [{ text: "interface", color: "#c792ea" }, { text: " ButtonProps ", color: "#ffcb6b" }, { text: "{", color: "#f0f0f0" }] },
  { tokens: [{ text: "  label", color: "#f07178" }, { text: ": ", color: "#f0f0f0" }, { text: "string", color: "#82aaff" }, { text: ";", color: "#f0f0f0" }] },
  { tokens: [{ text: "  onClick", color: "#f07178" }, { text: ": () => ", color: "#f0f0f0" }, { text: "void", color: "#82aaff" }, { text: ";", color: "#f0f0f0" }] },
  { tokens: [{ text: "}", color: "#f0f0f0" }] },
  { tokens: [{ text: "", color: "" }] },
  { tokens: [{ text: "export function ", color: "#c792ea" }, { text: "Button", color: "#82aaff" }, { text: "({ label, onClick }: ButtonProps) {", color: "#f0f0f0" }] },
  { tokens: [{ text: "  return ", color: "#c792ea" }, { text: "(", color: "#f0f0f0" }] },
  { tokens: [{ text: "    <", color: "#f0f0f0" }, { text: "button", color: "#f07178" }, { text: " onClick", color: "#82aaff" }, { text: "={onClick}>", color: "#f0f0f0" }] },
  { tokens: [{ text: "      ", color: "#f0f0f0" }, { text: "{label}", color: "#c3e88d" }] },
  { tokens: [{ text: "    </", color: "#f0f0f0" }, { text: "button", color: "#f07178" }, { text: ">", color: "#f0f0f0" }] },
  { tokens: [{ text: "  )", color: "#f0f0f0" }] },
  { tokens: [{ text: "}", color: "#f0f0f0" }] },
];

// ─── Navbar (shared) ──────────────────────────────────────────────────────────

export function Navbar({ activePath }: { activePath?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-border h-14"
      style={{ background: "rgba(8,8,8,0.88)", backdropFilter: "blur(14px)" }}
    >
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Camera size={17} style={{ color: "#00e676" }} />
          <span
            className="text-base font-semibold"
            style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}
          >
            SyntaxShot
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className="text-sm transition-colors hover:text-foreground"
              style={{ color: activePath === l.to ? "#f0f0f0" : "#666" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/#pricing"
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-1.5 rounded text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{ background: "#00e676", color: "#080808", fontFamily: "'Outfit', sans-serif" }}
          >
            Get started
          </Link>
          <button
            className="md:hidden p-1 text-sm"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ color: "#666" }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border px-6 py-4 flex flex-col gap-4" style={{ background: "#080808" }}>
          {NAV_LINKS.map((l) => (
            <Link key={l.label} to={l.to} className="text-sm" style={{ color: "#666" }}>{l.label}</Link>
          ))}
          <Link
            to="/docs"
            className="inline-flex items-center justify-center px-4 py-2 rounded text-sm font-semibold"
            style={{ background: "#00e676", color: "#080808", fontFamily: "'Outfit', sans-serif" }}
          >
            Get started
          </Link>
        </div>
      )}
    </header>
  );
}

// ─── Footer (shared) ──────────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer className="border-t border-border py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Camera size={15} style={{ color: "#00e676" }} />
          <span
            className="text-sm font-semibold"
            style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.01em" }}
          >
            SyntaxShot
          </span>
          <span className="text-xs ml-2" style={{ color: "#333" }}>© 2026</span>
        </div>
        <nav className="flex flex-wrap gap-6">
          {NAV_LINKS.map((l) =>
            l.to && l.to.startsWith("http") ? (
              <a
                key={l.label}
                href={l.to}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs transition-colors hover:text-foreground"
                style={{ color: "#444" }}
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.label}
                to={l.to}
                className="text-xs transition-colors hover:text-foreground"
                style={{ color: "#444" }}
              >
                {l.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </footer>
  );
}

// ─── Landing page ─────────────────────────────────────────────────────────────

export default function Landing() {
  const [billing, setBilling] = useState<BillingId>("monthly");
  const [typedCmd, setTypedCmd] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fullCmd = "syntaxshot ./src --theme midnight";

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTypedCmd(fullCmd.slice(0, i));
      if (i >= fullCmd.length) clearInterval(id);
    }, 55);
    return () => clearInterval(id);
  }, []);

  // Scroll to a section when navigated with a hash or ?scroll=section
  const location = useLocation();
  useEffect(() => {
    try {
      const hash = location.hash;
      const params = new URLSearchParams(location.search || "");
      const scrollTarget = hash?.replace("#", "") || params.get("scroll");
      if (!scrollTarget) return;
      const el = document.getElementById(scrollTarget);
      if (el) {
        // small timeout ensures element is present after route mount
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      }
    } catch (e) {
      // ignore in non-browser environments
    }
  }, [location]);

  useEffect(() => {
    if (!copiedId) return;
    const id = window.setTimeout(() => setCopiedId(null), 1400);
    return () => window.clearTimeout(id);
  }, [copiedId]);

  const copyInstallCommand = async (id: string) => {
    try {
      await navigator.clipboard.writeText("npm install -g syntaxshot-cli");
      setCopiedId(id);
    } catch {
      // ignore
    }
  };

  const selected = PRO_BILLING.find((b) => b.id === billing)!;

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar activePath="/" />

      {/* ── Hero ── */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <Pill>
              <Zap size={11} />
              Built on shiki + @napi-rs/canvas
            </Pill>

            <h1
              className="text-5xl lg:text-[3.6rem] font-bold leading-[1.07] tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.03em" }}
            >
              Code screenshots
              <br />
              from your{" "}
              <span style={{ color: "#00e676" }}>terminal.</span>
            </h1>

            <p className="text-lg leading-relaxed max-w-md" style={{ color: "#777" }}>
              Generate real syntax-highlighted images without touching a browser.
              One command per file on Free, full folder scan on Pro.
            </p>

            <div
              className="rounded-lg border border-border p-4 space-y-2"
              style={{ background: "#0a0a0a", fontFamily: "'JetBrains Mono', monospace" }}
            >
              <div className="text-xs" style={{ color: "#333" }}>~ my-project</div>
              <div className="flex items-center gap-2 text-sm">
                <span style={{ color: "#00e676" }}>$</span>
                <span style={{ color: "#f0f0f0" }}>{typedCmd}</span>
              </div>
              {typedCmd.length === fullCmd.length && (
                <div className="pt-1 space-y-1">
                  <div className="text-xs" style={{ color: "#444" }}>Scanning ./src… 23 capturable files found.</div>
                  <div className="text-xs" style={{ color: "#444" }}>Generate 23 images? (y/n)</div>
                  <div className="text-xs flex items-center gap-1.5">
                    <span style={{ color: "#00e676" }}>✓</span>
                    <span style={{ color: "#f0f0f0" }}>
                      23 images saved to{" "}
                      <span style={{ color: "#82aaff" }}>./syntaxshots/</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 flex-wrap">
          
              <div className="relative inline-flex items-center">
                <button
                  type="button"
                  onClick={() => copyInstallCommand("hero")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-medium border border-border transition-all hover:border-white/20"
                  style={{ color: "#888", fontFamily: "'Outfit', sans-serif" }}
                >
                  <Clipboard size={13} /> Try for free:
                  <br />npm install -g syntaxshot-cli
                </button>
                <span
                  className={`text-[11px] font-medium ml-3 transition-opacity duration-200 ${copiedId === "hero" ? "opacity-100" : "opacity-0"}`}
                  style={{ color: "#00e676", fontFamily: "'JetBrains Mono', monospace" }}
                  aria-live="polite"
                >
                  Copied
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-8 rounded-3xl blur-3xl opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 60% 30%, #00e676, transparent 60%)" }}
            />
            <CodeWindow lines={CODE_LINES} />
            <div
              className="absolute -bottom-4 -right-2 px-3 py-2 rounded-lg border border-border text-xs flex items-center gap-2"
              style={{ background: "#111", fontFamily: "'JetBrains Mono', monospace" }}
            >
              <span style={{ color: "#00e676" }}>✓</span>
              <span style={{ color: "#aaa" }}>Button.tsx.png saved</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="border-y border-border py-5" style={{ background: "#0a0a0a" }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between flex-wrap gap-6">
          {[
            { label: "Themes", value: "midnight · nord · solar" },
            { label: "Formats", value: "PNG · JPG · SVG" },
            { label: "Platforms", value: "Windows · macOS · Linux" },
            { label: "Native deps", value: "Zero" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-0.5">
              <div className="text-xs" style={{ color: "#444", fontFamily: "'JetBrains Mono', monospace" }}>{s.label}</div>
              <div className="text-sm font-semibold" style={{ fontFamily: "'Outfit', sans-serif", color: "#f0f0f0" }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: "#00e676", fontFamily: "'JetBrains Mono', monospace" }}>
              How it works
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.025em" }}>
              Up and running in three steps.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.step}
                className="p-8 space-y-4 transition-colors cursor-default"
                style={{ background: "#080808" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#0d0d0d")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#080808")}
              >
                <div className="text-4xl font-black" style={{ fontFamily: "'Outfit', sans-serif", color: "#1a1a1a" }}>{step.step}</div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>{step.title}</h3>
                <div
                  className="rounded px-3 py-2 text-sm"
                  style={{ fontFamily: "'JetBrains Mono', monospace", background: "#0a0a0a", color: "#00e676", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  {step.cmd}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#555" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14 max-w-xl">
            <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: "#00e676", fontFamily: "'JetBrains Mono', monospace" }}>
              Features
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.025em" }}>
              Everything you need,{" "}
              <span style={{ color: "#333" }}>nothing you don't.</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
            {FEATURE_CARDS.map((f) => (
              <div
                key={f.title}
                className="p-7 space-y-3 transition-colors cursor-default"
                style={{ background: "#080808" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#0d0d0d")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#080808")}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded flex items-center justify-center shrink-0" style={{ background: "rgba(0,230,118,0.07)", color: "#00e676" }}>
                    {f.icon}
                  </div>
                  <BadgePill label={f.badge} />
                </div>
                <h3 className="text-base font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#555" }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: "#00e676", fontFamily: "'JetBrains Mono', monospace" }}>
              Pricing
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.025em" }}>
              Simple, transparent pricing.
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="rounded-xl p-7 flex flex-col gap-6" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Free</p>
                <p className="text-xs" style={{ color: "#555" }}>No credit card. No expiry.</p>
              </div>
              <div>
                <div className="text-4xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.03em" }}>$0</div>
                <div className="text-xs mt-1" style={{ color: "#444" }}>forever</div>
              </div>
              <ul className="space-y-3 flex-1">
                {FEATURES_FREE.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "#777" }}>
                    <Check size={13} className="mt-0.5 shrink-0" style={{ color: "#00e676" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => copyInstallCommand("pricing-free")}
                  className="w-full py-2.5 rounded text-sm font-semibold transition-all hover:opacity-80 active:scale-95"
                  style={{ fontFamily: "'Outfit', sans-serif", background: "rgba(255,255,255,0.05)", color: "#f0f0f0", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  Try for free:
                  <br />npm install -g syntaxshot-cli
                </button>
                <span
                  className={`text-[11px] font-medium absolute right-3 top-3 transition-opacity duration-200 ${copiedId === "pricing-free" ? "opacity-100" : "opacity-0"}`}
                  style={{ color: "#00e676", fontFamily: "'JetBrains Mono', monospace" }}
                  aria-live="polite"
                >
                  Copied
                </span>
              </div>
            </div>

            {/* Pro */}
            <div
              className="rounded-xl p-7 flex flex-col gap-6 relative"
              style={{ background: "#0f0f0f", border: "1px solid rgba(0,230,118,0.3)", boxShadow: "0 0 50px rgba(0,230,118,0.05)" }}
            >
              <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#00e676", color: "#080808", fontFamily: "'Outfit', sans-serif" }}>
                Pro
              </div>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ fontFamily: "'Outfit', sans-serif", color: "#00e676" }}>Pro</p>
                <p className="text-xs" style={{ color: "#555" }}>Activate with a license key on any machine.</p>
              </div>
              <div className="space-y-2">
                {PRO_BILLING.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBilling(b.id)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all text-sm"
                    style={{
                      background: billing === b.id ? "rgba(0,230,118,0.08)" : "rgba(255,255,255,0.03)",
                      border: billing === b.id ? "1px solid rgba(0,230,118,0.25)" : "1px solid rgba(255,255,255,0.06)",
                      color: billing === b.id ? "#f0f0f0" : "#666",
                    }}
                  >
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}>{b.label}</span>
                    <span className="flex items-baseline gap-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      <span className="font-bold text-lg" style={{ color: billing === b.id ? "#00e676" : "#555", letterSpacing: "-0.02em" }}>{b.price}</span>
                      <span className="text-xs" style={{ color: "#444" }}>{b.sub}</span>
                    </span>
                  </button>
                ))}
              </div>
              <ul className="space-y-3 flex-1">
                {FEATURES_PRO.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "#888" }}>
                    <Check size={13} className="mt-0.5 shrink-0" style={{ color: "#00e676" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className="w-full py-2.5 rounded text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                style={{ background: "#00e676", color: "#080808", fontFamily: "'Outfit', sans-serif" }}
              >
                Get Pro — {selected.price} / {selected.label.toLowerCase()}
              </button>
            </div>
          </div>

          <div
            className="mt-8 max-w-3xl mx-auto rounded-lg p-4 flex items-start gap-3 text-sm"
            style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span style={{ color: "#00e676", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, marginTop: 2 }}>$</span>
            <div>
              <span style={{ color: "#555" }}>After purchase, activate on any machine with: </span>
              <code className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#f0f0f0" }}>
                syntaxshot login SYNX-XXXX-XXXX-XXXX
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 border-t border-border">
        <div
          className="max-w-3xl mx-auto text-center rounded-2xl p-12 border"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,230,118,0.06), transparent 65%), #0a0a0a", borderColor: "rgba(0,230,118,0.12)" }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.025em" }}>
            Start capturing your code today.
          </h2>
          <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: "#555" }}>
            Free forever for individual file captures. Upgrade to Pro for unlimited folder scans.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="relative inline-flex items-center">
              <button
                type="button"
                onClick={() => copyInstallCommand("cta")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                style={{ background: "#00e676", color: "#080808", fontFamily: "'Outfit', sans-serif" }}
              >
                <Clipboard size={13} /> Try for free:
                <br />npm install -g syntaxshot-cli <ArrowRight size={14} />
              </button>
              <span
                className={`text-[11px] font-medium ml-3 transition-opacity duration-200 ${copiedId === "cta" ? "opacity-100" : "opacity-0"}`}
                style={{ color: "#00e676", fontFamily: "'JetBrains Mono', monospace" }}
                aria-live="polite"
              >
                Copied
              </span>
            </div>
            <Link to="/docs" className="text-sm transition-colors hover:text-foreground" style={{ color: "#444", fontFamily: "'Outfit', sans-serif" }}>
              Read the docs →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
