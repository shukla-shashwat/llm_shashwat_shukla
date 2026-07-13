import { Button } from '@/app/components/button/Button'
import { Card } from '@/app/components/card/Card'
import useClickOutside from '@/app/hooks/useClickOutside'
import { X } from '@phosphor-icons/react'

import { useEffect, useRef } from 'react'
import { cn } from '~/utils/tw'

type ModalProps = {
    className?: string
  children: React.ReactNode
  clickOutsideToClose?: boolean
  isOpen: boolean
  onClose: () => void
}

export const Modal = ({
    className,
  children,
  clickOutsideToClose = false,
  isOpen,
  onClose,
}: ModalProps) => {
  const modalRef = clickOutsideToClose
    ? useClickOutside(onClose)
    : useRef<HTMLDivElement>(null)

  // Stop site overflow when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Tab focus
  useEffect(() => {
    if (!isOpen || !modalRef.current) return

    const focusableElements = modalRef.current.querySelectorAll(
      'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])',
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (firstElement) firstElement.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab moves focus backward
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab moves focus forward
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed left-0 top-0 z-50 flex h-dvh w-full items-center justify-center p-4 sm:p-6">
      <div className="fade fixed left-0 top-0 h-full w-full bg-black/30 backdrop-blur-sm" />

      <Card
        className={cn("reveal reveal-sm relative z-50 max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl", className)}
        ref={modalRef}
        tabIndex={-1}
      >
        {children}

        <Button
          aria-label="Close Modal"
          shape="square"
          className="absolute top-2 right-2"
          onClick={onClose}
          variant="ghost"
        >
          <X size={16} />
        </Button>
      </Card>
    </div>
  )
}
