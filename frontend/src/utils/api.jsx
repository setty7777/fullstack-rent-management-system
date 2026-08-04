import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ADD THIS REQUEST INTERCEPTOR:
// This automatically attaches the token to every request sent through this instance
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const apiRequest = async ({
  endpoint,
  method = "GET",
  body,
  navigate,
}) => {
  try {
    const response = await api({
      url: endpoint,
      method: method,
      data: body,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401 && navigate) {
      localStorage.removeItem("token"); // Clean up dead token
      navigate("/login");
    }
    throw error;
  }
};

export default apiRequest;
