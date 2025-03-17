import React, { useState, useEffect } from 'react';
import RecipeCRUD from './components/RecipeCRUD';
import RecipeManager from './components/RecipeManager';
import { Recipe } from './types';
import pkg from '../package.json';

const version = pkg.version;

const App: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [status, setStatus] = useState<string>('');
  const [mappingData, setMappingData] = useState<Record<number, { name: string; icon: string | null }>>({});
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [externalRecipes, setExternalRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const fetchMappingData = async () => {
      try {
        const response = await fetch('https://prices.runescape.wiki/api/v1/osrs/mapping');
        const data = await response.json();
        const formattedData: Record<number, { name: string; icon: string | null }> = {};
        data.forEach((item: { id: number; name: string; icon: string }) => {
          formattedData[item.id] = {
            name: item.name,
            icon: item.icon
              ? `https://oldschool.runescape.wiki/images/${item.icon.replace(/\s/g, '_')}`
              : null,
          };
        });
        // Ensure Coins exists
        if (!formattedData[995]) {
          formattedData[995] = {
            name: 'Coins',
            icon: 'https://oldschool.runescape.wiki/images/Coins_1.png',
          };
        }
        setMappingData(formattedData);
      } catch (error) {
        setStatus('⚠️ Error fetching item mapping data.');
      }
    };
    fetchMappingData();
  }, []);

  useEffect(() => {
    const fetchExternalRecipes = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/Flipping-Utilities/osrs-datasets/master/recipes.json');
        const data: Recipe[] = await response.json();
        data.forEach((r) => {
          if ((!r.id || r.id === 0) && r.outputs && r.outputs[0]) {
            r.id = r.outputs[0].id;
          }
        });
        setExternalRecipes(data);
      } catch (error) {
        setStatus('⚠️ Error fetching external recipes.');
      }
    };
    fetchExternalRecipes();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    document.body.classList.toggle('light-mode', !darkMode);
  }, [darkMode]);

  const mergeRecipes = (external: Recipe[], local: Recipe[]): Recipe[] => {
    const mergedMap: Record<number, Recipe> = {};
    external.forEach(r => {
      if (r.outputs && r.outputs[0]) {
        mergedMap[r.outputs[0].id] = r;
      }
    });
    local.forEach(r => {
      if (r.outputs && r.outputs[0]) {
        mergedMap[r.outputs[0].id] = r;
      }
    });
    return Object.values(mergedMap);
  };

  // Transform function for export (Copy Local Data).
 const transformRecipe = (recipe: Recipe) => {
   const transformedOutputs = recipe.outputs.map(out => ({
     id: out.id,
     quantity: out.quantity,
   }));

   const transformedInputs: Array<{ id: number; quantity: number; subText?: string }> = recipe.inputs.map(input => ({
     id: input.id,
     quantity: input.quantity,
   }));

   if (recipe.subText && transformedInputs.length > 0) {
     transformedInputs[transformedInputs.length - 1].subText = recipe.subText;
   }

   return {
     name: recipe.name,
     outputs: transformedOutputs,
     inputs: transformedInputs,
   };
 };

  const handleDownloadRecipes = () => {
    const merged = mergeRecipes(externalRecipes, recipes);
    const transformedRecipes = merged.map(transformRecipe);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transformedRecipes, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", "recipes.json");
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleCopyLocalRecipes = async () => {
    try {
      const transformedRecipes = recipes.map(transformRecipe);
      const textToCopy = `\`\`\`\n${JSON.stringify(transformedRecipes, null, 2)}\n\`\`\``;
      await navigator.clipboard.writeText(textToCopy);
      setStatus('✅ Local recipes copied to clipboard.');
    } catch (error) {
      setStatus('⚠️ Failed to copy local recipes.');
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="title-and-version">
          <h1 className="main-title">Recipe Builder</h1>
          <span className="version-text">v{version}</span>
        </div>
        <button className="toggle-mode-btn" onClick={() => setDarkMode(prev => !prev)}>
          {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </header>

      <div className="status-container">
        {status && <div className="status-message">{status}</div>}
      </div>

      <RecipeCRUD
        setRecipes={setRecipes}
        setStatus={setStatus}
        mappingData={mappingData}
      />

      <RecipeManager
        recipes={recipes}
        setRecipes={setRecipes}
        setStatus={setStatus}
        mappingData={mappingData}
      />

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button className="btn-create" onClick={handleDownloadRecipes}>
          Download Recipes
        </button>
        <button className="btn-copy" onClick={handleCopyLocalRecipes}>
          Copy Local Data
        </button>
      </div>
    </div>
  );
};

export default App;
