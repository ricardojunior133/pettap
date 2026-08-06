import { PublicOrderTracking, TrackingNotFound } from "@/features/commerce/components/PublicOrderTracking";
import { PublicOrderTrackingService } from "@/features/commerce/services/public-order-tracking-service";

export default async function PublicTrackingPage({ params }: PageProps<"/track/[orderNumber]">) {
  const { orderNumber } = await params;
  const tracking = await new PublicOrderTrackingService().get(orderNumber);
  return tracking ? <PublicOrderTracking tracking={tracking} /> : <TrackingNotFound />;
}
