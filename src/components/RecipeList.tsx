import React from 'react';

// Define an interface for a recipe component (an input item for a recipe)
interface RecipeComponent {
  id: number; // The unique OSRS item ID
  quantity: number; // The number of this item required
}

// Define an interface for a recipe structure
interface Recipe {
  name: string; // The name of the recipe
  outputs: RecipeComponent[]; // List of items produced by the recipe
  inputs: RecipeComponent[]; // List of items required for the recipe
}

// Define props expected by RecipeList component
interface RecipeListProps {
  recipes: Recipe[]; // List of recipes to be displayed
}

// RecipeList component displays all recipes passed to it
const RecipeList: React.FC<RecipeListProps> = ({ recipes }) => {
  return (
    <div>
      <h2>Recipe List</h2>
      {/* Map through all recipes and display their details */}
      {recipes.map((recipe) => (
        <div key={recipe.name} style={{ border: '1px solid black', padding: '10px', margin: '10px 0' }}>
          <h3>{recipe.name}</h3>

          {/* Display outputs (items created by the recipe) */}
          <h4>Outputs:</h4>
          {recipe.outputs.length > 0 ? (
            <ul>
              {recipe.outputs.map((output, index) => (
                <li key={`${output.id}-${index}`}>
                  ID: {output.id}, Quantity: {output.quantity}
                </li>
              ))}
            </ul>
          ) : (
            <p>No outputs defined</p>
          )}

          {/* Display inputs (items required for the recipe) */}
          <h4>Inputs:</h4>
          {recipe.inputs.length > 0 ? (
            <ul>
              {recipe.inputs.map((input, index) => (
                <li key={`${input.id}-${index}`}>
                  ID: {input.id}, Quantity: {input.quantity}
                </li>
              ))}
            </ul>
          ) : (
            <p>No inputs defined</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default RecipeList;
