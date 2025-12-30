'use client'

import React from 'react'

type AlertDialogProps = {
  open: boolean
  title: string
  message?: string
  onClose: () => void
}

export function AlertDialog({ open, title, message, onClose }: AlertDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-[90%] px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">{title}</h2>
        {message && (
          <p className="text-sm text-slate-600 mb-6 whitespace-pre-line">{message}</p>
        )}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  )
}

type ConfirmDialogProps = {
  open: boolean
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-[90%] px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">{title}</h2>
        {message && (
          <p className="text-sm text-slate-600 mb-6 whitespace-pre-line">{message}</p>
        )}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}


