/**
 * Service module for interacting with the SciValidate API
 */
const API_BASE_URL = 'https://scivalidate.onrender.com/api';

/**
 * Fetch author information and reputation data
 * @param {string} authorId - The ID of the author to fetch
 * @returns {Promise<Object>} - The author data including reputation information
 */
export const getAuthorReputation = async (authorId) => {
  try {
    const encodedId = encodeURIComponent(authorId);
    const response = await fetch(`${API_BASE_URL}/faculty/${authorId}/reputation`);
    
    if (!response.ok) {
      // More detailed error message based on status code
      if (response.status === 404) {
        console.warn(`Author with ID ${authorId} not found in the database`);
        return null;
      } else if (response.status === 409) {
        console.warn(`Constraint violation when accessing author ${authorId}`);
        return null;
      }
      throw new Error(`Error fetching reputation: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching author reputation:', error);
    // Return a basic object instead of null to prevent UI errors
    return { 
      status: 'error',
      name: 'Unknown Author',
      message: 'Could not retrieve author data'
    };
  }
};

/**
 * Verify the scientific validity of post content
 * @param {string} content - The post content to validate
 * @param {string} [topic] - Optional topic classification
 * @returns {Promise<Object>} - Validation result with status and references
 */
export const validatePostContent = async (content, topic = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        topic
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error validating content: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error validating post content:', error);
    // Return a default "awaiting" status when validation fails
    return {
      status: 'awaiting',
      message: 'Content awaiting scientific validation',
      experts: [],
      references: []
    };
  }
};

/**
 * Fetch reputation data for multiple authors
 * @param {Array<string>} authorIds - Array of author IDs to fetch
 * @returns {Promise<Object>} - Object mapping author IDs to their reputation data
 */
export const getBatchAuthorReputations = async (authorIds) => {
  try {
    // Make separate requests for each author for now
    // In a production environment, you'd want a batch endpoint
    const promises = authorIds.map(id => getAuthorReputation(id));
    const results = await Promise.allSettled(promises);
    
    const reputationData = {};
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        reputationData[authorIds[index]] = result.value;
      } else {
        reputationData[authorIds[index]] = null;
      }
    });
    
    return reputationData;
  } catch (error) {
    console.error('Error fetching batch author reputations:', error);
    throw error;
  }
};

/**
 * Get experts for a specific scientific topic
 * @param {string} topic - The scientific topic
 * @returns {Promise<Array>} - Array of experts in this field
 */
export const getTopicExperts = async (topic) => {
  try {
    const response = await fetch(`${API_BASE_URL}/experts?topic=${encodeURIComponent(topic)}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching experts: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching topic experts:', error);
    return [];
  }
};

export default {
  getAuthorReputation,
  validatePostContent,
  getBatchAuthorReputations,
  getTopicExperts
};