# Row Level Security

Enable RLS on every user-data table. Accounts use `id = auth.uid()`. Account-owned rows use `account_id = auth.uid()`. Pet children authorize through an `exists` query against `pets.account_id = auth.uid()`. Public lookup must use a dedicated RPC or view that returns only enabled `PublicPetProfile` fields; never grant broad table select.
