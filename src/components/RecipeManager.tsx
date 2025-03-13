import React, { useState, useEffect } from 'react';
import ClearableInput from './ClearableInput';
import { Recipe, RecipeManagerProps, RecipeComponent, Item } from '../types';

const RecipeManager: React.FC<RecipeManagerProps> = ({ recipes, setRecipes, setStatus, mappingData }) => {
  const [mergedRecipes, setMergedRecipes] = useState<Recipe[]>([]);
  const [manageQuery, setManageQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Merge external recipes with local recipes
  useEffect(() => {
    const fetchOsrsRecipes = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/Flipping-Utilities/osrs-datasets/master/recipes.json');
        const data: Recipe[] = await response.json();

        // Ensure external recipes have an id (use first output's id if missing)
        data.forEach(r => {
          if (!r.id && r.outputs && r.outputs[0]) {
            r.id = r.outputs[0].id;
          }
        });

        // Build unique recipe map (external recipes have priority)
        const mergedMap: Record<number, Recipe> = {};
        data.forEach(r => {
          mergedMap[r.id] = r;
        });
        recipes.forEach(r => {
          if (!mergedMap[r.id]) {
            mergedMap[r.id] = r;
          }
        });
        setMergedRecipes(Object.values(mergedMap));
      } catch (error) {
        setStatus('⚠️ Error fetching external recipes.');
      }
    };
    fetchOsrsRecipes();
  }, [recipes, setStatus]);

  const dropdownItems: Item[] = mergedRecipes
    .filter(r => {
      const lower = manageQuery.toLowerCase();
      const nameMatch = r.name.toLowerCase().includes(lower);
      const descMatch = r.subText?.toLowerCase().includes(lower) || false;
      const idMatch = (r.outputs[0]?.id.toString() || '').includes(lower);
      return nameMatch || descMatch || idMatch;
    })
    .slice(0, 10)
    .map(r => ({
      id: r.id,
      name: r.name,
      icon: r.outputs[0]?.icon || mappingData[r.outputs[0]?.id]?.icon || null,
    }));

  const handleSelectManageRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setManageQuery(recipe.name);
    setStatus(`✅ Selected recipe: ${recipe.name}`);
  };

  const handleDeleteRecipe = (recipeId: number) => {
    setRecipes(prev => prev.filter(r => r.id !== recipeId));
    setStatus('✅ Recipe deleted.');
    if (selectedRecipe && selectedRecipe.id === recipeId) {
      setSelectedRecipe(null);
      setManageQuery('');
    }
  };

  const handleEditRecipe = (recipeId: number) => {
    const found = mergedRecipes.find(r => r.id === recipeId);
    if (!found) return;
    setStatus(`✏️ Editing recipe: ${found.name}`);
    // Call global edit handler (e.g. in App.tsx, set editingRecipe state)
    // This example does not include the modal logic since that’s handled in App.tsx.
  };

  const iconStyle = {
    width: '24px',
    height: '24px',
    objectFit: 'contain' as const,
    marginRight: '4px',
  };

  return (
    <div className="recipe-manager">
      <h2>Manage Recipes</h2>
      <ClearableInput
        value={manageQuery}
        onChange={(value) => {
          setManageQuery(value);
          setSelectedRecipe(null);
        }}
        onClear={() => {
          setManageQuery('');
          setSelectedRecipe(null);
        }}
        placeholder="Search recipes from dataset..."
        items={dropdownItems}
        onSelectItem={(item: Item) => {
          const found = mergedRecipes.find(r => r.id === item.id);
          if (found) {
            handleSelectManageRecipe(found);
          }
        }}
        style={{ width: '200px', marginBottom: '15px' }}
      />

      {selectedRecipe && (
        <div style={{ border: '1px solid #555', borderRadius: '4px', maxHeight: '250px', overflowY: 'auto', marginBottom: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#444' }}>
                <th style={{ border: '1px solid #555', padding: '8px' }}>ID</th>
                <th style={{ border: '1px solid #555', padding: '8px' }}>Name</th>
                <th style={{ border: '1px solid #555', padding: '8px' }}>Description</th>
                <th style={{ border: '1px solid #555', padding: '8px' }}>Components</th>
                <th style={{ border: '1px solid #555', padding: '8px' }}>Quantity</th>
                <th style={{ border: '1px solid #555', padding: '8px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #555', padding: '8px' }}>{selectedRecipe.id}</td>
                <td style={{ border: '1px solid #555', padding: '8px' }}>{selectedRecipe.name}</td>
                <td style={{ border: '1px solid #555', padding: '8px' }}>
                  {selectedRecipe.subText || '—'}
                </td>
                <td style={{ border: '1px solid #555', padding: '8px' }}>
                  {selectedRecipe.inputs.map((inp: RecipeComponent) => (
                    <div key={inp.id} style={{ marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
                      <img
                        src={inp.icon || mappingData[inp.id]?.icon || ''}
                        alt="icon"
                        style={iconStyle}
                      />
                      {inp.name}
                    </div>
                  ))}
                </td>
                <td style={{ border: '1px solid #555', padding: '8px' }}>
                  {selectedRecipe.inputs.map((inp: RecipeComponent) => (
                    <div key={inp.id} style={{ marginBottom: '4px' }}>
                      {inp.quantity.toLocaleString()}
                    </div>
                  ))}
                </td>
                <td style={{ border: '1px solid #555', padding: '8px' }}>
                  <button onClick={() => handleEditRecipe(selectedRecipe.id)} style={{ marginRight: '8px' }}>
                    Edit
                  </button>
                  <button onClick={() => {
                    handleDeleteRecipe(selectedRecipe.id);
                    setSelectedRecipe(null);
                    setManageQuery('');
                  }}>
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecipeManager;
