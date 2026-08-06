import { notFound } from "next/navigation";
import { CustomerOrderDetail } from "@/features/commerce/components/CustomerOrders";
import { CustomerOrderService } from "@/features/commerce/services/customer-order-service";
export default async function AccountOrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) { const order = await new CustomerOrderService().getById((await params).orderId); if (!order) notFound(); return <CustomerOrderDetail order={order} basePath="/account/orders" />; }
