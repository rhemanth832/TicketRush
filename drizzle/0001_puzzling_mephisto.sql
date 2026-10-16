CREATE TABLE `market_mutation_checks` (
	`id` text PRIMARY KEY NOT NULL,
	`ok` integer NOT NULL,
	CONSTRAINT "market_mutation_must_succeed" CHECK("market_mutation_checks"."ok" = 1)
);
