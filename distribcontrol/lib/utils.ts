import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'UZS'): string {
  if (currency === 'UZS') {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' сум'
  }
  if (currency === 'USD') {
    return '$' + new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2 }).format(amount)
  }
  if (currency === 'EUR') {
    return '€' + new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2 }).format(amount)
  }
  return new Intl.NumberFormat('ru-RU').format(amount)
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-700',
    CONFIRMED: 'bg-indigo-100 text-indigo-700',
    SHIPPED: 'bg-yellow-100 text-yellow-700',
    IN_TRANSIT: 'bg-orange-100 text-orange-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    RETURNED: 'bg-purple-100 text-purple-700',
    ACTIVE: 'bg-green-100 text-green-700',
    INACTIVE: 'bg-gray-100 text-gray-600',
    BLOCKED: 'bg-red-100 text-red-700',
    PAID: 'bg-green-100 text-green-700',
    UNPAID: 'bg-red-100 text-red-700',
    PARTIAL: 'bg-yellow-100 text-yellow-700',
    VISITED: 'bg-green-100 text-green-700',
    MISSED: 'bg-red-100 text-red-700',
    PLANNED: 'bg-blue-100 text-blue-700',
    OUTSIDE_ROUTE: 'bg-orange-100 text-orange-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    NEW: 'Новый',
    CONFIRMED: 'Подтверждён',
    SHIPPED: 'Отгружен',
    IN_TRANSIT: 'В пути',
    DELIVERED: 'Доставлен',
    CANCELLED: 'Отменён',
    RETURNED: 'Возврат',
    ACTIVE: 'Активный',
    INACTIVE: 'Неактивный',
    BLOCKED: 'Заблокирован',
    PAID: 'Оплачен',
    UNPAID: 'Не оплачен',
    PARTIAL: 'Частично',
    VISITED: 'Посещён',
    MISSED: 'Не посещён',
    PLANNED: 'Запланирован',
    OUTSIDE_ROUTE: 'Вне маршрута',
    PENDING: 'Ожидает',
    APPROVED: 'Одобрен',
    REJECTED: 'Отклонён',
    ADMIN: 'Администратор',
    MANAGER: 'Менеджер',
    AGENT: 'Торговый агент',
    WAREHOUSE: 'Сотрудник склада',
    FINANCE: 'Финансовый менеджер',
    CASH: 'Наличные',
    TRANSFER: 'Перевод',
    CREDIT: 'Кредит',
    CARD: 'Карта',
  }
  return map[status] || status
}

export const ROLES = {
  ADMIN: 'Администратор',
  MANAGER: 'Менеджер',
  AGENT: 'Торговый агент',
  WAREHOUSE: 'Сотрудник склада',
  FINANCE: 'Финансовый менеджер',
} as const

export const BRANCHES = ['Все филиалы', 'Ташкент', 'Бекобод', 'Янгиюль', 'Завод', 'Хоразм']
