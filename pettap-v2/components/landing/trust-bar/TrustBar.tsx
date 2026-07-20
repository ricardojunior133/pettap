import Container from "@/components/layout/Container";

const items = [
  "No Subscription",
  "Works with iPhone",
  "Works with Android",
  "Secure NFC Technology",
];

export default function TrustBar() {
  return (
    <section className="border-y border-neutral-200 bg-neutral-50">
      <Container className="py-8">
        <div className="grid grid-cols-2 gap-6 text-center lg:grid-cols-4">
          {items.map((item) => (
            <div key={item}>
              <p className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                {item}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}