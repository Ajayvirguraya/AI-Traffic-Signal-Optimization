'use client'

import { motion } from 'motion/react'
import type { Direction, SignalPhase, Vehicle } from '@/lib/atso/simulation'
import TrafficLight from './TrafficLight'

type TrafficIntersectionProps = {
  signalPhase: SignalPhase
  vehicles: Vehicle[]
  running: boolean
  speed?: number
  compact?: boolean
  activeDirection?: Direction | null
}

const vehiclePosition = (vehicle: Vehicle) => {
  const offset = `${vehicle.position}%`
  if (vehicle.lane === 'North') return { right: '43%', top: offset }
  if (vehicle.lane === 'South') return { left: '43%', bottom: offset }
  if (vehicle.lane === 'East') return { bottom: '43%', right: offset }
  return { top: '43%', left: offset }
}

export default function TrafficIntersection({
  signalPhase,
  vehicles,
  running,
  speed = 1,
  compact = false,
  activeDirection,
}: TrafficIntersectionProps) {
  return (
    <div
      className={`intersection ${compact ? 'intersection-compact' : ''} ${
        running ? 'intersection-running' : 'intersection-paused'
      }`}
      aria-label={`Four-way ATSO intersection. ${signalPhase} lane currently has a green signal. ${vehicles.length} vehicles are active.`}
      role="img"
    >
      <div className="city-grid" />
      <div className="road road-vertical">
        <div className="lane-mark lane-mark-v" />
      </div>
      <div className="road road-horizontal">
        <div className="lane-mark lane-mark-h" />
      </div>
      <div className="intersection-box">
        <span className="crossing crossing-top" />
        <span className="crossing crossing-bottom" />
        <span className="crossing crossing-left" />
        <span className="crossing crossing-right" />
      </div>

      {(['North', 'South', 'East', 'West'] as Direction[]).map((lane) => (
        <TrafficLight
          direction={lane}
          phase={signalPhase}
          activeDirection={activeDirection}
          key={lane}
        />
      ))}

      {vehicles.map((vehicle) => (
        <motion.span
          className={`car car-${vehicle.lane.toLowerCase()} car-${vehicle.color} state-car`}
          key={vehicle.id}
          initial={false}
          animate={vehiclePosition(vehicle)}
          transition={{
            duration: running ? 0.82 / speed : 0,
            ease: 'linear',
          }}
        />
      ))}

      <div className="intersection-status">
        <span className={running ? 'live-dot' : 'paused-dot'} />
        <span>{signalPhase.replace(/_/g, ' ')} ACTIVE</span>
      </div>
    </div>
  )
}
