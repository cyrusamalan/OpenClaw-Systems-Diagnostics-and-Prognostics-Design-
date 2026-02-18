# OpenClaw Mission Control Dashboard

A systems diagnostics and prognostics dashboard for [OpenClaw](https://docs.openclaw.ai) — providing real-time monitoring, health assessment, and management of AI agents, sessions, channels, and gateway infrastructure.

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend Proxy**: FastAPI (Python) bridging the dashboard to OpenClaw's CLI
- **State**: Zustand for client-side state management
- **Animations**: Framer Motion
- **UI**: Dark-mode-first mission-control aesthetic

## Architecture

```
Browser → Next.js Dashboard (:3000) → /api/proxy/* → FastAPI Proxy (:8080) → OpenClaw CLI → Gateway (:18789)
```

The proxy calls `openclaw` CLI commands with `--json` flags and transforms the output into a uniform REST API that the dashboard consumes.

## Setup

### Prerequisites

- Node.js 20+
- Python 3.12+
- OpenClaw installed and gateway running (`openclaw gateway status`)

### Install

```bash
npm install
pip install -r proxy/requirements.txt
```

### Configure

```bash
cp .env.example .env
# Edit .env and set OPENCLAW_TOKEN to your gateway token
```

### Run

```bash
# Terminal 1 — proxy
cd proxy
OPENCLAW_TOKEN=<your-token> uvicorn app.main:app --host 127.0.0.1 --port 8080

# Terminal 2 — dashboard
npm run dev
```

Open http://localhost:3000

### Windows (WSL)

If OpenClaw runs in WSL and the dashboard runs on Windows, the proxy auto-detects this and calls `wsl -- bash -lc "openclaw ..."` to bridge across.

```powershell
# Terminal 1 — proxy (PowerShell)
$env:OPENCLAW_TOKEN="<your-token>"
cd proxy
python -m uvicorn app.main:app --host 127.0.0.1 --port 8080

# Terminal 2 — dashboard (PowerShell)
npm run dev
```

## Dashboard Pages

| Route | Description |
|-------|-------------|
| `/` | Mission Control overview — gateway, agents, sessions, channels, security |
| `/agents` | Agent registry with session details |
| `/tasks` | Sessions and channels view |
| `/metrics` | System metrics, memory status, security audit |
| `/settings` | Connection configuration |

## Proxy API

| Endpoint | Description |
|----------|-------------|
| `GET /api/overview` | Full system state (gateway + agents + sessions + channels + security) |
| `GET /api/agents` | List agents |
| `GET /api/sessions` | List sessions |
| `GET /api/channels` | Channel health |
| `GET /api/metrics` | Aggregated metrics |
| `GET /api/logs` | Recent log entries |
| `GET /api/logs/stream` | SSE real-time log stream |
| `GET /api/health` | Proxy + gateway health check |

## Environment Variables

See [`.env.example`](.env.example) for all available options.

| Variable | Description |
|----------|-------------|
| `OPENCLAW_TOKEN` | Gateway authentication token |
| `OPENCLAW_CMD` | Path to openclaw binary (default: `openclaw`) |
| `PROXY_PORT` | Proxy listen port (default: `8080`) |
| `DASHBOARD_PORT` | Dashboard port (default: `3000`) |
