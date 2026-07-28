# Sprint 25N.2 — NFC domain services report

## Status

**BLOCKED** — a canonical, versioned Tag ↔ Pet association service cannot be
recovered safely from the available sources.

1. **Where were services found?** Only as untracked candidate files in the
   original workspace.
2. **Which commits/baselines were sources?** None for the candidate files;
   Git history only identifies `102e83d` as the prior release baseline without
   these modules.
3. **Was Tag ↔ Pet association recovered?** No.
4. **Is pet reassignment supported?** No.
5. **Is unassignment supported?** No.
6. **Was physical activation recovered?** No.
7. **How is a token protected?** No token flow is imported; the candidate lacks
   sufficient token/hash/expiry/replay evidence.
8. **Is replay blocked?** Not proven, so activation remains blocked.
9. **Was PublicTagService recovered?** No.
10. **Does `/pet/[tagId]` remain compatible?** It is absent from this baseline;
    no public route was added or changed.
11. **Was Lost Mode recovered?** No.
12. **Can the portal change Lost Mode?** No.
13. **Are mutations owner-scoped?** No mutations were added.
14. **Does the browser accept a UUID?** No new browser input exists.
15. **Does a token or hash reach UI?** No.
16. **Is concurrency protected?** No mutation is exposed; the candidate's
    limited transaction was not imported.
17. **Was any rule invented?** No.
18. **Migration created/executed?** No.
19. **Physical schema changed?** No.
20. **Remote write, deploy, or push?** No.
21. **Is it safe to complete `/account/tags`?** Not with mutations or public
    profile linkage. Read-only list/detail remains possible from Sprint 25N.1.
22. **Blocked actions?** Activation, assignment, reassignment, unassignment,
    public resolver, and Lost Mode.
23. **Next step:** create an approved canonical-source import sprint for each
    missing domain module, then validate all dependencies and tests before UI.
