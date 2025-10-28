// components/ui/LightRays.tsx
'use client'

import { useMemo } from 'react'

interface LightRaysProps {
  count?: number
  color?: string
}

export function LightRays({ count = 32, color = '' }: LightRaysProps) {
  // Generate random properties for each ray (memoized to prevent recalculation)
  const rays = useMemo(() => {
    return Array.from({ length: count }, () => ({
      deg: Math.random(),
      thickness: 8 + Math.random() * 26,
      length: -50 + Math.random() * 100,
      duration: 1 + Math.random() * 1.5,
      delay: 2 + Math.random() * 1,
      rotate: -4 + Math.random() * 8,
    }))
  }, [count])

  return (
    <>
      <div className="ocean-light-rays">
        {rays.map((ray, index) => (
          <div
            key={index}
            className="ocean-light-ray"
            style={
              {
                '--deg': ray.deg,
                '--thickness': `${ray.thickness}px`,
                '--length': `${ray.length}px`,
                '--duration': `${ray.duration}s`,
                '--delay': `${ray.delay}s`,
                '--rotate': `${ray.rotate}deg`,
                '--ray-color': color,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <style jsx global>{`
        .ocean-light-rays {
          position: absolute;
          display: block;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
          filter: blur(0.6rem);
          will-change: filter;
        }

        .ocean-light-ray {
          --deg: 0;
          --length: 0rem;
          --thickness: 20px;
          --duration: 2s;
          --delay: 1s;
          --rotate: 0deg;
          --degRange: 72.5deg;
          --spreadRange: 40vw;
          --ray-color: var(--mana-color);

          position: absolute;
          transform-style: preserve-3d;
          perspective: 500px;
          width: var(--thickness);
          height: calc(20% + 370px + var(--length));
          left: 50%;
          transform: translateX(
              calc(
                -50% + var(--deg) * var(--spreadRange) * -1 + 0.5 * var(--spreadRange)
              )
            )
            translateY(-100px)
            rotateZ(calc(var(--degRange) * -0.5 + var(--deg) * var(--degRange)))
            rotateX(0.01deg);
          transform-origin: center -100px;
          mix-blend-mode: screen;
          will-change: transform, opacity;
          animation: 
            ocean-shimmer linear var(--duration) calc(var(--delay) * -1) infinite alternate forwards,
            ocean-rotate ease-in-out calc(var(--duration) * 3.14) calc(var(--delay) * -1) infinite alternate forwards;
        }

        .ocean-light-ray::before {
          content: "";
          position: absolute;
          display: block;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background: linear-gradient(
            to bottom,
            var(--ray-color),
            transparent 100%
          );
          transform-origin: top center;
          transform: rotateX(40deg);
          will-change: transform;
        }

        @keyframes ocean-shimmer {
          0% {
            opacity: 0.33;
          }
          100% {
            opacity: 0.03;
          }
        }

        @keyframes ocean-rotate {
          0% {
            rotate: 0deg;
          }
          100% {
            rotate: var(--rotate);
          }
        }
      `}</style>
    </>
  )
}
