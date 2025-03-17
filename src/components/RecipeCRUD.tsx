// src/components/RecipeCRUD.tsx
import React, { useState, useEffect, useRef, FocusEvent } from 'react';
import ClearableInput from './ClearableInput';
import { RecipeComponent, Item, RecipeCRUDProps } from '../types';
import { parseKMB, formatKMB } from '../utilities/quantities';

const RecipeCRUD: React.FC<Pick<RecipeCRUDProps, 'setRecipes' | 'setStatus' | 'mappingData'>> = ({
  setRecipes,
  setStatus,
  mappingData,
}) => {
  // Custom action inputs
  const [customActionPrefix, setCustomActionPrefix] = useState("");
  const [customActionSuffix, setCustomActionSuffix] = useState("");
  const customActionPrefixRef = useRef<HTMLInputElement>(null);

  const [baseName, setBaseName] = useState("");

  // Recipe Name / Description
  const [recipeNameQuery, setRecipeNameQuery] = useState("");
  const [recipeNameResults, setRecipeNameResults] = useState<Item[]>([]);
  const [selectedRecipeName, setSelectedRecipeName] = useState<Item | null>(null);
  const [description, setDescription] = useState("");

  // Output Quantity state (for recipe output in normal mode)
  const [outputQty, setOutputQty] = useState<string>("1");

  // Components
  const [componentQuery, setComponentQuery] = useState("");
  const [componentResults, setComponentResults] = useState<Item[]>([]);
  const [components, setComponents] = useState<RecipeComponent[]>([]);
  const [tempQty, setTempQty] = useState<string>("1");
  const [pendingComponent, setPendingComponent] = useState<Item | null>(null);

  // Breaking mode toggle (for create form only)
  const [isBreakingMode, setIsBreakingMode] = useState<boolean>(false);

  const recipeNameInputRef = useRef<HTMLInputElement>(null);
  const componentInputRef = useRef<HTMLInputElement>(null);

  // --- FILTER RECIPE NAMES ---
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
    const nameWithoutId = item.name.replace(/\s+\(ID:.*\)$/, '');
    setSelectedRecipeName({ ...item, name: nameWithoutId });
    setBaseName(nameWithoutId);
    setRecipeNameQuery(item.name);
    setStatus(`✅ Selected recipe: ${item.name}`);
  };

  // --- FILTER COMPONENTS ---
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

  // Helper: get a component's icon.
  const getComponentIcon = (comp: RecipeComponent): string => {
    return comp.icon || mappingData[comp.id]?.icon || "";
  };

  // Helper: format quantity for components.
  const formatQuantity = (comp: RecipeComponent): string => {
    if (comp.id === 995) {
      return comp.quantity.toLocaleString() + " gp";
    }
    return formatKMB(comp.quantity);
  };

  // + Add Component button.
  const handleAddComponent = () => {
    if (pendingComponent) {
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

  // Delete button for each component row.
  const handleDeleteComponent = (index: number) => {
    setComponents(prev => prev.filter((_, i) => i !== index));
    setStatus('✅ Removed component.');
    componentInputRef.current?.focus();
  };

  // K/M/B quantity input handlers.
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

  // Construct final recipe name.
  const constructFinalRecipeName = () => {
    return `${customActionPrefix.trim()} ${baseName.trim()} ${customActionSuffix.trim()}`.trim();
  };

  const handleCreateRecipe = () => {
    // Re-validation: in both modes, the recipe name must not be empty.
    if (baseName.trim() === "") {
      setStatus('⚠️ Please enter a valid recipe name.');
      recipeNameInputRef.current?.focus();
      return;
    }
    // Re-validation: the custom action prefix is mandatory regardless of mode.
    if (!customActionPrefix.trim()) {
      setStatus('⚠️ Please enter a custom action prefix.');
      customActionPrefixRef.current?.focus();
      return;
    }
    // Ensure at least one component is added.
    if (components.length === 0) {
      setStatus('⚠️ Please add at least one component.');
      componentInputRef.current?.focus();
      return;
    }

    const recipeId = selectedRecipeName ? selectedRecipeName.id : Date.now();
    const finalRecipeName = constructFinalRecipeName();

    let newRecipe;
    if (isBreakingMode) {
      // Breaking mode: the recipe name is used as the input (set item), and components become outputs.
      newRecipe = {
        id: recipeId,
        name: finalRecipeName,
        subText: description,
        customActionPrefix: customActionPrefix.trim(),
        customActionSuffix: customActionSuffix.trim(),
        inputs: [
          {
            id: recipeId,
            name: finalRecipeName,
            quantity: 1,
            // In breaking mode, use the icon from mappingData for input.
            icon: mappingData[recipeId]?.icon || null,
          },
        ],
        outputs: components.map(comp => ({ ...comp })),
      };
    } else {
      // Normal mode.
      newRecipe = {
        id: recipeId,
        name: finalRecipeName,
        subText: description,
        customActionPrefix: customActionPrefix.trim(),
        customActionSuffix: customActionSuffix.trim(),
        outputs: [
          {
            id: selectedRecipeName ? selectedRecipeName.id : recipeId,
            name: finalRecipeName,
            quantity: parseKMB(outputQty),
            icon: selectedRecipeName ? selectedRecipeName.icon : null,
          },
        ],
        inputs: components.map(comp => ({
          ...comp,
          name: comp.name || (mappingData[comp.id] ? mappingData[comp.id].name : ""),
        })),
      };
    }

    setRecipes(prev => [...prev, newRecipe]);
    setStatus(`✅ Created recipe: ${finalRecipeName}`);

    // Reset form.
    setSelectedRecipeName(null);
    setRecipeNameQuery('');
    setBaseName('');
    setDescription('');
    setComponents([]);
    setTempQty("1");
    recipeNameInputRef.current?.focus();

    setCustomActionPrefix("");
    setCustomActionSuffix("");
    setOutputQty("1");
  };

  return (
    <div style={{ marginBottom: '40px' }}>
      <h2>Create Recipe</h2>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ marginRight: '10px' }}>
          <input
            type="checkbox"
            checked={isBreakingMode}
            onChange={(e) => setIsBreakingMode(e.target.checked)}
          />{" "}
          Breaking Mode
        </label>
      </div>

      {/* Top Row: Custom Action Prefix, Recipe Name (ClearableInput), Custom Action Suffix, Output Quantity (normal mode only) */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '15px' }}>
        {/* Custom Action Prefix */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Custom Action Prefix</label>
          <input
            type="text"
            value={customActionPrefix}
            onChange={(e) => setCustomActionPrefix(e.target.value)}
            placeholder="e.g., Making"
            style={{ width: '150px', padding: '8px', borderRadius: '5px' }}
            ref={customActionPrefixRef}
          />
        </div>

        {/* Recipe Name (ClearableInput) */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Recipe Name</label>
          <ClearableInput
            ref={recipeNameInputRef}
            value={recipeNameQuery || baseName}
            onChange={(val) => {
              setBaseName(val);
              setRecipeNameQuery(val);
            }}
            onClear={() => {
              setRecipeNameQuery('');
              setBaseName('');
            }}
            placeholder={isBreakingMode ? "Enter set name..." : "Search recipe name..."}
            items={recipeNameResults}
            onSelectItem={handleSelectRecipeName}
            style={{ width: '220px' }}
          />
        </div>

        {/* Custom Action Suffix */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Custom Action Suffix</label>
          <input
            type="text"
            value={customActionSuffix}
            onChange={(e) => setCustomActionSuffix(e.target.value)}
            placeholder="with large ammo mould"
            style={{ width: '150px', padding: '8px', borderRadius: '5px' }}
          />
        </div>

        {/* Output Quantity (only in normal mode) */}
        {!isBreakingMode && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Qty x</label>
            <input
              type="text"
              value={outputQty}
              onChange={(e) => setOutputQty(e.target.value)}
              onFocus={(e) => {
                const numericValue = parseKMB(e.target.value);
                e.target.value = numericValue.toString();
                setOutputQty(numericValue.toString());
              }}
              onBlur={(e) => {
                const num = parseKMB(e.target.value);
                e.target.value = formatKMB(num);
                setOutputQty(e.target.value);
              }}
              placeholder="e.g., 1"
              style={{ width: '80px', padding: '8px', borderRadius: '5px' }}
            />
          </div>
        )}
      </div>

      {/* Description Field */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Enter description..."
          style={{ width: '100%', maxWidth: '400px', padding: '3px', borderRadius: '5px' }}
        />
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
            onBlur={(e) => handleQtyBlur(e)}
            style={{ width: '80px', padding: '6px', borderRadius: '5px' }}
          />
        </div>
        <button className="btn-add" onClick={handleAddComponent}>
          + Add Component
        </button>
      </div>

      {/* Components Table */}
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
