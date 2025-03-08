import React, { useEffect } from 'react';

// ✅ Define Recipe & RecipeComponent inside this file
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

interface RecipeUploaderProps {
  setRecipes: (recipes: Recipe[]) => void;
  setStatus: (status: string) => void; // ✅ Updates status message
}

const RecipeUploader: React.FC<RecipeUploaderProps> = ({ setRecipes, setStatus }) => {
  useEffect(() => {
    setStatus('Fetching Recipes...'); // ✅ Show status while fetching
    fetch('https://raw.githubusercontent.com/Flipping-Utilities/osrs-datasets/master/recipes.json')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then((data: Recipe[]) => {
        setRecipes(data);
        setStatus('✅ Recipes Loaded Successfully');
      })
      .catch(() => {
        setStatus('❌ Failed to load recipes');
      });
  }, [setRecipes, setStatus]);

  return null; // ✅ No UI needed, just runs effect on mount
};

export default RecipeUploader;
