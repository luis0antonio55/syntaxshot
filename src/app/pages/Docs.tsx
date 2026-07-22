import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { ChevronRight, ArrowRight } from "lucide-react";
import { Footer, Navbar } from "./Landing";
import { useSeo } from "../hooks/useSeo";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Section {
  id: string;
  label: string;
  subsections?: { id: string; label: string }[];
}

// ─── Sidebar sections ─────────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  { id: "installation", label: "Installation" },
  {
    id: "basic-usage",
    label: "Basic usage",
    subsections: [
      { id: "single-file", label: "Single file" },
      { id: "multiple-files", label: "Multiple files" },
      { id: "output-options", label: "Output options" },
    ],
  },
  {
    id: "pro-usage",
    label: "Pro — folder scan",
    subsections: [
      { id: "folder-scan", label: "Scanning a folder" },
      { id: "git-auto", label: "Git auto-detection" },
      { id: "skip-confirm", label: "Skip confirmation" },
    ],
  },
  {
    id: "configuration",
    label: "Configuration",
    subsections: [
      { id: "config-file", label: ".syntaxshotrc.json" },
      { id: "exclude-rules", label: "Exclude rules" },
    ],
  },
  { id: "themes", label: "Themes" },
  {
    id: "license",
    label: "License",
    subsections: [
      { id: "activate", label: "Activating" },
      { id: "deactivate", label: "Deactivating" },
      { id: "offline", label: "Offline behavior" },
    ],
  },
  { id: "faq", label: "FAQ" },
];

// ─── Small doc components ─────────────────────────────────────────────────────

function CodeBlock({
  children,
  filename,
}: {
  children: string;
  filename?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className="rounded-lg overflow-hidden text-sm my-4"
      style={{
        background: "#0a0a0a",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {filename && (
        <div
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
            background: "#0f0f0f",
          }}
        >
          <span
            style={{
              color: "#9a9a9a",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
            }}
          >
            {filename}
          </span>
        </div>
      )}
      <div className="relative group">
        <pre
          className="p-4 overflow-x-auto leading-6"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "#c3e88d",
          }}
        >
          <code>{children.trim()}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 px-2.5 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-all"
          style={{
            background: "rgba(255,255,255,0.06)",
            color: copied ? "#00e676" : "#9e9e9e",
            border: "1px solid rgba(255,255,255,0.08)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {copied ? "copied" : "copy"}
        </button>
      </div>
    </div>
  );
}

function JsonBlock({
  children,
  filename,
}: {
  children: string;
  filename?: string;
}) {
  return (
    <div
      className="rounded-lg overflow-hidden text-sm my-4"
      style={{
        background: "#0a0a0a",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {filename && (
        <div
          className="px-4 py-2 border-b"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
            background: "#0f0f0f",
          }}
        >
          <span
            style={{
              color: "#9a9a9a",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
            }}
          >
            {filename}
          </span>
        </div>
      )}
      <pre
        className="p-4 overflow-x-auto leading-6"
        style={{ fontFamily: "'JetBrains Mono', monospace", color: "#f0f0f0" }}
      >
        <code
          dangerouslySetInnerHTML={{
            __html: children
              .trim()
              .replace(
                /"([^"]+)"(?=\s*:)/g,
                '<span style="color:#f07178">"$1"</span>',
              )
              .replace(
                /:\s*"([^"]+)"/g,
                ': <span style="color:#c3e88d">"$1"</span>',
              )
              .replace(
                /:\s*(true|false|\d+\.?\d*)/g,
                ': <span style="color:#82aaff">$1</span>',
              ),
          }}
        />
      </pre>
    </div>
  );
}

function InlineCode({ children }: { children: string }) {
  return (
    <code
      className="px-1.5 py-0.5 rounded text-xs"
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        background: "rgba(255,255,255,0.07)",
        color: "#c3e88d",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {children}
    </code>
  );
}

function SectionTitle({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="text-2xl font-bold tracking-tight scroll-mt-24 mb-2"
      style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}
    >
      {children}
    </h2>
  );
}

function SubTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3
      id={id}
      className="text-lg font-semibold tracking-tight scroll-mt-24 mt-8 mb-2"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {children}
    </h3>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm leading-7 mb-4" style={{ color: "#888" }}>
      {children}
    </p>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg px-4 py-3 text-sm leading-6 my-4 flex items-start gap-3"
      style={{
        background: "rgba(0,230,118,0.05)",
        border: "1px solid rgba(0,230,118,0.15)",
        color: "#888",
      }}
    >
      <span className="shrink-0 mt-0.5" style={{ color: "#00e676" }}>
        →
      </span>
      <span>{children}</span>
    </div>
  );
}

function Warn({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg px-4 py-3 text-sm leading-6 my-4 flex items-start gap-3"
      style={{
        background: "rgba(255,180,0,0.04)",
        border: "1px solid rgba(255,180,0,0.15)",
        color: "#888",
      }}
    >
      <span className="shrink-0 mt-0.5" style={{ color: "#ffb400" }}>
        !
      </span>
      <span>{children}</span>
    </div>
  );
}

function ProBadge() {
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-2 align-middle"
      style={{
        background: "rgba(0,230,118,0.12)",
        color: "#00e676",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      Pro
    </span>
  );
}

function Divider() {
  return <div className="border-t border-border my-10" />;
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────

function FaqItem({ q, children }: { q: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left text-sm font-medium transition-colors hover:text-foreground"
        style={{
          fontFamily: "'Outfit', sans-serif",
          color: open ? "#f0f0f0" : "#888",
        }}
      >
        {q}
        <ChevronRight
          size={15}
          className="shrink-0 transition-transform"
          style={{
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            color: "#8f8f8f",
          }}
        />
      </button>
      {open && (
        <div className="pb-5 text-sm leading-7" style={{ color: "#9e9e9e" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Docs page ────────────────────────────────────────────────────────────────

export default function Docs() {
  const [activeId, setActiveId] = useState("installation");
  useSeo({
    title: "Documentation — SyntaxShot CLI",
    description:
      "Complete guide to installing and using the SyntaxShot CLI, from your first command to advanced Pro folder-scanning features.",
    path: "/docs",
  });

  useEffect(() => {
    const allIds = SECTIONS.flatMap((s) => [
      s.id,
      ...(s.subsections?.map((ss) => ss.id) ?? []),
    ]);
    const observers: IntersectionObserver[] = [];

    allIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id);
        },
        { rootMargin: "-20% 0px -70% 0px" },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* @ts-ignore: Navbar does not accept activePath in its current typing; passing for UX */}
      <Navbar activePath="/docs" />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-24 flex gap-12">
        {/* ── Sidebar ── */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-24 space-y-0.5">
            <p
              className="text-xs font-medium tracking-widest uppercase mb-4"
              style={{
                color: "#8f8f8f",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Docs
            </p>
            {SECTIONS.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => scrollTo(section.id)}
                  className="w-full text-left px-2 py-1.5 rounded text-sm transition-colors"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 500,
                    color: activeId === section.id ? "#f0f0f0" : "#9a9a9a",
                    background:
                      activeId === section.id
                        ? "rgba(255,255,255,0.04)"
                        : "transparent",
                  }}
                >
                  {section.label}
                </button>
                {section.subsections?.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => scrollTo(sub.id)}
                    className="w-full text-left pl-5 pr-2 py-1 rounded text-xs transition-colors"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      color: activeId === sub.id ? "#00e676" : "#8f8f8f",
                    }}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            ))}

            <div className="pt-6 border-t border-border mt-4">
              <Link
                to="/#pricing"
                className="inline-flex items-center gap-1.5 text-xs transition-colors hover:text-foreground"
                style={{ color: "#8f8f8f", fontFamily: "'Outfit', sans-serif" }}
              >
                Get Pro <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        </aside>

        {/* ── Content ── */}
        <main className="flex-1 min-w-0 max-w-2xl">
          {/* Page header */}
          <div className="mb-12">
            <p
              className="text-xs font-medium tracking-widest uppercase mb-3"
              style={{
                color: "#00e676",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              CLI Reference
            </p>
            <h1
              className="text-4xl font-bold tracking-tight mb-4"
              style={{
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: "-0.03em",
              }}
            >
              Documentation
            </h1>
            <Para>
              Everything you need to use the <InlineCode>syntaxshot</InlineCode>{" "}
              CLI — from installation to advanced Pro features.
            </Para>
          </div>

          {/* ── Installation ── */}
          <SectionTitle id="installation">Installation</SectionTitle>
          <Para>
            Clone the repo, install dependencies and link the global command.
          </Para>
          <CodeBlock filename="terminal">{`
cd syntaxshot
npm install
npm link
          `}</CodeBlock>
          <Note>
            <InlineCode>@napi-rs/canvas</InlineCode> ships prebuilt binaries for
            Windows, macOS and Linux. You do{" "}
            <strong style={{ color: "#f0f0f0" }}>not</strong> need Cairo, GTK,
            Visual Studio Build Tools or any other native dependency.
          </Note>
          <Para>
            Once linked, the <InlineCode>syntaxshot</InlineCode> command is
            available globally in your shell. Verify it with:
          </Para>
          <CodeBlock>{`syntaxshot --version`}</CodeBlock>

          <Divider />

          {/* ── Basic usage ── */}
          <SectionTitle id="basic-usage">Basic usage</SectionTitle>
          <Para>
            Start by running <InlineCode>syntaxshot init</InlineCode> to create
            a config file with sensible defaults. From there you can screenshot
            individual files in a single command.
          </Para>
          <CodeBlock>{`syntaxshot init   # creates .syntaxshotrc.json in the current directory`}</CodeBlock>

          <SubTitle id="single-file">Single file</SubTitle>
          <Para>
            Pass a file path and an image is written to{" "}
            <InlineCode>./syntaxshots/</InlineCode> (or whichever output folder
            is set in your config).
          </Para>
          <CodeBlock>{`syntaxshot path/to/file.js`}</CodeBlock>
          <Para>
            Output filename mirrors the source path:{" "}
            <InlineCode>file.js</InlineCode> →{" "}
            <InlineCode>syntaxshots/file.js.png</InlineCode>.
          </Para>

          <SubTitle id="multiple-files">Multiple files</SubTitle>
          <Para>
            Pass as many paths as you want in one call. Use{" "}
            <InlineCode>--theme</InlineCode> to override the config theme for
            that run.
          </Para>
          <CodeBlock>{`syntaxshot a.js b.ts c.css --theme nord`}</CodeBlock>

          <SubTitle id="output-options">Output options</SubTitle>
          <Para>
            Override the output folder with <InlineCode>-o</InlineCode> and the
            format with <InlineCode>--format</InlineCode>.
          </Para>
          <CodeBlock>{`syntaxshot a.py --format jpg -o outputs`}</CodeBlock>

          <div
            className="rounded-lg overflow-hidden my-4"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    background: "#0f0f0f",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {["Flag", "Short", "Default", "Description"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold"
                      style={{
                        color: "#9a9a9a",
                        fontFamily: "'Outfit', sans-serif",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ background: "#0a0a0a" }}>
                {[
                  ["--theme", null, "midnight", "Theme name to apply"],
                  ["--format", null, "png", "png · jpg · svg (svg = Pro)"],
                  ["--output", "-o", "syntaxshots", "Destination folder"],
                  [
                    "--yes",
                    "-y",
                    "false",
                    "Skip confirmation prompt (Pro folder scan)",
                  ],
                ].map(([flag, short, def, desc], i) => (
                  <tr
                    key={i}
                    style={{
                      borderTop:
                        i > 0 ? "1px solid rgba(255,255,255,0.04)" : undefined,
                    }}
                  >
                    <td className="px-4 py-3">
                      <InlineCode>{String(flag)}</InlineCode>
                    </td>
                    <td className="px-4 py-3">
                      {short ? (
                        <InlineCode>{short}</InlineCode>
                      ) : (
                        <span style={{ color: "#8a8a8a" }}>—</span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{
                        color: "#9a9a9a",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {def}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#9e9e9e" }}>
                      {desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Warn>
            The Free plan caps at{" "}
            <strong style={{ color: "#f0f0f0" }}>10 screenshots</strong> total.
          </Warn>

          <Divider />

          {/* ── Pro usage ── */}
          <SectionTitle id="pro-usage">
            Pro — folder scan
            <ProBadge />
          </SectionTitle>
          <Para>
            With an active Pro license you can pass a folder path and let
            syntaxshot walk it recursively, filter capturable files and generate
            everything in one go.
          </Para>

          <SubTitle id="folder-scan">Scanning a folder</SubTitle>
          <CodeBlock>{`syntaxshot ./src`}</CodeBlock>
          <Para>
            Before generating anything, the CLI tells you exactly how many files
            it found and asks for confirmation:
          </Para>
          <CodeBlock>{`Scanning ./src… 31 capturable files found.
Generate 31 images? (y/N)`}</CodeBlock>
          <Para>
            Files that would clutter the output are automatically excluded:{" "}
            <InlineCode>node_modules</InlineCode>, <InlineCode>.git</InlineCode>
            , <InlineCode>dist</InlineCode> / <InlineCode>build</InlineCode>,
            lockfiles (<InlineCode>package-lock.json</InlineCode>,{" "}
            <InlineCode>yarn.lock</InlineCode>…),{" "}
            <InlineCode>package.json</InlineCode>,{" "}
            <InlineCode>tsconfig.json</InlineCode>, any{" "}
            <InlineCode>.env*</InlineCode>, and dotfiles in general.
          </Para>
          <Para>
            Subfolder structure is preserved in the output, so files with the
            same name in different directories never overwrite each other.
          </Para>
          <Note>
            If you're on the Free plan and pass a folder, the CLI blocks it with
            a clear message and redirects you to the manual per-file flow.
            Normal usage is not affected.
          </Note>

          <SubTitle id="git-auto">Git auto-detection</SubTitle>
          <Para>
            The <InlineCode>--auto</InlineCode> flag screenshots only the files
            that have changed since the last commit — useful for generating
            visuals for a pull request.
          </Para>
          <CodeBlock>{`syntaxshot --auto`}</CodeBlock>
          <Para>
            syntaxshot runs <InlineCode>git diff --name-only HEAD</InlineCode>{" "}
            internally and feeds the result to the renderer.
          </Para>

          <SubTitle id="skip-confirm">Skip confirmation</SubTitle>
          <Para>
            Pass <InlineCode>-y</InlineCode> / <InlineCode>--yes</InlineCode> to
            bypass the confirmation prompt. Useful in scripts.
          </Para>
          <CodeBlock>{`syntaxshot ./src --yes`}</CodeBlock>

          <Divider />

          {/* ── Configuration ── */}
          <SectionTitle id="configuration">Configuration</SectionTitle>
          <Para>
            Running <InlineCode>syntaxshot init</InlineCode> creates a{" "}
            <InlineCode>.syntaxshotrc.json</InlineCode> in the current directory
            with all available options and their defaults.
          </Para>

          <SubTitle id="config-file">.syntaxshotrc.json</SubTitle>
          <JsonBlock filename=".syntaxshotrc.json">{`
{
  "theme": "midnight",
  "format": "png",
  "output": "syntaxshots",
  "fontSize": 16,
  "lineNumbers": true,
  "quality": 0.95
}
          `}</JsonBlock>

          <div
            className="rounded-lg overflow-hidden my-4"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    background: "#0f0f0f",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {["Key", "Type", "Default", "Description"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold"
                      style={{
                        color: "#9a9a9a",
                        fontFamily: "'Outfit', sans-serif",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ background: "#0a0a0a" }}>
                {[
                  ["theme", "string", "midnight", "Active theme name"],
                  ["format", "string", "png", "png · jpg · svg (svg = Pro)"],
                  ["output", "string", "syntaxshots", "Destination folder"],
                  ["fontSize", "number", "16", "Font size in pixels"],
                  ["lineNumbers", "boolean", "true", "Show line numbers"],
                  ["quality", "number", "0.95", "JPG quality (0–1)"],
                ].map(([key, type, def, desc], i) => (
                  <tr
                    key={i}
                    style={{
                      borderTop:
                        i > 0 ? "1px solid rgba(255,255,255,0.04)" : undefined,
                    }}
                  >
                    <td className="px-4 py-3">
                      <InlineCode>{key}</InlineCode>
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{
                        color: "#82aaff",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {type}
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{
                        color: "#9a9a9a",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {def}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#9e9e9e" }}>
                      {desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SubTitle id="exclude-rules">Exclude rules</SubTitle>
          <Para>
            For Pro folder scans, add custom exclusions to your config. Both
            directories and individual files are supported.
          </Para>
          <JsonBlock filename=".syntaxshotrc.json">{`
{
  "excludeDirs": ["scripts", "tmp", "fixtures"],
  "excludeFiles": ["seed-data.json", "mock-api.ts"]
}
          `}</JsonBlock>
          <Para>
            These are merged with the built-in exclusion list — you can't
            accidentally un-exclude <InlineCode>node_modules</InlineCode> by
            omitting it here.
          </Para>

          <Divider />

          {/* ── Themes ── */}
          <SectionTitle id="themes">Themes</SectionTitle>
          <Para>
            3 themes ship free with the CLI. Pro unlocks all 8 today — plus
            every new theme we release after that, at no extra cost.
          </Para>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
            {[
              {
                name: "midnight",
                plan: "Free",
                desc: "Dracula-style, dark violet window",
                colors: ["#bd93f9", "#ff79c6", "#50fa7b", "#f1fa8c", "#8be9fd"],
              },
              {
                name: "nord",
                plan: "Free",
                desc: "Nord palette, blue-gray window",
                colors: ["#88c0d0", "#81a1c1", "#a3be8c", "#ebcb8b", "#8fbcbb"],
              },
              {
                name: "paper",
                plan: "Free",
                desc: "Paper, minimal light",
                colors: ["#cf222e", "#0550ae", "#8250df", "#953800", "#1f2328"],
              },
              {
                name: "owl",
                plan: "Pro",
                desc: "Night Owl, teal & navy",
                colors: ["#c792ea", "#82aaff", "#ecc48d", "#ff5874", "#d6deeb"],
              },
              {
                name: "solar",
                plan: "Pro",
                desc: "Solarized Light, warm window",
                colors: ["#268bd2", "#859900", "#b58900", "#2aa198", "#657b83"],
              },
              {
                name: "mocha",
                plan: "Pro",
                desc: "Catppuccin Mocha",
                colors: ["#cba6f7", "#89b4fa", "#a6e3a1", "#eba0ac", "#94e2d5"],
              },
              {
                name: "onedark",
                plan: "Pro",
                desc: "Atom One Dark",
                colors: ["#c678dd", "#61afef", "#98c379", "#e5c07b", "#e06c75"],
              },
              {
                name: "tokyonight",
                plan: "Pro",
                desc: "Tokyo Night",
                colors: ["#9d7cd8", "#7aa2f7", "#9ece6a", "#e0af68", "#bb9af7"],
              },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-lg p-4 space-y-2.5"
                style={{
                  background: "#0a0a0a",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {t.colors.map((c) => (
                      <span
                        key={c}
                        className="w-4 h-4 rounded-full"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <span
                    className="text-[8px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      background:
                        t.plan === "Pro"
                          ? "rgba(0,230,118,0.1)"
                          : "rgba(255,255,255,0.05)",
                      color: t.plan === "Pro" ? "#00e676" : "#9a9a9a",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {t.plan}
                  </span>
                </div>
                <p
                  className="text-xs font-semibold"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "#f0f0f0",
                  }}
                >
                  {t.name}
                </p>
                <p className="text-xs leading-5" style={{ color: "#9a9a9a" }}>
                  {t.desc}
                </p>
              </div>
            ))}
          </div>

          <Para>List available themes at any time:</Para>
          <CodeBlock>{`syntaxshot themes`}</CodeBlock>
          <Para>
            Apply a theme for a single run without changing your config:
          </Para>
          <CodeBlock>{`syntaxshot file.ts --theme nord`}</CodeBlock>
          <Para>
            Free plan trying a Pro theme gets a clear message pointing back to
            midnight, nord, or solar — nothing silently fails.
          </Para>

          <Divider />

          {/* ── License ── */}
          <SectionTitle id="license">License</SectionTitle>
          <Para>
            After purchasing a Pro plan you receive a license key by email in
            the format <InlineCode>SYNX-XXXX-XXXX-XXXX</InlineCode>. Activate it
            on each machine you want to use.
          </Para>

          <SubTitle id="activate">Activating</SubTitle>
          <CodeBlock>{`syntaxshot login SYNX-XXXX-XXXX-XXXX`}</CodeBlock>
          <Para>
            This validates the key against the license API and caches the result
            in <InlineCode>~/.syntaxshot/license.json</InlineCode>. The cache is
            re-checked every 24 hours automatically.
          </Para>

          <SubTitle id="deactivate">Deactivating</SubTitle>
          <Para>To remove the license from the current machine:</Para>
          <CodeBlock>{`syntaxshot logout`}</CodeBlock>
          <Para>
            The local cache file is deleted. Pro features stop working
            immediately. You can re-activate on this machine or another using
            the same key.
          </Para>

          <SubTitle id="offline">Offline behavior</SubTitle>
          <Para>
            If the license API is temporarily unreachable, a
            previously-validated license keeps working for up to{" "}
            <strong style={{ color: "#f0f0f0" }}>7 days</strong> without
            connectivity. After that window, a network check is required to
            resume Pro features.
          </Para>
          <Note>
            You can override the API endpoint for local development:{" "}
            <InlineCode>
              {"export SYNTAXSHOT_API_URL=http://localhost:3000"}
            </InlineCode>
          </Note>

          <Divider />

          {/* ── FAQ ── */}
          <SectionTitle id="faq">FAQ</SectionTitle>
          <Para>Common questions and fixes.</Para>

          <div
            className="mt-6"
            style={{
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <div className="px-6">
              <FaqItem q="Command not found after running npm link">
                <p>
                  Make sure <InlineCode>npm link</InlineCode> completed without
                  errors. Then check that your global npm bin folder is in your{" "}
                  <InlineCode>PATH</InlineCode>:
                </p>
                <CodeBlock>{`npm bin -g    # prints the global bin path`}</CodeBlock>
                <p className="mt-2">
                  Add that path to your shell profile (
                  <InlineCode>~/.bashrc</InlineCode>,{" "}
                  <InlineCode>~/.zshrc</InlineCode>, etc.) and restart your
                  terminal. On macOS with nvm, the path changes per Node version
                  — re-run <InlineCode>npm link</InlineCode> after switching
                  versions.
                </p>
              </FaqItem>

              <FaqItem q="Error about native modules or canvas bindings">
                <p>
                  SyntaxShot uses <InlineCode>@napi-rs/canvas</InlineCode>,
                  which ships prebuilt binaries and requires no native
                  compilation. If you're seeing native errors, you likely have a
                  stale build from the classic <InlineCode>canvas</InlineCode>{" "}
                  package.
                </p>
                <CodeBlock>{`rm -rf node_modules
npm install`}</CodeBlock>
                <p className="mt-2">
                  Make sure you're on{" "}
                  <strong style={{ color: "#f0f0f0" }}>Node 18 or later</strong>
                  . Older Node versions may not match the prebuilt binaries.
                </p>
              </FaqItem>

              <FaqItem q="I've hit the 10-image Free plan limit">
                <p>
                  The usage counter lives in{" "}
                  <InlineCode>.syntaxshot-usage.json</InlineCode> in the
                  directory where you run the command. It is not global — each
                  project folder has its own counter. Running syntaxshot from a
                  different directory starts a fresh count.
                </p>
                <p className="mt-2">
                  To continue without limits, upgrade to Pro and activate with{" "}
                  <InlineCode>syntaxshot login &lt;key&gt;</InlineCode>.
                </p>
              </FaqItem>

              <FaqItem q="Folder scan is generating images I don't want">
                <p>
                  The built-in exclusion list covers the most common noise (
                  <InlineCode>node_modules</InlineCode>,{" "}
                  <InlineCode>dist</InlineCode>, lockfiles, dotfiles, etc.). For
                  project-specific files, add them to your config:
                </p>
                <JsonBlock filename=".syntaxshotrc.json">{`
{
  "excludeDirs": ["scripts", "tmp"],
  "excludeFiles": ["seed-data.json"]
}
                `}</JsonBlock>
                <p className="mt-2">
                  Re-run the scan — it will skip those paths.
                </p>
              </FaqItem>

              <FaqItem q="My license key isn't being accepted">
                <p>
                  Check that you're pasting the full key including all segments:{" "}
                  <InlineCode>SYNX-XXXX-XXXX-XXXX</InlineCode>. Keys are
                  case-insensitive but must include the hyphens.
                </p>
                <p className="mt-2">
                  If the key was just issued, wait a few seconds and retry —
                  there's a brief propagation delay after purchase. If the
                  problem persists, contact support with your purchase email.
                </p>
              </FaqItem>

              <FaqItem q="Pro features stopped working after being offline">
                <p>
                  The license is cached locally and valid for{" "}
                  <strong style={{ color: "#f0f0f0" }}>7 days</strong> without a
                  network check. After that window expires, a connection to the
                  license API is required.
                </p>
                <p className="mt-2">
                  Reconnect to the internet and run any{" "}
                  <InlineCode>syntaxshot</InlineCode> command — it will
                  re-validate automatically and restore Pro features.
                </p>
              </FaqItem>

              <FaqItem q="A file type isn't being syntax-highlighted">
                <p>
                  Highlighting is powered by{" "}
                  <strong style={{ color: "#f0f0f0" }}>shiki</strong>. If a file
                  extension isn't mapped, syntaxshot renders it as plain text
                  instead of erroring.
                </p>
                <p className="mt-2">
                  To add support for a language, open{" "}
                  <InlineCode>src/highlighter.js</InlineCode> and add the
                  extension → shiki language name mapping. Shiki supports{" "}
                  <a
                    href="https://shiki.style/languages"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 transition-colors hover:text-foreground"
                    style={{ color: "#00e676" }}
                  >
                    100+ languages
                  </a>
                  .
                </p>
              </FaqItem>

              <FaqItem q="Output images look blurry on high-DPI displays">
                <p>
                  The renderer uses a 1× pixel density by default. This is
                  intentional for consistent file sizes, but the images may
                  appear soft on Retina/HiDPI screens.
                </p>
                <p className="mt-2">
                  Increase <InlineCode>fontSize</InlineCode> in your config
                  (e.g. <InlineCode>32</InlineCode> instead of{" "}
                  <InlineCode>16</InlineCode>) to produce a physically larger
                  image that looks sharp when scaled down. SVG export (Pro) is
                  always infinitely sharp regardless of zoom.
                </p>
              </FaqItem>

              <FaqItem q="Can I use the same license key on multiple machines?">
                <p>
                  Yes. Run <InlineCode>syntaxshot login &lt;key&gt;</InlineCode>{" "}
                  on each machine. There is no hard limit on activations for
                  personal use. If you're activating on a team machine, the Pro
                  plan allows up to 3 seats.
                </p>
                <p className="mt-2">
                  To deactivate a machine, run{" "}
                  <InlineCode>syntaxshot logout</InlineCode> on it.
                </p>
              </FaqItem>
            </div>
          </div>

          {/* Bottom CTA */}
          <div
            className="mt-16 rounded-xl p-8 text-center"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(0,230,118,0.05), transparent 65%), #0a0a0a",
              border: "1px solid rgba(0,230,118,0.1)",
            }}
          >
            <p className="text-sm mb-4" style={{ color: "#9a9a9a" }}>
              Need folder scanning and unlimited screenshots?
            </p>
            <Link
              to="https://buy.stripe.com/test_eVq28q3Kwaez76KaUI1B600"
              target="_blank"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold transition-all hover:opacity-90"
              style={{
                background: "#00e676",
                color: "#080808",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Upgrade to Pro <ArrowRight size={14} />
            </Link>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
