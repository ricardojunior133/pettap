export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export interface LegalDocument {
  title: string;
  summary: string;
  updated: string;
  sections: LegalSection[];
}

export const LEGAL_DOCUMENTS = {
  privacy: {
    title: "Privacy policy",
    summary: "Information about personal data on the PetTap Coming Soon website.",
    updated: "Current website information",
    sections: [
      { title: "Coming Soon website", paragraphs: ["The current Coming Soon website does not collect waitlist email addresses while email capture is disabled."] },
      { title: "Future PetTag service", paragraphs: ["A PetTap profile may include pet and owner information that is selected for a public pet profile. Public profile information is separate from account access."] },
      { title: "Your choices", paragraphs: ["PetTap will provide clear controls for the information that is shown publicly and for support requests when the service is available."] },
    ],
  },
  terms: {
    title: "Terms & conditions",
    summary: "Information about the PetTap Coming Soon website and future product service.",
    updated: "Current website information",
    sections: [
      { title: "Current website", paragraphs: ["The Coming Soon website does not accept orders, payments or account registrations."] },
      { title: "Product and service", paragraphs: ["PetTap combines a physical NFC tag with a web-based pet profile experience. NFC compatibility can vary by device, case and settings."] },
      { title: "Future use", paragraphs: ["Pet owners will be responsible for keeping their contact and care information accurate and for attaching a PetTag securely."] },
    ],
  },
  shipping: {
    title: "Shipping",
    summary: "Shipping information will be shared when PetTap is available to order.",
    updated: "Current website information",
    sections: [
      { title: "Orders", paragraphs: ["The Coming Soon website does not currently accept orders."] },
      { title: "Delivery information", paragraphs: ["Delivery destinations, services, prices and tracking information will be shared when PetTap opens for orders."] },
    ],
  },
  returns: {
    title: "Returns",
    summary: "Returns information will be shared when PetTap is available to order.",
    updated: "Current website information",
    sections: [
      { title: "Orders", paragraphs: ["The Coming Soon website does not currently offer products for sale."] },
      { title: "Returns information", paragraphs: ["Returns information and support guidance will be shared when PetTap opens for orders."] },
    ],
  },
} satisfies Record<string, LegalDocument>;
