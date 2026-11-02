from dataclasses import dataclass, field

DIRECTIONS = ("North", "South", "East", "West")
MAX_BATCH_SIZE = 5
YELLOW_SECONDS = 3
ALL_RED_SECONDS = 2
SAFE_GAP = 8.0


@dataclass
class Vehicle:
    id: str
    lane: str
    position: float
    speed: float = 0
    waiting_time: float = 0


@dataclass
class Intersection:
    queues: dict[str, list[Vehicle]]
    active_direction: str = "North"
    phase: str = "GREEN"
    batch_cleared: int = 0
    completed: int = 0
    elapsed: int = 0
    events: list[dict] = field(default_factory=list)

    def choose_adaptive_direction(self) -> str:
        return max(
            DIRECTIONS,
            key=lambda lane: (
                len(self.queues[lane]) * 3
                + sum(vehicle.waiting_time for vehicle in self.queues[lane])
            ),
        )

    def tick(self) -> None:
        self.elapsed += 1
        if self.phase == "GREEN":
            lane = self.queues[self.active_direction]
            if lane and self.batch_cleared < MAX_BATCH_SIZE:
                vehicle = lane.pop(0)
                vehicle.position = 100
                self.batch_cleared += 1
                self.completed += 1
            for direction in DIRECTIONS:
                for vehicle in self.queues[direction]:
                    vehicle.waiting_time += 1
            if self.batch_cleared >= MAX_BATCH_SIZE or not lane:
                self.phase, self.elapsed = "YELLOW", 0
        elif self.phase == "YELLOW" and self.elapsed >= YELLOW_SECONDS:
            self.phase, self.elapsed = "ALL_RED", 0
        elif self.phase == "ALL_RED" and self.elapsed >= ALL_RED_SECONDS:
            self.active_direction = self.choose_adaptive_direction()
            self.phase, self.elapsed, self.batch_cleared = "GREEN", 0, 0
        self.events.append(
            {
                "phase": self.phase,
                "active_direction": self.active_direction,
                "batch_cleared": self.batch_cleared,
                "completed": self.completed,
            }
        )


def collision_free(vehicles: list[Vehicle]) -> bool:
    by_lane: dict[str, list[float]] = {lane: [] for lane in DIRECTIONS}
    for vehicle in vehicles:
        by_lane[vehicle.lane].append(vehicle.position)
    return all(
        all(b - a >= SAFE_GAP for a, b in zip(sorted(positions), sorted(positions)[1:]))
        for positions in by_lane.values()
    )
