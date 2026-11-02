import path from 'path'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { en as adminLanguage } from '@payloadcms/translations/languages/en'
import { fileURLToPath } from 'url'

import { Admins } from './collections/Admins'
import { Media } from './collections/Media'
import { Folders } from './collections/Folders'
import { Tags } from './collections/Tags'
import { SimulationRuns } from './collections/SimulationRuns'
import { TrafficDatasets } from './collections/TrafficDatasets'
import { AlgorithmConfigs } from './collections/AlgorithmConfigs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
secret: process.env.PAYLOAD_SECRET || 'development-secret-change-this-before-deployment',

admin: {
user: Admins.slug,
importMap: {
baseDir: dirname,
},
dashboard: {
widgets: [],
defaultLayout: [
{ widgetSlug: 'activity', width: 'full' },
{ widgetSlug: 'collections', width: 'full' },
],
},
},

i18n: {
fallbackLanguage: 'en',
supportedLanguages: {
en: adminLanguage,
},
},

collections: [
Admins,
Media,
Folders,
Tags,
SimulationRuns,
TrafficDatasets,
AlgorithmConfigs,
],

db: sqliteAdapter({
client: {
url: process.env.DATABASE_URL || 'file:./atso.db',
},
}),

typescript: {
outputFile: path.resolve(dirname, 'payload-types.ts'),
},

localization: {
locales: [{ code: 'en', label: 'English' }],
fallback: true,
defaultLocale: 'en',
},

plugins: [mcpPlugin({})],
})
