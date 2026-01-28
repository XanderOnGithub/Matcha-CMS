import React, { useEffect, useRef, useState } from 'react';

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
};

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal
        className="relative w-full max-w-md rounded-lg bg-white shadow-lg ring-1 ring-slate-200 mx-4"
      >
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="text-sm font-bold text-slate-700">{title}</div>
        </div>

        <div className="p-4">{children}</div>

        {footer && <div className="px-4 py-3 border-t border-slate-100">{footer}</div>}
      </div>
    </div>
  );
}

// --- Input Dialog ---
export function InputDialog({
  open,
  title,
  label,
  placeholder,
  initialValue = '',
  onCancel,
  onSubmit,
  isLoading = false,
  errorMessage,
}: {
  open: boolean;
  title?: string;
  label?: string;
  placeholder?: string;
  initialValue?: string;
  onCancel: () => void;
  onSubmit: (value: string) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  return (
    <Modal
      open={open}
      title={title}
      onClose={() => {
        if (!isLoading) onCancel();
      }}
      footer={
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 rounded bg-slate-50 text-slate-700 text-sm"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(value.trim())}
            className="px-3 py-1 rounded bg-emerald-600 text-white text-sm"
            disabled={isLoading || value.trim().length === 0}
          >
            {isLoading ? 'Creating…' : 'Create'}
          </button>
        </div>
      }
    >
      {label && <div className="text-sm text-slate-500 mb-2">{label}</div>}
      {errorMessage && <div className="text-sm text-red-600 mb-2">{errorMessage}</div>}
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const trimmed = value.trim();
            if (trimmed.length > 0 && !isLoading) onSubmit(trimmed);
          }
        }}
      />
    </Modal>
  );
}

// --- Confirm Dialog ---
export function ConfirmDialog({
  open,
  title,
  message,
  onCancel,
  onConfirm,
  confirmLabel = 'Delete',
  isLoading = false,
}: {
  open: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  isLoading?: boolean;
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={() => { if (!isLoading) onCancel(); }}
      footer={
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 rounded bg-slate-50 text-slate-700 text-sm"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1 rounded bg-red-600 text-white text-sm"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      }
    >
      <div className="text-sm text-slate-600">{message}</div>
    </Modal>
  );
}

export default Modal;
