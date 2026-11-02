'use client'

import { useMemo, useRef, useState } from 'react'
import Papa from 'papaparse'
import { CheckCircle2, Download, FileWarning, Upload } from 'lucide-react'

type Row = Record<string, string | number>

const requiredColumns = [
  'timestamp',
  'north_vehicle_count',
  'south_vehicle_count',
  'east_vehicle_count',
  'west_vehicle_count',
  'queue_length',
  'waiting_time',
  'traffic_density',
  'signal_duration',
  'throughput',
]

const numericColumns = requiredColumns.filter((column) => column !== 'timestamp')

const download = (name: string, content: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function DatasetManager() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [missing, setMissing] = useState(0)
  const [duplicates, setDuplicates] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const [features, setFeatures] = useState(requiredColumns)
  const [sourceType, setSourceType] = useState('SUMO_SYNTHETIC')
  const [status, setStatus] = useState('')

  const statistics = useMemo(
    () =>
      Object.fromEntries(
        numericColumns.map((column) => {
          const values = rows.map((row) => Number(row[column])).filter(Number.isFinite)
          const mean = values.length
            ? values.reduce((sum, value) => sum + value, 0) / values.length
            : 0
          return [
            column,
            {
              min: values.length ? Math.min(...values) : 0,
              max: values.length ? Math.max(...values) : 0,
              mean: Number(mean.toFixed(2)),
            },
          ]
        }),
      ),
    [rows],
  )

  const processFile = (file?: File) => {
    if (!file) return
    setName(file.name)
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, meta, errors: parseErrors }) => {
        const normalizedFields = (meta.fields ?? []).map((field) =>
          field
            .trim()
            .toLowerCase()
            .replace(/[\s-]+/g, '_'),
        )
        const absent = requiredColumns.filter((column) => !normalizedFields.includes(column))
        const normalized = data.map((raw) =>
          Object.fromEntries(
            Object.entries(raw).map(([key, value]) => [
              key
                .trim()
                .toLowerCase()
                .replace(/[\s-]+/g, '_'),
              value?.trim() ?? '',
            ]),
          ),
        )
        const missingCount = normalized.reduce(
          (total, row) =>
            total +
            requiredColumns.filter((column) => row[column] === '' || row[column] == null).length,
          0,
        )
        const seen = new Set<string>()
        let duplicateCount = 0
        normalized.forEach((row) => {
          const key = JSON.stringify(row)
          if (seen.has(key)) duplicateCount += 1
          seen.add(key)
        })
        const cleaned = normalized
          .filter((row) => requiredColumns.every((column) => row[column] !== ''))
          .filter(
            (row, index, all) =>
              all.findIndex((candidate) => JSON.stringify(candidate) === JSON.stringify(row)) ===
              index,
          )
          .map((row) =>
            Object.fromEntries(
              Object.entries(row).map(([key, value]) => [
                key,
                numericColumns.includes(key) ? Number(value) : value,
              ]),
            ),
          )
        setRows(cleaned)
        setMissing(missingCount)
        setDuplicates(duplicateCount)
        setErrors([
          ...absent.map((column) => `Missing required column: ${column}`),
          ...parseErrors.slice(0, 5).map((error) => error.message),
        ])
        setStatus('')
      },
    })
  }

  const validationStatus = errors.length
    ? 'INVALID'
    : missing || duplicates
      ? 'VALID_WITH_WARNINGS'
      : rows.length
        ? 'VALID'
        : 'EMPTY'

  const saveDataset = async () => {
    if (!rows.length || errors.length) return
    setStatus('Saving…')
    const response = await fetch('/api/atso/datasets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        sourceType,
        recordCount: rows.length,
        missingValues: missing,
        duplicateRows: duplicates,
        validationStatus,
        features,
        statistics,
        processedRows: rows.map((row) =>
          Object.fromEntries(features.map((feature) => [feature, row[feature]])),
        ),
      }),
    })
    const result = await response.json()
    setStatus(response.ok ? 'Dataset saved to persistent storage.' : result.error)
  }

  const exportProcessed = () => {
    const selected = rows.map((row) =>
      Object.fromEntries(features.map((feature) => [feature, row[feature]])),
    )
    download(
      `${name.replace(/\.csv$/i, '') || 'atso'}_processed.csv`,
      Papa.unparse(selected),
      'text/csv',
    )
  }

  return (
    <div className="dataset-workspace">
      <div className="workspace-toolbar">
        <div>
          <span className="panel-kicker">CSV PROCESSING PIPELINE</span>
          <strong>Validate, preprocess, select features and export</strong>
        </div>
        <div className="primary-controls">
          <button className="button button-secondary" onClick={() => inputRef.current?.click()}>
            <Upload size={16} /> CHOOSE CSV
          </button>
          <input
            ref={inputRef}
            className="hidden-input"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => processFile(event.target.files?.[0])}
          />
          <button
            className="button button-secondary"
            disabled={!rows.length}
            onClick={exportProcessed}
          >
            <Download size={16} /> EXPORT PROCESSED
          </button>
          <button
            className="button button-primary"
            disabled={!rows.length || !!errors.length}
            onClick={saveDataset}
          >
            SAVE DATASET
          </button>
        </div>
      </div>

      <div className="dataset-validation-grid">
        <div className={`validation-card validation-${validationStatus.toLowerCase()}`}>
          {errors.length ? <FileWarning size={19} /> : <CheckCircle2 size={19} />}
          <span>VALIDATION</span>
          <strong>{validationStatus}</strong>
        </div>
        <div className="validation-card">
          <span>PROCESSED ROWS</span>
          <strong>{rows.length}</strong>
        </div>
        <div className="validation-card">
          <span>MISSING VALUES</span>
          <strong>{missing}</strong>
        </div>
        <div className="validation-card">
          <span>DUPLICATES REMOVED</span>
          <strong>{duplicates}</strong>
        </div>
      </div>

      <div className="feature-panel">
        <div>
          <span className="panel-kicker">DATA PROVENANCE</span>
          <select value={sourceType} onChange={(event) => setSourceType(event.target.value)}>
            <option value="SUMO_SYNTHETIC">SUMO-generated synthetic data</option>
            <option value="SYNTHETIC">Reproducible synthetic data</option>
            <option value="REAL_WORLD">Uploaded real-world measurements</option>
          </select>
          <p>
            SUMO and generated records are simulation data, not real-world traffic measurements.
            Dataset reference: sumo.dlr.de/docs/
          </p>
        </div>
        <div>
          <span className="panel-kicker">FEATURE SELECTION</span>
          <div className="feature-checks">
            {requiredColumns.map((feature) => (
              <label key={feature}>
                <input
                  type="checkbox"
                  checked={features.includes(feature)}
                  onChange={() =>
                    setFeatures((current) =>
                      current.includes(feature)
                        ? current.filter((item) => item !== feature)
                        : [...current, feature],
                    )
                  }
                />
                {feature}
              </label>
            ))}
          </div>
        </div>
      </div>

      {!!errors.length && (
        <div className="dataset-errors">
          {errors.map((error) => (
            <span key={error}>{error}</span>
          ))}
        </div>
      )}
      {status && <p className="workspace-status">{status}</p>}

      {!!rows.length && (
        <div className="table-shell compact-table">
          <table>
            <thead>
              <tr>
                {features.map((feature) => (
                  <th key={feature}>{feature}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 8).map((row, index) => (
                <tr key={index}>
                  {features.map((feature) => (
                    <td key={feature}>{String(row[feature] ?? '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
