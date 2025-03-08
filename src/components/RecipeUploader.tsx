import React, { useState, useEffect, ChangeEvent } from 'react';

interface RecipeUploaderProps {
  setRecipes: (recipes: Recipe[]) => void;
}

interface RecipeComponent {
  id: string;
  quantity: string;
}

interface Recipe {
  name: string;
  outputs: { id: string; quantity: number }[];
  inputs: RecipeComponent[];
}

const RecipeUploader: React.FC<RecipeUploaderProps> = ({ setRecipes }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          const data = JSON.parse(e.target.result as string) as Recipe[];
          setRecipes(data);
        }
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/Flipping-Utilities/osrs-datasets/master/recipes.json')
      .then((response) => response.json())
      .then((data) => {
        setRecipes(data as Recipe[]);
      })
      .catch((error: unknown) => {
        console.error('Error fetching data:', error);
      });
  }, [setRecipes]);

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button type="button" onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default RecipeUploader;
