export type LostModeOwnerView = {
  statusMessage: string;
  primaryAction: "Report as missing" | "Mark as safe";
  confirmation: string;
  privacyMessage: string;
  gpsMessage: string;
  formFields: readonly ("petId" | "details")[];
};

/** Keeps browser payloads minimal; ownership and state are always resolved on the server. */
export function presentLostModeOwner(enabled: boolean): LostModeOwnerView {
  return enabled ? {
    statusMessage: "This pet’s public profile is currently in Lost Mode.",
    primaryAction: "Mark as safe",
    confirmation: "Confirm that your pet has been recovered. The tag will return to the normal public profile.",
    privacyMessage: "Your privacy preferences still control what is shown publicly.",
    gpsMessage: "Lost Mode does not provide GPS location.",
    formFields: ["petId"],
  } : {
    statusMessage: "This pet is not currently marked as missing.",
    primaryAction: "Report as missing",
    confirmation: "The public profile will change immediately. This note remains private.",
    privacyMessage: "Your privacy preferences still control what is shown publicly.",
    gpsMessage: "Lost Mode does not provide GPS location.",
    formFields: ["petId", "details"],
  };
}
