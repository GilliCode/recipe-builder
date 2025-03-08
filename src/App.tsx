import React, { useState } from 'react';
import RecipeUploader from './components/RecipeUploader';
import RecipeCRUD from './components/RecipeCRUD';
import RecipeList from './components/RecipeList';
import RecipeExporter from './components/RecipeExporter';
import './App.css';

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

const App: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [status, setStatus] = useState<string>('Fetching Recipes...'); // ✅ Status State

  return (
    <div className="App">
      <h1>{status}</h1> {/* ✅ Status updates shown here */}
      <RecipeUploader setRecipes={setRecipes} setStatus={setStatus} />
      <RecipeCRUD recipes={recipes} setRecipes={setRecipes} setStatus={setStatus} />
      <RecipeList recipes={recipes} />
      <RecipeExporter recipes={recipes} />
    </div>
  );
};

export default App;
