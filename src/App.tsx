import { useState } from 'react';
import RecipeUploader from './components/RecipeUploader';
import RecipeCRUD from './components/RecipeCRUD';
import RecipeList from './components/RecipeList';
import RecipeExporter from './components/RecipeExporter';
import GitHubOAuth from './components/GitHubOAuth';
import CreatePullRequest from './components/CreatePullRequest';
import './App.css';

const App: React.FC = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(null);

  return (
    <div className="App">
      <GitHubOAuth setToken={setToken} />
      <RecipeUploader setRecipes={setRecipes} />
      <RecipeCRUD recipes={recipes} setRecipes={setRecipes} />
      <RecipeList recipes={recipes} />
      <RecipeExporter recipes={recipes} />
      {token && <CreatePullRequest token={token} newRecipes={recipes} />}
    </div>
  );
};

export default App;
