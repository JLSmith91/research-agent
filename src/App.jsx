import { useState } from "react";

const COLORS = {
  bg: "#0d1117",
  surface: "#161b22",
  surface2: "#1c2333",
  border: "#2d3748",
  accent: "#c8a96e",
  accentDim: "#8a7040",
  accentPale: "rgba(200,169,110,0.08)",
  green: "#3fb950",
  red: "#f87171",
  yellow: "#fbbf24",
  blue: "#60a5fa",
  muted: "#484f58",
  text: "#e6edf3",
  textDim: "#8b949e",
};

const DEPTH_OPTIONS = [
  { id: "quick", label: "Quick", desc: "2-3 min · Overview & key facts", searches: 3 },
  { id: "standard", label: "Standard", desc: "4-6 min · Detailed analysis", searches: 6 },
  { id: "deep", label: "Deep Dive", desc: "8-12 min · Comprehensive report", searches: 10 },
];

export default function ResearchAgent() {
  const [query, setQuery] = useState("");
  const [depth, setDepth] = useState("standard");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState([]);
  const [activeSection, setActiveSection] = useState(null);

  async function runResearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);
    setProgress([]);

    const selectedDepth = DEPTH_OPTIONS.find(d => d.id === depth);

    const addProgress = (msg) => setProgress(prev => [...prev, msg]);

    addProgress("Planning research strategy...");

    const prompt = `You are an expert research analyst with access to web search. Research this topic comprehensively:

TOPIC: "${query}"
DEPTH: ${selectedDepth.label} (${selectedDepth.desc})
MAX SEARCHES: ${selectedDepth.searches}

Your task is to:
1. Break down the topic into ${selectedDepth.searches} specific search queries
2. Search for each one using the web_search tool
3. Synthesize all findings into a structured research report

After completing all searches, return ONLY a valid JSON object with this structure (no markdown):
{
  "title": "Research Report: [topic]",
  "summary": "2-3 sentence executive summary of key findings",
  "researchedAt": "${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}",
  "depth": "${selectedDepth.label}",
  "sections": [
    {
      "title": "Section Title",
      "content": "Detailed paragraph of findings for this section. 3-5 sentences minimum.",
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
    }
  ],
  "unknowns": ["Something that couldn't be confirmed", "Conflicting information about X"],
  "sources": ["Source name or URL 1", "Source name or URL 2"],
  "verdict": "One sentence conclusion or key takeaway from the research"
}

Section structure depends on the topic type:
- Companies: Overview, Products/Services, Market Position, Recent News, Leadership, Financial Health
- People: Background, Career, Achievements, Current Role, Public Presence
- Markets/Industries: Overview, Key Players, Trends, Opportunities, Risks
- General topics: Background, Current State, Key Findings, Implications

Be thorough, factual, and cite what you find. Return only the JSON.`;

    try {
      addProgress(`Running ${selectedDepth.searches} targeted searches...`);

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 4096,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "API error");

      addProgress("Synthesizing findings...");

      const fullText = data.content
        .map((i) => (i.type === "text" ? i.text : ""))
        .filter(Boolean)
        .join("\n");

      const clean = fullText.replace(/```json|```/g, "").trim();
      const start = clean.indexOf("{");
      const end = clean.lastIndexOf("}");
      if (start === -1) throw new Error("Failed to generate report");

      let jsonStr = clean.slice(start, end + 1);
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, "$1");
      const parsed = JSON.parse(jsonStr);

      addProgress("Report complete.");
      setReport(parsed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d1117; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.surface }}>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "16px", color: COLORS.text, letterSpacing: "-0.02em" }}>
          🔬 Research <span style={{ color: COLORS.accent }}>Agent</span>
        </div>
        <div style={{ fontSize: "12px", color: COLORS.muted }}>Multi-step AI research with live web search</div>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 32px" }}>

        {/* Input Panel */}
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "12px", padding: "28px", marginBottom: "24px" }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "22px", fontWeight: 700, color: COLORS.text, marginBottom: "8px", letterSpacing: "-0.02em" }}>
            What do you want to research?
          </div>
          <div style={{ fontSize: "13px", color: COLORS.textDim, marginBottom: "20px" }}>
            Enter a company, person, market, topic, or any question. The agent will search the web and build a structured report.
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && runResearch()}
            placeholder="e.g. Anthropic, Elon Musk, AI chip market, climate tech startups..."
            style={{
              width: "100%",
              background: COLORS.surface2,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text,
              padding: "12px 16px",
              fontSize: "15px",
              borderRadius: "8px",
              fontFamily: "'Inter', sans-serif",
              marginBottom: "20px",
              outline: "none",
            }}
          />

          {/* Depth Selector */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, color: COLORS.accentDim, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>Research Depth</div>
            <div style={{ display: "flex", gap: "10px" }}>
              {DEPTH_OPTIONS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDepth(d.id)}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    background: depth === d.id ? COLORS.accentPale : COLORS.surface2,
                    border: `1px solid ${depth === d.id ? COLORS.accent : COLORS.border}`,
                    borderRadius: "8px",
                    color: depth === d.id ? COLORS.accent : COLORS.textDim,
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "2px" }}>{d.label}</div>
                  <div style={{ fontSize: "11px", opacity: 0.7 }}>{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={runResearch}
            disabled={loading || !query.trim()}
            style={{
              padding: "12px 32px",
              background: loading || !query.trim() ? COLORS.surface2 : COLORS.accent,
              color: loading || !query.trim() ? COLORS.muted : COLORS.bg,
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading || !query.trim() ? "default" : "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {loading ? "Researching..." : "Start Research"}
          </button>
        </div>

        {/* Progress */}
        {loading && progress.length > 0 && (
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "20px 24px", marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, color: COLORS.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px" }}>Research Progress</div>
            {progress.map((msg, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: i === progress.length - 1 ? COLORS.accent : COLORS.green,
                  flexShrink: 0,
                  animation: i === progress.length - 1 ? "pulse 1s ease-in-out infinite" : "none"
                }} />
                <span style={{ fontSize: "13px", color: i === progress.length - 1 ? COLORS.text : COLORS.textDim }}>{msg}</span>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div style={{ background: "rgba(248,113,113,0.08)", border: `1px solid rgba(248,113,113,0.3)`, borderRadius: "8px", padding: "16px", color: COLORS.red, fontSize: "13px", marginBottom: "24px" }}>
            Research failed: {error}
          </div>
        )}

        {/* Report */}
        {report && (
          <div>
            {/* Report Header */}
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "12px", padding: "28px", marginBottom: "16px", borderTop: `3px solid ${COLORS.accent}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: COLORS.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Research Report</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "22px", fontWeight: 700, color: COLORS.text, letterSpacing: "-0.02em" }}>{report.title}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "11px", color: COLORS.muted, marginBottom: "4px" }}>{report.researchedAt}</div>
                  <div style={{ fontSize: "11px", padding: "3px 10px", background: COLORS.accentPale, border: `1px solid rgba(200,169,110,0.2)`, color: COLORS.accent, borderRadius: "20px", display: "inline-block" }}>{report.depth}</div>
                </div>
              </div>
              <div style={{ fontSize: "15px", color: COLORS.text, lineHeight: "1.7", fontStyle: "italic", borderLeft: `3px solid ${COLORS.accent}`, paddingLeft: "16px" }}>
                {report.summary}
              </div>
            </div>

            {/* Sections */}
            {report.sections?.map((section, i) => (
              <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "10px", marginBottom: "12px", overflow: "hidden" }}>
                <div
                  style={{ padding: "18px 24px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  onClick={() => setActiveSection(activeSection === i ? null : i)}
                >
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "15px", fontWeight: 600, color: COLORS.text }}>{section.title}</div>
                  <div style={{ color: COLORS.muted, fontSize: "16px" }}>{activeSection === i ? "↑" : "↓"}</div>
                </div>
                {activeSection === i && (
                  <div style={{ padding: "0 24px 24px", borderTop: `1px solid ${COLORS.border}`, paddingTop: "20px" }}>
                    <p style={{ fontSize: "14px", color: COLORS.textDim, lineHeight: "1.75", marginBottom: "16px" }}>{section.content}</p>
                    {section.keyPoints?.length > 0 && (
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: COLORS.accentDim, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>Key Points</div>
                        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
                          {section.keyPoints.map((pt, j) => (
                            <li key={j} style={{ display: "flex", gap: "10px", fontSize: "13px", color: COLORS.textDim, alignItems: "flex-start" }}>
                              <span style={{ color: COLORS.accent, flexShrink: 0 }}>→</span> {pt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Verdict */}
            {report.verdict && (
              <div style={{ background: COLORS.accentPale, border: `1px solid rgba(200,169,110,0.2)`, borderRadius: "10px", padding: "20px 24px", marginBottom: "12px" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: COLORS.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Key Takeaway</div>
                <div style={{ fontSize: "14px", color: COLORS.text, lineHeight: "1.65" }}>{report.verdict}</div>
              </div>
            )}

            {/* Unknowns + Sources */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              {report.unknowns?.length > 0 && (
                <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "20px 24px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: COLORS.yellow, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>⚠ Unknowns / Gaps</div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {report.unknowns.map((u, i) => (
                      <li key={i} style={{ fontSize: "12px", color: COLORS.textDim, lineHeight: "1.5" }}>· {u}</li>
                    ))}
                  </ul>
                </div>
              )}
              {report.sources?.length > 0 && (
                <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "20px 24px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: COLORS.blue, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>Sources</div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {report.sources.map((s, i) => (
                      <li key={i} style={{ fontSize: "12px", color: COLORS.textDim, lineHeight: "1.5" }}>· {s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* New Research */}
            <div style={{ textAlign: "center" }}>
              <button
                onClick={() => { setReport(null); setProgress([]); setQuery(""); }}
                style={{ padding: "10px 28px", background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.textDim, borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
              >
                Start New Research
              </button>
            </div>
          </div>
        )}

        {!loading && !report && !error && (
          <div style={{ textAlign: "center", padding: "60px 0", color: COLORS.muted, fontSize: "13px" }}>
            Enter a topic above to begin your research.
          </div>
        )}
      </div>
    </div>
  );
}