import random
from dataclasses import asdict, dataclass

DIRECTIONS = ("North", "South", "East", "West")
DURATIONS = (18, 24, 30)
ACTIONS = tuple((direction, duration) for direction in DIRECTIONS for duration in DURATIONS)


@dataclass(frozen=True)
class TrainingConfig:
    episodes: int = 400
    learning_rate: float = 0.18
    discount_factor: float = 0.92
    exploration_rate: float = 0.2
    seed: int = 276


class QLearningController:
    def __init__(self, config: TrainingConfig):
        self.config = config
        self.random = random.Random(config.seed)
        self.q_table: dict[str, list[float]] = {}
        self.rewards: list[float] = []

    @staticmethod
    def _bucket(value: float, low: float, high: float) -> int:
        return 0 if value <= low else 1 if value <= high else 2

    def encode(self, queues: dict[str, int], waits: dict[str, float], current: str) -> str:
        total_queue = sum(queues.values())
        density = total_queue / 40
        mean_wait = sum(waits.values()) / 4
        return ":".join(
            map(
                str,
                (
                    self._bucket(total_queue, 12, 25),
                    self._bucket(density, 0.35, 0.7),
                    self._bucket(mean_wait, 10, 30),
                    DIRECTIONS.index(current),
                ),
            )
        )

    @staticmethod
    def reward(queues: dict[str, int], waits: dict[str, float], action: tuple[str, int]) -> float:
        direction, _ = action
        throughput = min(5, queues[direction])
        starvation = sum(8 for lane in DIRECTIONS if lane != direction and waits[lane] > 35)
        return throughput * 8 - sum(queues.values()) * 0.45 - sum(waits.values()) * 0.08 - starvation

    def train(self) -> dict:
        current = "North"
        for _ in range(self.config.episodes):
            queues = {lane: self.random.randint(2, 13) for lane in DIRECTIONS}
            waits = {lane: self.random.randint(0, 45) for lane in DIRECTIONS}
            state = self.encode(queues, waits, current)
            values = self.q_table.setdefault(state, [0.0] * len(ACTIONS))
            if self.random.random() < self.config.exploration_rate:
                action_index = self.random.randrange(len(ACTIONS))
            else:
                action_index = max(range(len(values)), key=values.__getitem__)
            action = ACTIONS[action_index]
            reward = self.reward(queues, waits, action)
            next_queues = queues | {action[0]: max(0, queues[action[0]] - 5)}
            next_state = self.encode(next_queues, waits, action[0])
            next_values = self.q_table.setdefault(next_state, [0.0] * len(ACTIONS))
            target = reward + self.config.discount_factor * max(next_values)
            values[action_index] += self.config.learning_rate * (target - values[action_index])
            self.rewards.append(round(reward, 2))
            current = action[0]
        return {
            "config": asdict(self.config),
            "rewards": self.rewards,
            "q_table_size": len(self.q_table),
            "final_mean_reward": sum(self.rewards[-50:]) / min(50, len(self.rewards)),
        }
