export type CustomerOrderListItemViewModel = {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  fulfilmentStatus: string;
  paymentStatus: string;
  totalMinor: number;
  currency: string;
  itemCount: number;
  trackingSummary: string | null;
};

export type CustomerOrderAddressSnapshotViewModel = {
  fullName: string;
  company: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  county: string | null;
  postcode: string;
  countryCode: string;
};

export type CustomerOrderItemViewModel = {
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
  personalisation: Record<string, string>;
};

export type CustomerOrderDetailViewModel = {
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  customerName: string;
  fulfilmentStatus: string;
  currency: string;
  subtotalMinor: number;
  discountTotalMinor: number;
  shippingTotalMinor: number;
  taxTotalMinor: number;
  totalMinor: number;
  shippingAddressSnapshot: CustomerOrderAddressSnapshotViewModel | null;
  items: CustomerOrderItemViewModel[];
  tracking: { number: string; carrier: string | null; url: string | null; status: string } | null;
  timeline: Array<{ label: string; occurredAt: string }>;
};

export type CustomerOrderPageViewModel = {
  orders: CustomerOrderListItemViewModel[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
