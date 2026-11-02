import { describe, expect, it } from 'vitest'
import {
  advanceSimulation,
  createInitialSimulation,
  getSignalColor,
  MAX_BATCH_SIZE,
  SAFE_FOLLOWING_DISTANCE,
  type Direction,
} from '../src/lib/atso/simulation'

describe('ATSO simulation safety', () => {
  it('never gives a conflicting direction a green signal', () => {
    const directions: Direction[] = ['North', 'South', 'East', 'West']
    const state = createInitialSimulation('HIGH')
    const greens = directions.filter(
      (direction) => getSignalColor(direction, state.signalPhase, state.decisionLane) === 'GREEN',
    )
    expect(greens).toEqual(['North'])
  })

  it('maintains a safe single-file distance in every lane', () => {
    let state = { ...createInitialSimulation('EXTREME'), running: true }
    for (let tick = 0; tick < 180; tick += 1) state = advanceSimulation(state)
    for (const direction of ['North', 'South', 'East', 'West'] as Direction[]) {
      const positions = state.vehiclePositions
        .filter((vehicle) => vehicle.lane === direction)
        .map((vehicle) => vehicle.position)
        .sort((a, b) => a - b)
      positions.slice(1).forEach((position, index) => {
        expect(position - positions[index]).toBeGreaterThanOrEqual(SAFE_FOLLOWING_DISTANCE - 0.001)
      })
    }
  })

  it('caps the physically cleared batch at five', () => {
    let state = { ...createInitialSimulation('HIGH'), running: true }
    for (let tick = 0; tick < 120; tick += 1) {
      state = advanceSimulation(state)
      expect(state.batchCleared).toBeLessThanOrEqual(MAX_BATCH_SIZE)
    }
  })

  it('uses an all-red clearance between conflicting green phases', () => {
    let state = { ...createInitialSimulation(), running: true }
    const phases: string[] = []
    for (let tick = 0; tick < 80; tick += 1) {
      state = advanceSimulation(state)
      phases.push(state.signalPhase)
    }
    expect(phases).toContain('ALL_RED_TO_EAST_WEST')
  })
})
