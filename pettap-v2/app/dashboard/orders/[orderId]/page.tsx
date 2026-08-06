import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CustomerOrderDetail } from "@/features/commerce/components/CustomerOrders";
import { CustomerOrderService } from "@/features/commerce/services/customer-order-service";

export const metadata: Metadata = { title: "Order details", robots: { index: false, follow: false } };

export default async function CustomerOrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await new CustomerOrderService().getById(orderId);
  if (!order) notFound();
  return <CustomerOrderDetail order={order} />;
}
