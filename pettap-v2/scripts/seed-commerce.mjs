import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local", quiet: true });

if (process.env.PETTAP_COMMERCE_SEED !== "1" || process.env.PETTAP_COMMERCE_SEED_ENV !== "development") {
  throw new Error("Commerce seed is disabled. Set PETTAP_COMMERCE_SEED=1 and PETTAP_COMMERCE_SEED_ENV=development explicitly.");
}

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

const sql = postgres(process.env.DATABASE_URL, { ssl: "require", prepare: false });
const product = { name: "PetTap Personalised NFC Tag", slug: "pettap-personalised-nfc-tag", description: "Premium personalised NFC pet tag", type: "nfc_tag" };
const variants = [
  ["PTP-PET-MAT", "Petite Matte", "petite", "matte", 1999],
  ["PTP-CLA-MAT", "Classic Matte", "classic", "matte", 2499],
  ["PTP-EXP-MAT", "Explorer Matte", "explorer", "matte", 2999],
  ["PTP-PET-GLS", "Petite Gloss", "petite", "gloss", 1999],
  ["PTP-CLA-GLS", "Classic Gloss", "classic", "gloss", 2499],
  ["PTP-EXP-GLS", "Explorer Gloss", "explorer", "gloss", 2999],
];

try {
  const [savedProduct] = await sql`
    insert into public.products (name, slug, description, status, product_type, is_personalisable)
    values (${product.name}, ${product.slug}, ${product.description}, 'active', ${product.type}, true)
    on conflict (slug) do update set name = excluded.name, description = excluded.description, status = excluded.status, updated_at = now()
    returning id
  `;

  for (const [sku, name, size, finish, priceMinor] of variants) {
    const [variant] = await sql`
      insert into public.product_variants (product_id, sku, name, status, shape, size, material, finish, track_inventory)
      values (${savedProduct.id}, ${sku}, ${name}, 'active', 'personalised', ${size}, 'PETG', ${finish}, false)
      on conflict (sku) do update set name = excluded.name, status = excluded.status, size = excluded.size, finish = excluded.finish, updated_at = now()
      returning id
    `;
    const [existingPrice] = await sql`select id from public.product_prices where variant_id = ${variant.id} and currency = 'GBP' and status = 'active' order by created_at asc limit 1`;
    if (existingPrice) await sql`update public.product_prices set unit_amount_minor = ${priceMinor} where id = ${existingPrice.id}`;
    else await sql`insert into public.product_prices (variant_id, currency, unit_amount_minor, status) values (${variant.id}, 'GBP', ${priceMinor}, 'active')`;
  }
} finally {
  await sql.end({ timeout: 5 });
}

console.info("Development commerce seed completed.");
