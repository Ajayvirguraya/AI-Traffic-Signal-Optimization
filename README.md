# ATSO — Adaptive Traffic Signal Optimization Agent

**Project ID:** P02  
**Course:** CSE276  
**University:** Lovely Professional University, School of Computer Science  
**Domain:** Artificial Intelligence and Machine Learning  
**Academic year:** 2nd Year

ATSO is a deterministic four-way traffic simulation with fixed-time, adaptive
queue-based, and tabular Q-learning controllers. It records measured simulation
telemetry, validates traffic CSV files, stores run history, and exports reports.
It is an educational simulation and does not control real traffic signals.

## Team

- Ajayvir Singh — 12503533
- Gupreet Singh — 12515584
- Arpit — 12515044

Individual contribution statements have intentionally not been invented. Add
team-approved statements to `documentation/PROJECT_REPORT.md` before submission.

## Architecture

- **Primary web app:** Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Persistent runtime:** Payload CMS on the Figma-managed database
- **Submission/reference API:** Python FastAPI, SQLAlchemy, REST and WebSocket
- **Algorithms:** fixed-time, adaptive queue-based, seeded tabular Q-learning
- **Charts/export:** Recharts, CSV, jsPDF

The live Figma Make application uses Payload because its database and deployment
runtime are platform-managed. `backend/` is a standalone FastAPI profile for
local/university evaluation and can use SQLite by default or PostgreSQL through
`DATABASE_URL`.

## Run the web application

Requirements: Node.js 24.22+ and pnpm 10+.

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. In Figma Make the development server and Payload
environment are started automatically.

```bash
pnpm test
pnpm build
```

## Run the FastAPI profile

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn backend.main:app --reload --port 8000
```

API documentation: `http://localhost:8000/docs`  
Health check: `http://localhost:8000/health`  
WebSocket: `ws://localhost:8000/ws/simulation`

### PostgreSQL

Create an empty database, then set:

```env
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/atso
```

Tables are created at API startup. Never commit credentials.

## Dataset

Accepted columns:

`timestamp`, `north_vehicle_count`, `south_vehicle_count`,
`east_vehicle_count`, `west_vehicle_count`, `queue_length`, `waiting_time`,
`traffic_density`, `signal_duration`, `throughput`.

`dataset/atso_synthetic_sample.csv` is reproducible synthetic demonstration
data and is not a real-world measurement. SUMO datasets can be generated using
the official documentation at <https://sumo.dlr.de/docs/>.

## Safety policy

- One selected direction is served at a time.
- At most five vehicles are counted per green batch, after clearing.
- Yellow and all-red clearance phases separate conflicting service.
- Safe following distance and spawn occupancy checks prevent overlap.
- Waiting time contributes to priority to prevent starvation.

## Reports

The Reports area exports current measured run samples as CSV and PDF. Empty
states remain until a simulation has run. No benchmark result is fabricated.
The included project report labels sections requiring team contributions or
additional controlled experimental runs.

See:

- `documentation/PROJECT_REPORT.md`
- `documentation/API.md`
- `documentation/TESTING.md`
- `PROJECT_REPORT.pdf`
- `PROJECT_PRESENTATION.pptx`
