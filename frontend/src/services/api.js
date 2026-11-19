
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  timeout: 30000,
});

export const getModelInfo = async () => {
  const response = await api.get("/api/model-info");
  return response.data;
};

export const predictPatient = async (data) => {
  const response = await api.post("/api/predict", data);
  return response.data;
};

export default api;
