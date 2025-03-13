import React, { useState, useEffect } from 'react';
import RecipeCRUD from './components/RecipeCRUD';
import RecipeManager from './components/RecipeManager';
import RecipeEditForm from './components/RecipeEditForm';
import { Recipe } from './types';
import './App.css';
import pkg from '../package.json';

const App: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [status, setStatus] = useState<string>('');
  const [mappingData, setMappingData] = useState<Record<number, { name: string; icon: string | null }>>({});
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // Fetch mapping data from RuneScape Wiki API
  useEffect(() => {
    const fetchMappingData = async () => {
      try {
        const response = await fetch('https://prices.runescape.wiki/api/v1/osrs/mapping');
        const data = await response.json();
        const formattedData: Record<number, { name: string; icon: string | null }> = {};
        data.forEach((item: { id: number; name: string; icon: string }) => {
          formattedData[item.id] = {
            name: item.name,
            icon: item.icon ? `https://oldschool.runescape.wiki/images/${item.icon.replace(/\s/g, '_')}` : null,
          };
        });
        setMappingData(formattedData);
      } catch (error) {
        setStatus('⚠️ Error fetching item mapping data.');
      }
    };
    fetchMappingData();
  }, []);

  const clearEditing = () => setEditingRecipe(null);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="title-and-version">
          <h1 className="main-title">Recipe Builder</h1>
          <span className="version-text">(v{pkg.version})</span>
        </div>
        {/* Optional: add dark/light mode toggle here */}
      </header>
      <div className="status-container">
        {status && <div className="status-message">{status}</div>}
      </div>

      {/* Render creation form or edit modal based on editingRecipe */}
      {editingRecipe ? (
        <RecipeEditForm
          initialRecipe={editingRecipe}
          onSave={(updated) => {
            setRecipes(prev => prev.map(r => (r.id === updated.id ? updated : r)));
            setStatus(`✅ Updated recipe: ${updated.name}`);
            clearEditing();
          }}
          onCancel={clearEditing}
          mappingData={mappingData}
        />
      ) : (
        <RecipeCRUD
          recipes={recipes}
          setRecipes={setRecipes}
          setStatus={setStatus}
          mappingData={mappingData}
          editingRecipe={editingRecipe}
          clearEditing={clearEditing}
        />
      )}

      <RecipeManager
        recipes={recipes}
        setRecipes={setRecipes}
        setStatus={setStatus}
        mappingData={mappingData}
      />
    </div>
  );
};

export default App;
