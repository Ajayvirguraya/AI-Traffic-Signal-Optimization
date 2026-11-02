import config from '@payload-config'
import { getPayload } from 'payload'

const algorithms = new Set(['FIXED', 'ADAPTIVE', 'Q_LEARNING'])
const densities = new Set(['LOW', 'MEDIUM', 'HIGH', 'EXTREME'])

const finite = (value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER) =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max

export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  const result = await payload.find({
    collection: 'simulation-runs',
    overrideAccess: false,
    user,
    sort: '-createdAt',
    limit: 50,
    depth: 0,
  })
  return Response.json({ docs: result.docs, totalDocs: result.totalDocs })
}

export async function POST(request: Request) {
  const input = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (
    !input ||
    typeof input.name !== 'string' ||
    input.name.trim().length < 3 ||
    input.name.length > 120 ||
    !algorithms.has(String(input.algorithm)) ||
    !densities.has(String(input.trafficDensity)) ||
    !finite(input.duration, 1, 86400) ||
    !finite(input.totalVehicles) ||
    !finite(input.averageWaitingTime) ||
    !finite(input.averageQueueLength) ||
    !finite(input.throughput) ||
    !finite(input.congestionPercentage, 0, 100) ||
    !finite(input.completedVehicles) ||
    !Array.isArray(input.measurements)
  ) {
    return Response.json(
      { error: 'Invalid simulation summary. Run the simulation before saving.' },
      { status: 400 },
    )
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  const doc = await payload.create({
    collection: 'simulation-runs',
    overrideAccess: false,
    user,
    data: {
      name: input.name.trim(),
      algorithm: input.algorithm as 'FIXED' | 'ADAPTIVE' | 'Q_LEARNING',
      trafficDensity: input.trafficDensity as 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME',
      duration: input.duration as number,
      totalVehicles: input.totalVehicles as number,
      averageWaitingTime: input.averageWaitingTime as number,
      averageQueueLength: input.averageQueueLength as number,
      throughput: input.throughput as number,
      congestionPercentage: input.congestionPercentage as number,
      completedVehicles: input.completedVehicles as number,
      measurements: input.measurements.slice(0, 3600),
      qLearning:
        input.qLearning && typeof input.qLearning === 'object'
          ? (input.qLearning as Record<string, unknown>)
          : null,
      decisions: Array.isArray(input.decisions) ? input.decisions.slice(0, 500) : [],
    },
  })
  return Response.json({ doc }, { status: 201 })
}
