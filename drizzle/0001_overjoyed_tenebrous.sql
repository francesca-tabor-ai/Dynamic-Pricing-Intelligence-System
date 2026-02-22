CREATE TABLE `competitorPrices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`competitorName` varchar(255) NOT NULL,
	`price` int NOT NULL,
	`url` text,
	`inStock` int NOT NULL DEFAULT 1,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `competitorPrices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `demandData` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`price` int NOT NULL,
	`quantity` int NOT NULL,
	`revenue` int NOT NULL,
	`competitorPrice` int,
	`seasonality` varchar(50) DEFAULT 'normal',
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `demandData_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pricingHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`previousPrice` int NOT NULL,
	`newPrice` int NOT NULL,
	`recommendedPrice` int NOT NULL,
	`reason` varchar(255),
	`expectedProfitChange` int,
	`applied` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pricingHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`sku` varchar(100) NOT NULL,
	`baseCost` int NOT NULL,
	`currentPrice` int NOT NULL,
	`minMargin` int NOT NULL DEFAULT 15,
	`maxPrice` int,
	`inventory` int NOT NULL DEFAULT 0,
	`demandElasticity` varchar(50) DEFAULT '1.2',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
ALTER TABLE `competitorPrices` ADD CONSTRAINT `competitorPrices_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `demandData` ADD CONSTRAINT `demandData_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pricingHistory` ADD CONSTRAINT `pricingHistory_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;