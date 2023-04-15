export interface LootTableEntry {
	id: number;
	weight: number;
}

export const naturalSpawnTable: LootTableEntry[] = [
	{ id: 0, weight: 0.5 },
	{ id: 2, weight: 0.11 },
	{ id: 11, weight: 0.05 },
	{ id: 10, weight: 0.35 },
	{ id: 5, weight: 0.07 },
	{ id: 12, weight: 0.03 },
	{ id: 9, weight: 0.1 },
	{ id: 6, weight: 0.125 },
	{ id: 7, weight: 0.125 },
	{ id: 3, weight: 0.05 },
	{ id: 4, weight: 0.05 }
];
