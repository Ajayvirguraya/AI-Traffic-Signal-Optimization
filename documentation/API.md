# ATSO API

## Payload-backed web routes

- `GET /api/atso/runs` — latest 50 simulation summaries
- `POST /api/atso/runs` — validate and save a measured simulation
- `GET /api/atso/datasets` — latest dataset metadata
- `POST /api/atso/datasets` — validate and save processed dataset metadata
- `POST /api/atso/q-learning` — deterministic Q-learning training
- `/api/*` and `/admin` — Payload REST/admin endpoints

Payload user-facing calls enforce collection access with
`overrideAccess: false`. Request bodies are allowlisted and range-validated.

## FastAPI profile

- `GET /health`
- `GET /api/simulations`
- `POST /api/simulations`
- `POST /api/q-learning/train`
- `WS /ws/simulation`

Interactive OpenAPI documentation is available at `/docs`.
