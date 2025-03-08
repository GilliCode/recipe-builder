interface RecipeListProps {
  recipes: any[];
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes }) => {
  return (
    <div>
      {recipes.map((recipe, index) => (
        <div key={index}>
          <h3>{recipe.name}</h3>
          <p>Output ID: {recipe.outputs[0].id}</p>
          <p>Output Quantity: {recipe.outputs[0].quantity}</p>
          <h4>Components:</h4>
          {recipe.inputs.map((input: any, i: number) => (
            <p key={i}>
              ID: {input.id}, Quantity: {input.quantity}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
};

export default RecipeList;
