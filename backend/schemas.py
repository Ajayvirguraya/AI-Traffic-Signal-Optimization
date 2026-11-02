from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Algorithm = Literal["FIXED", "ADAPTIVE", "Q_LEARNING"]
Density = Literal["LOW", "MEDIUM", "HIGH", "EXTREME"]


class SimulationCreate(BaseModel):
    algorithm: Algorithm
    duration: int = Field(ge=1, le=86400)
    traffic_density: Density
    total_vehicles: int = Field(ge=0)
    average_waiting_time: float = Field(ge=0)
    average_queue_length: float = Field(ge=0)
    throughput: float = Field(ge=0)
    congestion_percentage: float = Field(ge=0, le=100)
    measurements: list[dict] = Field(default_factory=list, max_length=3600)


class SimulationRead(SimulationCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class TrainRequest(BaseModel):
    episodes: int = Field(default=400, ge=50, le=5000)
    learning_rate: float = Field(default=0.18, gt=0, le=1)
    discount_factor: float = Field(default=0.92, ge=0, le=1)
    exploration_rate: float = Field(default=0.2, ge=0, le=1)
    seed: int = 276
