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

interface RecipeListProps {
  recipes: Recipe[];
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes }) => {
  return (
    <div>
      {recipes.map((recipe) => (
        <div key={recipe.name}>
          <h3>{recipe.name}</h3>
          <p>Output ID: {recipe.outputs[0].id}</p>
          <p>Output Quantity: {recipe.outputs[0].quantity}</p>
          <h4>Components:</h4>
          {recipe.inputs.map((input) => (
            <p key={input.id}>
              ID: {input.id}, Quantity: {input.quantity}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
};

export default RecipeList;
