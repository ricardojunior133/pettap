export interface Owner {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface OwnerContact {
  id?: string;
  name: string;
  phone: string;
  availability?: string;
  relationship?: string;
}
