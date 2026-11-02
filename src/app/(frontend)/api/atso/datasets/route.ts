import config from '@payload-config'
import { getPayload } from 'payload'

const sourceTypes = new Set(['SUMO_SYNTHETIC', 'SYNTHETIC', 'REAL_WORLD'])
const statuses = new Set(['VALID', 'INVALID', 'VALID_WITH_WARNINGS'])

const count = (value: unknown) => typeof value === 'number' && Number.isInteger(value) && value >= 0

export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  const result = await payload.find({
    collection: 'traffic-datasets',
    overrideAccess: false,
    user,
    sort: '-createdAt',
    limit: 25,
    depth: 0,
  })
  return Response.json({ docs: result.docs, totalDocs: result.totalDocs })
}

export async function POST(request: Request) {
  const input = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (
    !input ||
    typeof input.name !== 'string' ||
    input.name.trim().length < 1 ||
    input.name.length > 180 ||
    !sourceTypes.has(String(input.sourceType)) ||
    !statuses.has(String(input.validationStatus)) ||
    !count(input.recordCount) ||
    !count(input.missingValues) ||
    !count(input.duplicateRows) ||
    !Array.isArray(input.features) ||
    typeof input.statistics !== 'object'
  ) {
    return Response.json({ error: 'Invalid dataset metadata.' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  const doc = await payload.create({
    collection: 'traffic-datasets',
    overrideAccess: false,
    user,
    data: {
      name: input.name.trim(),
      sourceType: input.sourceType as 'SUMO_SYNTHETIC' | 'SYNTHETIC' | 'REAL_WORLD',
      validationStatus: input.validationStatus as 'VALID' | 'INVALID' | 'VALID_WITH_WARNINGS',
      recordCount: input.recordCount as number,
      missingValues: input.missingValues as number,
      duplicateRows: input.duplicateRows as number,
      features: input.features.slice(0, 100),
      statistics: input.statistics as Record<string, unknown>,
      processedRows: Array.isArray(input.processedRows) ? input.processedRows.slice(0, 1000) : [],
    },
  })
  return Response.json({ doc }, { status: 201 })
}
