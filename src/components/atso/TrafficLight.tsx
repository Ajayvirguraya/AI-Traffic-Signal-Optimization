import type { Direction, SignalColor, SignalPhase } from '@/lib/atso/simulation'
import { getSignalColor } from '@/lib/atso/simulation'

type TrafficLightProps = {
  direction: Direction
  phase: SignalPhase
  activeDirection?: Direction | null
}

export default function TrafficLight({ direction, phase, activeDirection }: TrafficLightProps) {
  const color: SignalColor = getSignalColor(direction, phase, activeDirection)

  return (
    <div
      className={`signal signal-${direction.charAt(0).toLowerCase()}`}
      aria-label={`${direction} traffic light: ${color}`}
    >
      <span className={`light ${color.toLowerCase()}`} />
    </div>
  )
}
