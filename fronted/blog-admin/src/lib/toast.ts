/**
 * 轻量级全局 Toast 订阅服务
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

type ToastListener = (toast: ToastItem) => void;

class ToastManager {
  private listeners: Set<ToastListener> = new Set();

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  show(message: string, type: ToastType = 'info', duration = 3000) {
    const id = Math.random().toString(36).substring(2, 9);
    const toastItem: ToastItem = { id, message, type, duration };
    this.listeners.forEach((listener) => listener(toastItem));
  }

  success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number) {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number) {
    this.show(message, 'info', duration);
  }
}

export const toast = new ToastManager();
