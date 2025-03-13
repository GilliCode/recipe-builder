import React, { useState, useEffect, useRef } from 'react';
import ClearableInput from './ClearableInput';
import type { Recipe, RecipeComponent, Item } from '../types';

type ActionPrefix = "Creating" | "Breaking" | "Making";

interface RecipeEditFormProps {
  initialRecipe: Recipe;
  onSave: (updated: Recipe) => void;
  onCancel: () => void;
  mappingData: Record<number, { name: string; icon: string | null }>;
}

const RecipeEditForm: React.FC<RecipeEditFormProps> = ({ initialRecipe, onSave, onCancel, mappingData }) => {
  const [action, setAction] = useState<ActionPrefix>("Creating");
  const [baseName, setBaseName] = useState("");
  const [description, setDescription] = useState(initialRecipe.subText);
  const [components, setComponents] = useState<RecipeComponent[]>(initialRecipe.inputs);

  const [componentQuery, setComponentQuery] = useState("");
  const [componentResults, setComponentResults] = useState<Item[]>([]);
  const componentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const name = initialRecipe.name;
    if (name.startsWith("Breaking ")) {
      setAction("Breaking");
      setBaseName(name.replace(/^Breaking\s+/i, ""));
    } else if (name.startsWith("Making ")) {
      setAction("Making");
      setBaseName(name.replace(/^Making\s+/i, ""));
    } else if (name.startsWith("Creating ")) {
      setAction("Creating");
      setBaseName(name.replace(/^Creating\s+/i, ""));
    } else {
      setBaseName(name);
    }
  }, [initialRecipe]);

  // Search for new components using mappingData
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
      quantity: 1,
    };
    setComponents(prev => [...prev, newComp]);
    setComponentQuery('');
    componentInputRef.current?.focus();
  };

  const handleDeleteComponent = (index: number) => {
    setComponents(prev => prev.filter((_, i) => i !== index));
  };

  const fullRecipeName = `${action} ${baseName}`.trim();

  const handleSave = () => {
    const updated: Recipe = {
      ...initialRecipe,
      name: fullRecipeName,
      subText: description,
      inputs: components,
      outputs: initialRecipe.outputs.map(out => ({
        ...out,
        name: fullRecipeName,
      })),
    };
    onSave(updated);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Edit Recipe</h3>
        {/* Action Selection */}
        <div style={{ marginBottom: '10px', textAlign: 'center' }}>
          <label style={{ marginRight: '10px' }}>Action:</label>
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
        {/* Recipe Name */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '8px' }}>Recipe Name:</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 'bold', marginRight: '4px' }}>{action}</span>
            <input
              type="text"
              value={baseName}
              onChange={e => setBaseName(e.target.value)}
              style={{ flex: 1, padding: '6px', borderRadius: '4px' }}
            />
          </div>
        </div>
        {/* Description */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '8px' }}>Description:</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ width: '100%', padding: '6px', borderRadius: '4px' }}
          />
        </div>
        {/* Components */}
        <div style={{ marginBottom: '10px' }}>
          <label>Components:</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
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
          </div>
          <div style={{ border: '1px solid #555', maxHeight: '150px', overflowY: 'auto', marginTop: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#444' }}>
                  <th style={{ padding: '8px', border: '1px solid #555' }}>ID</th>
                  <th style={{ padding: '8px', border: '1px solid #555' }}>Name</th>
                  <th style={{ padding: '8px', border: '1px solid #555' }}>Quantity</th>
                  <th style={{ padding: '8px', border: '1px solid #555' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {components.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '8px', border: '1px solid #555', textAlign: 'center' }}>
                      No components
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
        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="save-btn" onClick={handleSave}>Save</button>
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default RecipeEditForm;
