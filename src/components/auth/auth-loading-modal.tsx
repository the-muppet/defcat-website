// components/auth/auth-loading-modal.tsx
'use client'

import { AnimatePresence, motion } from 'motion/react'

interface AuthLoadingModalProps {
  isOpen: boolean
  type: 'login' | 'logout'
}

export function AuthLoadingModal({ isOpen, type }: AuthLoadingModalProps) {
  const message = type === 'login' ? 'Signing you in...' : 'Signing you out...'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with tinted overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: 9998 }}
          />

          {/* Modal with tinted glass effect */}
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="glass-tinted border-tinted rounded-lg p-8 shadow-tinted-xl max-w-sm w-full"
            >
              <div className="flex flex-col items-center space-y-6">
                {/* Animated spinner with mana color */}
                <div className="relative">
                  <motion.div
                    className="w-16 h-16 rounded-full"
                    style={{
                      border: '4px solid rgba(var(--mana-rgb), 0.2)',
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 w-16 h-16 rounded-full"
                    style={{
                      borderWidth: '4px',
                      borderStyle: 'solid',
                      borderColor: 'transparent',
                      borderTopColor: 'var(--mana-color)',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </div>

                {/* Message */}
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">{message}</h3>
                  <p className="text-sm text-muted-foreground">Please wait a moment</p>
                </div>

                {/* Loading dots animation */}
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--mana-color)' }}
                      animate={{
                        y: [0, -8, 0],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
