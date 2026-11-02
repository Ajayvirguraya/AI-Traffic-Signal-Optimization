from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    algorithm: Mapped[str] = mapped_column(String(24), index=True)
    duration: Mapped[int] = mapped_column(Integer)
    traffic_density: Mapped[str] = mapped_column(String(16))
    total_vehicles: Mapped[int] = mapped_column(Integer)
    average_waiting_time: Mapped[float] = mapped_column(Float)
    average_queue_length: Mapped[float] = mapped_column(Float)
    throughput: Mapped[float] = mapped_column(Float)
    congestion_percentage: Mapped[float] = mapped_column(Float)
    measurements: Mapped[list] = mapped_column(JSON, default=list)


class DatasetRecord(Base):
    __tablename__ = "datasets"

    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    name: Mapped[str] = mapped_column(String(180))
    source_type: Mapped[str] = mapped_column(String(32))
    record_count: Mapped[int] = mapped_column(Integer)
    missing_values: Mapped[int] = mapped_column(Integer)
    duplicate_rows: Mapped[int] = mapped_column(Integer)
    statistics: Mapped[dict] = mapped_column(JSON, default=dict)


class AlgorithmConfig(Base):
    __tablename__ = "algorithm_configs"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)
    algorithm: Mapped[str] = mapped_column(String(24))
    green_duration: Mapped[int] = mapped_column(Integer, default=30)
    yellow_duration: Mapped[int] = mapped_column(Integer, default=3)
    all_red_duration: Mapped[int] = mapped_column(Integer, default=2)
    maximum_batch_size: Mapped[int] = mapped_column(Integer, default=5)
    parameters: Mapped[dict] = mapped_column(JSON, default=dict)
