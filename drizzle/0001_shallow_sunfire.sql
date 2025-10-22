CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_event_type_idx" ON "audit_logs" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs" USING btree ("timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_timestamp_idx" ON "audit_logs" USING btree ("user_id","timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "budgets_user_id_idx" ON "budgets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "budgets_user_id_category_idx" ON "budgets" USING btree ("user_id","category_id");--> statement-breakpoint
CREATE INDEX "budgets_user_id_period_idx" ON "budgets" USING btree ("user_id","period");--> statement-breakpoint
CREATE INDEX "categories_user_id_idx" ON "categories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "categories_user_id_type_idx" ON "categories" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "transactions_user_id_idx" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_user_id_date_idx" ON "transactions" USING btree ("user_id","date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "transactions_user_id_category_idx" ON "transactions" USING btree ("user_id","category_id");--> statement-breakpoint
CREATE INDEX "transactions_user_id_account_idx" ON "transactions" USING btree ("user_id","account_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");