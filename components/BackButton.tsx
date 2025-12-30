'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  href?: string
  label: string
  onClick?: () => void
  className?: string
}

export function BackButton({ href, label, onClick, className = '' }: BackButtonProps) {
  const router = useRouter()

  const baseClasses =
    'inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/90 text-primary-600 text-sm md:text-base font-medium border border-primary-100 shadow-sm hover:bg-primary-50/90 hover:text-primary-700 hover:shadow-md transition-all'

  const content = (
    <>
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-50">
        <ArrowLeft className="w-3.5 h-3.5" />
      </span>
      <span>{label}</span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={`${baseClasses} ${className}`}>
        {content}
      </Link>
    )
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.back()
    }
  }

  return (
    <button type="button" onClick={handleClick} className={`${baseClasses} ${className}`}>
      {content}
    </button>
  )
}


