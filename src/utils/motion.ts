import { useEffect, useRef, useState } from 'react'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useAnimatedNumber(value: number, duration = 850) {
  const reducedMotion = typeof window === 'undefined' || prefersReducedMotion()
  const initialValue = reducedMotion ? value : 0
  const [displayValue, setDisplayValue] = useState(initialValue)
  const displayValueRef = useRef(initialValue)

  useEffect(() => {
    if (reducedMotion) {
      displayValueRef.current = value
      return
    }

    const startValue = displayValueRef.current
    const change = value - startValue
    if (!change) return

    let frame = 0
    const startedAt = performance.now()

    function tick(now: number) {
      const progress = Math.min((now - startedAt) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const nextValue = startValue + change * eased
      displayValueRef.current = nextValue
      setDisplayValue(nextValue)

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [duration, reducedMotion, value])

  return reducedMotion ? value : displayValue
}
