"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useBranch } from "@/lib/branch-context"
import { formatCurrency } from "@/lib/utils"

const ORDER_STATUSES = [
  { value: "NEW", label: "Новый" },
  { value: "CONFIRMED", label: "Подтверждён" },
  { value: "SHIPPED", label: "Отгружен" },
  { value: "IN_TRANSIT", label: "В пути" },
  { value: "DELIVERED", label: "Доставлен" },
  { value: "RETURNED", label: "Возврат" },
  { value: "CANCELLED", label: "Отменён" },
]

const PAYMENT_STATUSES = [
  { value: "UNPAID", label: "Не оплачен" },
  { value: "PAID", label: "Оплачен" },
  { value: "PARTIAL", label: "Частично" },
]

export default function EditOrderPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  const { selectedBranch } = useBranch()

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  const [clients, setClients] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [orderNumber, setOrderNumber] = useState("")

  // Form State
  const [clientId, setClientId] = useState("")
  const [paymentType, setPaymentType] = useState("CASH")
  const [status, setStatus] = useState("NEW")
  const [paymentStatus, setPaymentStatus] = useState("UNPAID")
  const [note, setNote] = useState("")
  const [items, setItems] = useState<Array<{ productId: string; quantity: number; price: number }>>([])

  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingData(true)
        const [orderRes, clientsRes, productsRes] = await Promise.all([
          fetch(`/api/orders/${orderId}`),
          fetch(`/api/clients?limit=100${selectedBranch !== "Все филиалы" ? `&branch=${selectedBranch}` : ""}`),
          fetch(`/api/warehouse?limit=100`),
        ])

        if (orderRes.ok) {
          const order = await orderRes.json()
          setOrderNumber(order.orderNumber || "")
          setClientId(order.clientId || "")
          setPaymentType(order.paymentType || "CASH")
          setStatus(order.status || "NEW")
          setPaymentStatus(order.paymentStatus || "UNPAID")
          setNote(order.note || "")
          setItems(
            (order.items || []).map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            }))
          )
        } else {
          alert("Заказ не найден")
          router.push("/sales/orders")
        }

        if (clientsRes.ok) {
          const data = await clientsRes.json()
          setClients(data.clients || [])
        }

        if (productsRes.ok) {
          const data = await productsRes.json()
          setProducts(data.products || [])
        }
      } catch (error) {
        console.error("Failed to load data", error)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [orderId, selectedBranch, router])

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantity: 1, price: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items]
    if (field === "productId") {
      const product = products.find(p => p.id === value)
      newItems[index] = {
        ...newItems[index],
        productId: value,
        price: product ? product.price : 0,
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value }
    }
    setItems(newItems)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientId) {
      alert("Пожалуйста, выберите клиента")
      return
    }

    if (items.length === 0 || items.some(i => !i.productId || i.quantity <= 0)) {
      alert("Добавьте хотя бы один товар с корректным количеством")
      return
    }

    setLoading(true)

    try {
      const payload = {
        clientId,
        paymentType,
        note,
        status,
        paymentStatus,
        items: items.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          price: Number(item.price),
          total: Number(item.price) * Number(item.quantity),
        })),
      }

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push("/sales/orders")
      } else {
        const error = await res.json()
        alert(error.error || "Ошибка при обновлении заказа")
      }
    } catch (error) {
      console.error(error)
      alert("Произошла системная ошибка")
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/sales/orders" className="p-2 border rounded-xl hover:bg-gray-50 transition-colors bg-white">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Редактировать заказ</h1>
          <p className="text-sm text-gray-500 mt-1">
            {orderNumber && <span className="font-medium text-blue-700">{orderNumber}</span>}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main info */}
        <div className="card p-6 border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Основная информация</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Клиент *</label>
              <select
                className="form-input w-full"
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                required
              >
                <option value="">-- Выберите клиента --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.address ? `(${c.address})` : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип оплаты</label>
              <select
                className="form-input w-full"
                value={paymentType}
                onChange={e => setPaymentType(e.target.value)}
              >
                <option value="CASH">Наличные</option>
                <option value="TRANSFER">Перевод</option>
                <option value="CREDIT">В долг</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Статус заказа</label>
              <select
                className="form-input w-full"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                {ORDER_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Статус оплаты</label>
              <select
                className="form-input w-full"
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value)}
              >
                {PAYMENT_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Примечание</label>
              <textarea
                className="form-input w-full"
                rows={2}
                placeholder="Дополнительная информация к заказу..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card p-6 border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Товары</h2>
            <button type="button" onClick={handleAddItem} className="btn-secondary text-sm py-1.5">
              <Plus size={16} className="mr-1" />
              Добавить товар
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-end p-3 border rounded-lg bg-gray-50/50">
                <div className="w-full md:flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Выберите товар *</label>
                  <select
                    className="form-input w-full bg-white"
                    value={item.productId}
                    onChange={e => handleItemChange(index, "productId", e.target.value)}
                    required
                  >
                    <option value="">-- Товар --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku}) - {formatCurrency(p.price)}</option>
                    ))}
                  </select>
                </div>
                <div className="w-24 shrink-0">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Цена</label>
                  <input
                    type="number"
                    className="form-input w-full bg-gray-100 text-gray-500"
                    value={item.price}
                    disabled
                  />
                </div>
                <div className="w-24 shrink-0">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Кол-во *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input w-full bg-white"
                    value={item.quantity}
                    onChange={e => handleItemChange(index, "quantity", Number(e.target.value))}
                    required
                  />
                </div>
                <div className="w-32 shrink-0">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Сумма</label>
                  <div className="form-input w-full bg-gray-100 text-gray-800 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="p-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg shrink-0 transition-colors mb-px"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-xl">
                Нет товаров.{" "}
                <button type="button" onClick={handleAddItem} className="text-blue-500 font-medium hover:underline">
                  Добавить
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end border-t pt-4">
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Итого к оплате</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(calculateTotal())}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Link href="/sales/orders" className="btn-secondary px-6">
            Отмена
          </Link>
          <button type="submit" disabled={loading} className="btn-primary px-6">
            {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
            {loading ? "Сохранение..." : "Сохранить изменения"}
          </button>
        </div>
      </form>
    </div>
  )
}
