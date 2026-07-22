# PetTap Brand

## Summary

PetTap is a premium pet accessory brand built around reassurance, simplicity, and emotional connection. Its brand language should make advanced technology feel quiet, useful, and human.

## Contents

1. [Name](#name)
2. [Logo](#logo)
3. [Personality](#personality)
4. [Tone of Voice](#tone-of-voice)
5. [Visual Identity](#visual-identity)
6. [Colour System](#colour-system)
7. [Typography](#typography)
8. [Interface Style](#interface-style)
9. [Communication Rules](#communication-rules)
10. [NFC-Only Rule](#nfc-only-rule)
11. [Notes](#notes)
12. [Future Roadmap](#future-roadmap)

## Name

**PetTap** combines the emotional world of pets with the simple physical action that powers the product: a tap.

Use the name as `PetTap`—capital P, capital T—across product copy, UI, and documentation.

## Logo

The current product mark uses a shield-check symbol alongside the PetTap wordmark in navigation contexts. It communicates protection and recovery without becoming visually heavy.

Treat the mark as a quiet signal of trust. Do not stretch, rotate, outline, add visual effects to, or recreate it with unrelated iconography.

## Personality

PetTap is:

- Warm, but never childish.
- Premium, but never distant.
- Calm, but never passive.
- Technically capable, but never jargon-heavy.
- Protective, but never alarmist.

The product should feel closer to a beautifully made everyday object than to a gadget or an emergency-services interface.

## Tone of Voice

### Core tone

Clear, reassuring, concise, and human. Start with the pet and the owner’s peace of mind; explain technology only when it adds meaning.

### Good examples

- “Because every pet deserves a safe way home.”
- “No app. No QR code. Just tap.”
- “A familiar face, always protected.”
- “Contact the owner first.”

### Avoid

- Technical jargon where simple language works.
- Fear-based claims or dramatic emergency language.
- Generic e-commerce urgency.
- Long feature lists without customer meaning.
- Claims about functionality not present in the product.

## Visual Identity

The visual language is minimal, spacious, and product-led. It should feel consistent across the Landing, Studio, Rescue experience, Dashboard, and Pet Workspace.

Key characteristics:

- Generous white or soft-neutral space.
- Strong, near-black headings.
- Soft borders and large rounded corners.
- Subtle layered shadows that suggest quality rather than spectacle.
- Restrained blue accents for interaction and reassurance.
- Green for safe/protected states and rose/red for Lost Mode or urgent states.
- Gentle animation that supports hierarchy and feedback.

## Colour System

The current global tokens are the working reference:

| Role | Current value | Use |
| --- | --- | --- |
| Background | `#FFFFFF` | Primary canvas |
| Foreground / Primary | `#111111` | Headings, primary actions, high-contrast UI |
| Muted text | `#6B7280` | Supporting copy |
| Border | `#E5E7EB` | Soft separation |
| Accent | `#2563EB` | Interactive and reassurance cues |
| Success | `#22C55E` | Safe, active, protected states |

Use rose/red tones selectively for Lost Mode. The intent is respectful urgency, not alarm. Avoid neon colours, metallic gradients, large glows, or LED-like effects.

## Typography

The application uses **Inter** through `next/font` as its system typeface.

Typography should be:

- Confident and compact in headlines.
- Highly legible for public rescue content.
- Clear at small supporting sizes.
- Built with strong hierarchy rather than many weights or decorative faces.

Use tight tracking for large display headings with care; avoid compressed or stylised typography that reduces accessibility.

## Interface Style

### Shape and space

Use large, friendly radii—current shared UI cards use a `24px` radius—and meaningful spacing between choices. Avoid dense tables and cramped control panels.

### Depth

Use soft, low-contrast shadows. Elevation should guide attention, not make every element float.

### Motion

Motion should be brief and purposeful: a small fade, subtle lift, or understated scale change. Respect `prefers-reduced-motion` where motion is present. Never use animated effects that distract from a rescue action or make the product feel toy-like.

### Icons

Use the existing Lucide icon language. Icons should support labels, not replace essential meaning.

## Communication Rules

- Speak to owners as people who care deeply about their pets.
- Speak to finders with calm, direct instructions.
- Make the next important action unmistakable.
- Prefer “pet” and the pet’s name over abstract technical language.
- Keep marketing copy emotionally grounded and concise.
- Maintain accessible contrast, focus indicators, and readable labels.

## NFC-Only Rule

**PetTap is NFC only. Never use, show, suggest, generate, or add a QR code anywhere in the PetTap product, documentation, marketing, mockups, or future implementation.**

The intended interaction is a compatible smartphone tapping the physical PetTap tag. Messaging may explain the benefit as “No app. No QR code. Just tap.” when appropriate.

## Notes

- The product is designed around premium 3D-printed pet tags, with finishes that represent real available print colours rather than fictional metal or carbon materials.
- Brand consistency is a product requirement, not a final styling pass.
- Existing global design tokens in `app/globals.css` are the implementation reference until a dedicated token system is introduced.

## Future Roadmap

Future brand work may define a formal asset library, complete logo usage rules, photography direction, print-finish catalogues, component tokens, and content guidelines for owner communication. Do not infer that these assets or systems already exist.
