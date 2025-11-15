const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000";

export class APIError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = "APIError";
  }
}

export async function apiRequest(path, { method = "GET", body, token, headers = {} } = {}) {
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    let data = null;
    try {
      data = await response.json();
    } catch {
      // If response is ok but not JSON, return null
      if (response.ok) {
        return null;
      }
      throw new APIError("Unexpected server response", response.status);
    }

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || "Request failed";
      throw new APIError(errorMessage, response.status);
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(error.message || "Network error", 0);
  }
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

/**
 * Checks if an error is due to authentication issues
 */
export function isAuthError(error) {
  return error instanceof APIError && (error.status === 401 || error.status === 403);
}

