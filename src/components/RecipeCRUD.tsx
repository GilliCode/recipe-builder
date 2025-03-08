import React, { useState } from 'react';
import ClearableInput, { Item } from './ClearableInput';
import { Recipe, RecipeComponent } from '../types';

interface RecipeCRUDProps {
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  itemData: Item[];
}

const RecipeCRUD: React.FC<RecipeCRUDProps> = ({ recipes, setRecipes, setStatus, itemData }) => {
  const [recipeName, setRecipeName] = useState('');
  const [components, setComponents] = useState<RecipeComponent[]>([
    { id: 0, name: '', quantity: 1 },
  ]);

  const handleCreate = () => {
    if (!recipeName.trim()) {
      setStatus('⚠️ Enter a recipe name.');
      return;
    }

    const newRecipe: Recipe = {
      id: Date.now(),
      name: recipeName,
      inputs: components.filter(c => c.name.trim()),
      outputs: [],
    };

    setRecipes([...recipes, newRecipe]);
    setRecipeName('');
    setComponents([{ id: 0, name: '', quantity: 1 }]);
    setStatus(`✅ Recipe "${recipeName}" created.`);
  };

  return (
    <div>
      <h2>Create Recipe</h2>
      <ClearableInput
        value={recipeName}
        onChange={setRecipeName}
        onClear={() => setRecipeName('')}
        placeholder="Recipe Name"
        items={itemData}
      />

      <h3>Components</h3>
      {components.map((comp, idx) => (
        <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
          <ClearableInput
            value={comp.name}
            onChange={(val) => {
              const updated = [...components];
              updated[idx].name = val;
              setComponents(updated);
            }}
            onClear={() => {
              const updated = [...components];
              updated[idx] = { id: 0, name: '', quantity: 1 };
              setComponents(updated);
            }}
            placeholder="Component Name"
            items={itemData}
            onSelectItem={(item) => {
              const updated = [...components];
              updated[idx].id = item.id;
              updated[idx].name = item.name;
              setComponents(updated);
            }}
          />
          <input
            type="number"
            value={comp.quantity}
            min={1}
            onChange={(e) => {
              const updated = [...components];
              updated[idx].quantity = Number(e.target.value);
              setComponents(updated);
            }}
            style={{ width: '60px', padding: '8px' }}
          />
        </div>
      ))}

      <button onClick={() => setComponents([...components, { id: 0, name: '', quantity: 1 }])}>
        ➕ Add Component
      </button>
      <button onClick={handleCreate}>✅ Create Recipe</button>
    </div>
  );
};

export default RecipeCRUD;
