import type { CollectionConfig } from 'payload'

const publicRead = () => true
const adminOnly = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export const AlgorithmConfigs: CollectionConfig = {
  slug: 'algorithm-configs',
  admin: {
    group: 'ATSO Operations',
    useAsTitle: 'name',
  },
  access: {
    read: publicRead,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'algorithm',
      type: 'select',
      required: true,
      options: ['FIXED', 'ADAPTIVE', 'Q_LEARNING'],
    },
    { name: 'greenDuration', type: 'number', required: true, min: 5, max: 120 },
    { name: 'yellowDuration', type: 'number', required: true, min: 2, max: 10 },
    { name: 'allRedDuration', type: 'number', required: true, min: 1, max: 10 },
    { name: 'maximumBatchSize', type: 'number', required: true, min: 1, max: 5 },
    { name: 'learningRate', type: 'number', min: 0, max: 1 },
    { name: 'discountFactor', type: 'number', min: 0, max: 1 },
    { name: 'explorationRate', type: 'number', min: 0, max: 1 },
    { name: 'trainingEpisodes', type: 'number', min: 1, max: 100000 },
    { name: 'active', type: 'checkbox', defaultValue: false },
  ],
  timestamps: true,
}
