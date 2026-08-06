"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { Divider } from "@/components/ui/Divider";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { premiumEase } from "@/lib/theme/motion";
import { spacing } from "@/lib/theme/spacing";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqItems: readonly FAQItem[] = [
  { id: "what-is-pettap", question: "What is PetTap?", answer: "PetTap is a personalised pet tag with built-in NFC. When someone finds your pet, they can tap the tag with a compatible smartphone to open the secure profile you have chosen to share." },
  { id: "gps", question: "Is PetTap a GPS tracker?", answer: "No. PetTap does not track your pet’s live location. It uses NFC to help someone who finds your pet access the information you choose to share and contact you." },
  { id: "battery", question: "Does PetTap need a battery?", answer: "No. The NFC chip inside the tag is passive, so the tag does not need charging or battery replacements." },
  { id: "app", question: "Does the finder need an app?", answer: "No. On compatible modern smartphones, the finder can tap the tag and open the pet profile in their browser without creating an account or downloading an app." },
  { id: "subscription", question: "Does PetTap require a subscription?", answer: "No. PetTap is designed without a monthly subscription. You purchase the tag and manage your pet’s profile through your PetTap account." },
  { id: "compatibility", question: "Which phones are compatible?", answer: "PetTap is designed to work with modern NFC-enabled iPhone and Android devices. NFC behaviour can vary by phone model, settings and operating system." },
  { id: "updates", question: "Can I update my pet’s information?", answer: "Yes. You can update the information connected to the tag through your PetTap account, so your physical tag does not need to be replaced whenever your details change." },
  { id: "privacy", question: "What information can someone see?", answer: "Only the information you choose to make public. Privacy controls allow you to decide whether to display details such as your pet’s name, photo, medical information and approved contact details." },
  { id: "found", question: "What happens when someone finds my pet?", answer: "They tap the PetTap with a compatible smartphone, view the secure public profile and use the contact options you have approved to reach you." },
  { id: "damaged", question: "What happens if the tag is damaged or lost?", answer: "A damaged or missing tag cannot be scanned. PetTap should be checked regularly as part of your pet’s everyday collar routine and replaced if it becomes damaged." },
] as const;

export default function PremiumFAQ() {
  const [openId, setOpenId] = useState<string | null>(faqItems[0].id);
  const reducedMotion = useReducedMotion();

  return (
    <section id="faq" aria-labelledby="faq-title" className={`relative z-10 overflow-hidden bg-white px-6 ${spacing.sectionY}`}>
      <div aria-hidden="true" className="pointer-events-none absolute left-[-14rem] top-1/3 size-[30rem] rounded-full bg-sky-100/35 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.08fr)] lg:gap-20 lg:px-8">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 16, filter: "blur(5px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: reducedMotion ? 0 : 0.6, ease: premiumEase }}
          className="max-w-xl lg:sticky lg:top-12 lg:self-start"
        >
          <SectionHeader eyebrow="Questions, answered" id="faq-title" title="Everything you need to know" description="Simple answers about NFC, privacy and how PetTap helps someone contact you when your pet is found." />
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.08, ease: premiumEase }}
          className="overflow-hidden rounded-[2rem] border border-black/[0.07] bg-[#fcfcfb] px-5 shadow-[0_16px_44px_rgba(17,17,17,0.045)] sm:px-7"
        >
          {faqItems.map(({ id, question, answer }) => {
            const isOpen = openId === id;
            const panelId = `faq-panel-${id}`;
            const buttonId = `faq-button-${id}`;

            return (
              <div key={id} className="last:[&_.pettap-divider]:hidden">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenId(isOpen ? null : id)}
                    className="flex min-h-16 w-full items-center justify-between gap-5 py-5 text-left text-[0.95rem] font-semibold tracking-[-0.02em] text-neutral-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15"
                  >
                    {question}
                    <ChevronDown className={`size-5 shrink-0 text-neutral-500 transition-transform duration-300 motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: reducedMotion ? 0 : 0.24, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-6 text-sm leading-6 text-neutral-600">{answer}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                <Divider className="pettap-divider" />
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
