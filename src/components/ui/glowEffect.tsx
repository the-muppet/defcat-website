/** biome-ignore-all assist/source/organizeImports: <explanation> */
'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { animate } from 'motion/react'

interface GlowingEffectProps {
  blur?: number
  inactiveZone?: number
  proximity?: number
  spread?: number
  variant?: 'default' | 'white'
  glow?: boolean
  className?: string
  disabled?: boolean
  movementDuration?: number
  borderWidth?: number
}

// Precalculated gradient strings for better performance
const GRADIENT_PRESETS = {
  default: `radial-gradient(circle, #dd7bbb 10%, #dd7bbb00 20%),
    radial-gradient(circle at 40% 40%, #d79f1e 5%, #d79f1e00 15%),
    radial-gradient(circle at 60% 60%, #5a922c 10%, #5a922c00 20%), 
    radial-gradient(circle at 40% 60%, #4c7894 10%, #4c789400 20%),
    repeating-conic-gradient(
      from 236.84deg at 50% 50%,
      #dd7bbb 0%,
      #d79f1e 20%,
      #5a922c 40%, 
      #4c7894 60%,
      #dd7bbb 80%,
      #dd7bbb 100%
    )`,
  white: `repeating-conic-gradient(
    from 236.84deg at 50% 50%,
    var(--black) 0%,
    var(--black) 20%,
    var(--black) 100%
  )`,
}

// Throttle function for mouse movement
const throttle = <T extends (...args: any[]) => void>(func: T, delay: number): T => {
  let timeoutId: NodeJS.Timeout | null = null
  let lastExecTime = 0

  return ((...args: any[]) => {
    const currentTime = Date.now()

    if (currentTime - lastExecTime > delay) {
      lastExecTime = currentTime
      func(...args)
    } else if (!timeoutId) {
      timeoutId = setTimeout(
        () => {
          lastExecTime = Date.now()
          func(...args)
          timeoutId = null
        },
        delay - (currentTime - lastExecTime)
      )
    }
  }) as T
}

const GlowingEffect = memo(
  ({
    blur = 0,
    inactiveZone = 0.7,
    proximity = 48,
    spread = 15,
    variant = 'default',
    glow = false,
    className,
    movementDuration = 2,
    borderWidth = 1,
    disabled = true,
  }: GlowingEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const lastPosition = useRef({ x: 0, y: 0 })
    const animationFrameRef = useRef<number>(0)
    const animationRef = useRef<any>(null)
    const [isVisible, setIsVisible] = useState(true)

    // Precalculate the gradient
    const gradient = useMemo(() => GRADIENT_PRESETS[variant] || GRADIENT_PRESETS.default, [variant])

    // Precalculate mask image
    const maskImage = useMemo(
      () =>
        `linear-gradient(#0000,#0000),conic-gradient(from calc((var(--start)-${spread})*1deg),#00000000 0deg,#fff,#00000000 calc(${spread}*2deg))`,
      [spread]
    )

    // Batch DOM updates
    const updateStyles = useCallback((updates: Record<string, string>) => {
      if (!containerRef.current) return

      // Batch all style updates in a single reflow
      requestAnimationFrame(() => {
        if (!containerRef.current) return
        Object.entries(updates).forEach(([key, value]) => {
          containerRef.current!.style.setProperty(key, value)
        })
      })
    }, [])

    const handleMove = useCallback(
      (e?: MouseEvent | { x: number; y: number }) => {
        if (!containerRef.current || !isVisible) return

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          const element = containerRef.current
          if (!element) return

          const rect = element.getBoundingClientRect()
          const { left, top, width, height } = rect
          const mouseX = e?.x ?? lastPosition.current.x
          const mouseY = e?.y ?? lastPosition.current.y

          if (e) {
            lastPosition.current = { x: mouseX, y: mouseY }
          }

          // Precalculate center once
          const centerX = left + width * 0.5
          const centerY = top + height * 0.5
          const distanceFromCenter = Math.hypot(mouseX - centerX, mouseY - centerY)
          const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone

          if (distanceFromCenter < inactiveRadius) {
            updateStyles({ '--active': '0' })
            return
          }

          const isActive =
            mouseX > left - proximity &&
            mouseX < left + width + proximity &&
            mouseY > top - proximity &&
            mouseY < top + height + proximity

          if (!isActive) {
            updateStyles({ '--active': '0' })
            return
          }

          updateStyles({ '--active': '1' })

          const currentAngle = parseFloat(element.style.getPropertyValue('--start')) || 0
          const targetAngle = (180 * Math.atan2(mouseY - centerY, mouseX - centerX)) / Math.PI + 90

          const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180
          const newAngle = currentAngle + angleDiff

          // Cancel previous animation if exists
          if (animationRef.current) {
            animationRef.current.cancel()
          }

          animationRef.current = animate(currentAngle, newAngle, {
            duration: movementDuration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (value) => {
              updateStyles({ '--start': String(value) })
            },
            onComplete: () => {
              animationRef.current = null
            },
          })
        })
      },
      [inactiveZone, proximity, movementDuration, isVisible, updateStyles]
    )

    // Throttled version of handleMove for better performance
    const throttledHandleMove = useMemo(
      () => throttle(handleMove, 16), // ~60fps
      [handleMove]
    )

    // Intersection Observer for visibility
    useEffect(() => {
      if (disabled) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(entry.isIntersecting)
          if (!entry.isIntersecting && animationRef.current) {
            animationRef.current.cancel()
            animationRef.current = null
          }
        },
        { threshold: 0.1 }
      )

      if (containerRef.current) {
        observer.observe(containerRef.current)
      }

      return () => observer.disconnect()
    }, [disabled])

    useEffect(() => {
      if (disabled || !isVisible) return

      const handleScroll = () => throttledHandleMove()
      const handlePointerMove = (e: PointerEvent) => throttledHandleMove(e)

      window.addEventListener('scroll', handleScroll, { passive: true })
      document.body.addEventListener('pointermove', handlePointerMove, {
        passive: true,
      })

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        if (animationRef.current) {
          animationRef.current.cancel()
        }
        window.removeEventListener('scroll', handleScroll)
        document.body.removeEventListener('pointermove', handlePointerMove)
      }
    }, [throttledHandleMove, disabled, isVisible])

    return (
      <>
        <div
          className={cn(
            'pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity',
            glow && 'opacity-100',
            variant === 'white' && 'border-white',
            disabled && '!block'
          )}
        />
        <div
          ref={containerRef}
          style={
            {
              '--blur': `${blur}px`,
              '--spread': spread,
              '--start': '0',
              '--active': '0',
              '--glowingeffect-border-width': `${borderWidth}px`,
              '--gradient': gradient,
              '--mask-image': maskImage,
            } as React.CSSProperties
          }
          className={cn(
            'pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity',
            'will-change-[opacity,mask-image]', // GPU acceleration
            'transform-gpu', // Force GPU layer
            glow && 'opacity-100',
            blur > 0 && 'blur-[var(--blur)]',
            className,
            disabled && '!hidden'
          )}
        >
          <div
            className={cn(
              'glow',
              'rounded-[inherit]',
              // GPU optimizations
              '[contain:layout_style_paint]', // CSS containment
              '[backface-visibility:hidden]',
              '[perspective:1000px]',
              'transform-gpu',
              // After pseudo-element styles
              'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
              'after:[border:var(--glowingeffect-border-width)_solid_transparent]',
              'after:[background:var(--gradient)] after:[background-attachment:fixed]',
              'after:opacity-[var(--active)] after:transition-opacity after:duration-300',
              // GPU acceleration for pseudo-element
              'after:will-change-[opacity]',
              'after:transform-gpu',
              // Optimized mask
              'after:[mask-clip:padding-box,border-box]',
              'after:[mask-composite:intersect]',
              'after:[mask-image:var(--mask-image)]'
            )}
          />
        </div>
      </>
    )
  }
)

GlowingEffect.displayName = 'GlowingEffect'

export { GlowingEffect }
