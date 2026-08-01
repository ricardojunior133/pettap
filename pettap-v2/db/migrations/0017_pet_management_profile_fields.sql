-- Canonical profile attributes for an owner-managed pet.
-- Existing pets remain valid; all new fields are optional.
ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS breed text,
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS sex text,
  ADD COLUMN IF NOT EXISTS weight numeric(6,2),
  ADD COLUMN IF NOT EXISTS colour text;
--> statement-breakpoint
ALTER TABLE public.pets
  ADD CONSTRAINT pets_sex_check CHECK (sex IS NULL OR sex IN ('male', 'female', 'unknown')),
  ADD CONSTRAINT pets_weight_positive_check CHECK (weight IS NULL OR weight > 0);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS pets_account_created_idx ON public.pets (account_id, created_at DESC);
