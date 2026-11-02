import { trainQLearning } from '@/lib/atso/qlearning'

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const episodes =
    typeof body.episodes === 'number'
      ? Math.max(50, Math.min(5000, Math.round(body.episodes)))
      : 400
  const result = trainQLearning({
    episodes,
    learningRate:
      typeof body.learningRate === 'number'
        ? Math.max(0.01, Math.min(1, body.learningRate))
        : undefined,
    discountFactor:
      typeof body.discountFactor === 'number'
        ? Math.max(0, Math.min(1, body.discountFactor))
        : undefined,
    explorationRate:
      typeof body.explorationRate === 'number'
        ? Math.max(0, Math.min(1, body.explorationRate))
        : undefined,
    seed: typeof body.seed === 'number' ? Math.round(body.seed) : undefined,
  })
  return Response.json({
    config: result.config,
    rewards: result.rewards,
    qTableSize: Object.keys(result.qTable).length,
    finalMeanReward:
      result.rewards.slice(-50).reduce((sum, value) => sum + value, 0) /
      Math.min(50, result.rewards.length),
  })
}
