const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest(
  endpoint,
  method = "GET",
  body = null,
  token = null
) {
  if (!API_BASE) {
    throw new Error("API base URL is not defined");
  }

  const headers = {
    Accept: "application/json",
  };

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (data.errors) {
      const firstKey = Object.keys(data.errors)[0];
      const firstMessage = data.errors[firstKey]?.[0];
      throw new Error(firstMessage || "Request failed");
    }

    throw new Error(data.message || "Request failed");
  }

  return data;
}