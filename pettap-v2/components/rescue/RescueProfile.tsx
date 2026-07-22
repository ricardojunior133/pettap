import type { RescueProfile as RescueProfileData } from "@/src/lib/domain/rescue";
import EmergencyHelpCard from "@/components/lost-mode/EmergencyHelpCard";
import { mockLostMode } from "@/lib/lost-mode";

import EmergencyContacts from "./EmergencyContacts";
import LostModeActions from "./LostModeActions";
import LostModeBanner from "./LostModeBanner";
import LostModeDetails from "./LostModeDetails";
import MedicalInformation from "./MedicalInformation";
import PetDetails from "./PetDetails";
import RescueActions from "./RescueActions";
import RescueFooter from "./RescueFooter";
import RescueHero from "./RescueHero";
import TagDetails from "./TagDetails";

export default function RescueProfile({ profile }: { profile: RescueProfileData }) {
  const isLost = profile.lostMode;

  return (
    <>
      {isLost && <LostModeBanner petName={profile.pet.name} />}
    <main className="min-h-screen bg-[#F6F7F8] py-4 sm:py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <article className="overflow-hidden rounded-[30px] bg-white shadow-[0_24px_70px_rgba(0,0,0,.10)] sm:rounded-[40px]">
          <RescueHero profile={profile} />
          <div className="px-5 pb-8 pt-6 sm:px-9 sm:pb-10 sm:pt-8">
            {isLost ? <><LostModeActions petName={profile.pet.name} ownerName={profile.owner.name} ownerPhone={profile.owner.phone} /><EmergencyHelpCard items={mockLostMode.helpItems} /><LostModeDetails profile={profile} /></> : <RescueActions petName={profile.pet.name} ownerName={profile.owner.name} ownerPhone={profile.owner.phone} availability={profile.owner.availability} />}
            <PetDetails pet={profile.pet} />
            <MedicalInformation medicalInformation={profile.medicalInformation} />
            <EmergencyContacts owner={profile.owner} contacts={profile.emergencyContacts} />
            <TagDetails tag={profile.tag} />
          </div>
          <RescueFooter petName={profile.pet.name} lastUpdated={profile.lastUpdated} />
        </article>
      </div>
    </main>
    </>
  );
}
