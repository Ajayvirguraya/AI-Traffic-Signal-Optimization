from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import SimulationRun
from .q_learning import QLearningController, TrainingConfig
from .schemas import SimulationCreate, SimulationRead, TrainRequest


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="ATSO API",
    version="1.0.0",
    description="CSE276 Adaptive Traffic Signal Optimization REST and WebSocket API",
    lifespan=lifespan,
)


@app.get("/health")
def health():
    return {"status": "ok", "database": "configured"}


@app.get("/api/simulations", response_model=list[SimulationRead])
def list_simulations(database: Session = Depends(get_db)):
    return database.scalars(select(SimulationRun).order_by(SimulationRun.created_at.desc())).all()


@app.post("/api/simulations", response_model=SimulationRead, status_code=201)
def create_simulation(data: SimulationCreate, database: Session = Depends(get_db)):
    record = SimulationRun(**data.model_dump())
    database.add(record)
    database.commit()
    database.refresh(record)
    return record


@app.post("/api/q-learning/train")
def train_q_learning(request: TrainRequest):
    controller = QLearningController(
        TrainingConfig(
            episodes=request.episodes,
            learning_rate=request.learning_rate,
            discount_factor=request.discount_factor,
            exploration_rate=request.exploration_rate,
            seed=request.seed,
        )
    )
    return controller.train()


@app.websocket("/ws/simulation")
async def simulation_socket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            state = await websocket.receive_json()
            await websocket.send_json({"type": "simulation_state", "state": state})
    except WebSocketDisconnect:
        return
