import type { CollectionConfig } from 'payload'

const publicReadCreate = () => true
const adminOnly = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export const SimulationRuns: CollectionConfig = {
  slug: 'simulation-runs',
  admin: {
    group: 'ATSO Operations',
    useAsTitle: 'name',
    defaultColumns: ['name', 'algorithm', 'duration', 'averageWaitingTime', 'createdAt'],
  },
  access: {
    read: publicReadCreate,
    create: publicReadCreate,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true, maxLength: 120 },
    {
      name: 'algorithm',
      type: 'select',
      required: true,
      options: [
        { label: 'Fixed-Time', value: 'FIXED' },
        { label: 'Adaptive Queue-Based', value: 'ADAPTIVE' },
        { label: 'Q-Learning', value: 'Q_LEARNING' },
      ],
    },
    { name: 'duration', type: 'number', required: true, min: 0, max: 86400 },
    {
      name: 'trafficDensity',
      type: 'select',
      required: true,
      options: ['LOW', 'MEDIUM', 'HIGH', 'EXTREME'],
    },
    { name: 'totalVehicles', type: 'number', required: true, min: 0 },
    { name: 'averageWaitingTime', type: 'number', required: true, min: 0 },
    { name: 'averageQueueLength', type: 'number', required: true, min: 0 },
    { name: 'throughput', type: 'number', required: true, min: 0 },
    { name: 'congestionPercentage', type: 'number', required: true, min: 0, max: 100 },
    { name: 'completedVehicles', type: 'number', required: true, min: 0 },
    {
      name: 'measurements',
      type: 'json',
      required: true,
      admin: {
        description:
          'Simulation-derived time series; never real-world unless explicitly identified.',
      },
    },
    { name: 'qLearning', type: 'json' },
    { name: 'decisions', type: 'json' },
  ],
  timestamps: true,
}
