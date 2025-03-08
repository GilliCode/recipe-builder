import React, { useState, useEffect } from 'react';
import RecipeCRUD from './components/RecipeCRUD';
import RecipeManager from './components/RecipeManager';
import { Recipe } from './types';

const App: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [status, setStatus] = useState<string>('');
  const [itemData, setItemData] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/osrsbox/osrsbox-db/master/docs/items-complete.json')
      .then(res => res.json())
      .then(data => setItemData(Object.values(data).map((item: any) => ({ id: item.id, name: item.name }))))
      .catch(err => setStatus(`⚠️ Error fetching items: ${err}`));
  }, []);

  return (
    <div>
      <h1>Recipe Builder</h1>
      {status && <p style={{ background: '#222', color: 'white', padding: '5px' }}>{status}</p>}

      <RecipeCRUD
        recipes={recipes}
        setRecipes={setRecipes}
        setStatus={setStatus}
        itemData={itemData}
      />

      <RecipeManager
        recipes={recipes}
        setRecipes={setRecipes}
        setStatus={setStatus}
      />

      <h2>All Recipes:</h2>
      {recipes.map(recipe => (
        <div key={recipe.id}>
          <h3>{recipe.name}</h3>
          <ul>
            {recipe.inputs.map(input => (
              <li key={input.id}>{input.name} x {input.quantity}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default App;
