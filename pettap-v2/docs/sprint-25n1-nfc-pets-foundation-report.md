# Sprint 25N.1 — NFC and pets foundation report

## Result

**READY TO RESUME SPRINT 25N** for private, owner-scoped tag listing and detail
work. Assignment, physical activation, public-profile linking, and Lost Mode
remain intentionally unavailable pending a focused import of their canonical
services.

1. **Tables existed in migrations?** Yes: `pets`, `nfc_tags`, and
   `tag_activations` originate in 0000; current mapping also reflects 0005
   suspension fields and 0007 `pets.archived_at`.
2. **Physical table created?** No.
3. **Column added or altered?** No.
4. **Migration created?** No.
5. **Migration executed?** No.
6. **Do Drizzle mappings match migrations conceptually?** Yes; see the
   reconciliation matrix.
7. **Tables added to TypeScript?** `pets`, `nfcTags`, and `tagActivations`.
8. **Confirmed public tag identifier?** `nfc_tags.public_id`.
9. **Do pets have a safe public identifier?** Yes: `pets.public_id`.
10. **Repositories created?** Owner-scoped pet, tag, and activation foundation repositories.
11. **Services created?** Owner-scoped customer pet and tag foundation services.
12. **Was PublicTagService recovered?** No; it remains outside this baseline.
13. **Was Lost Mode recovered?** No; it remains outside this baseline.
14. **Is it safe to resume `/account/tags`?** Yes for read-only list/detail.
15. **Can tag/pet assignment be implemented safely already?** Not yet: the
    canonical physical activation/assignment service has not been imported.
16. **Any internal ID in DTOs?** No.
17. **Any token or hash in DTOs?** No.
18. **Was Checkout, Stripe, Admin, or Event Demo changed?** No.
19. **Was there a remote write, deploy, or push?** No.
20. **Next step:** resume Sprint 25N with private list/detail pages, then review
    canonical mutable NFC and public resolver services in a separately approved sprint.
