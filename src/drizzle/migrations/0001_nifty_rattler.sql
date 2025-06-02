CREATE TYPE "public"."role" AS ENUM('admin', 'user');--> statement-breakpoint
ALTER TABLE "customer" ALTER COLUMN "Role" SET DEFAULT 'user'::"public"."role";--> statement-breakpoint
ALTER TABLE "customer" ALTER COLUMN "Role" SET DATA TYPE "public"."role" USING "Role"::"public"."role";