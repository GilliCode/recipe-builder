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

const RecipeEditForm: React.FC<RecipeEditFormProps> = ({
  initialRecipe,
  onSave,
  onCancel,
  mappingData,
}) => {
  const [recipeName, setRecipeName] = useState(initialRecipe.name);
  const [description, setDescription] = useState(initialRecipe.subText);
  const [components, setComponents] = useState<RecipeComponent[]>(initialRecipe.inputs);

  // For adding new components
  const [componentQuery, setComponentQuery] = useState("");
  const [componentResults, setComponentResults] = useState<Item[]>([]);
  const [pendingComponent, setPendingComponent] = useState<Item | null>(null);
  const componentInputRef = useRef<HTMLInputElement>(null);

  // Simple status message
  const [statusMessage, setStatusMessage] = useState('');

  // Search logic for new components (by name or id)
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
      // Remove " (ID: ...)" suffix from the displayed name
      const compName = pendingComponent.name.replace(/\s+\(ID:.*\)$/, '');
      const newComp: RecipeComponent = {
        id: pendingComponent.id,
        name: compName,
        icon: pendingComponent.icon,
        quantity: 1,
      };
      setComponents(prev => [...prev, newComp]);
      setStatusMessage(`Added component: ${compName}`);
      setPendingComponent(null);
      setComponentQuery('');
      componentInputRef.current?.focus();
    } else {
      setStatusMessage('Please select a component from the dropdown.');
      componentInputRef.current?.focus();
    }
  };

  // K/M/B quantity input handlers
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
    const updated: Recipe = {
      ...initialRecipe,
      name: recipeName,
      subText: description,
      inputs: components.map(comp => {
        if (!comp.name && mappingData[comp.id]) {
          return { ...comp, name: mappingData[comp.id].name };
        }
        return comp;
      }),
      outputs: initialRecipe.outputs.map(out => ({ ...out, name: recipeName })),
    };
    onSave(updated);
  };

  const getRecipeIcon = () => {
    return initialRecipe.outputs[0]?.icon || mappingData[initialRecipe.outputs[0]?.id || 0]?.icon || '';
  };

  const getComponentIcon = (comp: RecipeComponent) => {
    return comp.icon || mappingData[comp.id]?.icon || '';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Recipe</h2>

        <div className="edit-form-grid">
          {/* Recipe Name Field */}
          <div className="form-group">
            <label>Recipe Name:</label>
            <div className="icon-input-wrapper">
              {getRecipeIcon() && (
                <img src={getRecipeIcon()} alt="icon" className="icon-input-icon" />
              )}
              <input
                type="text"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder="Enter recipe name"
                className="icon-input-field"
                style={{ width: '220px' }}
              />
            </div>
          </div>

          {/* Description Field */}
          <div className="form-group full-width">
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
                      const icon = getComponentIcon(comp);
                      const displayVal = formatKMB(comp.quantity);
                      return (
                        <tr key={`${comp.id}-${index}`}>
                          <td>
                            <div className="icon-input-wrapper">
                              {icon && (
                                <img src={icon} alt="icon" className="icon-input-icon" />
                              )}
                              <input
                                type="text"
                                readOnly
                                value={comp.name || mappingData[comp.id]?.name || ''}
                                style={{
                                  width: '180px',
                                  padding: icon ? '3px 3px 3px 24px' : '3px',
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
        </div>

        {statusMessage && (
          <div className="form-status">
            {statusMessage}
            {pendingComponent?.icon && (
              <img src={pendingComponent.icon} alt="icon" className="item-icon inline-icon" />
            )}
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
