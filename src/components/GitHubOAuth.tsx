import { useEffect } from 'react';
import axios from 'axios';

interface GitHubOAuthProps {
  setToken: (token: string | null) => void;
}

const GitHubOAuth: React.FC<GitHubOAuthProps> = ({ setToken }) => {
  const clientId = 'YOUR_CLIENT_ID'; // Replace with your GitHub OAuth App Client ID

  const handleLogin = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo`;
  };

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      axios
        .post('https://github.com/login/oauth/access_token', {
          client_id: clientId,
          client_secret: 'YOUR_CLIENT_SECRET', // Replace with your GitHub OAuth App Client Secret
          code,
        })
        .then((response) => {
          const params = new URLSearchParams(response.data);
          const token = params.get('access_token');
          setToken(token);
        })
        .catch((error) => console.error('Error fetching access token:', error));
    }
  }, [setToken]);

  return <button onClick={handleLogin}>Login with GitHub</button>;
};

export default GitHubOAuth;
