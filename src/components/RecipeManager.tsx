import React, { useState } from 'react';
import ClearableInput, { Item } from './ClearableInput';
import { Recipe } from '../types';

interface RecipeManagerProps {
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
}

const RecipeManager: React.FC<RecipeManagerProps> = ({ recipes, setRecipes, setStatus }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [updatedRecipeName, setUpdatedRecipeName] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const results = recipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setUpdatedRecipeName(recipe.name);
    setSearchQuery(recipe.name);
    setSearchResults([]);
    setStatus(`✅ Selected Recipe: ${recipe.name}`);
  };

  const handleDelete = () => {
    if (!selectedRecipe) {
      setStatus('⚠️ No recipe selected to delete.');
      return;
    }
    setRecipes(recipes.filter((recipe) => recipe.id !== selectedRecipe.id));
    setStatus(`❌ Deleted Recipe: ${selectedRecipe.name}`);
    setSelectedRecipe(null);
    setSearchQuery('');
  };

  const handleUpdate = () => {
    if (!selectedRecipe) {
      setStatus('⚠️ No recipe selected to update.');
      return;
    }
    if (!updatedRecipeName.trim()) {
      setStatus('⚠️ Recipe name cannot be empty.');
      return;
    }
    setRecipes(
      recipes.map((recipe) =>
        recipe.id === selectedRecipe.id ? { ...recipe, name: updatedRecipeName } : recipe
      )
    );
    setStatus(`✅ Updated Recipe: ${updatedRecipeName}`);
    setSelectedRecipe(null);
    setSearchQuery('');
  };

  const handleExport = () => {
    const json = JSON.stringify(recipes, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setStatus('✅ Recipes downloaded successfully.');
  };

  return (
    <div>
      <h2>Manage Recipes</h2>
      <label>Search Recipe:</label>
      <ClearableInput
        value={searchQuery}
        onChange={handleSearch}
        onClear={() => {
          setSearchQuery('');
          setSearchResults([]);
        }}
        placeholder="Search recipes..."
        items={
          searchResults.length
            ? searchResults.map(r => ({ id: r.id, name: r.name }))
            : recipes.map(r => ({ id: r.id, name: r.name }))
        }
        onSelectItem={(item: Item) => {
          const recipe = recipes.find((r) => r.id === item.id);
          if (recipe) handleSelectRecipe(recipe);
        }}
      />

      {selectedRecipe && (
        <div style={{ marginTop: '10px' }}>
          <h3>Edit Recipe</h3>
          <input
            type="text"
            value={updatedRecipeName}
            onChange={(e) => setUpdatedRecipeName(e.target.value)}
            placeholder="Edit recipe name..."
            style={{ padding: '8px', width: '100%', borderRadius: '5px' }}
          />
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
            <button onClick={handleUpdate}>✅ Update Recipe</button>
            <button onClick={handleDelete} style={{ background: 'red', color: 'white' }}>
              ❌ Delete Recipe
            </button>
          </div>
        </div>
      )}

      <button onClick={handleExport} style={{ marginTop: '10px' }}>
        📥 Download
      </button>
    </div>
  );
};

export default RecipeManager;
