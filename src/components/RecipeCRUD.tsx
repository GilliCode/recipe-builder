import React, { useState, useEffect, useRef } from 'react';
import ClearableInput from './ClearableInput';
import type { Recipe, RecipeComponent, Item, RecipeCRUDProps } from '../types';
import '../App.css';

type ActionPrefix = "Creating" | "Breaking" | "Making";

const RecipeCRUD: React.FC<RecipeCRUDProps> = ({
  recipes: _recipes, // retained for type compatibility / future merging
  setRecipes,
  setStatus,
  mappingData,
  editingRecipe,
  clearEditing, // retained for future editing support
}) => {
  // Action (radial) selection and base name (without prefix)
  const [action, setAction] = useState<ActionPrefix>("Creating");
  const [baseName, setBaseName] = useState("");

  // Recipe Name search using mappingData
  const [recipeNameQuery, setRecipeNameQuery] = useState("");
  const [recipeNameResults, setRecipeNameResults] = useState<Item[]>([]);
  const [selectedRecipeName, setSelectedRecipeName] = useState<Item | null>(null);

  // Description (subText)
  const [description, setDescription] = useState("");

  // Components section
  const [componentQuery, setComponentQuery] = useState("");
  const [componentResults, setComponentResults] = useState<Item[]>([]);
  const [components, setComponents] = useState<RecipeComponent[]>([]);
  const [tempQty, setTempQty] = useState<number>(1);

  // Refs for focusing inputs
  const recipeNameInputRef = useRef<HTMLInputElement>(null);
  const componentInputRef = useRef<HTMLInputElement>(null);

  // If editingRecipe exists, load its data into the form
  useEffect(() => {
    if (editingRecipe) {
      const knownPrefixes: ActionPrefix[] = ["Creating", "Breaking", "Making"];
      let foundPrefix: ActionPrefix | null = null;
      for (const prefix of knownPrefixes) {
        if (editingRecipe.name.startsWith(prefix)) {
          foundPrefix = prefix;
          break;
        }
      }
      setAction(foundPrefix ?? "Creating");
      const rawName = foundPrefix
        ? editingRecipe.name.replace(new RegExp(`^${foundPrefix}\\s+`, "i"), "")
        : editingRecipe.name;
      setBaseName(rawName);
      setRecipeNameQuery(rawName);
      setDescription(editingRecipe.subText);
      setComponents(editingRecipe.inputs);
      const firstOutput = editingRecipe.outputs[0];
      if (firstOutput) {
        setSelectedRecipeName({
          id: firstOutput.id,
          name: firstOutput.name,
          icon: firstOutput.icon,
        });
      }
    } else {
      setAction("Creating");
      setBaseName("");
      setRecipeNameQuery("");
      setDescription("");
      setComponents([]);
      setSelectedRecipeName(null);
    }
  }, [editingRecipe]);

  // Recipe name search using mappingData
  useEffect(() => {
    if (!recipeNameQuery.trim()) {
      setRecipeNameResults([]);
      return;
    }
    const lower = recipeNameQuery.toLowerCase();
    const results: Item[] = Object.entries(mappingData)
      .filter(([, data]) => data.name.toLowerCase().includes(lower))
      .map(([id, data]) => ({
        id: Number(id),
        name: data.name,
        icon: data.icon,
      }))
      .slice(0, 10);
    setRecipeNameResults(results);
  }, [recipeNameQuery, mappingData]);

  const handleSelectRecipeName = (item: Item) => {
    setSelectedRecipeName(item);
    let cleanName = item.name;
    ["Creating ", "Breaking ", "Making "].forEach(prefix => {
      if (cleanName.startsWith(prefix)) {
        cleanName = cleanName.substring(prefix.length);
      }
    });
    setBaseName(cleanName);
    setRecipeNameQuery(item.name);
    setStatus(`✅ Selected recipe: ${item.name}`);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  // Component search using mappingData
  useEffect(() => {
    if (!componentQuery.trim()) {
      setComponentResults([]);
      return;
    }
    const lower = componentQuery.toLowerCase();
    const results: Item[] = Object.entries(mappingData)
      .filter(([, data]) => data.name.toLowerCase().includes(lower))
      .map(([id, data]) => ({
        id: Number(id),
        name: data.name,
        icon: data.icon,
      }))
      .slice(0, 10);
    setComponentResults(results);
  }, [componentQuery, mappingData]);

  const handleAddComponent = (item: Item) => {
    const newComp: RecipeComponent = {
      id: item.id,
      name: item.name,
      icon: item.icon,
      quantity: tempQty,
    };
    setComponents(prev => [...prev, newComp]);
    setStatus(`✅ Added component: ${item.name} x${tempQty}`);
    setComponentQuery('');
    setTempQty(1);
    componentInputRef.current?.focus();
  };

  const handleDeleteComponent = (index: number) => {
    setComponents(prev => prev.filter((_, i) => i !== index));
    setStatus('✅ Removed component.');
    componentInputRef.current?.focus();
  };

  const fullRecipeName = `${action} ${baseName}`.trim();

  const handleCreateOrSaveRecipe = () => {
    if (!selectedRecipeName && baseName.trim() === "") {
      setStatus('⚠️ Please select or enter a valid recipe name.');
      return;
    }
    if (editingRecipe) {
      // Update existing recipe
      setRecipes(prev =>
        prev.map(r =>
          r.id === editingRecipe.id
            ? {
                ...r,
                name: selectedRecipeName
                  ? `${action} ${selectedRecipeName.name.replace(/^(Creating|Breaking|Making)\s+/i, "")}`
                  : fullRecipeName,
                subText: description,
                outputs: [
                  {
                    id: selectedRecipeName ? selectedRecipeName.id : r.id,
                    name: selectedRecipeName
                      ? `${action} ${selectedRecipeName.name.replace(/^(Creating|Breaking|Making)\s+/i, "")}`
                      : fullRecipeName,
                    quantity: 1,
                    icon: selectedRecipeName ? selectedRecipeName.icon : null,
                  },
                ],
                inputs: components,
              }
            : r
        )
      );
      setStatus(`✅ Updated recipe: ${fullRecipeName}`);
      clearEditing();
    } else {
      // Create new recipe
      const newRecipe = {
        id: selectedRecipeName ? selectedRecipeName.id : Date.now(),
        name: selectedRecipeName
          ? `${action} ${selectedRecipeName.name.replace(/^(Creating|Breaking|Making)\s+/i, "")}`
          : fullRecipeName,
        subText: description,
        outputs: [
          {
            id: selectedRecipeName ? selectedRecipeName.id : Date.now(),
            name: selectedRecipeName
              ? `${action} ${selectedRecipeName.name.replace(/^(Creating|Breaking|Making)\s+/i, "")}`
              : fullRecipeName,
            quantity: 1,
            icon: selectedRecipeName ? selectedRecipeName.icon : null,
          },
        ],
        inputs: components,
      };
      setRecipes(prev => [...prev, newRecipe]);
      setStatus(`✅ Created recipe: ${newRecipe.name}`);
    }
    // Reset form
    setSelectedRecipeName(null);
    setRecipeNameQuery("");
    setBaseName("");
    setDescription("");
    setComponents([]);
    setTempQty(1);
    recipeNameInputRef.current?.focus();
  };

  return (
    <div className="recipe-crud-container">
      <h2>{editingRecipe ? 'Edit Recipe' : 'Create Recipe'}</h2>

      {/* Action Selection Radial Buttons (rendered horizontally) */}
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <label style={{ marginRight: '10px' }}>Select Action:</label>
        <label style={{ marginRight: '8px' }}>
          <input
            type="radio"
            name="action"
            value="Creating"
            checked={action === "Creating"}
            onChange={() => setAction("Creating")}
          /> Create
        </label>
        <label style={{ marginRight: '8px' }}>
          <input
            type="radio"
            name="action"
            value="Breaking"
            checked={action === "Breaking"}
            onChange={() => setAction("Breaking")}
          /> Break
        </label>
        <label style={{ marginRight: '8px' }}>
          <input
            type="radio"
            name="action"
            value="Making"
            checked={action === "Making"}
            onChange={() => setAction("Making")}
          /> Make
        </label>
      </div>

      {/* Recipe Name & Description Section */}
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '8px' }}>Recipe Name:</label>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <strong>{action}</strong>
            <ClearableInput
              ref={recipeNameInputRef}
              value={recipeNameQuery || baseName}
              onChange={(val) => {
                let clean = val;
                const prefix = action + " ";
                if (clean.startsWith(prefix)) {
                  clean = clean.substring(prefix.length);
                }
                setBaseName(clean);
                setRecipeNameQuery(val);
              }}
              onClear={() => {
                setRecipeNameQuery("");
                setBaseName("");
              }}
              placeholder="Search recipe name..."
              items={recipeNameResults}
              onSelectItem={handleSelectRecipeName}
              style={{ width: '300px' }}
            />
          </div>
        </div>
        <div>
          <label style={{ marginRight: '8px' }}>Description:</label>
          <input
            type="text"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Enter description..."
            style={{ width: '300px' }}
          />
        </div>
      </div>

      {/* Components Section */}
      <div style={{ marginTop: '20px' }}>
        <h3>Add Components</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '15px' }}>
          <ClearableInput
            ref={componentInputRef}
            value={componentQuery}
            onChange={setComponentQuery}
            onClear={() => setComponentQuery('')}
            placeholder="Search for component..."
            items={componentResults}
            onSelectItem={handleAddComponent}
            style={{ width: '200px' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ marginRight: '6px' }}>Qty x</label>
            <input
              type="number"
              min="1"
              value={tempQty}
              onChange={(e) => setTempQty(Number(e.target.value))}
              style={{ width: '80px' }}
            />
          </div>
          <button
            onClick={() => {
              setStatus('⚠️ Please select a component from the dropdown.');
              componentInputRef.current?.focus();
            }}
          >
            + Add Component
          </button>
        </div>
        <div className="recipe-crud-table-container">
          <table className="recipe-table">
            <thead>
              <tr style={{ background: '#444' }}>
                <th>ID</th>
                <th>Name</th>
                <th>Quantity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {components.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>
                    No components added yet
                  </td>
                </tr>
              ) : (
                components.map((comp, index) => (
                  <tr key={`${comp.id}-${index}`}>
                    <td style={{ padding: '8px', border: '1px solid #555' }}>{comp.id}</td>
                    <td style={{ padding: '8px', border: '1px solid #555' }}>
                      {comp.icon && (
                        <img
                          src={comp.icon}
                          alt="icon"
                          style={{ width: '24px', height: '24px', objectFit: 'contain', marginRight: '4px' }}
                        />
                      )}
                      {comp.name}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #555' }}>
                      <input
                        type="number"
                        min="1"
                        value={comp.quantity}
                        onChange={(e) => {
                          const newQty = Number(e.target.value) || 1;
                          setComponents(prev =>
                            prev.map((c, i) => (i === index ? { ...c, quantity: newQty } : c))
                          );
                        }}
                        style={{ width: '60px' }}
                      />
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #555' }}>
                      <button onClick={() => handleDeleteComponent(index)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Save Recipe Button */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button onClick={handleCreateOrSaveRecipe}>
          {editingRecipe ? 'Save Recipe' : 'Create Recipe'}
        </button>
      </div>

      {/* Download Button */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          onClick={() => {
            // Use _recipes (the local recipes passed in) for download
            const dataStr = JSON.stringify(_recipes, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'recipes.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            setStatus('✅ Download initiated for recipes.json');
          }}
        >
          Download Recipes.json
        </button>
      </div>
    </div>
  );
};

export default RecipeCRUD;
