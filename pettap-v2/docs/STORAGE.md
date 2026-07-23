# Storage

Create private buckets `pet-images`, `avatars` and `future-tag-assets`. Accept JPEG, PNG and WebP only, validate size server-side before signing uploads, and store object paths rather than public URLs. Generate signed URLs only after ownership authorization. Future image processing should run outside the request path.
