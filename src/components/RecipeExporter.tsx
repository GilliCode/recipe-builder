import React from 'react';

interface RecipeComponent {
  id: string;
  quantity: string;
}

interface Recipe {
  name: string;
  outputs: { id: string; quantity: number }[];
  inputs: RecipeComponent[];
}

interface RecipeExporterProps {
  recipes: Recipe[];
}

const RecipeExporter: React.FC<RecipeExporterProps> = ({ recipes }) => {
  const handleExport = () => {
    const json = JSON.stringify(recipes, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return <button type="button" onClick={handleExport}>Download JSON</button>;
};

export default RecipeExporter;
