<script lang="ts">
	import { onMount } from 'svelte';
	import { Inventory, type InventoryItem } from '../game/inventory';
	import { clickOutside } from '../events/clickOutside';
	import { checkRecipe, type RecipeProduct } from '../game/crafting';
	import { naturalSpawnTable, gameObjects as objects, type GameObject } from '../game/gameObjects';
	import { recipes } from '../game/recipes';
	import type { LootTableEntry } from '../game/fieldSpawnTable';

	let gameOver = false;
	let field = Array.from(Array(3), () => new Array(3).fill(objects[0]) as GameObject[]);
	let craftGrid = Array.from(
		Array(3),
		() => new Array(3).fill({ object: objects[0], count: 0 }) as InventoryItem[]
	);
	let inventory = Inventory;
	let selectedItem: null | InventoryItem = null;
	let recipe: RecipeProduct = { productId: 0, amount: 0 };

	function craft() {
		inventory.add(recipe.productId, recipe.amount);
		inventory = inventory;

		for (let i = 0; i < craftGrid.length; i++) {
			for (let j = 0; j < craftGrid[i].length; j++) {
				if (craftGrid[i][j].count > 0) {
					craftGrid[i][j].count = craftGrid[i][j].count - 1;

					if (craftGrid[i][j].count <= 0) {
						craftGrid[i][j] = { object: objects[0], count: 0 };
					}
				}
			}
		}

		recipe = checkRecipe(craftGrid);
	}

	function selectItem(item: InventoryItem) {
		selectedItem = Object.assign({}, item);
	}

	function handleCraftClick(event: MouseEvent, row: number, col: number) {
		event.preventDefault();
		if (!selectedItem || event.shiftKey) {
			if (craftGrid[row][col].object.id !== 0) {
				selectedItem = null;
				inventory.add(craftGrid[row][col].object.id, 1);
				craftGrid[row][col] = { object: objects[0], count: 0 };
				inventory = inventory;

				recipe = checkRecipe(craftGrid);
			}
			return;
		}

		craftGrid[row][col] = Object.assign({ ...selectedItem }, { count: 1 });
		selectedItem.count = selectedItem.count - 1;
		inventory.remove(selectedItem.object.id);
		inventory = inventory;

		if (selectedItem.count <= 0) {
			selectedItem = null;
		}

		recipe = checkRecipe(craftGrid);
	}

	function handleMouseOverCraft(event: MouseEvent, row: number, col: number) {
		event.preventDefault();

		if (event.buttons !== 1) {
			return;
		}

		if (!selectedItem || event.shiftKey) {
			if (craftGrid[row][col].object.id !== 0) {
				selectedItem = null;
				inventory.add(craftGrid[row][col].object.id, 1);
				craftGrid[row][col] = { object: objects[0], count: 0 };
				inventory = inventory;

				recipe = checkRecipe(craftGrid);
			}
			return;
		}

		craftGrid[row][col] = Object.assign({ ...selectedItem }, { count: 1 });
		selectedItem.count = selectedItem.count - 1;
		inventory.remove(selectedItem.object.id);
		inventory = inventory;

		if (selectedItem.count <= 0) {
			selectedItem = null;
		}

		recipe = checkRecipe(craftGrid);
	}

	function interact(object: GameObject, row: number, cell: number) {
		if (gameOver) {
			return;
		}

		if (selectedItem !== null && typeof selectedItem.object.applyEffect === 'function') {
			const response = selectedItem.object.applyEffect(object);
			if (response.success) {
				field[row][cell] = response.object;
				field = field;

				selectedItem.count = selectedItem.count - 1;
				inventory.remove(selectedItem.object.id);
				inventory = inventory;

				if (selectedItem.count <= 0) {
					selectedItem = null;
				}
			}
		} else if (object.type === 'item') {
			inventory.add(object.id, 1);
			inventory = inventory;
			field[row][cell] = Object.assign({}, objects[0]);
		} else if (object.type === 'entity') {
			if (object.hp === undefined) {
				return;
			}

			if (field[1][1].damage) {
				object.hp -= field[1][1].damage;
			}

			if (object.hp <= 0 && object.lootTable !== undefined) {
				let loot = selectItemFromTable(object.lootTable);
				field[row][cell] = { ...objects[loot.id] };
			}
			field = field;
		} else if (object.type === 'empty') {
			// Return if there are other objects in the field, else generate new field,
			// prevents generating new field if there are objects remaining
			for (let i = 0; i < field.length; i++) {
				for (let j = 0; j < field[i].length; j++) {
					if (field[i][j].id !== 0 && field[i][j].id !== 1) {
						return;
					}
				}
			}

			generateField();
			return;
		}

		fieldTick();
	}

	function selectItemFromTable(lootTable: LootTableEntry[]) {
		const totalWeight = lootTable.reduce((sum, item) => sum + item.weight, 0);

		const randomValue = Math.random() * totalWeight;

		let weightSum = 0;
		for (const item of lootTable) {
			weightSum += item.weight;
			if (randomValue <= weightSum) {
				return item;
			}
		}

		// As a fallback return the first item.
		return lootTable[0];
	}

	function generateField() {
		for (let i = 0; i < field.length; i++) {
			for (let j = 0; j < field[i].length; j++) {
				if (field[i][j].id == 1) {
					continue;
				}

				let spawnObject = selectItemFromTable(naturalSpawnTable);
				let id = spawnObject.id;
				if (id == 1) {
					id = 0;
				}

				field[i][j] = Object.assign({}, objects[id]);
			}
		}
	}

	function fieldTick() {
		for (let i = 0; i < field.length; i++) {
			for (let j = 0; j < field[i].length; j++) {
				if (field[i][j].type === 'entity') {
					let damage = field[i][j].damage || 0;

					if (field[1][1].hp !== undefined) {
						field[1][1].hp -= damage;
						if (field[1][1].hp <= 0) {
							field[1][1] = Object.assign({}, objects[0]);
							gameOver = true;
						}
					}
				}
			}
		}
	}

	function restart() {
		gameOver = false;
		generateField();
		objects[1].hp = 10;
		field[1][1] = { ...objects[1] };
		inventory.clear();
		inventory = inventory;
	}

	function fixElementToCursor(event: MouseEvent) {
		let elem = document.querySelector('#cursor') as HTMLElement;
		let x = event.clientX;
		let y = event.clientY;
		if (elem) {
			elem.style.setProperty('position', 'absolute');
			elem.style.setProperty('left', x + 30 + 'px');
			elem.style.setProperty('top', y - 10 + 'px');
		}
	}

	onMount(async () => {
		// Set player position
		field[1][1] = { ...objects[1] };
		generateField();
	});

	function onKeyPress(event: KeyboardEvent) {
		switch (event.key) {
			case 'Escape':
				selectedItem = null;
				break;
		}
	}
</script>

<svelte:window on:keydown={onKeyPress} />

<main class="" on:mousemove={fixElementToCursor}>
	<div class="flex items-center justify-center h-screen">
		<div class="flex flex-col">
			<h1 class="pb-12">Welcome to Runecraft</h1>

			{#if gameOver}
				<h2 class="text-center">Game over!</h2>
				<button
					on:click={() => restart()}
					class="inline-block rounded bg-primary px-6 pb-2 mb-4 pt-2 font-medium uppercase text-white leading-normal"
					>Restart</button
				>
			{/if}
			<div
				use:clickOutside
				on:outclick={() => {
					selectedItem = null;
				}}
			>
				<div class="field grid grid-cols-3 gap-2">
					{#each field as row, i}
						{#each row as cell, j}
							<button
								on:click={() => interact(cell, i, j)}
								class="field-button transition duration-150 ease-in-out hover:bg-slate-200"
							>
								{cell.visual}
								<br />
								{#if cell.type === 'entity' || cell.type === 'player'}
									<span class="text-red-600 font-bold">{cell.hp}/{cell.maxHp} </span>
									{#if cell.damage && cell.damage > 0}
										<span>{cell.damage} </span>
									{/if}
								{/if}
							</button>
						{/each}
					{/each}
				</div>

				<h2>Rune table</h2>
				<div class="field grid grid-cols-3 gap-2 pt-2 noselect">
					{#each craftGrid as row, i}
						{#each row as cell, j}
							<div
								on:mouseenter={(e) => handleMouseOverCraft(e, i, j)}
								on:mousedown={(e) => handleCraftClick(e, i, j)}
								class="field-button"
							>
								{cell.object.visual}
								{#if cell.count > 0}
									{cell.count}
								{/if}
							</div>
						{/each}
					{/each}
				</div>
			</div>
			<div>
				<p>Product:</p>
				<button on:click={() => craft()}>
					{objects[recipe.productId].visual}
				</button>
				{#if recipe.amount > 1}
					{recipe.amount}
				{/if}
			</div>
			<br />

			<h2>Inventory</h2>
			{#if selectedItem}
				<div class="absolute top-0 left-0" id="cursor">
					{selectedItem.object.visual}
					{selectedItem.count}
				</div>
			{/if}

			{#each Object.values(inventory.items) as item}
				<button id={item.object.id.toString()} on:click={() => selectItem(item)}>
					{item.object.visual}: {item.count}
				</button>
			{/each}
		</div>

		<div class="flex flex-col items-center justify-center h-screen p-8">
			<h2 class="pr-8 pb-4 text-center">Recipes</h2>
			<div class="overflow-y-scroll h-2/3 p-4 border-2">
				{#each recipes as recipe}
					<div class="flex pb-4">
						<div>
							{#each recipe.recipe as recipeArray}
								<div class="flex">
									{#each recipeArray as cell}
										<div class="field-button">
											{objects[cell].visual}
										</div>
									{/each}
								</div>
							{/each}
						</div>
						<div class="flex items-center justify-center">
							= {recipe.amount}x {objects[recipe.product].visual}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</main>

<style>
	.field {
		width: max-content;
	}

	.field-button {
		min-height: 3rem;
		width: 3rem;
		border-style: solid;
		border-width: 2px;
		border-color: hsl(255, 50%, 60%);
	}

	.noselect {
		-webkit-touch-callout: none; /* iOS Safari */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Old versions of Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
		user-select: none; /* Non-prefixed version, currently
                                    supported by Chrome, Edge, Opera and Firefox */
	}
</style>
