// src/types.ts
export interface RecipeComponent {
  id: number;
  name: string;
  quantity: number;
}

export interface Recipe {
  id: number;
  name: string;
  inputs: RecipeComponent[];
  outputs: RecipeComponent[];
}
