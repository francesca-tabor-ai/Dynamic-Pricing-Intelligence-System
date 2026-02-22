CREATE TYPE "public"."users_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "competitorPrices" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"competitorName" varchar(255) NOT NULL,
	"price" integer NOT NULL,
	"url" text,
	"inStock" integer DEFAULT 1 NOT NULL,
	"recordedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demandData" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"price" integer NOT NULL,
	"quantity" integer NOT NULL,
	"revenue" integer NOT NULL,
	"competitorPrice" integer,
	"seasonality" varchar(50) DEFAULT 'normal',
	"recordedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricingHistory" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"previousPrice" integer NOT NULL,
	"newPrice" integer NOT NULL,
	"recommendedPrice" integer NOT NULL,
	"reason" varchar(255),
	"expectedProfitChange" integer,
	"applied" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"sku" varchar(100) NOT NULL,
	"baseCost" integer NOT NULL,
	"currentPrice" integer NOT NULL,
	"minMargin" integer DEFAULT 15 NOT NULL,
	"maxPrice" integer,
	"inventory" integer DEFAULT 0 NOT NULL,
	"demandElasticity" varchar(50) DEFAULT '1.2',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "users_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
ALTER TABLE "competitorPrices" ADD CONSTRAINT "competitorPrices_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demandData" ADD CONSTRAINT "demandData_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricingHistory" ADD CONSTRAINT "pricingHistory_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;