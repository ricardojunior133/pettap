# Public Profile Privacy

Public lookup must use `PublicPetProfile`, never `Pet`, `Owner` or an unfiltered database record. Owner email, private phone numbers, microchip numbers, audit events and account preferences are private. Contact actions must be mediated by the backend, rate-limited and logged. Medical information is opt-in and should be limited to emergency-safe alerts selected by the owner.
