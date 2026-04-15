'use client';

import { useCallback, useSyncExternalStore } from 'react';

export type ToastType = 'ok' | 'error' | 'info';
export type ToastItem = { id: string; type: ToastType; message: string };
const EMPTY_TOASTS: ToastItem[] = [];

let toasts: ToastItem[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
let toastCounter = 0;

function createToastId() {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  toastCounter += 1;
  return `toast-${Date.now()}-${toastCounter}`;
}

function push(type: ToastType, message: string) {
  const id = createToastId();
  toasts = [...toasts, { id, type, message }];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 3500);
}

export function useToast() {
  const items = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => toasts,
    () => EMPTY_TOASTS
  );

  return {
    items,
    remove: useCallback((id: string) => {
      toasts = toasts.filter((t) => t.id !== id);
      emit();
    }, []),
    ok: useCallback((m: string) => push('ok', m), []),
    error: useCallback((m: string) => push('error', m), []),
    info: useCallback((m: string) => push('info', m), [])
  };
}
