import { create } from 'zustand';

export interface DialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: 'danger' | 'success' | 'info' | 'error';
  onConfirm?: () => void | Promise<void>;
}

export interface DialogRequest extends DialogOptions { id: number; }

let nextId = 0;
export const useDialogStore = create<{
  queue: DialogRequest[];
  open: (options: DialogOptions) => void;
  dismiss: (id: number) => void;
}>((set) => ({
  queue: [],
  open: (options) => set((state) => ({ queue: [...state.queue, { ...options, id: ++nextId }] })),
  dismiss: (id) => set((state) => ({ queue: state.queue.filter((item) => item.id !== id) })),
}));

export const dialogs = {
  alert: (title: string, message: string) => useDialogStore.getState().open({ title, message, tone: 'error' }),
  confirm: (options: DialogOptions) => useDialogStore.getState().open({ tone: 'danger', ...options }),
};
