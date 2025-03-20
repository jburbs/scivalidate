  // packages/api-client/src/index.js
  import { getConfig } from './config';

  const API_BASE_URL = getConfig().apiUrl ||
  'https://scivalidate.onrender.com/api';

  export const getAuthorReputation = async (authorId) => {
    // Implementation
  };

  export const validatePostContent = async (content, topic = null) => {
    // Implementation
  };

  // Additional API methods