'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Activity,
  ArrowDown,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CarFront,
  Check,
  ChevronRight,
  CircleGauge,
  Clock3,
  Database,
  FileUp,
  Gauge,
  Info,
  Network,
  Pause,
  Play,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrafficCone,
  TrendingDown,
  TrendingUp,
  Upload,
  Zap,
} from 'lucide-react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import TrafficIntersection from './TrafficIntersection'
import SiteFooter from './SiteFooter'
import SiteHeader from './SiteHeader'
import DatasetManager from './DatasetManager'
import SubmissionWorkspace from './SubmissionWorkspace'
import {
  advanceSimulation,
  analyzeTraffic,
  applyAiDecision,
  changeDensity,
  createInitialSimulation,
  directions,
  getSignalColor,
  GREEN_DURATION,
  groupForPhase,
  MAX_GREEN_DURATION,
  phaseLabel,
  SAFE_FOLLOWING_DISTANCE,
  type Density,
  type Direction,
  type HistoryPoint,
  type Mode,
} from '@/lib/atso/simulation'

type IconType = React.ComponentType<{ size?: number; className?: string }>
type Notification = {
  id: number
  title: string
  message: string
}

const navItems = [
  ['01 Simulation', 'simulation'],
  ['02 Dataset', 'dataset'],
  ['03 Analytics', 'analytics'],
  ['04 Reports', 'reports'],
  ['05 About', 'about'],
]

const datasetRows = [
  ['08:42:10', 'North-01', '38', '14', '42.3s', 'North', 'High'],
  ['08:42:10', 'South-02', '21', '08', '18.7s', 'North', 'High'],
  ['08:42:10', 'East-01', '29', '11', '31.2s', 'North', 'Medium'],
  ['08:42:10', 'West-02', '17', '06', '15.8s', 'North', 'Medium'],
  ['08:42:20', 'North-01', '34', '09', '26.1s', 'North', 'High'],
]

const cityIntersections = [
  { id: 'J-01', name: 'Central Avenue', status: 'LIVE' },
  { id: 'J-02', name: 'University Road', status: 'NORMAL', vehicles: 26, wait: 8 },
  { id: 'J-03', name: 'Station Square', status: 'HIGH', vehicles: 74, wait: 31 },
  { id: 'J-04', name: 'Tech Park East', status: 'CRITICAL', vehicles: 112, wait: 49 },
]

const formatTime = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}) {
  return (
    <button className={`button button-${variant} ${className}`} {...props}>
      {children}
    </button>
  )
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <div className="section-heading">
      <span className="eyebrow">
        <span />
        {eyebrow}
      </span>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  status = 'good',
}: {
  icon: IconType
  label: string
  value: string | number
  unit?: string
  trend: string
  status?: 'good' | 'warn' | 'danger'
}) {
  return (
    <motion.div className="metric-card" whileHover={{ y: -3 }}>
      <div className="metric-top">
        <span className={`metric-icon metric-${status}`}>
          <Icon size={18} />
        </span>
        <span className={`trend trend-${status}`}>{trend}</span>
      </div>
      <div className="metric-value">
        {value}
        <small>{unit}</small>
      </div>
      <div className="metric-label">{label}</div>
    </motion.div>
  )
}

function DataBadge({ live = false }: { live?: boolean }) {
  return (
    <span className={`demo-badge ${live ? 'live-data-badge' : ''}`}>
      <Info size={12} />{' '}
      {live ? 'LIVE SIMULATION DATA' : 'DEMO SIMULATION — NOT REAL-WORLD MEASUREMENTS'}
    </span>
  )
}

function HistoryChart({
  title,
  kicker,
  data,
  lines,
  unit,
}: {
  title: string
  kicker: string
  data: HistoryPoint[]
  lines: { key: keyof HistoryPoint; name: string; color: string }[]
  unit?: string
}) {
  return (
    <div className="chart-card">
      <div className="chart-head">
        <div>
          <span>{kicker}</span>
          <h3>{title}</h3>
        </div>
      </div>
      <div className="chart-wrap chart-medium">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#20354c" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#6f849a"
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis stroke="#6f849a" tickLine={false} axisLine={false} unit={unit} />
              <Tooltip
                contentStyle={{
                  background: '#0c1827',
                  border: '1px solid #274059',
                  borderRadius: '10px',
                }}
              />
              {lines.length > 1 && <Legend />}
              {lines.map((line) => (
                <Line
                  key={String(line.key)}
                  name={line.name}
                  type="monotone"
                  dataKey={line.key}
                  connectNulls
                  stroke={line.color}
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-chart">
            <Activity size={22} />
            <strong>Waiting for simulation data</strong>
            <span>Press Start to begin recording.</span>
          </div>
        )}
      </div>
    </div>
  )
}

const average = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null

const laneNumber: Record<Direction, string> = {
  North: 'LANE 1',
  South: 'LANE 2',
  East: 'LANE 3',
  West: 'LANE 4',
}

export default function App() {
  const [simulation, setSimulation] = useState(createInitialSimulation)
  const [notification, setNotification] = useState<Notification | null>(null)
  const [datasetName, setDatasetName] = useState('SUMO_urban_flow.csv')
  const [datasetRecords, setDatasetRecords] = useState(12480)
  const [selectedJunction, setSelectedJunction] = useState('J-01')
  const uploadRef = useRef<HTMLInputElement>(null)
  const notificationSequence = useRef(0)

  const recommendation = useMemo(() => analyzeTraffic(simulation), [simulation])
  const currentPriority =
    simulation.decisionLane && simulation.laneStates[simulation.decisionLane].vehicleCount > 5
      ? simulation.decisionLane
      : (recommendation.congestedLanes[0] ?? null)
  const nextPriority =
    recommendation.congestedLanes.find((direction) => direction !== currentPriority) ?? null

  useEffect(() => {
    if (!simulation.running) return
    const timer = window.setInterval(
      () => setSimulation((current) => advanceSimulation(current)),
      1000 / simulation.speed,
    )
    return () => window.clearInterval(timer)
  }, [simulation.running, simulation.speed])

  useEffect(() => {
    if (!notification) return
    const timer = window.setTimeout(() => setNotification(null), 2500)
    return () => window.clearTimeout(timer)
  }, [notification])

  const showNotification = (title: string, message: string) => {
    notificationSequence.current += 1
    setNotification({
      id: notificationSequence.current,
      title,
      message,
    })
  }

  const setRunning = (running: boolean) => setSimulation((current) => ({ ...current, running }))

  const setMode = (mode: Mode) =>
    setSimulation((current) => ({
      ...current,
      aiMode: mode,
      signalElapsed: 0,
      signalDuration: mode === 'FIXED' ? GREEN_DURATION : current.signalDuration,
      decisionApplied: false,
      decisionLane: null,
    }))

  const reset = () => {
    setSimulation(createInitialSimulation())
    showNotification('SIMULATION RESET', 'History and AI decisions have been cleared.')
  }

  const applyDecision = () => {
    if (!simulation.signalPhase.endsWith('_GREEN')) return
    const activeGroup = groupForPhase(simulation.signalPhase).replace('_', ' / ')
    const alreadyExtended = simulation.aiExtensionPhase === simulation.signalPhase
    setSimulation((current) => applyAiDecision(current))
    showNotification(
      'AI DECISION APPLIED',
      alreadyExtended
        ? `${activeGroup} green remains capped at ${MAX_GREEN_DURATION}s`
        : `${activeGroup} green extended once by ${recommendation.extension}s`,
    )
  }

  const uploadDataset = async (file?: File) => {
    if (!file) return
    const content = await file.text()
    setDatasetName(file.name)
    setDatasetRecords(Math.max(0, content.split(/\r?\n/).filter(Boolean).length - 1))
    showNotification('DATASET LOADED', `${file.name} is ready in the ATSO workspace.`)
  }

  const congestionLabel =
    simulation.congestion > 75 ? 'Critical' : simulation.congestion > 45 ? 'High' : 'Normal'
  const metricStatus =
    simulation.congestion > 75 ? 'danger' : simulation.congestion > 45 ? 'warn' : 'good'

  const fixedHistory = simulation.history.filter((point) => point.mode === 'FIXED')
  const adaptiveHistory = simulation.history.filter((point) => point.mode === 'AI')
  const fixedWait = average(fixedHistory.map((point) => point.waitingTime))
  const adaptiveWait = average(adaptiveHistory.map((point) => point.waitingTime))
  const fixedThroughput = average(fixedHistory.map((point) => point.throughput))
  const adaptiveThroughput = average(adaptiveHistory.map((point) => point.throughput))
  const waitImprovement =
    fixedWait && adaptiveWait !== null ? ((fixedWait - adaptiveWait) / fixedWait) * 100 : null
  const throughputImprovement =
    fixedThroughput && adaptiveThroughput !== null
      ? ((adaptiveThroughput - fixedThroughput) / fixedThroughput) * 100
      : null

  const selectedCity = cityIntersections.find((junction) => junction.id === selectedJunction)!
  const selectedMetrics =
    selectedJunction === 'J-01'
      ? {
          vehicles: simulation.vehicleCount,
          wait: simulation.waitingTime,
          status: congestionLabel.toUpperCase(),
        }
      : {
          vehicles: selectedCity.vehicles!,
          wait: selectedCity.wait!,
          status: selectedCity.status,
        }

  return (
    <div className="app-shell">
      <SiteHeader />

      <main>
        <section className="hero section" id="home">
          <div className="hero-glow" />
          <div className="hero-copy">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="eyebrow">
                <span /> ADAPTIVE TRAFFIC SIGNAL OPTIMIZATION
              </span>
              <h1>
                TRAFFIC CHANGES EVERY SECOND. <em>YOUR SIGNALS SHOULD TOO.</em>
              </h1>
              <p>
                ATSO uses real-time traffic conditions to dynamically optimize signal timing, reduce
                queues and keep vehicles moving.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#simulation">
                  ENTER SIMULATION <ArrowRight size={17} />
                </a>
                <a className="button button-secondary" href="#about">
                  EXPLORE ATSO <ArrowDown size={17} />
                </a>
              </div>
            </motion.div>
            <div className="trust-row">
              <span>
                <ShieldCheck size={16} /> SAFE-GAP VEHICLE LOGIC
              </span>
              <span>
                <Radio size={16} /> DYNAMIC LANE PRIORITY
              </span>
              <span>
                <Network size={16} /> LIVE SYSTEM STATE
              </span>
            </div>
          </div>
          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.8 }}
          >
            <div className="visual-header">
              <div>
                <span className={simulation.running ? 'live-dot' : 'paused-dot'} /> SYSTEM MIRROR{' '}
                <b>J-01</b>
              </div>
              <span>T+ {formatTime(simulation.simulationTime)}</span>
            </div>
            <TrafficIntersection
              compact
              signalPhase={simulation.signalPhase}
              activeDirection={simulation.decisionLane}
              vehicles={simulation.vehiclePositions}
              running={simulation.running}
              speed={simulation.speed}
            />
            <div className="visual-footer">
              <span>{simulation.aiMode} CONTROL ACTIVE</span>
              <strong>
                {simulation.vehicleCount} <small>VEHICLES</small>
              </strong>
            </div>
          </motion.div>
        </section>

        <section className="story-strip">
          {[
            [Database, '01', 'TRAFFIC DATA'],
            [BrainCircuit, '02', 'AI PRIORITY'],
            [Zap, '03', 'SIGNAL OPTIMIZATION'],
            [TrendingUp, '04', 'PERFORMANCE DATA'],
          ].map(([Icon, step, label], index) => {
            const StoryIcon = Icon as IconType
            return (
              <div className="story-step" key={label as string}>
                <span className="story-icon">
                  <StoryIcon size={20} />
                </span>
                <div>
                  <small>STEP {step as string}</small>
                  <strong>{label as string}</strong>
                </div>
                {index < 3 && <ChevronRight className="story-arrow" size={18} />}
              </div>
            )
          })}
        </section>

        <nav className="section-index" aria-label="Application flow">
          <span>ATSO PLATFORM</span>
          <div>
            {navItems.map(([label, id]) => (
              <a href={`#${id}`} key={id}>
                {label}
              </a>
            ))}
          </div>
        </nav>

        <section className="section simulation-section" id="simulation">
          <div className="heading-row simulation-heading">
            <SectionHeading
              eyebrow="01 — SIMULATION"
              title="One state. One intelligent traffic system."
              body="Every vehicle, lane, signal, KPI, decision and chart is driven by the same deterministic simulation loop."
            />
            <div className="simulation-runtime">
              <span className={simulation.running ? 'runtime-live' : ''}>
                <i /> {simulation.running ? 'RUNNING' : 'PAUSED'}
              </span>
              <strong>T+ {formatTime(simulation.simulationTime)}</strong>
              <DataBadge live />
            </div>
          </div>

          <div className="simulation-toolbar">
            <div className="primary-controls">
              <Button
                onClick={() => setRunning(true)}
                disabled={simulation.running}
                className={simulation.running ? 'control-disabled' : ''}
              >
                <Play size={17} /> START
              </Button>
              <Button
                variant="secondary"
                onClick={() => setRunning(false)}
                disabled={!simulation.running}
                className={!simulation.running ? 'control-disabled' : ''}
              >
                <Pause size={17} /> PAUSE
              </Button>
              <Button variant="secondary" onClick={reset}>
                <RefreshCw size={17} /> RESET
              </Button>
            </div>
            <div className="toolbar-divider" />
            <label className="speed-control">
              <span>SIMULATION SPEED</span>
              <input
                type="range"
                min="1"
                max="4"
                value={simulation.speed}
                onChange={(event) =>
                  setSimulation((current) => ({
                    ...current,
                    speed: Number(event.target.value),
                  }))
                }
              />
              <b>{simulation.speed}×</b>
            </label>
            <div className="mode-toggle simulation-mode">
              <Button
                variant="ghost"
                className={simulation.aiMode === 'AI' ? 'active' : ''}
                onClick={() => setMode('AI')}
              >
                <BrainCircuit size={17} /> ADAPTIVE AI
              </Button>
              <Button
                variant="ghost"
                className={simulation.aiMode === 'FIXED' ? 'active' : ''}
                onClick={() => setMode('FIXED')}
              >
                <Clock3 size={17} /> FIXED TIMING
              </Button>
              <Button
                variant="ghost"
                className={simulation.aiMode === 'Q_LEARNING' ? 'active' : ''}
                onClick={() => setMode('Q_LEARNING')}
              >
                <Sparkles size={17} /> Q-LEARNING
              </Button>
            </div>
          </div>

          <div className="density-bar">
            <div>
              <span className="panel-kicker">TRAFFIC DEMAND</span>
              <strong>Density changes vehicle generation and pressure</strong>
            </div>
            <div className="density-control density-inline">
              {(['LOW', 'MEDIUM', 'HIGH', 'EXTREME'] as Density[]).map((density) => (
                <Button
                  variant="ghost"
                  className={simulation.trafficDensity === density ? 'active' : ''}
                  key={density}
                  onClick={() => setSimulation((current) => changeDensity(current, density))}
                >
                  <span className={`density-dot density-${density.toLowerCase()}`} />
                  {density}
                </Button>
              ))}
            </div>
          </div>

          <div className="metrics-grid simulation-metrics">
            <MetricCard
              icon={CarFront}
              label="Live vehicles"
              value={simulation.vehicleCount}
              trend={simulation.running ? 'LIVE' : 'PAUSED'}
            />
            <MetricCard
              icon={TrafficCone}
              label="Queue length"
              value={simulation.queueLength}
              unit=" veh"
              trend={`${recommendation.target} priority`}
              status={metricStatus}
            />
            <MetricCard
              icon={Clock3}
              label="Average wait"
              value={simulation.waitingTime}
              unit="s"
              trend={simulation.aiMode}
              status={
                simulation.waitingTime > 35
                  ? 'danger'
                  : simulation.waitingTime > 18
                    ? 'warn'
                    : 'good'
              }
            />
            <MetricCard
              icon={Gauge}
              label="Throughput"
              value={simulation.throughput}
              unit="/min"
              trend={`${simulation.completedVehicles} completed`}
            />
            <MetricCard
              icon={CircleGauge}
              label="Signal efficiency"
              value={simulation.signalEfficiency}
              unit="%"
              trend={simulation.aiMode}
            />
            <MetricCard
              icon={Activity}
              label="Congestion"
              value={simulation.congestion}
              unit="%"
              trend={congestionLabel}
              status={metricStatus}
            />
          </div>

          <div className="simulation-workspace">
            <div className="panel simulation-canvas-panel">
              <div className="panel-header">
                <div>
                  <span className="panel-kicker">LIVE DIGITAL TWIN · J-01</span>
                  <h3>Safe lane-based vehicle movement</h3>
                </div>
                <div className="signal-readout">
                  <span className={simulation.running ? 'live-dot' : 'paused-dot'} />
                  <div>
                    <small>CURRENT SIGNAL PHASE</small>
                    <b>{phaseLabel(simulation.signalPhase)}</b>
                  </div>
                </div>
              </div>
              <TrafficIntersection
                signalPhase={simulation.signalPhase}
                activeDirection={simulation.decisionLane}
                vehicles={simulation.vehiclePositions}
                running={simulation.running}
                speed={simulation.speed}
              />
              <div className="canvas-footer">
                <span>
                  MODE <b>{simulation.aiMode}</b>
                </span>
                <span>
                  PHASE REMAINING{' '}
                  <b>{Math.max(0, simulation.signalDuration - simulation.signalElapsed)}s</b>
                </span>
                <span>
                  NORTH / SOUTH{' '}
                  <b>{getSignalColor('North', simulation.signalPhase, simulation.decisionLane)}</b>
                </span>
                <span>
                  EAST / WEST{' '}
                  <b>{getSignalColor('East', simulation.signalPhase, simulation.decisionLane)}</b>
                </span>
                <span>
                  SAFE GAP <b>{SAFE_FOLLOWING_DISTANCE} UNITS</b>
                </span>
                <span>
                  SPEED <b>{simulation.speed}×</b>
                </span>
              </div>
            </div>

            <div className="simulation-side">
              <div className="panel queue-panel">
                <div className="panel-header">
                  <div>
                    <span className="panel-kicker">CONTINUOUS MONITORING</span>
                    <h3>Lane pressure and priority</h3>
                  </div>
                  <span className="mode-chip">{simulation.aiMode} MODE</span>
                </div>
                <div className="queue-list">
                  {directions.map((direction) => {
                    const lane = simulation.laneStates[direction]
                    return (
                      <div
                        className={`queue-row priority-${lane.priority.toLowerCase().replace(' ', '-')} ${
                          direction === currentPriority ? 'current-priority-row' : ''
                        }`}
                        key={direction}
                      >
                        <span className="direction-code">{direction.charAt(0)}</span>
                        <div>
                          <span>
                            <b>{direction}</b>
                            <small>{lane.priority}</small>
                          </span>
                          <div className="pressure-track">
                            <motion.span
                              className={
                                lane.queueLength > 8
                                  ? 'pressure-high'
                                  : lane.queueLength > 4
                                    ? 'pressure-medium'
                                    : ''
                              }
                              animate={{
                                width: `${Math.min(100, lane.queueLength * 8)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <strong>{lane.queueLength}</strong>
                      </div>
                    )
                  })}
                </div>
                <div className="serial-priority-status">
                  <div>
                    <span>CURRENT PRIORITY</span>
                    <strong>
                      {currentPriority
                        ? `${laneNumber[currentPriority]} · ${currentPriority.toUpperCase()}`
                        : 'NORMAL OPERATION'}
                    </strong>
                  </div>
                  <ArrowRight size={16} />
                  <div>
                    <span>NEXT PRIORITY</span>
                    <strong>
                      {nextPriority
                        ? `${laneNumber[nextPriority]} · ${nextPriority.toUpperCase()}`
                        : 'NONE'}
                    </strong>
                  </div>
                </div>
                <div className="lane-thresholds">
                  <span>3–5 NORMAL</span>
                  <span>6–10 HIGH PRIORITY</span>
                  <span>ONE LANE AT A TIME</span>
                </div>
              </div>

              <div className="decision-card integrated-decision">
                <div className="decision-title">
                  <span>
                    <Sparkles size={18} /> AI DECISION ENGINE
                  </span>
                  <span className="confidence">{recommendation.confidence}% CONFIDENCE</span>
                </div>
                <div className="priority-headline">
                  <strong>{recommendation.headline}</strong>
                  <span>{recommendation.detail}</span>
                </div>
                <h3>
                  Extend <em>{groupForPhase(simulation.signalPhase).replace('_', ' / ')}</em> green
                  phase by {recommendation.extension} seconds.
                </h3>
                <div className="reasoning">
                  <strong>
                    <BrainCircuit size={17} /> WHY THIS ACTION?
                  </strong>
                  <p>{recommendation.why}</p>
                </div>
                <div className="signal-timing-audit">
                  <div>
                    <span>BASE GREEN</span>
                    <b>{GREEN_DURATION}s</b>
                  </div>
                  <div>
                    <span>AI EXTENSION</span>
                    <b>+{simulation.aiExtensionSeconds || 0}s</b>
                  </div>
                  <div>
                    <span>MAX GREEN</span>
                    <b>{MAX_GREEN_DURATION}s</b>
                  </div>
                  <div>
                    <span>CURRENT REMAINING</span>
                    <b>{Math.max(0, simulation.signalDuration - simulation.signalElapsed)}s</b>
                  </div>
                </div>
                <Button
                  onClick={applyDecision}
                  disabled={!simulation.signalPhase.endsWith('_GREEN')}
                  className={simulation.signalPhase.endsWith('_GREEN') ? '' : 'control-disabled'}
                >
                  <Zap size={18} /> APPLY AI DECISION
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="section data-section" id="dataset">
          <div className="heading-row">
            <SectionHeading
              eyebrow="02 — DATASET"
              title="Traffic data built for operational testing."
              body="ATSO accepts SUMO-generated traffic-flow data through TraCI or vehicle counts derived from roadside video."
            />
            <Button variant="secondary" onClick={() => uploadRef.current?.click()}>
              <Upload size={17} /> UPLOAD CSV
            </Button>
            <input
              ref={uploadRef}
              className="hidden-input"
              type="file"
              accept=".csv"
              onChange={(event) => uploadDataset(event.target.files?.[0])}
            />
          </div>
          <div className="dataset-stats">
            <div>
              <Database size={19} />
              <span>
                <small>ACTIVE DATASET</small>
                <b>{datasetName}</b>
              </span>
            </div>
            <div>
              <BarChart3 size={19} />
              <span>
                <small>RECORDS</small>
                <b>{datasetRecords.toLocaleString()}</b>
              </span>
            </div>
            <div>
              <TrafficCone size={19} />
              <span>
                <small>LANES</small>
                <b>08 monitored</b>
              </span>
            </div>
            <div>
              <Clock3 size={19} />
              <span>
                <small>SAMPLE RATE</small>
                <b>10 seconds</b>
              </span>
            </div>
          </div>
          <div className="data-source-row">
            <div>
              <Database size={19} />
              <span>
                <b>SUMO + TraCI</b> Generated mobility scenarios
              </span>
            </div>
            <div>
              <FileUp size={19} />
              <span>
                <b>Video derived</b> Detector and vehicle counts
              </span>
            </div>
            <DataBadge />
          </div>
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  {[
                    'Timestamp',
                    'Lane',
                    'Vehicle Count',
                    'Queue Length',
                    'Waiting Time',
                    'Signal Phase',
                    'Traffic Density',
                  ].map((item) => (
                    <th key={item}>{item}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datasetRows.map((row, index) => (
                  <tr key={index}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DatasetManager />
        </section>

        <section className="section analytics-section" id="analytics">
          <div className="heading-row">
            <SectionHeading
              eyebrow="03 — ANALYTICS"
              title="What happened, measured honestly."
              body="All charts are built from ATSO simulation ticks. Pausing freezes collection; resetting clears every recorded point."
            />
            <div className="analytics-badges">
              <DataBadge live />
              <DataBadge />
            </div>
          </div>
          <div className="analytics-kpis">
            <div>
              <TrendingDown size={18} />
              <span>AVERAGE WAIT</span>
              <b>{simulation.waitingTime}s</b>
            </div>
            <div>
              <TrafficCone size={18} />
              <span>QUEUE LENGTH</span>
              <b>{simulation.queueLength} veh</b>
            </div>
            <div>
              <TrendingUp size={18} />
              <span>THROUGHPUT</span>
              <b>{simulation.throughput}/min</b>
            </div>
            <div>
              <CircleGauge size={18} />
              <span>EFFICIENCY</span>
              <b>{simulation.signalEfficiency}%</b>
            </div>
            <div>
              <Activity size={18} />
              <span>CONGESTION</span>
              <b>{simulation.congestion}%</b>
            </div>
          </div>

          <div className="calculated-comparison">
            <div>
              <span>FIXED VS ADAPTIVE · WAITING TIME</span>
              <strong>
                {waitImprovement === null
                  ? 'Run both modes to compare'
                  : `${waitImprovement >= 0 ? '−' : '+'}${Math.abs(waitImprovement).toFixed(1)}%`}
              </strong>
              <small>
                {fixedWait === null
                  ? 'No fixed-timing samples yet'
                  : `Fixed ${fixedWait.toFixed(1)}s`}
                {' · '}
                {adaptiveWait === null
                  ? 'No adaptive samples yet'
                  : `Adaptive ${adaptiveWait.toFixed(1)}s`}
              </small>
            </div>
            <div>
              <span>FIXED VS ADAPTIVE · THROUGHPUT</span>
              <strong>
                {throughputImprovement === null
                  ? 'Run both modes to compare'
                  : `${throughputImprovement >= 0 ? '+' : '−'}${Math.abs(throughputImprovement).toFixed(1)}%`}
              </strong>
              <small>Calculated only from recorded simulation samples</small>
            </div>
          </div>

          <div className="history-chart-grid">
            <HistoryChart
              title="Waiting Time vs Simulation Time"
              kicker="WAITING TIME"
              data={simulation.history}
              lines={[
                {
                  key: 'waitingTime',
                  name: 'Average wait',
                  color: '#24d6c4',
                },
              ]}
              unit="s"
            />
            <HistoryChart
              title="Queue Length vs Simulation Time"
              kicker="QUEUE PRESSURE"
              data={simulation.history}
              lines={[
                {
                  key: 'queueLength',
                  name: 'Queued vehicles',
                  color: '#f6b94b',
                },
              ]}
            />
            <HistoryChart
              title="Throughput vs Simulation Time"
              kicker="NETWORK FLOW"
              data={simulation.history}
              lines={[
                {
                  key: 'throughput',
                  name: 'Vehicles per minute',
                  color: '#53a8ff',
                },
              ]}
              unit="/m"
            />
            <HistoryChart
              title="Traffic Density vs Simulation Time"
              kicker="DEMAND LEVEL"
              data={simulation.history}
              lines={[
                {
                  key: 'density',
                  name: 'Density index',
                  color: '#ab87ff',
                },
              ]}
              unit="%"
            />
            <HistoryChart
              title="Fixed-Time vs Adaptive vs Q-Learning"
              kicker="ACTUAL RECORDED MODE SAMPLES"
              data={simulation.history}
              lines={[
                {
                  key: 'fixedWaitingTime',
                  name: 'Fixed timing',
                  color: '#f26d7d',
                },
                {
                  key: 'adaptiveWaitingTime',
                  name: 'Adaptive AI',
                  color: '#24d6a9',
                },
                {
                  key: 'qLearningWaitingTime',
                  name: 'Q-Learning',
                  color: '#ab87ff',
                },
              ]}
              unit="s"
            />
          </div>
        </section>

        <SubmissionWorkspace simulation={simulation} />

        <section className="section about-section" id="about">
          <SectionHeading
            eyebrow="04 — ABOUT ATSO"
            title="A connected intelligence layer for urban movement."
            body="ATSO converts lane-level traffic conditions into explainable signal priorities, safe vehicle flow and measurable network performance."
          />
          <div className="smart-city-layout">
            <div className="panel smart-city-panel">
              <div className="panel-header">
                <div>
                  <span className="panel-kicker">SMART CITY VIEW</span>
                  <h3>Connected intersection network</h3>
                </div>
                <span className="panel-live">
                  <span /> 4 JUNCTIONS
                </span>
              </div>
              <div className="junction-grid">
                {cityIntersections.map((junction) => {
                  const status =
                    junction.id === 'J-01' ? congestionLabel.toUpperCase() : junction.status
                  return (
                    <button
                      key={junction.id}
                      className={`junction-card junction-${status.toLowerCase()} ${
                        selectedJunction === junction.id ? 'selected' : ''
                      }`}
                      onClick={() => setSelectedJunction(junction.id)}
                    >
                      <span>{junction.id}</span>
                      <strong>{junction.name}</strong>
                      <small>{status}</small>
                    </button>
                  )
                })}
              </div>
            </div>
            <motion.div
              className="panel junction-detail"
              key={selectedJunction}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="panel-kicker">SELECTED INTERSECTION</span>
              <h3>
                {selectedCity.id} · {selectedCity.name}
              </h3>
              <div className="junction-metrics">
                <div>
                  <span>VEHICLES</span>
                  <b>{selectedMetrics.vehicles}</b>
                </div>
                <div>
                  <span>AVERAGE WAIT</span>
                  <b>{selectedMetrics.wait}s</b>
                </div>
                <div>
                  <span>NETWORK STATE</span>
                  <b>{selectedMetrics.status}</b>
                </div>
              </div>
              <div className="map-advice">
                <BrainCircuit size={19} />
                <div>
                  <strong>ATSO NETWORK ACTION</strong>
                  <span>
                    {selectedMetrics.status === 'NORMAL'
                      ? 'Maintain current timing plan and continue monitoring.'
                      : 'Coordinate the next safe priority phase to reduce corridor pressure.'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="platform-story">
            {[
              ['01', 'Observe', 'Lane-level vehicle positions and safe gaps'],
              ['02', 'Prioritize', 'Queue, wait and congestion ranking'],
              ['03', 'Optimize', 'Serial adaptive signal phases'],
              ['04', 'Measure', 'Simulation-derived performance history'],
            ].map(([step, title, detail]) => (
              <div key={step}>
                <span>{step}</span>
                <strong>{title}</strong>
                <p>{detail}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />

      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification.id}
            className="toast"
            initial={{ opacity: 0, y: -12, x: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Check size={18} />
            <div className="toast-copy">
              <strong>{notification.title}</strong>
              <span>{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
