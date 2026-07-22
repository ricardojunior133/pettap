export interface AccountPreferences {
  locale?: string;
  theme?: "light" | "dark" | "system";
}

export interface Account {
  id: string;
  ownerId: string;
  preferences?: AccountPreferences;
}
