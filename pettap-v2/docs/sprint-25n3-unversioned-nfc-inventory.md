# Sprint 25N.3 — unversioned NFC domain inventory

## Snapshot

- Source workspace (read-only): `C:\Users\ricar\pettap\pettap-v2`
- Git status at capture: all candidate feature directories and their related tests
  were untracked; `app/pet/[tagId]/page.tsx` was modified.
- Candidate source count: **61 TypeScript/TSX files** across the domain groups
  below, plus five directly related untracked test files.
- No `.env` file was read or copied. No source file was modified, moved, or
  deleted.

The source paths, byte sizes, last-write dates, SHA-256 values, imports, and
exports were captured before copying. The table records the complete candidate
set by module; only files selected for a possible copy have an individual
provenance entry in the companion provenance document.

| Module | Files | Candidate role | Internal dependencies | External dependencies | Classification |
| --- | ---: | --- | --- | --- | --- |
| `features/tags` | 6 | tag type, activation schema, repository, service, action and form | pets access/service, database, action state | Drizzle, Zod, Next, React | C / D |
| `features/public-tags` | 4 | public DTO, resolver repository/service, rate limiter | medical crypto, photo storage, schema, rate limiter | Drizzle | A only for rate helper; C otherwise |
| `features/lost-mode` | 7 | lost report type/schema/repository/service/action/forms | pets access, absent `lostReports` mapping, action state | Drizzle, Zod, Next, React | C |
| `features/pets` | 15 | private pets and public-preference support | absent/partial photos, contacts, audit, schema mappings | Drizzle, Zod, Next, React | C |
| `features/photos` | 7 | private photo storage/signing | pet access, Supabase server client | Sharp, Supabase, Next, React | C |
| `features/medical` | 7 | encrypted medical data | pet access, missing encryption/key configuration | Node crypto, Drizzle, Zod, Next, React | D for public use |
| `features/emergency-contacts` | 8 | private contacts | pet access and schema mapping | Drizzle, Zod, Next, React | C |
| `app/pet/[tagId]` | 4 | public route and loading/error/not-found UI | public resolver, rescue component | Next, Lucide | C |
| `lib/security` | 3 | action state, rate limit, same-origin | Next headers | Next | already versioned / no copy |

## Candidate files directly reviewed

| Source path | SHA-256 | Classification | Reason |
| --- | --- | --- | --- |
| `features/tags/types/tag.ts` | `6ED5AE0DBA4A44BA1C002FC60394D82017D3A19E7896E429223E44E4E2AD8A44` | C | mixes public tag data with internal UUID fields. |
| `features/tags/schemas/tag.ts` | `F62EAAAE4FAAF88DB61FC0EA00F551258A3569829E3B1872B6EE3114FAF4A4AF` | D | activation input accepts an internal pet UUID. |
| `features/tags/repositories/tag-repository.ts` | `B5314BB11439952745C3E02539443D21E228086CEEAEAFFC27B1635F13E8B284` | C | owner reads are useful, but mutation combines physical activation and association without token safeguards. |
| `features/tags/services/tag-service.ts` | `316E3B6FB3D8BF60F26F8D7156A0AA97ED362379CD0A60E4E03B6305F10D78A2` | D | takes physical code and a browser pet UUID; no proven token lifecycle. |
| `features/tags/actions/tag-actions.ts` | `C2BBC0BAAF69D39427E5C27693A95D17FB11DAF8C453766DCE1570830918B575` | D | exposes the unsafe activation boundary and legacy routes. |
| `features/public-tags/types.ts` | `188795F0E811F8A2B45AC8221CED59CAF94ECD9417AB192287ED12388D7E264E` | C | public model requires privacy-aware resolver implementation not yet reconciled. |
| `features/public-tags/repositories/public-tag-repository.ts` | `2245EF94A38D432D4C69BDDEA6F4687A04E3D90243DFEE8FDA8595841CB2B4FD` | C | depends on unversioned photos, contacts, medical, preferences and audit mappings. |
| `features/public-tags/services/public-tag-service.ts` | `9218E3603F2AAB0E1CAE5D50113C867AC0CF768DF17DFF151963297F171B711A` | C | contains useful privacy intent but cannot be executed safely without reconciled dependencies. |
| `features/public-tags/services/public-tag-rate-limit.ts` | `86E615134A2497C4B3A3EA7CDE54A44F9B594032F4CC851CF9179A10C35DFE50` | A | pure wrapper around the already versioned rate limiter; copied with formatting-only change. |
| `features/lost-mode/repositories/lost-report-repository.ts` | `D8BE2B72CD20C979F6CA960E15D9D1A38CD7B1B84732E01E8D6E4E51AAD923CC` | C | has owner checks but relies on an absent mapping and does not prove tag-state linkage. |
| `features/lost-mode/services/lost-report-service.ts` | `D58885F2E467D5365F9A62EC888E72A8A138B22CD34D059F6F5E6F30BF8CABC6` | C | private lost-report wrapper only; no proven tag lifecycle transaction. |
| `app/pet/[tagId]/page.tsx` | `4380CBC6FC1FDE31A52CB7DD9D49360F0777EDA4B3A94DA15013302077B187EA` | C | modified, unversioned route requiring absent public UI and resolver modules. |

## Explicitly absent candidates

No candidate implementation of token hashing, activation-cookie/session handling,
token expiry, token consumption, fulfilment/order binding, or a shared
transaction helper was found in the scanned NFC/Pets paths. These are blockers,
not inferred requirements.

Related untracked tests found: `lost-mode.test.ts`, `pet-public-preferences.test.ts`,
`pets.test.ts`, `photos.test.ts`, and `public-tag-resolver.test.ts`. They were
reviewed as intent evidence only and were not copied because their dependencies
are also unversioned.
