-- A Stripe payment intent/session must not become more than one payment row.
CREATE UNIQUE INDEX "payments_provider_payment_id_unique" ON "payments" USING btree ("provider", "provider_payment_id") WHERE "provider_payment_id" IS NOT NULL;
