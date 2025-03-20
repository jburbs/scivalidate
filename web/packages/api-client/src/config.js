// packages/api-client/src/config.js

// Default configuration
const defaultConfig = {
  apiUrl: 'https://scivalidate.onrender.com/api',
  // Add other default configuration values as needed
};

// Environment-specific overrides
const envConfig = {
  development: {
    // You can override defaults for development
    // apiUrl: 'http://localhost:3001/api',
  },
  test: {
    // Test environment overrides
  },
  production: {
    // Production environment overrides
  },
};

export function getConfig() {
  const env = process.env.NODE_ENV || 'development';
  return {
    ...defaultConfig,
    ...(envConfig[env] || {}),
  };
}