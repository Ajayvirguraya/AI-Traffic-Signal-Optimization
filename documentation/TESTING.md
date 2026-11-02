# Testing

## Frontend and engine

```bash
pnpm test
pnpm build
```

Vitest covers:

- non-conflicting signals;
- lane following distance;
- five-vehicle batch cap;
- all-red transition;
- Q-table creation, action validity, measured rewards and reproducibility.

## Backend

```bash
pytest -q tests/backend
```

Pytest covers:

- FastAPI health and training endpoints;
- Q-learning reproducibility;
- yellow/all-red sequencing;
- five-vehicle batch policy;
- collision detection.

## Manual acceptance

1. Start, pause, reset and change simulation speed.
2. Run each algorithm and verify charts update only while running.
3. Apply the adaptive recommendation during a green phase.
4. Upload a valid and invalid CSV; inspect missing/duplicate reporting.
5. Export the processed CSV.
6. Save a run and reopen it in Simulation History.
7. Export measured run CSV and PDF.
8. Confirm synthetic/SUMO labels are visible.
