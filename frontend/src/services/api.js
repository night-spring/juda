// API Client for the Juda Backend Server

// Retrieve custom API base URL from localStorage if set, default to standard local FastAPI server
export const getApiBaseUrl = () => {
  return localStorage.getItem('juda_api_host') || 'http://127.0.0.1:8000';
};

export const setApiBaseUrl = (url) => {
  if (!url) {
    localStorage.removeItem('juda_api_host');
  } else {
    // Strip trailing slash if present
    const cleanUrl = url.replace(/\/$/, '');
    localStorage.setItem('juda_api_host', cleanUrl);
  }
};

const request = async (endpoint, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/v1${endpoint}`;
  
  const headers = {
    'Accept': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    // Parse JSON
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      throw new Error(data?.detail || `API error: ${response.status} ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`API Request Failure [${endpoint}]:`, error);
    throw error;
  }
};

export const api = {
  /**
   * Uploads a CSV file to process strictly in-memory
   * @param {File} file 
   */
  uploadCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return request('/eda/upload', {
      method: 'POST',
      body: formData,
      // Note: Fetch sets boundary automatically when body is FormData
      headers: {},
    });
  },

  /**
   * Retrieves raw parsed JSON data statistics for a session
   * @param {string} sessionId 
   */
  getSummary: async (sessionId) => {
    return request(`/eda/summary/${sessionId}`, {
      method: 'GET',
    });
  },

  /**
   * Generates a markdown analytical report from the dataset summary metadata
   * @param {string} sessionId 
   */
  getReport: async (sessionId) => {
    return request(`/eda/report/${sessionId}`, {
      method: 'GET',
    });
  },

  /**
   * Retrieves a pre-generated visualization as a Base64-encoded JSON response
   * @param {string} sessionId 
   * @param {'correlation'|'missing_values'|'distributions'} plotType 
   */
  getPlotBase64: async (sessionId, plotType) => {
    return request(`/viz/base64/${sessionId}/${plotType}`, {
      method: 'GET',
    });
  },

  /**
   * Asks questions about the uploaded dataset
   * @param {string} sessionId 
   * @param {string} message 
   */
  chatWithData: async (sessionId, message) => {
    return request(`/chat/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
  },

  /**
   * Retrieves all sessions stored in the backend (Firestore or local cache)
   */
  getSessions: async () => {
    return request('/eda/sessions', {
      method: 'GET',
    });
  },

  /**
   * Retrieves ordered chat conversation log for a session
   * @param {string} sessionId
   */
  getChatHistory: async (sessionId) => {
    return request(`/chat/history/${sessionId}`, {
      method: 'GET',
    });
  },

  /**
   * Deletes a session and all its messages from Firestore
   * @param {string} sessionId
   */
  deleteSession: async (sessionId) => {
    return request(`/eda/session/${sessionId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Clears ordered chat conversation log for a session, keeping the session document itself
   * @param {string} sessionId
   */
  clearChatHistory: async (sessionId) => {
    return request(`/chat/history/${sessionId}`, {
      method: 'DELETE',
    });
  },
};
