/**
 * API service for SciValidate
 */

// Define the API base URL from environment variable or fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Fetch faculty profiles from the API
 * @returns {Promise<Array>} - Array of faculty profiles
 */
export const getFacultyProfiles = async () => {
  try {
    // For development/testing, use the mock data if API is unavailable
    if (process.env.NODE_ENV === 'development' && !API_BASE_URL) {
      console.warn('Using mock faculty data (API_BASE_URL not set)');
      return window.mockFacultyData || [];
    }
    
    const response = await fetch(`${API_BASE_URL}/faculty`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching faculty profiles:', error);
    // Fallback to mock data in case of error
    return window.mockFacultyData || [];
  }
};

/**
 * Fetch reputation data for a specific faculty member
 * @param {string} facultyId - ID of the faculty member
 * @returns {Promise<Object>} - Reputation data
 */
export const getFacultyReputation = async (facultyId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/faculty/${facultyId}/reputation`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching reputation for faculty ${facultyId}:`, error);
    return null;
  }
};

/**
 * Submit verification data for a faculty profile
 * @param {string} facultyId - ID of the faculty member
 * @param {Object} verificationData - Verification data to submit
 * @returns {Promise<Object>} - Response from the API
 */
export const submitVerification = async (facultyId, verificationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify/${facultyId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verificationData),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error submitting verification for faculty ${facultyId}:`, error);
    throw error;
  }
};