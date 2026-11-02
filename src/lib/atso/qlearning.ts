import type { Direction, LaneState } from './simulation'

export type QAction = {
  direction: Direction
  duration: 18 | 24 | 30
}

export type QLearningConfig = {
  learningRate: number
  discountFactor: number
  explorationRate: number
  episodes: number
  seed: number
}

export type QLearningResult = {
  qTable: Record<string, number[]>
  rewards: number[]
  config: QLearningConfig
}

const directions: Direction[] = ['North', 'South', 'East', 'West']
const durations = [18, 24, 30] as const
export const qActions: QAction[] = directions.flatMap((direction) =>
  durations.map((duration) => ({ direction, duration })),
)

const seededRandom = (seed: number) => {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

const bucket = (value: number, low: number, high: number) =>
  value <= low ? 0 : value <= high ? 1 : 2

export const encodeState = (
  lanes: Record<Direction, Pick<LaneState, 'queueLength' | 'averageWaitingTime'>>,
  current: Direction,
) => {
  const queue = directions.reduce((sum, lane) => sum + lanes[lane].queueLength, 0)
  const wait = directions.reduce((sum, lane) => sum + lanes[lane].averageWaitingTime, 0) / 4
  const density = queue / 40
  return `${bucket(queue, 12, 25)}:${bucket(density, 0.35, 0.7)}:${bucket(wait, 10, 30)}:${directions.indexOf(current)}`
}

const maxIndex = (values: number[]) =>
  values.reduce((best, value, index) => (value > values[best] ? index : best), 0)

const syntheticState = (random: () => number): Record<Direction, LaneState> =>
  Object.fromEntries(
    directions.map((direction) => {
      const queueLength = 2 + Math.floor(random() * 12)
      const averageWaitingTime = Math.floor(random() * 45)
      return [
        direction,
        {
          vehicleCount: queueLength,
          queueLength,
          averageWaitingTime,
          congestionScore: Math.min(100, queueLength * 7 + averageWaitingTime),
          priority: queueLength > 5 ? 'HIGH PRIORITY' : 'NORMAL',
        },
      ]
    }),
  ) as Record<Direction, LaneState>

const rewardFor = (
  lanes: Record<Direction, LaneState>,
  action: QAction,
  previousDirection: Direction,
) => {
  const selected = lanes[action.direction]
  const totalQueue = directions.reduce((sum, lane) => sum + lanes[lane].queueLength, 0)
  const totalWait = directions.reduce((sum, lane) => sum + lanes[lane].averageWaitingTime, 0)
  const throughput = Math.min(5, selected.queueLength)
  const starvationPenalty = directions.reduce(
    (sum, lane) => sum + (lane !== action.direction && lanes[lane].averageWaitingTime > 35 ? 8 : 0),
    0,
  )
  const switchingPenalty = action.direction === previousDirection ? 0 : 1.5
  return (
    throughput * 8 - totalQueue * 0.45 - totalWait * 0.08 - starvationPenalty - switchingPenalty
  )
}

export const trainQLearning = (partial: Partial<QLearningConfig> = {}): QLearningResult => {
  const config: QLearningConfig = {
    learningRate: partial.learningRate ?? 0.18,
    discountFactor: partial.discountFactor ?? 0.92,
    explorationRate: partial.explorationRate ?? 0.2,
    episodes: partial.episodes ?? 400,
    seed: partial.seed ?? 276,
  }
  const random = seededRandom(config.seed)
  const qTable: Record<string, number[]> = {}
  const rewards: number[] = []
  let currentDirection: Direction = 'North'

  for (let episode = 0; episode < config.episodes; episode += 1) {
    const lanes = syntheticState(random)
    const state = encodeState(lanes, currentDirection)
    qTable[state] ??= Array(qActions.length).fill(0)
    const explore = random() < config.explorationRate
    const actionIndex = explore ? Math.floor(random() * qActions.length) : maxIndex(qTable[state])
    const action = qActions[actionIndex]
    const reward = rewardFor(lanes, action, currentDirection)
    const nextLanes = structuredClone(lanes)
    nextLanes[action.direction].queueLength = Math.max(
      0,
      nextLanes[action.direction].queueLength - 5,
    )
    const nextState = encodeState(nextLanes, action.direction)
    qTable[nextState] ??= Array(qActions.length).fill(0)
    const future = Math.max(...qTable[nextState])
    qTable[state][actionIndex] +=
      config.learningRate * (reward + config.discountFactor * future - qTable[state][actionIndex])
    rewards.push(Number(reward.toFixed(2)))
    currentDirection = action.direction
  }

  return { qTable, rewards, config }
}

export const selectQAction = (
  result: QLearningResult,
  lanes: Record<Direction, LaneState>,
  current: Direction,
) => {
  const state = encodeState(lanes, current)
  const values = result.qTable[state]
  if (values) return qActions[maxIndex(values)]

  const fallback = [...directions].sort(
    (a, b) =>
      lanes[b].queueLength * 3 +
      lanes[b].averageWaitingTime -
      (lanes[a].queueLength * 3 + lanes[a].averageWaitingTime),
  )[0]
  return { direction: fallback, duration: 24 as const }
}

export const defaultQLearningResult = trainQLearning()
