# NFC physical provisioning contract

The system writes only a deterministic NDEF URI: `https://<origin>/nfc/v1/t/<publicCode>`. It contains no PII, credential, challenge, account identifier, or final public-profile URL.

Provisioning is internal and short-lived: `pending → issued → write_confirmed → activated`, with `expired`, `cancelled`, and `failed` terminal states. A plaintext confirmation challenge is shown only to the authorised `tags.manage` actor and its SHA-256 hash is persisted. Read-back must exactly match the expected URI before confirmation.

The current implementation intentionally provides no Web NFC implementation: chip model, capacity, lock behaviour and browser support have not been evidenced. `NfcWriterAdapter` isolates future approved hardware. `ManualNfcWriterAdapter` supports an operator-confirmed external writer and scanner read-back; `UnsupportedNfcWriterAdapter` fails closed.

Customer activation is authenticated and reuses `NfcTagActivationService.activateTag`; it remains owner-scoped and validates the existing activation credential. The credential is never written to an NFC tag or audit log. A future endpoint must apply the existing rate-limit and same-origin helpers before exposing any provisioning action.
