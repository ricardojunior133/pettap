export type VaccinationInput = {
  name: string;
  administeredAt: string;
  expiresAt: string | null;
};

export type Vaccination = VaccinationInput & {
  id: string;
  petId: string;
};
