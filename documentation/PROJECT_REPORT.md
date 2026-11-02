# Adaptive Traffic Signal Optimization Agent

## Project identification

- Project ID: P02
- Course: CSE276
- University: Lovely Professional University
- Department: School of Computer Science
- Domain: Artificial Intelligence and Machine Learning
- Academic year: 2nd Year
- Team: Ajayvir Singh (12503533), Gupreet Singh (12515584), Arpit (12515044)

## Introduction

ATSO is an educational traffic-control simulation that evaluates signal
strategies against the same deterministic lane and vehicle model. It connects
vehicle movement, safe signal transitions, algorithm decisions, data processing
and measured analytics in one application.

## Problem statement and need

Fixed schedules cannot react to uneven traffic demand. Long queues increase
delay, fuel use and emissions, while unsafe or opaque adaptive decisions are
not suitable for study. ATSO provides an explainable environment for comparing
fixed-time, queue-based and reinforcement-learning approaches.

## Societal impact

Adaptive control research can support reduced delay, lower idling emissions and
more reliable urban travel. ATSO is not a production controller; deployment
would require calibrated field data, transport-authority approval, hardware
integration and formal safety validation.

## Dataset

Source: SUMO documentation, <https://sumo.dlr.de/docs/>. The included file
`dataset/atso_synthetic_sample.csv` contains 120 reproducible synthetic rows.
It is clearly labeled synthetic and is not presented as real traffic.

Features: timestamp, four directional vehicle counts, queue length, waiting
time, traffic density, signal duration and throughput.

Preprocessing: normalized column names, schema validation, missing-value
detection, exact duplicate removal, numeric conversion, feature selection,
descriptive statistics and processed CSV export.

## Models

1. **Fixed-time:** deterministic baseline using predetermined timing.
2. **Adaptive queue-based:** ranks queue length, waiting time and congestion,
   with starvation awareness.
3. **Tabular Q-learning:** state buckets encode queue, density, waiting time and
   current direction. Twelve actions combine four directions and three green
   durations. The reward favors throughput and penalizes queue, waiting and
   starvation.

These models provide an interpretable baseline, a responsive heuristic and a
learning policy without pretending that one simulated result generalizes to a
real road network.

## Evaluation metrics

Average waiting time, average queue length, throughput, congestion percentage,
completed vehicles, signal efficiency and per-episode Q-learning reward.

## Model comparison

The application records each run and compares only modes that have actual
samples. No fixed numerical superiority claim is included in this report.
Run controlled experiments with identical density, duration and seed, then add
the exported measurements and statistical analysis before final submission.

## Safety

One direction is active at a time. A batch ends after at most five vehicles
physically clear. Yellow and all-red intervals precede conflicting service.
Vehicle movement enforces lane assignment, safe following distance, occupied
spawn avoidance and conflict-zone exclusion.

## Individual contributions

**Requires team input before submission.** Individual contributions were not
provided and have not been invented.

## Limitations

- The browser simulation is a simplified microscopic model.
- Turning paths, pedestrian phases, emergency priority and multi-junction
  coordination require further calibration and validation.
- Q-learning is trained on reproducible synthetic states, not field deployment
  data.
- Uploaded “real-world” labels depend on user-supplied provenance.

## Future scope

SUMO/TraCI live integration, calibrated turning movements, pedestrians,
emergency vehicles, graph-based corridor coordination, deep reinforcement
learning, fairness constraints, digital-twin validation and deployment-grade
fault tolerance.

## References

1. Eclipse SUMO Documentation, <https://sumo.dlr.de/docs/>.
2. Sutton, R. S. and Barto, A. G., _Reinforcement Learning: An Introduction_.
3. FastAPI Documentation, <https://fastapi.tiangolo.com/>.
4. Payload Documentation, <https://payloadcms.com/docs>.
5. Next.js Documentation, <https://nextjs.org/docs>.

No certificate page is included.
