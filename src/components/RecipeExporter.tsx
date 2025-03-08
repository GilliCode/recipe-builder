import React, { useState } from 'react';

interface RecipeComponent {
  id: number;
  quantity: number;
}

interface Recipe {
  name: string;
  outputs: RecipeComponent[];
  inputs: RecipeComponent[];
}

interface RecipeExporterProps {
  recipes: Recipe[];
}

const RecipeExporter: React.FC<RecipeExporterProps> = ({ recipes }) => {
  const [filter, setFilter] = useState<string>('');
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value.toLowerCase());
  };

  const handleRecipeSelection = (recipe: Recipe) => {
    setSelectedRecipes((prevSelected) =>
      prevSelected.includes(recipe) ? prevSelected.filter((r) => r !== recipe) : [...prevSelected, recipe]
    );
  };

  const handleExport = () => {
    const exportData = selectedRecipes.length > 0 ? selectedRecipes : recipes;
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div>
      <h2>Export Recipes</h2>
      <input type="text" value={filter} onChange={handleFilterChange} placeholder="Search by name..." />
      <div>
        {recipes
          .filter((recipe) => recipe.name.toLowerCase().includes(filter))
          .map((recipe) => (
            <div key={recipe.name}>
              <input type="checkbox" checked={selectedRecipes.includes(recipe)} onChange={() => handleRecipeSelection(recipe)} />
              <label>{recipe.name}</label>
            </div>
          ))}
      </div>
      <button type="button" onClick={handleExport}>Download {selectedRecipes.length > 0 ? 'Selected' : 'All'} Recipes</button>
    </div>
  );
};

export default RecipeExporter;
