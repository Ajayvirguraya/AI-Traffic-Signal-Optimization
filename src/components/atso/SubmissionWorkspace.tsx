'use client'

import { useEffect, useState } from 'react'
import { Download, FileText, History, Save, Sparkles } from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SimulationState } from '@/lib/atso/simulation'
import { defaultQLearningResult } from '@/lib/atso/qlearning'

type StoredRun = {
  id: string
  name: string
  algorithm: string
  duration: number
  trafficDensity: string
  totalVehicles: number
  averageWaitingTime: number
  averageQueueLength: number
  throughput: number
  congestionPercentage: number
  completedVehicles: number
  createdAt: string
  measurements: unknown[]
}

const download = (name: string, content: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}

const algorithmName = (mode: SimulationState['aiMode']) => (mode === 'AI' ? 'ADAPTIVE' : mode)

export default function SubmissionWorkspace({ simulation }: { simulation: SimulationState }) {
  const [runs, setRuns] = useState<StoredRun[]>([])
  const [selected, setSelected] = useState<StoredRun | null>(null)
  const [status, setStatus] = useState('')
  const rewardData = defaultQLearningResult.rewards
    .filter((_, index) => index % 10 === 0)
    .map((reward, index) => ({ episode: index * 10, reward }))

  const loadRuns = async () => {
    const response = await fetch('/api/atso/runs')
    if (!response.ok) return
    const data = await response.json()
    setRuns(data.docs)
  }

  useEffect(() => {
    void loadRuns()
  }, [])

  const summary = {
    name: `ATSO ${algorithmName(simulation.aiMode)} run ${new Date().toLocaleString()}`,
    algorithm: algorithmName(simulation.aiMode),
    duration: simulation.simulationTime,
    trafficDensity: simulation.trafficDensity,
    totalVehicles: simulation.vehicleCount + simulation.completedVehicles,
    averageWaitingTime: simulation.waitingTime,
    averageQueueLength: simulation.queueLength,
    throughput: simulation.throughput,
    congestionPercentage: simulation.congestion,
    completedVehicles: simulation.completedVehicles,
    measurements: simulation.history,
    qLearning:
      simulation.aiMode === 'Q_LEARNING'
        ? {
            config: defaultQLearningResult.config,
            rewards: defaultQLearningResult.rewards,
            qTableSize: Object.keys(defaultQLearningResult.qTable).length,
          }
        : null,
    decisions: [],
  }

  const saveRun = async () => {
    if (!simulation.history.length) {
      setStatus('Run the simulation before saving a result.')
      return
    }
    setStatus('Saving…')
    const response = await fetch('/api/atso/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(summary),
    })
    const result = await response.json()
    setStatus(response.ok ? 'Simulation saved.' : result.error)
    if (response.ok) await loadRuns()
  }

  const exportCsv = () => {
    if (!simulation.history.length) {
      setStatus('No measured simulation samples to export.')
      return
    }
    const keys = Object.keys(simulation.history[0])
    const csv = [
      keys.join(','),
      ...simulation.history.map((point) =>
        keys.map((key) => JSON.stringify(point[key as keyof typeof point] ?? '')).join(','),
      ),
    ].join('\n')
    download('ATSO_simulation_measurements.csv', csv, 'text/csv')
  }

  const exportPdf = async () => {
    if (!simulation.history.length) {
      setStatus('No measured simulation samples to report.')
      return
    }
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF()
    pdf.setFontSize(18)
    pdf.text('ATSO Simulation Summary', 18, 20)
    pdf.setFontSize(10)
    const lines = [
      'CSE276 · Project P02 · Lovely Professional University',
      `Algorithm: ${summary.algorithm}`,
      `Duration: ${summary.duration} seconds`,
      `Traffic density: ${summary.trafficDensity}`,
      `Total observed vehicles: ${summary.totalVehicles}`,
      `Average waiting time: ${summary.averageWaitingTime} seconds`,
      `Average queue length: ${summary.averageQueueLength}`,
      `Throughput: ${summary.throughput} vehicles/minute`,
      `Congestion: ${summary.congestionPercentage}%`,
      `Completed vehicles: ${summary.completedVehicles}`,
      '',
      'Results above are generated from the current simulation run.',
      'They are not real-world measurements and are not fabricated benchmark claims.',
    ]
    pdf.text(lines, 18, 32)
    pdf.save('ATSO_simulation_report.pdf')
  }

  return (
    <section className="section operations-section" id="reports">
      <div className="heading-row">
        <div className="section-heading">
          <span className="eyebrow">
            <span /> 04 — MODELS, HISTORY & REPORTS
          </span>
          <h2>Measured evidence, reproducible learning.</h2>
          <p>
            Save simulation runs, inspect Q-learning progress, and export only recorded results.
          </p>
        </div>
        <div className="primary-controls">
          <button className="button button-primary" onClick={saveRun}>
            <Save size={16} /> SAVE RUN
          </button>
          <button className="button button-secondary" onClick={exportCsv}>
            <Download size={16} /> CSV
          </button>
          <button className="button button-secondary" onClick={exportPdf}>
            <FileText size={16} /> PDF
          </button>
        </div>
      </div>
      {status && <p className="workspace-status">{status}</p>}

      <div className="models-grid">
        <div className="model-card">
          <span>MODEL 1</span>
          <strong>Fixed-Time Control</strong>
          <p>
            Predetermined green, yellow and all-red timings. Serves at most five physically cleared
            vehicles per selected lane.
          </p>
        </div>
        <div className="model-card">
          <span>MODEL 2</span>
          <strong>Adaptive Queue-Based</strong>
          <p>
            Ranks queue length, waiting time and congestion, then recalculates after each safe
            batch.
          </p>
        </div>
        <div className="model-card active-model">
          <span>MODEL 3</span>
          <strong>Q-Learning</strong>
          <p>
            Seeded tabular reinforcement learning selects direction and 18/24/30-second duration
            actions.
          </p>
        </div>
      </div>

      <div className="operations-grid">
        <div className="panel training-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">ACTUAL TRAINING PROGRESS</span>
              <h3>Episode reward</h3>
            </div>
            <span className="mode-chip">
              <Sparkles size={13} /> {defaultQLearningResult.config.episodes} EPISODES
            </span>
          </div>
          <div className="training-stats">
            <span>α {defaultQLearningResult.config.learningRate}</span>
            <span>γ {defaultQLearningResult.config.discountFactor}</span>
            <span>ε {defaultQLearningResult.config.explorationRate}</span>
            <span>{Object.keys(defaultQLearningResult.qTable).length} STATES</span>
          </div>
          <div className="chart-wrap chart-small">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rewardData}>
                <CartesianGrid stroke="#20354c" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="episode" stroke="#6f849a" />
                <YAxis stroke="#6f849a" />
                <Tooltip contentStyle={{ background: '#0c1827', border: '1px solid #274059' }} />
                <Line type="monotone" dataKey="reward" stroke="#42d7ff" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel history-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">PERSISTENT SIMULATION HISTORY</span>
              <h3>Previous runs</h3>
            </div>
            <History size={18} />
          </div>
          <div className="run-list">
            {runs.length ? (
              runs.map((run) => (
                <button
                  key={run.id}
                  onClick={() => setSelected(run)}
                  className={selected?.id === run.id ? 'selected' : ''}
                >
                  <span>{new Date(run.createdAt).toLocaleString()}</span>
                  <strong>
                    {run.algorithm} · {run.duration}s
                  </strong>
                  <small>
                    {run.throughput}/min · {run.averageWaitingTime}s wait
                  </small>
                </button>
              ))
            ) : (
              <p>No saved runs yet. Complete and save a simulation.</p>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <div className="selected-run">
          <strong>{selected.name}</strong>
          <span>Density {selected.trafficDensity}</span>
          <span>{selected.totalVehicles} vehicles</span>
          <span>{selected.averageQueueLength} average queue</span>
          <span>{selected.congestionPercentage}% congestion</span>
          <span>{selected.completedVehicles} cleared</span>
        </div>
      )}
    </section>
  )
}
