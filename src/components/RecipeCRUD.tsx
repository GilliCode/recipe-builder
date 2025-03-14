// src/components/RecipeCRUD.tsx
import React, { useState, useEffect, useRef, FocusEvent } from 'react';
import ClearableInput from './ClearableInput';
import { RecipeComponent, Item, RecipeCRUDProps } from '../types';
import { parseKMB, formatKMB } from '../utilities/quantities';

type ActionPrefix = "Creating" | "Breaking" | "Making";

const RecipeCRUD: React.FC<Pick<RecipeCRUDProps, 'setRecipes' | 'setStatus' | 'mappingData'>> = ({
  setRecipes,
  setStatus,
  mappingData,
}) => {
  const [action, setAction] = useState<ActionPrefix>("Creating");
  const [baseName, setBaseName] = useState("");

  // Recipe Name / Description
  const [recipeNameQuery, setRecipeNameQuery] = useState("");
  const [recipeNameResults, setRecipeNameResults] = useState<Item[]>([]);
  const [selectedRecipeName, setSelectedRecipeName] = useState<Item | null>(null);
  const [description, setDescription] = useState("");

  // Components
  const [componentQuery, setComponentQuery] = useState("");
  const [componentResults, setComponentResults] = useState<Item[]>([]);
  const [components, setComponents] = useState<RecipeComponent[]>([]);
  const [tempQty, setTempQty] = useState<string>("1");
  const [pendingComponent, setPendingComponent] = useState<Item | null>(null);

  const recipeNameInputRef = useRef<HTMLInputElement>(null);
  const componentInputRef = useRef<HTMLInputElement>(null);

  // Filter recipe names from mappingData (search by name or ID)
  useEffect(() => {
    if (!recipeNameQuery.trim()) {
      setRecipeNameResults([]);
      return;
    }
    const lower = recipeNameQuery.toLowerCase();
    setRecipeNameResults(
      Object.entries(mappingData)
        .filter(([id, data]) =>
          data.name.toLowerCase().includes(lower) ||
          id.toString().includes(lower)
        )
        .map(([id, data]) => ({
          id: Number(id),
          name: `${data.name} (ID: ${id})`,
          icon: data.icon,
        }))
        .slice(0, 10)
    );
  }, [recipeNameQuery, mappingData]);

  const handleSelectRecipeName = (item: Item) => {
    // Remove the " (ID: ...)" suffix for internal processing
    const nameWithoutId = item.name.replace(/\s+\(ID:.*\)$/, '');
    setSelectedRecipeName({ ...item, name: nameWithoutId });
    setBaseName(nameWithoutId);
    setRecipeNameQuery(item.name);
    setStatus(`✅ Selected recipe: ${item.name}`);
  };

  // Filter components from mappingData (search by name or ID)
  useEffect(() => {
    if (!componentQuery.trim()) {
      setComponentResults([]);
      return;
    }
    const lower = componentQuery.toLowerCase();
    setComponentResults(
      Object.entries(mappingData)
        .filter(([id, data]) =>
          data.name.toLowerCase().includes(lower) ||
          id.toString().includes(lower)
        )
        .map(([id, data]) => ({
          id: Number(id),
          name: `${data.name} (ID: ${id})`,
          icon: data.icon,
        }))
        .slice(0, 10)
    );
  }, [componentQuery, mappingData]);

  // Helper to get a component's icon
  const getComponentIcon = (comp: RecipeComponent): string => {
    return comp.icon || mappingData[comp.id]?.icon || "";
  };

  // Helper: Format quantity based on item ID.
  // If the component represents coins (ID 995), display using toLocaleString plus " gp".
  const formatQuantity = (comp: RecipeComponent): string => {
    if (comp.id === 995) {
      return comp.quantity.toLocaleString() + " gp";
    }
    return formatKMB(comp.quantity);
  };

  // "+ Add Component" button: adds pendingComponent only on button click
  const handleAddComponent = () => {
    if (pendingComponent) {
      // Remove " (ID: ...)" from displayed name
      const compName = pendingComponent.name.replace(/\s+\(ID:.*\)$/, '');
      const qtyNum = parseKMB(tempQty);
      const newComp: RecipeComponent = {
        id: pendingComponent.id,
        name: compName,
        icon: pendingComponent.icon,
        quantity: qtyNum,
      };
      setComponents(prev => [...prev, newComp]);
      setStatus(`✅ Added component: ${compName}`);
      setPendingComponent(null);
      setComponentQuery('');
      setTempQty("1");
      componentInputRef.current?.focus();
    } else {
      setStatus('⚠️ Please select a component from the dropdown.');
      componentInputRef.current?.focus();
    }
  };

  // Delete component function (now reinstated)
  const handleDeleteComponent = (index: number) => {
    setComponents(prev => prev.filter((_, i) => i !== index));
    setStatus('✅ Removed component.');
    componentInputRef.current?.focus();
  };

  // K/M/B quantity input handlers
  const handleQtyBlur = (e: FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const num = parseKMB(rawValue);
    e.target.value = formatKMB(num);
    setTempQty(e.target.value);
  };

  const handleQtyFocus = (e: FocusEvent<HTMLInputElement>) => {
    const numericValue = parseKMB(e.target.value);
    e.target.value = numericValue.toString();
    setTempQty(numericValue.toString());
  };

  // Combine action prefix with base name
  const fullRecipeName = `${action} ${baseName}`.trim();

  const handleCreateRecipe = () => {
    if (!selectedRecipeName && baseName.trim() === "") {
      setStatus('⚠️ Please select a recipe name from the dropdown or enter a valid name.');
      return;
    }
    const recipeId = selectedRecipeName ? selectedRecipeName.id : Date.now();
    const finalRecipeName = selectedRecipeName
      ? `${action} ${selectedRecipeName.name.replace(/^(Creating|Breaking|Making)\s+/i, "").replace(/\s+\(ID:.*\)$/, "")}`
      : fullRecipeName;

    const newRecipe = {
      id: recipeId,
      name: finalRecipeName,
      subText: description,
      outputs: [
        {
          id: selectedRecipeName ? selectedRecipeName.id : recipeId,
          name: finalRecipeName,
          quantity: 1,
          icon: selectedRecipeName ? selectedRecipeName.icon : null,
        },
      ],
      inputs: components.map(comp => {
        if (!comp.name && mappingData[comp.id]) {
          return { ...comp, name: mappingData[comp.id].name };
        }
        return comp;
      }),
    };

    setRecipes(prev => [...prev, newRecipe]);
    setStatus(`✅ Created recipe: ${finalRecipeName}`);
    // Reset form
    setSelectedRecipeName(null);
    setRecipeNameQuery('');
    setBaseName('');
    setDescription('');
    setComponents([]);
    setTempQty("1");
    recipeNameInputRef.current?.focus();
  };

  return (
    <div style={{ marginBottom: '40px' }}>
      <h2>Create Recipe</h2>

      {/* Action Selection */}
      <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <label>Action:</label>
        <div style={{ display: 'inline-flex', gap: '1rem', alignItems: 'center' }}>
          <label>
            <input
              type="radio"
              name="action"
              value="Creating"
              checked={action === "Creating"}
              onChange={() => setAction("Creating")}
            /> Create
          </label>
          <label>
            <input
              type="radio"
              name="action"
              value="Breaking"
              checked={action === "Breaking"}
              onChange={() => setAction("Breaking")}
            /> Break
          </label>
          <label>
            <input
              type="radio"
              name="action"
              value="Making"
              checked={action === "Making"}
              onChange={() => setAction("Making")}
            /> Make
          </label>
        </div>
      </div>

      {/* Recipe Name & Description */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Recipe Name</label>
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
              setRecipeNameQuery('');
              setBaseName('');
            }}
            placeholder="Search recipe name..."
            items={recipeNameResults}
            onSelectItem={handleSelectRecipeName}
            style={{ width: '200px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Enter description..."
            style={{ width: '200px', padding: '3px', borderRadius: '5px' }}
          />
        </div>
      </div>

      {/* Components Section */}
      <label style={{ display: 'block', marginBottom: '5px' }}>Add Components</label>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '15px' }}>
        <div>
          <ClearableInput
            ref={componentInputRef}
            value={componentQuery}
            onChange={setComponentQuery}
            onClear={() => {
              setComponentQuery('');
              setPendingComponent(null);
            }}
            placeholder="Search for component..."
            items={componentResults}
            onSelectItem={(item: Item) => setPendingComponent(item)}
            style={{ width: '200px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Qty x</span>
          <input
            type="text"
            value={tempQty}
            onChange={(e) => setTempQty(e.target.value)}
            onFocus={handleQtyFocus}
            onBlur={handleQtyBlur}
            style={{ width: '80px', padding: '6px', borderRadius: '5px' }}
          />
        </div>
        <button className="btn-add" onClick={handleAddComponent}>
          + Add Component
        </button>
      </div>

      {/* Components Table (ID column removed) */}
      <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '15px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {components.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center' }}>
                  No components added yet
                </td>
              </tr>
            ) : (
              components.map((comp, index) => {
                const compName = comp.name || mappingData[comp.id]?.name || "Unknown";
                const iconUrl = getComponentIcon(comp);
                return (
                  <tr key={`${comp.id}-${index}`}>
                    <td>
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
                          value={compName}
                          style={{
                            width: '180px',
                            padding: iconUrl ? '3px 3px 3px 24px' : '3px',
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        readOnly
                        value={formatQuantity(comp)}
                        style={{ width: '80px', padding: '3px' }}
                      />
                    </td>
                    <td>
                      <button className="btn-delete" onClick={() => handleDeleteComponent(index)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <button className="btn-create" onClick={handleCreateRecipe} style={{ marginBottom: '20px' }}>
        Create Recipe
      </button>
    </div>
  );
};

export default RecipeCRUD;
