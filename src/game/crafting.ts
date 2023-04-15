import type { InventoryItem } from './inventory';
import { recipes } from './recipes';

export interface RecipeProduct {
	productId: number;
	amount: number;
}

export function checkRecipe(grid: InventoryItem[][]): RecipeProduct {
	const idGrid: number[][] = Array.from(Array(3), () => new Array(3).fill(0));

	for (let i = 0; i < grid.length; i++) {
		for (let j = 0; j < grid[i].length; j++) {
			idGrid[i][j] = grid[i][j].object.id;
		}
	}

	for (const recipe of recipes) {
		if (recipe.recipe.toString() == idGrid.toString()) {
			return { productId: recipe.product, amount: recipe.amount };
		}
	}

	return { productId: 0, amount: 0 };
}
