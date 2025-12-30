// Enhanced configuration with validation and fallbacks
interface ConfigType {
  API_ENDPOINT: string;
  API_TIMEOUT?: number;
  MAX_RETRIES?: number;
  DEBUG?: boolean;
}

const local: ConfigType = {
  API_ENDPOINT: "http://localhost:5000/",
  API_TIMEOUT: 10000,
  MAX_RETRIES: 3,
  DEBUG: true
};

const dev: ConfigType = {
  API_ENDPOINT: "https://marketing-requests-be.vercel.app/api/",  
  API_TIMEOUT: 15000,
  MAX_RETRIES: 2,
  DEBUG: true,
};

const stag: ConfigType = {
API_ENDPOINT:  "https://marketing-requests-be.vercel.app/api/", 
  API_TIMEOUT: 20000,
  MAX_RETRIES: 2,
  DEBUG: false,
};

const prod: ConfigType = {
  API_ENDPOINT:"http://localhost:5000/api/", 
  // API_TIMEOUT: 120000,
  MAX_RETRIES: 1,
  DEBUG: false,
};

const stage = process.env.NEXT_PUBLIC_STAGE;
const validStages = ['local', 'dev', 'stag', 'prod'];

if (stage && !validStages.includes(stage)) {
  console.warn(`Invalid NEXT_PUBLIC_STAGE: ${stage}. Falling back to production.`);
}

const config: ConfigType = {
  ...(stage === "local" ? local :
    stage === "dev" ? dev :
     stage === "stag" ? stag :
     prod),
};

// Add runtime validation
if (!config.API_ENDPOINT) {
  throw new Error('API_ENDPOINT is not configured');
}

// Log current environment (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log(`🔧 Running in ${stage || 'prod'} mode`);
  console.log(`🌐 API Endpoint: ${config.API_ENDPOINT}`);
}

export default config;

// Export individual config values for easier testing
export const { API_ENDPOINT, API_TIMEOUT, MAX_RETRIES, DEBUG } = config;