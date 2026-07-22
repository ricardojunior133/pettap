export type DashboardPetTagStatus = "active" | "inactive";

export interface DashboardOwner {
  name: string;
  greeting: string;
  initials: string;
}

export interface DashboardStat {
  label: string;
  value: string;
  detail: string;
  icon: "pets" | "tag" | "shield";
}

export interface DashboardPet {
  id: string;
  name: string;
  breed: string;
  age: string;
  photo: string;
  tagStatus: DashboardPetTagStatus;
  lostMode: boolean;
}

export interface DashboardQuickAction {
  title: string;
  description: string;
  icon: "tag" | "plus" | "user" | "alert";
  href?: string;
}

export interface DashboardActivity {
  title: string;
  detail: string;
  timestamp: string;
  icon: "profile" | "tag" | "contact" | "shield";
}

export interface DashboardNavigationItem {
  label: string;
  active?: boolean;
}

export interface DashboardData {
  owner: DashboardOwner;
  stats: DashboardStat[];
  pets: DashboardPet[];
  quickActions: DashboardQuickAction[];
  activities: DashboardActivity[];
  navigation: DashboardNavigationItem[];
}

export interface WorkspaceTab { label: string; active?: boolean; }
export interface WorkspaceAction { label: string; description: string; icon: "edit" | "alert" | "profile" | "share"; href?: string; }
export interface WorkspaceActivity { title: string; detail: string; timestamp: string; icon: "pet" | "photo" | "contact" | "shield"; }

export interface PetWorkspace {
  id: string; name: string; breed: string; age: string; photo: string; sex: string; colour: string; weight: string; birthDate: string;
  microchip: "verified" | "not-provided"; tagId: string; tagStatus: DashboardPetTagStatus; activationDate: string; tagShape?: string; tagSize?: string; tagColour?: string; tagMaterial?: string; nfcStatus?: "ready" | "inactive"; protectionStatus: string; lastUpdated: string; lostMode: boolean;
  tabs: WorkspaceTab[]; actions: WorkspaceAction[]; activity: WorkspaceActivity[];
}
