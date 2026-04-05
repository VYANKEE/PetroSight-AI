import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: 20000,
});

async function withRetry(executor, retries = 2, delay = 800) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await executor();
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1)));
    }
  }
  throw lastError;
}

export const apiClient = {
  async getDashboard(years = 10) {
    const response = await withRetry(() => api.get("/dashboard", { params: { years } }));
    return response.data;
  },
  async getHistory(params) {
    const response = await withRetry(() => api.get("/history", { params }));
    return response.data;
  },
  async getForecastRange(params) {
    const response = await withRetry(() => api.get("/forecast_range", { params }));
    return response.data;
  },
  async getPrediction(params) {
    const response = await withRetry(() => api.get("/predict", { params }));
    return response.data;
  },
  async getChatReply(payload) {
    const response = await withRetry(() => api.post("/chat", payload));
    return response.data;
  },
};

export async function streamChat(payload, onChunk) {
  const response = await fetch(`${api.defaults.baseURL}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok || !response.body) {
    throw new Error("Unable to stream AI analysis right now.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    events.forEach((event) => {
      if (!event.startsWith("data: ")) {
        return;
      }
      const raw = event.replace("data: ", "").trim();
      if (!raw || raw === "[DONE]") {
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed.error) {
        throw new Error(parsed.error);
      }
      if (parsed.token) {
        onChunk(parsed.token);
      }
    });
  }
}
