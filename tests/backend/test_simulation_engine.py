from backend.simulation_engine import (
    DIRECTIONS,
    MAX_BATCH_SIZE,
    Intersection,
    Vehicle,
    collision_free,
)


def make_intersection(count: int = 8) -> Intersection:
    queues = {
        lane: [Vehicle(f"{lane}-{index}", lane, index * 8) for index in range(count)]
        for lane in DIRECTIONS
    }
    return Intersection(queues=queues)


def test_batch_never_exceeds_five():
    intersection = make_intersection()
    for _ in range(30):
        intersection.tick()
        assert intersection.batch_cleared <= MAX_BATCH_SIZE


def test_yellow_and_all_red_are_observed():
    intersection = make_intersection()
    phases = []
    for _ in range(15):
        intersection.tick()
        phases.append(intersection.phase)
    assert "YELLOW" in phases
    assert "ALL_RED" in phases


def test_collision_detection_rejects_overlap():
    safe = [Vehicle("a", "North", 0), Vehicle("b", "North", 8)]
    unsafe = [Vehicle("a", "North", 0), Vehicle("b", "North", 3)]
    assert collision_free(safe)
    assert not collision_free(unsafe)
