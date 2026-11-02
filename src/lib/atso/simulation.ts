export type Density = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME'
export type Mode = 'AI' | 'FIXED' | 'Q_LEARNING'
export type Direction = 'North' | 'South' | 'East' | 'West'
export type SignalGroup = 'NORTH_SOUTH' | 'EAST_WEST'
export type SignalPhase =
  | 'NORTH_SOUTH_GREEN'
  | 'NORTH_SOUTH_YELLOW'
  | 'ALL_RED_TO_EAST_WEST'
  | 'EAST_WEST_GREEN'
  | 'EAST_WEST_YELLOW'
  | 'ALL_RED_TO_NORTH_SOUTH'
export type SignalColor = 'RED' | 'YELLOW' | 'GREEN'
export type PriorityLevel = 'NORMAL' | 'HIGH PRIORITY'

export type Vehicle = {
  id: string
  lane: Direction
  position: number
  speed: number
  waitingTime: number
  color: 'cyan' | 'white' | 'amber' | 'red'
}

export type LaneState = {
  vehicleCount: number
  queueLength: number
  averageWaitingTime: number
  congestionScore: number
  priority: PriorityLevel
}

export type HistoryPoint = {
  time: number
  label: string
  waitingTime: number
  queueLength: number
  throughput: number
  density: number
  signalEfficiency: number
  congestion: number
  mode: Mode
  fixedWaitingTime: number | null
  adaptiveWaitingTime: number | null
  qLearningWaitingTime: number | null
}

export type SimulationState = {
  running: boolean
  speed: number
  trafficDensity: Density
  aiMode: Mode
  simulationTime: number
  tick: number
  vehicleCount: number
  queueLength: number
  waitingTime: number
  throughput: number
  signalEfficiency: number
  congestion: number
  signalPhase: SignalPhase
  signalElapsed: number
  signalDuration: number
  nextSignalGroup: SignalGroup | null
  aiExtensionSeconds: number
  aiExtensionPhase: SignalPhase | null
  laneStates: Record<Direction, LaneState>
  vehiclePositions: Vehicle[]
  vehicleSpeeds: Record<string, number>
  completedVehicles: number
  recentExitTimes: number[]
  nextVehicleId: number
  history: HistoryPoint[]
  decisionApplied: boolean
  decisionLane: Direction | null
  batchCleared: number
  batchTarget: number
}

export type Recommendation = {
  target: Direction
  extension: number
  confidence: number
  serial: boolean
  congestedLanes: Direction[]
  headline: string
  detail: string
  why: string
}

export const directions: Direction[] = ['North', 'South', 'East', 'West']

export const densitySettings: Record<
  Density,
  { initial: Record<Direction, number>; score: number }
> = {
  LOW: {
    initial: { North: 3, South: 3, East: 3, West: 3 },
    score: 25,
  },
  MEDIUM: {
    initial: { North: 8, South: 7, East: 4, West: 3 },
    score: 50,
  },
  HIGH: {
    initial: { North: 10, South: 9, East: 8, West: 6 },
    score: 75,
  },
  EXTREME: {
    initial: { North: 10, South: 10, East: 10, West: 10 },
    score: 100,
  },
}

export const SAFE_FOLLOWING_DISTANCE = 8
export const MINIMUM_VEHICLE_GAP = 5
export const GREEN_DURATION = 30
export const YELLOW_DURATION = 3
export const ALL_RED_DURATION = 2
export const AI_MAX_EXTENSION = 6
export const MAX_GREEN_DURATION = GREEN_DURATION + AI_MAX_EXTENSION
export const MAX_BATCH_SIZE = 5

const STOP_LINE = 36
const INTERSECTION_EXIT = 68
const REQUIRED_VEHICLE_SPACING = Math.max(SAFE_FOLLOWING_DISTANCE, MINIMUM_VEHICLE_GAP)
const colors: Vehicle['color'][] = ['cyan', 'white', 'amber', 'red']

export const groupForDirection = (direction: Direction): SignalGroup =>
  direction === 'North' || direction === 'South' ? 'NORTH_SOUTH' : 'EAST_WEST'

export const groupForPhase = (phase: SignalPhase): SignalGroup =>
  phase.startsWith('NORTH_SOUTH') || phase === 'ALL_RED_TO_NORTH_SOUTH'
    ? 'NORTH_SOUTH'
    : 'EAST_WEST'

export const greenPhaseFor = (group: SignalGroup): SignalPhase =>
  group === 'NORTH_SOUTH' ? 'NORTH_SOUTH_GREEN' : 'EAST_WEST_GREEN'

export const yellowPhaseFor = (group: SignalGroup): SignalPhase =>
  group === 'NORTH_SOUTH' ? 'NORTH_SOUTH_YELLOW' : 'EAST_WEST_YELLOW'

export const getSignalColor = (
  direction: Direction,
  phase: SignalPhase,
  activeDirection?: Direction | null,
): SignalColor => {
  if (phase.startsWith('ALL_RED')) return 'RED'
  const directionGroup = groupForDirection(direction)
  if (directionGroup !== groupForPhase(phase)) return 'RED'
  if (phase.endsWith('_GREEN') && activeDirection && direction !== activeDirection) return 'RED'
  return phase.endsWith('_GREEN') ? 'GREEN' : 'YELLOW'
}

export const phaseLabel = (phase: SignalPhase) => phase.replace(/_/g, ' ')

type PhaseTransition = {
  signalPhase: SignalPhase
  signalDuration: number
  signalElapsed: number
  aiExtensionSeconds: number
  aiExtensionPhase: SignalPhase | null
}

export const transitionToNextPhase = (currentPhase: SignalPhase): PhaseTransition => {
  switch (currentPhase) {
    case 'NORTH_SOUTH_GREEN':
      return {
        signalPhase: 'NORTH_SOUTH_YELLOW',
        signalDuration: YELLOW_DURATION,
        signalElapsed: 0,
        aiExtensionSeconds: 0,
        aiExtensionPhase: null,
      }
    case 'NORTH_SOUTH_YELLOW':
      return {
        signalPhase: 'ALL_RED_TO_EAST_WEST',
        signalDuration: ALL_RED_DURATION,
        signalElapsed: 0,
        aiExtensionSeconds: 0,
        aiExtensionPhase: null,
      }
    case 'ALL_RED_TO_EAST_WEST':
      return {
        signalPhase: 'EAST_WEST_GREEN',
        signalDuration: GREEN_DURATION,
        signalElapsed: 0,
        aiExtensionSeconds: 0,
        aiExtensionPhase: null,
      }
    case 'EAST_WEST_GREEN':
      return {
        signalPhase: 'EAST_WEST_YELLOW',
        signalDuration: YELLOW_DURATION,
        signalElapsed: 0,
        aiExtensionSeconds: 0,
        aiExtensionPhase: null,
      }
    case 'EAST_WEST_YELLOW':
      return {
        signalPhase: 'ALL_RED_TO_NORTH_SOUTH',
        signalDuration: ALL_RED_DURATION,
        signalElapsed: 0,
        aiExtensionSeconds: 0,
        aiExtensionPhase: null,
      }
    case 'ALL_RED_TO_NORTH_SOUTH':
      return {
        signalPhase: 'NORTH_SOUTH_GREEN',
        signalDuration: GREEN_DURATION,
        signalElapsed: 0,
        aiExtensionSeconds: 0,
        aiExtensionPhase: null,
      }
  }
}

const emptyLaneState = (): LaneState => ({
  vehicleCount: 0,
  queueLength: 0,
  averageWaitingTime: 0,
  congestionScore: 0,
  priority: 'NORMAL',
})

const makeVehicles = (density: Density) => {
  let id = 1
  return directions.flatMap((lane, laneIndex) =>
    Array.from({ length: densitySettings[density].initial[lane] }, (_, index) => ({
      id: `v-${id++}`,
      lane,
      position: STOP_LINE - index * REQUIRED_VEHICLE_SPACING,
      speed: 0,
      waitingTime: index,
      color: colors[(index + laneIndex) % colors.length],
    })),
  )
}

const priorityFor = (count: number): PriorityLevel => (count > 5 ? 'HIGH PRIORITY' : 'NORMAL')

const calculateLaneStates = (vehicles: Vehicle[]) =>
  directions.reduce(
    (states, lane) => {
      const laneVehicles = vehicles.filter((vehicle) => vehicle.lane === lane)
      const averageWaitingTime = laneVehicles.length
        ? laneVehicles.reduce((sum, vehicle) => sum + vehicle.waitingTime, 0) / laneVehicles.length
        : 0
      const vehicleCount = laneVehicles.length
      states[lane] = {
        vehicleCount,
        queueLength: vehicleCount,
        averageWaitingTime: Math.round(averageWaitingTime),
        congestionScore: Math.min(100, Math.round(vehicleCount * 8 + averageWaitingTime * 1.5)),
        priority: priorityFor(vehicleCount),
      }
      return states
    },
    {
      North: emptyLaneState(),
      South: emptyLaneState(),
      East: emptyLaneState(),
      West: emptyLaneState(),
    } as Record<Direction, LaneState>,
  )

const rankedLanes = (laneStates: Record<Direction, LaneState>) =>
  [...directions].sort((first, second) => {
    const countDifference = laneStates[second].vehicleCount - laneStates[first].vehicleCount
    return countDifference || directions.indexOf(first) - directions.indexOf(second)
  })

export const analyzeTraffic = (state: SimulationState): Recommendation => {
  const ranking = rankedLanes(state.laneStates)
  const congestedLanes = ranking.filter((lane) => state.laneStates[lane].vehicleCount > 5)
  const currentPriorityLane =
    state.decisionLane && state.laneStates[state.decisionLane].vehicleCount > 5
      ? state.decisionLane
      : null
  const target = currentPriorityLane ?? congestedLanes[0] ?? ranking[0] ?? 'North'
  const lane = state.laneStates[target]
  const extension = AI_MAX_EXTENSION
  const serial = congestedLanes.length > 1
  const confidence = Math.min(98, 82 + lane.vehicleCount * 1.5)
  const laneList = congestedLanes.join(' and ')

  return {
    target,
    extension,
    confidence: Math.round(confidence),
    serial,
    congestedLanes,
    headline: congestedLanes.length
      ? `${target.toUpperCase()} PRIORITIZED`
      : 'NORMAL TRAFFIC OPERATION',
    detail: serial
      ? currentPriorityLane
        ? `SERIAL PRIORITY ACTIVE — ${target} is being served until it reaches 5 cars. Remaining lanes will then be ranked again.`
        : `SERIAL PRIORITY ACTIVE — ${laneList} exceeded the 5-car threshold. ${target} has the highest active count.`
      : congestedLanes.length
        ? `${lane.vehicleCount} cars detected — priority threshold exceeded.`
        : 'Every lane is within the normal 3–5 car range.',
    why: `${target} currently has ${lane.vehicleCount} active cars. ATSO maps this lane to the compatible ${groupForDirection(target).replace('_', '/')} corridor phase, serves one ranked priority at a time and recalculates when the lane reaches 5 cars.`,
  }
}

const moveVehicles = (
  vehicles: Vehicle[],
  signalPhase: SignalPhase,
  density: Density,
  activeDirection: Direction | null,
) => {
  const moved: Vehicle[] = []
  let exits = 0
  const activeGroup = groupForPhase(signalPhase)
  const allRed = signalPhase.startsWith('ALL_RED')
  const conflictingVehicleInIntersection = vehicles.some(
    (vehicle) =>
      (allRed || groupForDirection(vehicle.lane) !== activeGroup) &&
      vehicle.position > STOP_LINE &&
      vehicle.position < INTERSECTION_EXIT,
  )
  const maximumSpeed = density === 'EXTREME' ? 2.4 : density === 'HIGH' ? 2.6 : 2.8
  const acceleration = 0.62
  const deceleration = 0.9

  directions.forEach((lane) => {
    const laneVehicles = vehicles
      .filter((vehicle) => vehicle.lane === lane)
      .sort((first, second) => second.position - first.position)
    let vehicleAheadNext: Vehicle | undefined
    let vehicleAheadPrevious: Vehicle | undefined

    laneVehicles.forEach((vehicle) => {
      const lightColor = getSignalColor(lane, signalPhase, activeDirection)
      const hasEnteredIntersection = vehicle.position > STOP_LINE
      const canEnter = lightColor === 'GREEN' && !conflictingVehicleInIntersection
      const distanceToStopLine = Math.max(0, STOP_LINE - vehicle.position)
      const brakingSpeed = Math.sqrt(2 * deceleration * distanceToStopLine)
      let desiredSpeed =
        hasEnteredIntersection || canEnter ? maximumSpeed : Math.min(maximumSpeed, brakingSpeed)

      if (vehicleAheadPrevious && vehicleAheadPrevious.speed < 0.1 && vehicle.speed < 0.1) {
        desiredSpeed = 0
      }

      if (vehicleAheadNext) {
        const availableDistance =
          vehicleAheadNext.position - REQUIRED_VEHICLE_SPACING - vehicle.position
        desiredSpeed = Math.min(desiredSpeed, Math.max(0, availableDistance))
      }

      let speed =
        desiredSpeed > vehicle.speed
          ? Math.min(desiredSpeed, vehicle.speed + acceleration)
          : Math.max(desiredSpeed, vehicle.speed - deceleration)
      let nextPosition = vehicle.position + speed

      if (!hasEnteredIntersection && !canEnter) {
        nextPosition = Math.min(nextPosition, STOP_LINE)
        speed = Math.max(0, nextPosition - vehicle.position)
      }
      if (vehicleAheadNext) {
        const maximumPosition = vehicleAheadNext.position - REQUIRED_VEHICLE_SPACING
        nextPosition = Math.min(nextPosition, maximumPosition)
        speed = Math.max(0, nextPosition - vehicle.position)
      }

      const nextVehicle: Vehicle = {
        ...vehicle,
        position: nextPosition,
        speed,
        waitingTime:
          speed < 0.15 && vehicle.position < INTERSECTION_EXIT
            ? vehicle.waitingTime + 1
            : vehicle.waitingTime,
      }

      if (nextVehicle.position > 103) {
        exits += 1
      } else {
        moved.push(nextVehicle)
        vehicleAheadNext = nextVehicle
      }
      vehicleAheadPrevious = vehicle
    })
  })

  return { vehicles: moved, exits }
}

const spawnReplacements = (
  vehicles: Vehicle[],
  nextId: number,
): { vehicles: Vehicle[]; nextVehicleId: number } => {
  const spawned = [...vehicles]
  let nextVehicleId = nextId

  directions.forEach((lane, laneIndex) => {
    const laneVehicles = spawned.filter((vehicle) => vehicle.lane === lane)
    if (laneVehicles.length >= 3) return
    const laneTail = laneVehicles.reduce(
      (minimum, vehicle) => Math.min(minimum, vehicle.position),
      Number.POSITIVE_INFINITY,
    )
    const spawnPosition = Number.isFinite(laneTail)
      ? Math.min(0, laneTail - REQUIRED_VEHICLE_SPACING)
      : 0
    spawned.push({
      id: `v-${nextVehicleId}`,
      lane,
      position: spawnPosition,
      speed: 0,
      waitingTime: 0,
      color: colors[(nextVehicleId + laneIndex) % colors.length],
    })
    nextVehicleId += 1
  })

  return { vehicles: spawned, nextVehicleId }
}

export const createInitialSimulation = (density: Density = 'MEDIUM'): SimulationState => {
  const vehicles = makeVehicles(density)
  const laneStates = calculateLaneStates(vehicles)
  const queueLength = Object.values(laneStates).reduce((sum, lane) => sum + lane.queueLength, 0)
  return {
    running: false,
    speed: 1,
    trafficDensity: density,
    aiMode: 'AI',
    simulationTime: 0,
    tick: 0,
    vehicleCount: vehicles.length,
    queueLength,
    waitingTime: 0,
    throughput: 0,
    signalEfficiency: 68,
    congestion: Math.min(100, Math.round(queueLength * 3.2)),
    signalPhase: 'NORTH_SOUTH_GREEN',
    signalElapsed: 0,
    signalDuration: GREEN_DURATION,
    nextSignalGroup: null,
    aiExtensionSeconds: 0,
    aiExtensionPhase: null,
    laneStates,
    vehiclePositions: vehicles,
    vehicleSpeeds: Object.fromEntries(vehicles.map((vehicle) => [vehicle.id, vehicle.speed])),
    completedVehicles: 0,
    recentExitTimes: [],
    nextVehicleId: vehicles.length + 1,
    history: [],
    decisionApplied: false,
    decisionLane: 'North',
    batchCleared: 0,
    batchTarget: MAX_BATCH_SIZE,
  }
}

export const advanceSimulation = (state: SimulationState): SimulationState => {
  if (!state.running) return state

  let signalPhase = state.signalPhase
  let signalElapsed = state.signalElapsed + 1
  let signalDuration = state.signalDuration
  let aiExtensionSeconds = state.aiExtensionSeconds
  let aiExtensionPhase = state.aiExtensionPhase
  let decisionLane = state.decisionLane
  let batchCleared = state.batchCleared

  if (
    signalPhase.endsWith('_GREEN') &&
    batchCleared >= state.batchTarget &&
    !state.vehiclePositions.some(
      (vehicle) =>
        vehicle.lane === decisionLane &&
        vehicle.position > STOP_LINE &&
        vehicle.position < INTERSECTION_EXIT,
    )
  ) {
    signalElapsed = signalDuration
  }

  if (signalElapsed >= signalDuration) {
    const transition = transitionToNextPhase(signalPhase)
    signalPhase = transition.signalPhase
    signalDuration = transition.signalDuration
    signalElapsed = transition.signalElapsed
    aiExtensionSeconds = transition.aiExtensionSeconds
    aiExtensionPhase = transition.aiExtensionPhase
    if (signalPhase.endsWith('_GREEN')) {
      const nextGroup = groupForPhase(signalPhase)
      if (state.aiMode === 'Q_LEARNING') {
        const qAction = selectQAction(
          defaultQLearningResult,
          state.laneStates,
          state.decisionLane ?? 'North',
        )
        decisionLane =
          groupForDirection(qAction.direction) === nextGroup
            ? qAction.direction
            : (rankedLanes(state.laneStates).find(
                (lane) => groupForDirection(lane) === nextGroup,
              ) ?? null)
        signalDuration = qAction.duration
      } else {
        decisionLane =
          rankedLanes(state.laneStates).find((lane) => groupForDirection(lane) === nextGroup) ??
          null
      }
      batchCleared = 0
    }
  }

  const movement = moveVehicles(
    state.vehiclePositions,
    signalPhase,
    state.trafficDensity,
    decisionLane,
  )
  const clearedByPriority = state.vehiclePositions.filter(
    (vehicle) =>
      vehicle.lane === decisionLane &&
      !movement.vehicles.some((next) => next.id === vehicle.id) &&
      vehicle.position > INTERSECTION_EXIT,
  ).length
  batchCleared = Math.min(state.batchTarget, batchCleared + clearedByPriority)
  const spawning = spawnReplacements(movement.vehicles, state.nextVehicleId)
  const laneStates = calculateLaneStates(spawning.vehicles)
  const laneValues = Object.values(laneStates)
  const queueLength = laneValues.reduce((sum, lane) => sum + lane.queueLength, 0)
  const waitingTotal = spawning.vehicles.reduce((sum, vehicle) => sum + vehicle.waitingTime, 0)
  const waitingTime = spawning.vehicles.length
    ? Math.round(waitingTotal / spawning.vehicles.length)
    : 0
  const simulationTime = state.simulationTime + 1
  const recentExitTimes = [
    ...state.recentExitTimes.filter((time) => simulationTime - time < 60),
    ...Array.from({ length: movement.exits }, () => simulationTime),
  ]
  const observedWindow = Math.max(1, Math.min(60, simulationTime))
  const throughput = Math.round((recentExitTimes.length / observedWindow) * 60)
  const congestion = spawning.vehicles.length
    ? Math.min(100, Math.round((queueLength / spawning.vehicles.length) * 70 + waitingTime * 1.3))
    : 0
  const activeDirections =
    groupForPhase(signalPhase) === 'NORTH_SOUTH'
      ? (['North', 'South'] as Direction[])
      : (['East', 'West'] as Direction[])
  const activeDemand = activeDirections.reduce(
    (sum, lane) => sum + laneStates[lane].vehicleCount,
    0,
  )
  const signalEfficiency = Math.max(
    20,
    Math.min(
      100,
      Math.round(55 + activeDemand * 2 - congestion * 0.22 + (state.aiMode === 'AI' ? 9 : 0)),
    ),
  )
  const historyPoint: HistoryPoint = {
    time: simulationTime,
    label: `${String(Math.floor(simulationTime / 60)).padStart(2, '0')}:${String(
      simulationTime % 60,
    ).padStart(2, '0')}`,
    waitingTime,
    queueLength,
    throughput,
    density: densitySettings[state.trafficDensity].score,
    signalEfficiency,
    congestion,
    mode: state.aiMode,
    fixedWaitingTime: state.aiMode === 'FIXED' ? waitingTime : null,
    adaptiveWaitingTime: state.aiMode === 'AI' ? waitingTime : null,
    qLearningWaitingTime: state.aiMode === 'Q_LEARNING' ? waitingTime : null,
  }

  return {
    ...state,
    simulationTime,
    tick: state.tick + 1,
    signalPhase,
    signalElapsed,
    signalDuration,
    nextSignalGroup: null,
    aiExtensionSeconds,
    aiExtensionPhase,
    laneStates,
    vehiclePositions: spawning.vehicles,
    vehicleSpeeds: Object.fromEntries(
      spawning.vehicles.map((vehicle) => [vehicle.id, vehicle.speed]),
    ),
    vehicleCount: spawning.vehicles.length,
    queueLength,
    waitingTime,
    throughput,
    signalEfficiency,
    congestion,
    completedVehicles: state.completedVehicles + movement.exits,
    recentExitTimes,
    nextVehicleId: spawning.nextVehicleId,
    history: [...state.history.slice(-119), historyPoint],
    decisionLane,
    batchCleared,
  }
}

export const applyAiDecision = (state: SimulationState): SimulationState => {
  const recommendation = analyzeTraffic(state)
  const currentIsGreen = state.signalPhase.endsWith('_GREEN')
  if (!currentIsGreen) return state

  const currentGroup = groupForPhase(state.signalPhase)
  const targetGreenPhase = greenPhaseFor(currentGroup)
  const extensionAlreadyApplied = state.aiExtensionPhase === targetGreenPhase
  const extensionSeconds = extensionAlreadyApplied
    ? state.aiExtensionSeconds
    : recommendation.extension
  const extendedDuration = extensionAlreadyApplied
    ? state.signalDuration
    : Math.min(GREEN_DURATION + recommendation.extension, MAX_GREEN_DURATION)
  const compatiblePriority =
    rankedLanes(state.laneStates).find((lane) => groupForDirection(lane) === currentGroup) ??
    recommendation.target

  return {
    ...state,
    running: true,
    aiMode: 'AI',
    signalPhase: state.signalPhase,
    signalElapsed: state.signalElapsed,
    signalDuration: extendedDuration,
    nextSignalGroup: null,
    aiExtensionSeconds: extensionSeconds,
    aiExtensionPhase: targetGreenPhase,
    decisionApplied: true,
    decisionLane: compatiblePriority,
  }
}

export const changeDensity = (state: SimulationState, density: Density): SimulationState => {
  const fresh = createInitialSimulation(density)
  return {
    ...fresh,
    running: state.running,
    speed: state.speed,
    aiMode: state.aiMode,
    history: state.history,
    simulationTime: state.simulationTime,
    tick: state.tick,
  }
}
import { defaultQLearningResult, selectQAction } from './qlearning'
