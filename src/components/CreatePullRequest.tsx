import axios from 'axios';

interface CreatePullRequestProps {
  token: string;
  newRecipes: any[];
}

const CreatePullRequest: React.FC<CreatePullRequestProps> = ({ token, newRecipes }) => {
  const handleCreatePR = () => {
    const owner = 'Flipping-Utilities';
    const repo = 'osrs-datasets';
    const branch = 'new-recipes-branch';
    const filePath = 'recipes.json';
    const commitMessage = 'Add new recipes';

    axios
      .post(
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
        {
          message: commitMessage,
          content: btoa(JSON.stringify(newRecipes, null, 2)),
          branch,
        },
        { headers: { Authorization: `token ${token}` } }
      )
      .then(() => {
        return axios.post(
          `https://api.github.com/repos/${owner}/${repo}/pulls`,
          {
            title: 'Add new recipes',
            head: branch,
            base: 'master',
          },
          { headers: { Authorization: `token ${token}` } }
        );
      })
      .catch((error) => console.error('Error creating pull request:', error));
  };

  return <button onClick={handleCreatePR}>Create Pull Request</button>;
};

export default CreatePullRequest;
