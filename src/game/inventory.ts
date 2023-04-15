import { objects, type GameObject } from '../types/types';

export interface InventoryItem {
	object: GameObject;
	count: number;
}

interface Inventory {
	items: { [key: number]: InventoryItem };
	add: (id: number, amount: number) => void;
	remove: (id: number) => void;
	clear: () => void;
}

export const Inventory: Inventory = {
	items: {},
	add: function (id, amount) {
		if (Object.keys(this.items).includes(id.toString())) {
			this.items[id].count += amount;
		} else {
			this.items[id] = { object: objects[id], count: amount };
		}
	},
	remove: function (id) {
		if (Object.keys(this.items).includes(id.toString())) {
			this.items[id].count -= 1;

			if (this.items[id].count <= 0) {
				delete this.items[id];
			}
		}
	},
	clear: function () {
		this.items = {};
	}
};
