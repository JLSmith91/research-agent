# 🔬 Research Agent

A multi-step AI research agent that autonomously searches the web, synthesizes findings across multiple sources, and generates structured research reports on any company, person, market, or topic.

**Live Demo:** [research-agent-indol.vercel.app](https://research-agent-indol.vercel.app)

---

## What It Does

Enter any research topic and the agent autonomously plans a research strategy, executes multiple targeted web searches, and synthesizes everything into a professional structured report.

**Research depth options:**
- **Quick** — 2-3 minute overview with key facts (3 searches)
- **Standard** — 4-6 minute detailed analysis (6 searches)
- **Deep Dive** — 8-12 minute comprehensive report (10 searches)

**Each report includes:**
- Executive summary
- Expandable sections with key points per topic area
- Key takeaway / verdict
- Unknowns and information gaps
- Sources referenced

**Handles any topic type:**
- Companies & competitors
- People & public figures
- Markets & industries
- General research questions

---

## What Makes This Different

Unlike a single LLM query, the Research Agent:

1. **Plans before searching** — breaks the topic into targeted sub-questions
2. **Executes multiple searches** — runs parallel web searches for each sub-question
3. **Synthesizes across sources** — combines findings into a coherent structured report
4. **Identifies gaps** — flags what couldn't be confirmed or where information conflicts

This is genuine multi-step agentic behavior, not a single prompt-response.

---

## Tech Stack

- **React** + **Vite** — frontend framework and build tool
- **Anthropic Claude API** (`claude-sonnet-4-6`) — research planning, synthesis, and report generation
- **Claude Web Search Tool** — live multi-source web search
- **Vercel** — deployment and hosting

---

## Getting Started

### Prerequisites
- Node.js v18+
- Anthropic API key ([console.anthropic.com](https://console.anthropic.com))

### Installation

```bash
git clone https://github.com/JLSmith91/research-agent.git
cd research-agent
npm install
```

### Environment Variables

Create a `.env` file in the root of the project:

```
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and start researching.

---

## How to Use

1. Enter any topic, company, person, or question
2. Select your research depth
3. Click **Start Research**
4. Watch the progress tracker as the agent searches and synthesizes
5. Click any section to expand full findings and key points

---

## Deployment

This project is deployed on Vercel. To deploy your own instance:

1. Fork this repo
2. Import it into [vercel.com](https://vercel.com)
3. Add `VITE_ANTHROPIC_API_KEY` as an environment variable
4. Deploy

---

## Part of a Larger AI Tooling Portfolio

Research Agent is part of a suite of AI-powered tools built for real-world use. Other projects include a pre-market trading intelligence agent, an AI job search agent, a full stack trade journal, and a meal planning agent.

---

## Author

**Jared Smith** — [@JLSmith91](https://github.com/JLSmith91)
