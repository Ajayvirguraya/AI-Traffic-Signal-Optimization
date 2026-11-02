import type { CollectionConfig } from 'payload'

const publicReadCreate = () => true
const adminOnly = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export const TrafficDatasets: CollectionConfig = {
  slug: 'traffic-datasets',
  admin: {
    group: 'ATSO Operations',
    useAsTitle: 'name',
    defaultColumns: ['name', 'sourceType', 'recordCount', 'validationStatus', 'createdAt'],
  },
  access: {
    read: publicReadCreate,
    create: publicReadCreate,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true, maxLength: 180 },
    {
      name: 'sourceType',
      type: 'select',
      required: true,
      options: [
        { label: 'SUMO generated', value: 'SUMO_SYNTHETIC' },
        { label: 'Reproducible synthetic', value: 'SYNTHETIC' },
        { label: 'Uploaded real-world', value: 'REAL_WORLD' },
      ],
    },
    { name: 'recordCount', type: 'number', required: true, min: 0 },
    { name: 'missingValues', type: 'number', required: true, min: 0 },
    { name: 'duplicateRows', type: 'number', required: true, min: 0 },
    {
      name: 'validationStatus',
      type: 'select',
      required: true,
      options: ['VALID', 'INVALID', 'VALID_WITH_WARNINGS'],
    },
    { name: 'features', type: 'json', required: true },
    { name: 'statistics', type: 'json', required: true },
    {
      name: 'processedRows',
      type: 'json',
      admin: { description: 'Validated and normalized preview/processed records.' },
    },
  ],
  timestamps: true,
}
