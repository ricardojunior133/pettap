export default function RescueFooter({ petName, lastUpdated }: { petName: string; lastUpdated?: string }) {
  return (
    <footer className="border-t border-neutral-100 bg-neutral-50 px-6 py-6 text-center sm:px-9">
      <p className="text-sm font-medium text-neutral-700">Protected by PetTap</p>
      <p className="mt-1 text-sm text-muted-foreground">This profile was opened with {petName}&apos;s NFC PetTag.</p>
      <p className="mt-2 text-xs font-medium text-neutral-400">{lastUpdated ? `Information last reviewed ${lastUpdated}.` : "Thank you for helping a pet get home safely."}</p>
    </footer>
  );
}
