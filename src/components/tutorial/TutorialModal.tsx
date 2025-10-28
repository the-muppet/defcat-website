'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { PlayCircle, XCircle } from 'lucide-react'

interface TutorialModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const tutorialDuration = 30000 // 30 seconds

  useEffect(() => {
    if (!isPlaying || !isOpen) return

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const currentProgress = (elapsed / tutorialDuration) * 100

      if (currentProgress >= 100) {
        setProgress(100)
        setIsPlaying(false)
        clearInterval(interval)
      } else {
        setProgress(currentProgress)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [isPlaying, isOpen])

  useEffect(() => {
    if (!isOpen) {
      setProgress(0)
      setIsPlaying(false)
    }
  }, [isOpen])

  const handleStart = () => {
    setIsPlaying(true)
    setProgress(0)
  }

  const handleClose = () => {
    setIsPlaying(false)
    setProgress(0)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl glass-tinted-strong border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-tinted-text">
            Welcome to DefCat's DeckVault
          </DialogTitle>
          <DialogDescription>
            Take a quick 30-second tour to learn how to navigate and use the platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video/Tutorial Content Area */}
          <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center relative overflow-hidden">
            {!isPlaying ? (
              <div className="text-center">
                <PlayCircle className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">30-Second Tutorial</p>
                <Button
                  onClick={handleStart}
                  className="mt-4 btn-tinted-primary shadow-tinted-glow"
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Start Tutorial
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="space-y-4 max-w-xl mx-auto px-6">
                  <h3 className="text-2xl font-bold">How to Use DeckVault</h3>
                  <div className="text-left space-y-3 text-muted-foreground">
                    <p>1. Browse decks by commander, color, or bracket level</p>
                    <p>2. View detailed deck lists with pricing and card images</p>
                    <p>3. Submit your own decks based on your Patreon tier</p>
                    <p>4. Join Commander College to improve your deck building skills</p>
                    <p>5. Check out the Discount Store for exclusive deals</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isPlaying && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {Math.ceil((tutorialDuration - (progress * tutorialDuration) / 100) / 1000)}s
                remaining
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              <XCircle className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
