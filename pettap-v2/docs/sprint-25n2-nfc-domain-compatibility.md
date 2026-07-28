# Sprint 25N.2 — NFC domain compatibility matrix

## Source audit

The only candidate implementations were found under the original workspace as
untracked files. `git log --all` shows no historical commit for the candidate
paths; the last relevant committed baseline is `102e83d` (`release: Event Demo
and premium Coming Soon`), which does not contain them. Untracked source is not
an auditable canonical source for a security-sensitive customer flow and is not
imported into this worktree.

| Candidate | Source | Responsibility | Dependencies | Compatibility | Decision |
| --- | --- | --- | --- | --- | --- |
| `features/tags/repositories/tag-repository.ts` | Original, untracked | Lists tags and activates `unassigned` tags | `nfc_tags`, `tag_activations` | Needs a physical code and internal IDs; no public customer assignment operation | Do not import |
| `features/tags/services/tag-service.ts` | Original, untracked | Activation orchestration | Absent `pet-access`, `pet-service` | Accepts physical code and pet UUID; no token hash, expiry, replay or rate-limit proof | Block activation |
| `features/tags/actions/tag-actions.ts` | Original, untracked | Dashboard activation action | Absent action-state/pet modules, legacy dashboard routes | Browser accepts pet UUID and redirects to legacy routes | Do not import |
| `features/public-tags/*` and `app/pet/[tagId]` | Original, untracked/modified | Public resolver and profile | Absent medical crypto, photo storage, preferences, contacts and page component | Semantic use of `public_id` is sound, but required security dependencies are absent | Do not import |
| `features/lost-mode/*` | Original, untracked | Lost report lifecycle | Absent `lost_reports` Drizzle mapping, pet access service, UI modules | Owner-scoped by pet UUID but does not prove tag state linkage | Do not import |
| Admin tag modules | Original, untracked | Administrative operations | Admin/RBAC domain | Explicitly out of scope | Excluded |

## Persisted status evidence

Migration `0000_chilly_nebula.sql` defines `tag_status` as `unassigned`,
`active`, `suspended`, `lost`, and `retired`.

The candidate activation repository conditionally performs only:

```
unassigned → active
```

inside a transaction, then inserts `tag_activations`. It does not provide
customer-safe reassignment, unassignment, suspension, retirement, or Lost Mode
transitions. The candidate PublicTagService treats `active` and `lost` as
publicly resolvable, `suspended` as a support state, and `unassigned`/`retired`
as unknown. No candidate proves how a lost report changes a tag to `lost`.

## Activation assessment

The candidate activation flow treats `nfc_tags.public_id` as an activation
code. It stores no token hash, expiry, consumption state, order linkage, or
rate-limit evidence. It receives a browser `petId` UUID. This does not meet the
Sprint 25N.2 requirements for a recovered physical activation service and must
remain blocked.

## Public resolver and Lost Mode assessment

The candidate resolver looks up by public tag ID and conditionally exposes data
using `public_profile_enabled` and preferences. However, it requires unversioned
medical encryption, private Storage signing, pet photos, contacts, preferences,
and public UI modules. Lost Mode depends on an absent `lost_reports` mapping and
does not provide a proven tag-state transaction. Neither module is imported.

## Decision

No canonical, versioned service can be reconciled without inventing security
rules or importing a large unreviewed dependency graph. The next safe action is
to first version/audit the NFC activation, public resolver, and Lost Mode modules
as complete independently reviewable foundations, including their direct schema
mappings and tests. Only then should customer mutations be exposed.
