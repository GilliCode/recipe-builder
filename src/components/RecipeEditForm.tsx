// src/components/RecipeEditForm.tsx
import React, { useState, useEffect, useRef, FocusEvent } from 'react';
import ClearableInput from './ClearableInput';
import { Recipe, RecipeComponent, Item } from '../types';
import { parseKMB, formatKMB } from '../utilities/quantities';

interface RecipeEditFormProps {
  initialRecipe: Recipe;
  onSave: (updated: Recipe) => void;
  onCancel: () => void;
  mappingData: Record<number, { name: string; icon: string | null }>;
}

// Function declaration for auto-detecting breaking mode.
function isInitialBreaking(recipe: Recipe): boolean {
  return recipe.customActionPrefix?.toLowerCase().includes("breaking") ||
         recipe.name.toLowerCase().includes("breaking");
}

const RecipeEditForm: React.FC<RecipeEditFormProps> = ({
  initialRecipe,
  onSave,
  onCancel,
  mappingData,
}) => {
  // Remove custom action prefix/suffix from recipe name to get base name.
  let initialBaseName = initialRecipe.name;
  if (initialRecipe.customActionPrefix) {
    initialBaseName = initialBaseName.replace(initialRecipe.customActionPrefix, '').trim();
  }
  if (initialRecipe.customActionSuffix) {
    initialBaseName = initialBaseName.replace(initialRecipe.customActionSuffix, '').trim();
  }

  // Lock in breaking mode once the modal opens.
  const [isBreakingMode] = useState<boolean>(isInitialBreaking(initialRecipe));

  // Recipe name: in normal mode, it's read-only; in breaking mode, it's editable via ClearableInput.
  const [recipeName, setRecipeName] = useState(initialBaseName);
  const [description, setDescription] = useState(initialRecipe.subText);

  // Components: In normal mode, use initialRecipe.inputs; in breaking mode, use initialRecipe.outputs.
  const [components, setComponents] = useState<RecipeComponent[]>(
    isInitialBreaking(initialRecipe) ? initialRecipe.outputs : initialRecipe.inputs
  );

  // For adding new components.
  const [componentQuery, setComponentQuery] = useState("");
  const [componentResults, setComponentResults] = useState<Item[]>([]);
  const [pendingComponent, setPendingComponent] = useState<Item | null>(null);
  const componentInputRef = useRef<HTMLInputElement>(null);

  // Custom action inputs.
  const [customActionPrefix, setCustomActionPrefix] = useState(initialRecipe.customActionPrefix || "");
  const [customActionSuffix, setCustomActionSuffix] = useState(initialRecipe.customActionSuffix || "");
  const customActionPrefixRef = useRef<HTMLInputElement>(null);

  // Output quantity state (used in normal mode only).
  const [outputQty, setOutputQty] = useState<string>(
    initialRecipe.outputs[0]?.quantity?.toString() || "1"
  );

  // Simple status message.
  const [statusMessage, setStatusMessage] = useState('');

  // --- SEARCH LOGIC for new components ---
  useEffect(() => {
    if (!componentQuery.trim()) {
      setComponentResults([]);
      return;
    }
    const lower = componentQuery.toLowerCase();
    const results: Item[] = Object.entries(mappingData)
      .filter(([id, data]) =>
        data.name.toLowerCase().includes(lower) || String(id).includes(lower)
      )
      .map(([id, data]) => ({
        id: Number(id),
        name: `${data.name} (ID: ${id})`,
        icon: data.icon,
      }))
      .slice(0, 10);
    setComponentResults(results);
  }, [componentQuery, mappingData]);

  const handleAddPendingComponent = () => {
    if (pendingComponent) {
      const compName = pendingComponent.name.replace(/\s+\(ID:.*\)$/, '');
      const newComp: RecipeComponent = {
        id: pendingComponent.id,
        name: compName,
        icon: pendingComponent.icon,
        quantity: 1,
      };
      setComponents(prev => [...prev, newComp]);
      setStatusMessage(`✅ Added component: ${compName}`);
      setPendingComponent(null);
      setComponentQuery('');
      componentInputRef.current?.focus();
    } else {
      setStatusMessage('⚠️ Please select a component from the dropdown.');
      componentInputRef.current?.focus();
    }
  };

  // Event handlers for component quantity – now used in the components table.
  const handleQuantityFocus = (e: FocusEvent<HTMLInputElement>) => {
    const currentVal = e.target.value;
    const num = parseKMB(currentVal);
    e.target.value = num.toString();
  };

  const handleQuantityBlur = (e: FocusEvent<HTMLInputElement>, index: number) => {
    const raw = e.target.value;
    const num = parseKMB(raw);
    setComponents(prev => prev.map((c, i) => i === index ? { ...c, quantity: num } : c));
    e.target.value = formatKMB(num);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const raw = e.target.value;
    const num = parseKMB(raw);
    setComponents(prev => prev.map((c, i) => i === index ? { ...c, quantity: num } : c));
  };

  const handleSave = () => {
    // Re-validation: in both modes, recipe name must not be empty.
    if (recipeName.trim() === "") {
      setStatusMessage('⚠️ Recipe name cannot be empty.');
      return;
    }
    // In normal mode, customActionPrefix is mandatory.
    if (!isBreakingMode && !customActionPrefix.trim()) {
      setStatusMessage('⚠️ Please enter a custom action prefix.');
      customActionPrefixRef.current?.focus();
      return;
    }
    // Ensure at least one component is added.
    if (components.length === 0) {
      setStatusMessage('⚠️ Please add at least one component.');
      componentInputRef.current?.focus();
      return;
    }
    const finalRecipeName = `${customActionPrefix.trim()} ${recipeName.trim()} ${customActionSuffix.trim()}`.trim();

    let updatedRecipe;
    if (isBreakingMode) {
      // Breaking mode: recipe name becomes the input (set item), components remain as outputs.
      updatedRecipe = {
        ...initialRecipe,
        name: finalRecipeName,
        subText: description,
        customActionPrefix: customActionPrefix.trim(),
        customActionSuffix: customActionSuffix.trim(),
        inputs: [
          {
            id: initialRecipe.id,
            name: finalRecipeName,
            quantity: 1,
            // For breaking mode, use the icon from initialRecipe.inputs or fallback to mappingData.
            icon: initialRecipe.inputs[0]?.icon || mappingData[initialRecipe.inputs[0]?.id || 0]?.icon || '',
          },
        ],
        outputs: components.map(comp => ({ ...comp })),
      };
    } else {
      // Normal mode.
      updatedRecipe = {
        ...initialRecipe,
        name: finalRecipeName,
        subText: description,
        customActionPrefix: customActionPrefix.trim(),
        customActionSuffix: customActionSuffix.trim(),
        outputs: initialRecipe.outputs.map(out => ({
          ...out,
          name: finalRecipeName,
          quantity: parseKMB(outputQty),
        })),
        inputs: components.map(comp => ({
          ...comp,
          name: comp.name || (mappingData[comp.id] ? mappingData[comp.id].name : ""),
        })),
      };
    }
    onSave(updatedRecipe);
  };

  const getRecipeIcon = () => {
    if (isBreakingMode) {
      return initialRecipe.inputs[0]?.icon || mappingData[initialRecipe.inputs[0]?.id || 0]?.icon || '';
    }
    return initialRecipe.outputs[0]?.icon || mappingData[initialRecipe.outputs[0]?.id || 0]?.icon || '';
  };

  const getComponentIcon = (comp: RecipeComponent) => {
    return comp.icon || mappingData[comp.id]?.icon || '';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Recipe</h2>

        {/* Custom Action Prefix */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Custom Action Prefix</label>
          <input
            type="text"
            value={customActionPrefix}
            onChange={(e) => setCustomActionPrefix(e.target.value)}
            placeholder="e.g., Breaking"
            ref={customActionPrefixRef}
            style={{ width: '150px', padding: '8px', borderRadius: '5px' }}
          />
        </div>

        {/* Recipe Name & Output Quantity Row */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '15px' }}>
          <div style={{ width: '220px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Recipe Name</label>
            {isBreakingMode ? (
              <ClearableInput
                value={recipeName}
                onChange={(val) => setRecipeName(val)}
                onClear={() => setRecipeName('')}
                placeholder="Enter set name..."
                items={[]} // Optionally, enable search here by passing items if desired.
                onSelectItem={() => {}}
                style={{ width: '220px' }}
              />
            ) : (
              <div className="icon-input-wrapper" style={{ width: '220px' }}>
                {getRecipeIcon() && (
                  <img src={getRecipeIcon()} alt="icon" className="icon-input-icon" />
                )}
                <input
                  type="text"
                  value={recipeName}
                  readOnly
                  className="icon-input-field"
                  style={{ width: '220px' }}
                />
              </div>
            )}
          </div>
          {!isBreakingMode && (
            <div style={{ width: '80px' }}>
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

        {/* Custom Action Suffix */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Custom Action Suffix</label>
          <input
            type="text"
            value={customActionSuffix}
            onChange={(e) => setCustomActionSuffix(e.target.value)}
            placeholder="with large ammo mould"
            style={{ width: '150px', padding: '8px', borderRadius: '5px' }}
          />
        </div>

        {/* Description */}
        <div className="form-group full-width" style={{ marginBottom: '15px' }}>
          <label>Description:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="E.g., 'No Diary' means higher cost"
          />
        </div>

        {/* Components Section */}
        <div className="form-group full-width">
          <label>Components:</label>
          <div className="component-add-section">
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
            <button className="btn-add add-component-btn" onClick={handleAddPendingComponent}>
              + Add Component
            </button>
          </div>

          <div className="components-table-container">
            <table>
              <thead>
                <tr>
                  <th>Component Name</th>
                  <th>Quantity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {components.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center' }}>
                      No components added.
                    </td>
                  </tr>
                ) : (
                  components.map((comp, index) => {
                    const compName = comp.name || mappingData[comp.id]?.name || '';
                    const iconUrl = getComponentIcon(comp);
                    const displayVal = formatKMB(comp.quantity);
                    return (
                      <tr key={`${comp.id}-${index}`}>
                        <td>
                          <div className="icon-input-wrapper">
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
                            defaultValue={displayVal}
                            onFocus={(e) => handleQuantityFocus(e)}
                            onBlur={(e) => handleQuantityBlur(e, index)}
                            onChange={(e) => handleQuantityChange(e, index)}
                            placeholder="Qty"
                            style={{ width: '60px' }}
                          />
                        </td>
                        <td>
                          <button className="btn-delete" onClick={() => {
                            setComponents(prev => prev.filter((_, i) => i !== index));
                          }}>
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
        </div>

        {statusMessage && (
          <div className="form-status">
            {statusMessage}
          </div>
        )}

        <div className="modal-actions">
          <button onClick={handleSave} className="btn-save save-btn">Save</button>
          <button onClick={onCancel} className="btn-cancel cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default RecipeEditForm;
