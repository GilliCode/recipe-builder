// src/components/RecipeManager.tsx
import React, { useState, useEffect, useRef } from 'react';
import ClearableInput from './ClearableInput';
import RecipeEditForm from './RecipeEditForm';
import { Recipe, RecipeManagerProps, RecipeComponent, Item } from '../types';
import { formatKMB } from '../utilities/quantities';

/**
 * Determines if a recipe is in breaking mode by checking
 * if the recipe's name or customActionPrefix contains "breaking" (case-insensitive).
 */
function isBreakingRecipe(recipe: Recipe): boolean {
  return recipe.customActionPrefix?.toLowerCase().includes("breaking")
      || recipe.name.toLowerCase().includes("breaking");
}

/**
 * Helper: Return a string | null icon from a given component-like object.
 */
function getIcon(comp: { icon: string | null; id: number }): string | null {
  return comp.icon !== null ? comp.icon : null;
}

/**
 * Helper: Returns the icon for displaying the recipe name in the Manage Recipes table.
 * If it's a breaking recipe, use the first input's icon. Otherwise, use the first output's icon.
 */
function getRecipeDisplayIcon(recipe: Recipe, mappingData: Record<number, { name: string; icon: string | null }>): string | null {
  if (isBreakingRecipe(recipe)) {
    // If there's an input item, use that icon or the mapping fallback.
    if (recipe.inputs[0]) {
      return recipe.inputs[0].icon ?? mappingData[recipe.inputs[0].id]?.icon ?? null;
    }
    return null;
  } else {
    // Normal mode: use the first output's icon or the mapping fallback.
    if (recipe.outputs[0]) {
      return recipe.outputs[0].icon ?? mappingData[recipe.outputs[0].id]?.icon ?? null;
    }
    return null;
  }
}

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
        // Merge external data first
        data.forEach(r => {
          mergedMap[r.id] = r;
        });
        // Overwrite with local recipes
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

  /**
   * Build dropdown items for searching. We'll display the recipe's name
   * and an icon that depends on whether it's a breaking recipe or not.
   */
  const dropdownItems: Item[] = mergedRecipes
    .filter(r => {
      const lower = manageQuery.toLowerCase();
      const nameMatch = r.name.toLowerCase().includes(lower);
      const descMatch = r.subText?.toLowerCase().includes(lower) || false;
      const idMatch = (r.outputs[0]?.id.toString() || '').includes(lower);
      return nameMatch || descMatch || idMatch;
    })
    .slice(0, 10)
    .map(r => {
      // If it's a breaking recipe, use the input icon
      // otherwise, use the output icon
      let icon: string | null = null;
      if (isBreakingRecipe(r)) {
        icon = r.inputs[0]?.icon ?? mappingData[r.inputs[0]?.id]?.icon ?? null;
      } else {
        icon = r.outputs[0]?.icon ?? mappingData[r.outputs[0]?.id]?.icon ?? null;
      }

      return {
        id: r.id,
        name: r.name,
        icon,
      };
    });

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
    if (selectedRecipe && selectedRecipe.id === updated.id) {
      setSelectedRecipe(updated);
      setManageQuery(updated.name);
    }
    setStatus(`✅ Recipe updated: ${updated.name}`);
    setEditingRecipe(null);
  };

  const handleCancelEdit = () => {
    setEditingRecipe(null);
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
        <table className="manage-recipes-table">
          <thead>
            <tr>
              <th>Recipe Name</th>
              <th>Description</th>
              <th>Items & Qty</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {selectedRecipe ? (
              <tr>
                {/* RECIPE NAME COLUMN */}
                <td>
                  <div className="icon-input-wrapper" style={{ position: 'relative' }}>
                    {getRecipeDisplayIcon(selectedRecipe, mappingData) && (
                      <img
                        src={getRecipeDisplayIcon(selectedRecipe, mappingData)!}
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
                        padding: getRecipeDisplayIcon(selectedRecipe, mappingData)
                          ? '3px 3px 3px 24px'
                          : '3px',
                      }}
                    />
                  </div>
                </td>

                {/* DESCRIPTION COLUMN */}
                <td>
                  <input
                    type="text"
                    readOnly
                    value={selectedRecipe.subText || '—'}
                    style={{ width: '150px', padding: '3px' }}
                  />
                </td>

                {/* ITEMS & QTY COLUMN */}
                <td>
                  {isBreakingRecipe(selectedRecipe) ? (
                    // Breaking mode: show only outputs
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Outputs:</div>
                      {selectedRecipe.outputs.map((out, idx) => {
                        const icon = getIcon(out as RecipeComponent);
                        return (
                          <div
                            key={`out-${idx}`}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}
                          >
                            {icon && (
                              <img src={icon} alt="icon" style={{ width: '16px', height: '16px' }} />
                            )}
                            <span>{out.name} x {formatKMB(out.quantity)}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // Normal mode: show single output and inputs
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Output:</div>
                      {selectedRecipe.outputs.map((out, idx) => {
                        const icon = getIcon(out as RecipeComponent);
                        return (
                          <div
                            key={`out-${idx}`}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}
                          >
                            {icon && (
                              <img src={icon} alt="icon" style={{ width: '16px', height: '16px' }} />
                            )}
                            <span>{out.name} x {formatKMB(out.quantity)}</span>
                          </div>
                        );
                      })}
                      <div style={{ fontWeight: 'bold', margin: '8px 0 4px' }}>Inputs:</div>
                      {selectedRecipe.inputs.map((inp, idx) => {
                        const icon = getIcon(inp);
                        return (
                          <div
                            key={`inp-${idx}`}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}
                          >
                            {icon && (
                              <img src={icon} alt="icon" style={{ width: '16px', height: '16px' }} />
                            )}
                            <span>{inp.name} x {formatKMB(inp.quantity)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </td>

                {/* ACTION COLUMN */}
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
                <td colSpan={4} style={{ textAlign: 'center' }}>
                  No recipe selected
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
