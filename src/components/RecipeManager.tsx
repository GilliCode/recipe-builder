// src/components/RecipeManager.tsx
import React, { useState, useEffect, useRef } from 'react';
import ClearableInput from './ClearableInput';
import RecipeEditForm from './RecipeEditForm';
import { Recipe, RecipeManagerProps, RecipeComponent, Item } from '../types';
import { formatKMB } from '../utilities/quantities';

const RecipeManager: React.FC<RecipeManagerProps> = ({
  recipes,
  setRecipes,
  setStatus,
  mappingData,
}) => {
  const [mergedRecipes, setMergedRecipes] = useState<Recipe[]>([]);
  const [manageQuery, setManageQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchOsrsRecipes = async () => {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/Flipping-Utilities/osrs-datasets/master/recipes.json'
        );
        const data: Recipe[] = await response.json();

        // Ensure each external recipe has an id
        data.forEach(r => {
          if (!r.id && r.outputs && r.outputs[0]) {
            r.id = r.outputs[0].id;
          }
        });

        const mergedMap: Record<number, Recipe> = {};
        // Start with dataset
        data.forEach(r => {
          mergedMap[r.id] = r;
        });
        // Overwrite or add local recipes
        recipes.forEach(r => {
          mergedMap[r.id] = r;
        });
        setMergedRecipes(Object.values(mergedMap));
      } catch (error) {
        setStatus('⚠️ Error fetching recipes.json.');
      }
    };
    fetchOsrsRecipes();
  }, [recipes, setStatus]);

  // Build dropdown items for searching
  const dropdownItems: Item[] = mergedRecipes
    .filter(r => {
      const lower = manageQuery.toLowerCase();
      const nameMatch = r.name.toLowerCase().includes(lower);
      const descMatch = r.subText?.toLowerCase().includes(lower) || false;
      // Also match if any output ID includes the query
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
    // Refocus search input after deletion
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleEditRecipe = (recipeId: number) => {
    const found = mergedRecipes.find(r => r.id === recipeId);
    if (!found) return;
    setEditingRecipe(found);
    setStatus(`✏️ Editing recipe: ${found.name}`);
  };

  const handleSaveEdit = (updated: Recipe) => {
    setRecipes(prev => prev.map(r => (r.id === updated.id ? updated : r)));
    setStatus(`✅ Recipe updated: ${updated.name}`);
    setEditingRecipe(null);
  };

  const handleCancelEdit = () => {
    setEditingRecipe(null);
  };

  // Helper to get a component's icon
  const getComponentIcon = (comp: RecipeComponent): string => {
    return comp.icon || mappingData[comp.id]?.icon || '';
  };

  // Helper to get recipe icon from the first output
  const getRecipeIcon = (recipe: Recipe): string => {
    return recipe.outputs[0]?.icon || mappingData[recipe.outputs[0]?.id]?.icon || '';
  };

  return (
    <div className="recipe-manager">
      <h2>Manage Recipes</h2>

      <ClearableInput
        ref={searchInputRef}
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

      <div className="recipe-manager-table">
        {/* Removed the ID column. We have 5 columns: Recipe Name, Description, Components, Quantity, Action */}
        <table className="manage-recipes-table">
          <thead>
            <tr>
              <th>Recipe Name</th>
              <th>Description</th>
              <th>Components</th>
              <th>Quantity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {selectedRecipe ? (
              <tr>
                {/* RECIPE NAME */}
                <td>
                  <div className="icon-input-wrapper" style={{ position: 'relative' }}>
                    {getRecipeIcon(selectedRecipe) && (
                      <img
                        src={getRecipeIcon(selectedRecipe)}
                        alt="icon"
                        className="icon-input-icon"
                        style={{ width: '16px', height: '16px' }}
                      />
                    )}
                    <input
                      type="text"
                      readOnly
                      value={selectedRecipe.name}
                      style={{
                        width: '180px',
                        padding: getRecipeIcon(selectedRecipe) ? '3px 3px 3px 24px' : '3px',
                      }}
                    />
                  </div>
                </td>
                {/* DESCRIPTION */}
                <td>
                  <input
                    type="text"
                    readOnly
                    value={selectedRecipe.subText || '—'}
                    style={{ width: '150px', padding: '3px' }}
                  />
                </td>
                {/* COMPONENTS */}
                <td>
                  {selectedRecipe.inputs.map((inp: RecipeComponent) => {
                    const iconUrl = getComponentIcon(inp);
                    const displayName = inp.name || mappingData[inp.id]?.name || 'Unknown';
                    return (
                      <div key={inp.id} style={{ marginBottom: '4px' }}>
                        <div className="icon-input-wrapper" style={{ position: 'relative' }}>
                          {iconUrl && (
                            <img
                              src={iconUrl}
                              alt="icon"
                              className="icon-input-icon"
                              style={{ width: '16px', height: '16px' }}
                            />
                          )}
                          <input
                            type="text"
                            readOnly
                            value={displayName}
                            style={{
                              width: '150px',
                              padding: iconUrl ? '3px 3px 3px 24px' : '3px',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </td>
                {/* QUANTITY */}
                <td>
                  {selectedRecipe.inputs.map((inp: RecipeComponent) => (
                    <div key={inp.id} style={{ marginBottom: '4px' }}>
                      <input
                        type="text"
                        readOnly
                        value={formatKMB(inp.quantity)}
                        style={{ width: '80px', padding: '3px' }}
                      />
                    </div>
                  ))}
                </td>
                {/* ACTION */}
                <td>
                  <button className="btn-edit" onClick={() => handleEditRecipe(selectedRecipe.id)}>
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => {
                      handleDeleteRecipe(selectedRecipe.id);
                      setSelectedRecipe(null);
                      setManageQuery('');
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>
                  No recipe selected
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Form (Modal) */}
      {editingRecipe && (
        <RecipeEditForm
          initialRecipe={editingRecipe}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          mappingData={mappingData}
        />
      )}
    </div>
  );
};

export default RecipeManager;
