-- PetTap private pet-photo bucket and Storage account isolation.
-- This migration depends on public.current_account_id() from migration 0001.

-- Bucket -----------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-photos',
  'pet-photos',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
--> statement-breakpoint

-- Helper -----------------------------------------------------------------------
-- Objects use exactly: {accountId}/{petId}/{photoId}.webp. The helper verifies
-- both path segments against the authenticated account and its owned pet. It
-- accepts no account identifier as an authorization parameter.
CREATE OR REPLACE FUNCTION public.can_manage_pet_photo_path(object_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH path_parts AS (
    SELECT storage.foldername(object_name) AS folders
  )
  SELECT COALESCE(
    array_length(path_parts.folders, 1) = 2
    AND path_parts.folders[1] = (SELECT public.current_account_id())::text
    AND EXISTS (
      SELECT 1
      FROM public.pets AS p
      WHERE p.id::text = path_parts.folders[2]
        AND p.account_id = (SELECT public.current_account_id())
    ),
    false
  )
  FROM path_parts;
$$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.can_manage_pet_photo_path(text) FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.can_manage_pet_photo_path(text) TO authenticated;
--> statement-breakpoint

-- Storage grants ---------------------------------------------------------------
-- The `storage.objects` table is shared by every bucket, so this migration does
-- not revoke global grants that could change another bucket's contract. RLS has
-- no `anon` policy for this bucket, and the authenticated policies below restrict
-- access to the current account and pet. Object updates are intentionally absent:
-- replacements use a new immutable path and upsert is disabled.
GRANT SELECT, INSERT, DELETE ON TABLE storage.objects TO authenticated;
--> statement-breakpoint

-- Storage policies -------------------------------------------------------------
DROP POLICY IF EXISTS pet_photos_select_own_account ON storage.objects;
--> statement-breakpoint
CREATE POLICY pet_photos_select_own_account ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'pet-photos'
    AND public.can_manage_pet_photo_path(name)
  );
--> statement-breakpoint
DROP POLICY IF EXISTS pet_photos_insert_own_account ON storage.objects;
--> statement-breakpoint
CREATE POLICY pet_photos_insert_own_account ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'pet-photos'
    AND public.can_manage_pet_photo_path(name)
  );
--> statement-breakpoint
DROP POLICY IF EXISTS pet_photos_delete_own_account ON storage.objects;
--> statement-breakpoint
CREATE POLICY pet_photos_delete_own_account ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'pet-photos'
    AND public.can_manage_pet_photo_path(name)
  );
--> statement-breakpoint

-- Main-photo integrity ---------------------------------------------------------
-- This fails loudly if pre-existing data contains duplicate primary photos,
-- rather than silently choosing one owner-visible image over another.
CREATE UNIQUE INDEX pet_photos_one_primary_per_pet_idx
  ON public.pet_photos (pet_id)
  WHERE is_primary;
