export type ActivationMethod = "nfc" | "manual-code";
export type ActivationStatus = "welcome" | "method" | "reading" | "assigning" | "confirmation" | "success";
export type { TagLifecycleStatus } from "@/types/tag";
import type { TagLifecycleStatus } from "@/types/tag";

export interface TagInformation {
  id: string;
  activationCode: string;
  lifecycleStatus: TagLifecycleStatus;
}

export interface ActivationPet {
  id: string;
  name: string;
  breed: string;
  age: string;
  photo: string;
  publicProfileHref?: string;
}

export interface ActivationResult {
  tagId: string;
  petName: string;
  protectionStatus: string;
  activationDate: string;
}

export interface ActivationSession {
  status: ActivationStatus;
  method?: ActivationMethod;
  tag?: TagInformation;
  petId?: string;
}

export interface ActivationContent {
  welcome: { title: string; description: string; action: string };
  methods: { title: string; description: string; nfc: { title: string; detail: string; recommendation: string }; manual: { title: string; detail: string; placeholder: string; action: string; demoAction: string } };
  nfc: { title: string; waiting: string; detected: string; detail: string; action: string };
  pets: { title: string; description: string; createNew: string; continue: string };
  confirmation: { title: string; description: string; action: string; labels: { tagId: string; petName: string; protection: string; activationDate: string } };
  success: { title: string; description: string; setup: string; workspace: string; publicProfile: string; dashboard: string };
}

export interface ActivationData {
  tag: TagInformation;
  pets: ActivationPet[];
  content: ActivationContent;
}
