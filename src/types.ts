/**
 * types.ts
 *
 * - Item: includes id, name, and icon.
 * - RecipeComponent: includes id, name, quantity, and icon.
 * - Recipe: includes id, name, inputs, outputs, and subText (Description).
 * - RecipeCRUDProps and RecipeManagerProps: prop types for our components.
 */

export interface Item {
  id: number;
  name: string;
  icon: string | null;
}

export interface RecipeComponent {
  id: number;
  name: string;
  icon: string | null;
  quantity: number;
}

export interface Recipe {
  id: number;
  name: string;
  subText: string;
  inputs: RecipeComponent[];
  outputs: RecipeComponent[];
}

export interface RecipeCRUDProps {
  recipes: Recipe[]; // retained for type compatibility (even if not directly used)
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  mappingData: Record<number, { name: string; icon: string | null }>;
  // For editing:
  editingRecipe: Recipe | null;
  clearEditing: () => void;
}

export interface RecipeManagerProps {
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  mappingData: Record<number, { name: string; icon: string | null }>;
}
