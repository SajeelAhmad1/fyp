"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) throw new Error("Failed to fetch order details");

        const data = await response.json();
        setOrder(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
      {loading && <p>Loading order...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      {order && (
        <>
          <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>Order ID: {order.id}</h2>
          <p>User: {order.user?.email || "Guest"}</p>
          <p>Total Price: £{order.totalPrice}</p>
          <p>Status: {order.status}</p>
          <p>Payment: {order.payment?.status || "Pending"}</p>

          <h3 style={{ marginTop: "20px", fontWeight: "bold" }}>Items</h3>
          <ul style={{ paddingLeft: "20px" }}>
            {order.items.map((item:any) => (
              <li key={item.id}>
                {item.product.name} - {item.quantity} pcs (£{item.price})
              </li>
            ))}
          </ul>

          <button style={{ marginTop: "20px", padding: "10px 15px", border: "none", backgroundColor: "blue", color: "white", cursor: "pointer", borderRadius: "4px" }}>
            Mark as Shipped
          </button>
        </>
      )}
    </div>
  );
}