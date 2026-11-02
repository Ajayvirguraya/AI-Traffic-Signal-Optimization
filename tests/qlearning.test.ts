import { describe, expect, it } from 'vitest'
import { qActions, selectQAction, trainQLearning } from '../src/lib/atso/qlearning'
import { createInitialSimulation } from '../src/lib/atso/simulation'

describe('Q-learning controller', () => {
  it('trains a non-empty Q-table with measured rewards', () => {
    const result = trainQLearning({ episodes: 120, seed: 276 })
    expect(Object.keys(result.qTable).length).toBeGreaterThan(0)
    expect(result.rewards).toHaveLength(120)
    expect(result.rewards.every(Number.isFinite)).toBe(true)
  })

  it('returns a valid direction and duration action', () => {
    const result = trainQLearning({ episodes: 120 })
    const state = createInitialSimulation('HIGH')
    const action = selectQAction(result, state.laneStates, 'North')
    expect(qActions).toContainEqual(action)
  })

  it('is reproducible with a fixed seed', () => {
    const first = trainQLearning({ episodes: 80, seed: 42 })
    const second = trainQLearning({ episodes: 80, seed: 42 })
    expect(first.rewards).toEqual(second.rewards)
    expect(first.qTable).toEqual(second.qTable)
  })
})
