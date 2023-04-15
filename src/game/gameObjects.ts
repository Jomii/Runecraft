import type { LootTableEntry } from './fieldSpawnTable';

export interface GameObjects {
	[key: number]: GameObject;
}

export interface GameObject {
	id: number;
	visual: string;
	type: 'item' | 'entity' | 'empty' | 'player';
	maxHp?: number;
	hp?: number;
	damage?: number;
	lootTable?: LootTableEntry[];
	/**
	 * Copies a given object, and modifies the copy in some way.
	 * @returns modified object.
	 */
	applyEffect?: (target: GameObject) => { object: GameObject; success: boolean };
}

export const gameObjects: GameObjects = {
	0: { id: 0, type: 'empty', visual: ' ', hp: -1 },
	1: { id: 1, type: 'player', visual: '😀', maxHp: 10, hp: 10, damage: 1 },
	2: {
		id: 2,
		type: 'entity',
		visual: '🦇',
		maxHp: 2,
		hp: 2,
		damage: 1,
		lootTable: [
			{ id: 7, weight: 0.5 },
			{ id: 0, weight: 0.5 }
		]
	},
	3: { id: 3, type: 'item', visual: '⚪' },
	4: { id: 4, type: 'item', visual: '⚫' },
	5: { id: 5, type: 'item', visual: '🌈' },
	6: { id: 6, type: 'item', visual: '◻' },
	7: { id: 7, type: 'item', visual: '◼' },
	8: {
		id: 8,
		type: 'item',
		visual: '🤍',
		applyEffect: (target) => {
			const newObject = { ...target };
			let success = false;

			if (newObject.maxHp !== undefined) {
				newObject.maxHp = newObject.maxHp + 1;
				success = true;
			}

			console.log('armored ', target.id, success);
			return { object: newObject, success };
		}
	},
	9: {
		id: 9,
		type: 'item',
		visual: '❤',
		applyEffect: (target) => {
			const newObject = { ...target };
			let success = false;

			if (
				newObject.hp !== undefined &&
				newObject.maxHp !== undefined &&
				newObject.hp < newObject.maxHp
			) {
				newObject.hp = newObject.hp + 1;
				success = true;
			}

			console.log('healed ', target.id, success);
			return { object: newObject, success };
		}
	},
	10: {
		id: 10,
		type: 'entity',
		visual: '🌲',
		maxHp: 3,
		hp: 3,
		lootTable: [{ id: 6, weight: 1.0 }]
	},
	11: {
		id: 11,
		type: 'entity',
		visual: '🐻',
		maxHp: 4,
		hp: 4,
		damage: 1,
		lootTable: [
			{ id: 7, weight: 0.5 },
			{ id: 4, weight: 0.5 }
		]
	},
	12: {
		id: 12,
		type: 'item',
		visual: '⬆',
		applyEffect: (target) => {
			const newObject = { ...target };
			let success = false;

			if (newObject.damage !== undefined) {
				newObject.damage += 1;
				success = true;
			}

			return { object: newObject, success };
		}
	},
	13: {
		id: 13,
		type: 'item',
		visual: '☣',
		applyEffect: () => {
			return { object: gameObjects[14], success: true };
		}
	},
	14: {
		id: 14,
		type: 'entity',
		visual: '👾',
		maxHp: 50,
		hp: 50,
		damage: 2,
		lootTable: [{ id: 15, weight: 1.0 }]
	},
	15: {
		id: 15,
		type: 'item',
		visual: '🏆'
	}
} as GameObjects;

export const naturalSpawnTable = [
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
