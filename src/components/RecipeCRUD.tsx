import React, { useState, ChangeEvent } from 'react';

interface RecipeComponent {
  id: string;
  quantity: string;
}

interface Recipe {
  name: string;
  outputs: { id: string; quantity: number }[];
  inputs: RecipeComponent[];
}

interface RecipeCRUDProps {
  recipes: Recipe[];
  setRecipes: (recipes: Recipe[]) => void;
}

const RecipeCRUD: React.FC<RecipeCRUDProps> = ({ recipes, setRecipes }) => {
  const [form, setForm] = useState<{ name: string; id: string; components: RecipeComponent[] }>({ name: '', id: '', components: [] });
  const [numComponents, setNumComponents] = useState(1);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleComponentsChange = (index: number, field: keyof RecipeComponent, value: string) => {
    const updatedComponents = [...form.components];
    updatedComponents[index] = { ...updatedComponents[index], [field]: value };
    setForm({ ...form, components: updatedComponents });
  };

  const handleNumComponentsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const number = Math.min(parseInt(e.target.value, 10), 10); // Max 10 components
    const updatedComponents = form.components.slice(0, number);
    for (let i = updatedComponents.length; i < number; i++) {
      updatedComponents.push({ id: '', quantity: '' });
    }
    setForm({ ...form, components: updatedComponents });
    setNumComponents(number);
  };

  const handleCreate = () => {
    const newRecipe: Recipe = {
      name: form.name,
      outputs: [{ id: form.id, quantity: 1 }],
      inputs: form.components.map((component) => ({
        id: component.id,
        quantity: component.quantity,
      })),
    };
    setRecipes([...recipes, newRecipe]);
  };

  const handleUpdate = () => {
    const updatedRecipes = recipes.map((recipe) =>
      recipe.name === form.name ? { ...recipe, name: form.name, id: form.id, components: form.components } : recipe
    );
    setRecipes(updatedRecipes);
  };

  const handleDelete = () => {
    const updatedRecipes = recipes.filter((recipe) => recipe.name !== form.name);
    setRecipes(updatedRecipes);
  };

  return (
    <div>
      <input name="name" value={form.name} onChange={handleInputChange} placeholder="Item Name" />
      <input name="id" value={form.id} onChange={handleInputChange} placeholder="Item ID" />

      <input type="number" value={numComponents} onChange={handleNumComponentsChange} placeholder="Number of Components" />

      {form.components.map((component, index) => (
        <div key={component.id}>
          <input
            name={`id-${index}`}
            value={component.id}
            onChange={(e) => handleComponentsChange(index, 'id', e.target.value)}
            placeholder={`Component ${index + 1} ID`}
          />
          <input
            name={`quantity-${index}`}
            value={component.quantity}
            onChange={(e) => handleComponentsChange(index, 'quantity', e.target.value)}
            placeholder={`Component ${index + 1} Quantity`}
          />
        </div>
      ))}

      <button type="button" onClick={() => handleCreate()}>Create</button>
      <button type="button" onClick={() => handleUpdate()}>Update</button>
      <button type="button" onClick={() => handleDelete()}>Delete</button>
    </div>
  );
};

export default RecipeCRUD;
