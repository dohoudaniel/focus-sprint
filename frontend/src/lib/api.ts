const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("focussprint_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkError) {
    throw new Error("Network error — backend may be waking up. Try again.");
  }

  // Guard against non-JSON responses (Render HTML error pages, 502 proxies, etc.)
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    if (!response.ok) {
      throw new Error(`Server error (${response.status}). The backend may be restarting.`);
    }
    // If it's a 200 but not JSON, something is very wrong
    throw new Error("Unexpected response format from server.");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.msg || `Request failed (${response.status})`);
  }

  return data;
};
