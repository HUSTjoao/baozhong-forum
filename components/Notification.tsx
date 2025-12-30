'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationProps {
  message: string
  type?: NotificationType
  duration?: number
  onClose: () => void
}

export default function Notification({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // 等待动画完成
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  }

  const Icon = icons[type]

  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4 sm:top-8">
      <div
        className={`pointer-events-auto max-w-md w-full transform transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        <div
          className={`${colors[type]} border-2 rounded-xl shadow-2xl px-5 py-4 flex items-start gap-3`}
        >
          <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[type]}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium break-words">{message}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className={`flex-shrink-0 ${iconColors[type]} hover:opacity-70 transition-opacity`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook for using notification
export function useNotification() {
  const [notification, setNotification] = useState<{
    message: string
    type: NotificationType
  } | null>(null)

  const showNotification = (message: string, type: NotificationType = 'info') => {
    setNotification({ message, type })
  }

  const hideNotification = () => {
    setNotification(null)
  }

  return {
    notification,
    showNotification,
    hideNotification,
    NotificationComponent: notification ? (
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
    ) : null,
  }
}


