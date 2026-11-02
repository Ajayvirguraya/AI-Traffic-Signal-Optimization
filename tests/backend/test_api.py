import os

os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from fastapi.testclient import TestClient

from backend.main import app


def test_health_and_training_endpoints():
    with TestClient(app) as client:
        health = client.get("/health")
        assert health.status_code == 200
        assert health.json()["status"] == "ok"

        training = client.post("/api/q-learning/train", json={"episodes": 60, "seed": 276})
        assert training.status_code == 200
        assert len(training.json()["rewards"]) == 60
