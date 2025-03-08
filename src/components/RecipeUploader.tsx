import { useState, useEffect, ChangeEvent } from 'react';

interface RecipeUploaderProps {
  setRecipes: (recipes: any) => void;
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
          const data = JSON.parse(e.target.result as string);
          setRecipes(data);
        }
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/Flipping-Utilities/osrs-datasets/master/recipes.json')
      .then((response) => response.json())
      .then((data) => setRecipes(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, [setRecipes]);

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default RecipeUploader;
