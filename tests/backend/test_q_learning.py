from backend.q_learning import QLearningController, TrainingConfig


def test_q_learning_is_reproducible_and_measured():
    first = QLearningController(TrainingConfig(episodes=100, seed=276)).train()
    second = QLearningController(TrainingConfig(episodes=100, seed=276)).train()
    assert first["rewards"] == second["rewards"]
    assert first["q_table_size"] > 0
    assert len(first["rewards"]) == 100
