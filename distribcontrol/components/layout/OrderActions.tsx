"use client";

const statuses = [
  { label: "Новый", value: "NEW" },
  { label: "Подтверждён", value: "CONFIRMED" },
  { label: "Отгружен", value: "SHIPPED" },
  { label: "В пути", value: "IN_TRANSIT" },
  { label: "Доставлен", value: "DELIVERED" },
  { label: "Отменён", value: "CANCELLED" },
];

export default function OrderActions({ orderId }: { orderId: string }) {
  const changeStatus = async (status: string) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    location.reload();
  };

  return (
    <div className="relative group">
      <button className="px-2">⋯</button>

      <div className="hidden group-hover:block absolute right-0 bg-white shadow rounded w-40">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => changeStatus(s.value)}
            className="block w-full text-left px-3 py-2 hover:bg-gray-100"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}