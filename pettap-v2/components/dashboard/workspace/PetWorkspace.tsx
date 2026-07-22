import type { PetWorkspace as PetWorkspaceData } from "@/lib/dashboard";
import { mockLostMode } from "@/lib/lost-mode";

import WorkspaceInteractive from "./WorkspaceInteractive";

export default function PetWorkspace({ pet }: { pet: PetWorkspaceData }) {
  return <WorkspaceInteractive pet={pet} lostModeData={{ ...mockLostMode, petId: pet.id, petName: pet.name, banner: { ...mockLostMode.banner, description: `${pet.name} is currently marked as missing.` } }} />;
}
