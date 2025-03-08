import React, { useState, useEffect, ChangeEvent } from 'react';
import ClearableInput from './ClearableInput';

// ✅ Define RecipeComponent and Recipe inside this file
interface RecipeComponent {
  id: number;
  name: string;
  quantity: number;
}

interface Recipe {
  name: string;
  outputs: RecipeComponent[];
  inputs: RecipeComponent[];
}

interface RecipeCRUDProps {
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
}

const RecipeCRUD: React.FC<RecipeCRUDProps> = ({ setRecipes, setStatus }) => {
  const [form, setForm] = useState<{ name: string; id: number; components: RecipeComponent[] }>({
    name: '',
    id: 0,
    components: [{ id: 0, name: '', quantity: 1 }],
  });

  const [itemData, setItemData] = useState<{ [key: number]: string }>({});
  const [searchResults, setSearchResults] = useState<{ id: number; name: string }[]>([]);
  const [searchQueries, setSearchQueries] = useState<{ [index: number]: string }>({});

  // ✅ Fetch OSRS item data
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/osrsbox/osrsbox-db/master/docs/items-complete.json'
        );
        const data = await response.json();

        const itemMap: { [key: number]: string } = {};
        Object.values(data).forEach((item: any) => {
          itemMap[item.id] = item.name;
        });

        setItemData(itemMap);
      } catch (error) {
        console.error('Error fetching OSRS item data:', error);
      }
    };

    fetchItems();
  }, []);

  // ✅ Handle input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Handle changes to component fields
  const handleComponentChange = (index: number, field: keyof RecipeComponent, value: string | number) => {
    const updatedComponents = [...form.components];
    const numValue = typeof value === 'string' ? Number(value) : value;

    if (field === 'name') {
      setSearchQueries((prev) => ({ ...prev, [index]: String(value) }));
      updatedComponents[index].name = String(value);
      handleSearch(String(value));
    } else {
      updatedComponents[index][field] = numValue;
    }

    if (field === 'id' && itemData[numValue]) {
      updatedComponents[index].name = itemData[numValue];
      setSearchQueries((prev) => ({ ...prev, [index]: itemData[numValue] }));
    }

    setForm({ ...form, components: updatedComponents });
  };

  // ✅ Search for items (Fixed: Removed `index` since it was unused)
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = Object.entries(itemData)
      .filter(([_, name]) => name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10)
      .map(([id, name]) => ({ id: Number(id), name }));

    setSearchResults(results);
  };

  // ✅ Select an item from search results
  const handleSelectItem = (index: number, item: { id: number; name: string }) => {
    const updatedComponents = [...form.components];
    updatedComponents[index] = { id: item.id, name: item.name, quantity: 1 };
    setForm({ ...form, components: updatedComponents });
    setSearchQueries((prev) => ({ ...prev, [index]: item.name }));
    setSearchResults([]);
  };

  // ✅ Clear search field
  const handleClearSearch = (index: number) => {
    const updatedComponents = [...form.components];
    updatedComponents[index] = { id: 0, name: '', quantity: 1 };
    setForm({ ...form, components: updatedComponents });
    setSearchQueries((prev) => ({ ...prev, [index]: '' }));
    setSearchResults([]);
  };

  // ✅ Add a new component
  const addComponent = () => {
    setForm({ ...form, components: [...form.components, { id: 0, name: '', quantity: 1 }] });
  };

  // ✅ Remove a component
  const removeComponent = (index: number) => {
    setForm({ ...form, components: form.components.filter((_, i) => i !== index) });
  };

  // ✅ Create a new recipe
  const handleCreate = () => {
    const newRecipe: Recipe = {
      name: form.name,
      outputs: [{ id: form.id, name: itemData[form.id] || 'Unknown', quantity: 1 }],
      inputs: form.components,
    };

    setRecipes((prevRecipes) => [...prevRecipes, newRecipe]);
    setStatus(`✅ Created Recipe: ${form.name}`);
  };

  return (
    <div>
      <h2>Manage Recipes</h2>
      <input name="name" value={form.name} onChange={handleInputChange} placeholder="Recipe Name" />
      <input name="id" type="number" value={form.id} onChange={handleInputChange} placeholder="Output Item ID" />

      <h3>Recipe Components</h3>
      {form.components.map((component, index) => (
        <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
          <input
            type="number"
            value={component.id}
            onChange={(e) => handleComponentChange(index, 'id', e.target.value)}
            placeholder="Component ID"
          />

          <ClearableInput
            value={searchQueries[index] || ''}
            onChange={(newValue) => handleSearch(newValue)}
            onClear={() => handleClearSearch(index)}
          />

          <input
            type="number"
            value={component.quantity}
            onChange={(e) => handleComponentChange(index, 'quantity', e.target.value)}
            placeholder="Quantity"
          />
          {index > 0 && <button type="button" onClick={() => removeComponent(index)}>Remove</button>}

          {/* ✅ Search results dropdown */}
          {searchResults.length > 0 && (
            <div
              style={{
                position: 'absolute',
                background: 'white',
                border: '1px solid black',
                zIndex: 100,
                width: '200px',
                maxHeight: '150px',
                overflowY: 'auto',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
                padding: '5px',
              }}
            >
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(index, item)}
                  style={{
                    padding: '5px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #ddd',
                    background: '#fff',
                    color: '#000',
                    fontSize: '14px',
                  }}
                >
                  {item.name} (ID: {item.id})
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <button type="button" onClick={addComponent}>+ Add Another Component</button>
      <button type="button" onClick={handleCreate}>Create Recipe</button>
    </div>
  );
};

export default RecipeCRUD;
