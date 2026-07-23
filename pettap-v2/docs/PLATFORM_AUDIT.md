# Platform Audit

| Area | Classification | Decision |
| --- | --- | --- |
| Coming Soon | Reusable | Public launch remains unchanged. |
| Studio | Reusable, private | Keep behind route policy until commerce launch. |
| Dashboard and workspace | Requires backend | Reuse shell and presentation components; remove mock-backed assumptions from future production reads. |
| Activation | Requires refactor | Existing flow is useful UX research, but real validation must use `TagService`. |
| Public pet profile | Blocked pending backend | Keep route protected; future profile maps only `PublicPetProfile`. |
| Mock data | Unsafe for production | Retain only as isolated development fixtures; never select it in production services. |
| Shared UI | Reusable | Consolidate around existing Button, Input, Card, Badge and Dialog primitives. |
