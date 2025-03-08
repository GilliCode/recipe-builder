import React from 'react';
import axios from 'axios';

interface CreatePullRequestProps {
  token: string;
}

const CreatePullRequest: React.FC<CreatePullRequestProps> = ({ token }) => {
  const handleCreatePR = async () => {
    try {
      await axios.post(
        `https://api.github.com/repos/Flipping-Utilities/osrs-datasets/pulls`,
        {
          title: 'Add new recipes',
          body: 'This PR adds new recipes to the dataset.',
          head: 'new-recipes-branch',
          base: 'master',
        },
        { headers: { Authorization: `token ${token}` } }
      );
      alert('Pull request created successfully!');
    } catch (error) {
      console.error('Error creating pull request:', error);
      alert('Failed to create pull request.');
    }
  };

  return (
    <div>
      <h2>Submit to GitHub</h2>
      <button type="button" onClick={handleCreatePR}>Create Pull Request</button>
    </div>
  );
};

export default CreatePullRequest;
