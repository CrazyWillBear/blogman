CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
-- array_to_string is STABLE, but generated columns require IMMUTABLE expressions.
-- Safe to wrap here: text[] -> text conversion does not depend on session state.
CREATE FUNCTION immutable_array_to_string(text[], text) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE
RETURN array_to_string($1, $2);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "search" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', "posts"."title"), 'A') || setweight(to_tsvector('english', immutable_array_to_string("posts"."tags", ' ')), 'B') || setweight(to_tsvector('english', "posts"."md_content"), 'C')) STORED;--> statement-breakpoint
CREATE INDEX "posts_search_idx" ON "posts" USING gin ("search");--> statement-breakpoint
CREATE INDEX "posts_title_trgm_idx" ON "posts" USING gin ("title" gin_trgm_ops);