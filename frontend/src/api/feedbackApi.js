import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + import.meta.env.VITE_API_VERSION,
  withCredentials: true,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Create feedback
export const createFeedback = (data) => API.post("/feedbacks", data);

// Get my feedbacks
export const getMyFeedbacks = () => API.get("/feedbacks/my-feedbacks");

// Get candidate details by ID
export const getUserById = (id) => API.get(`/users/candidate/${id}`);

// In feedbackApi.js — use existing route
export const getApplicationByJobAndCandidate = (jobPostId) =>
  API.get(`/applications/job/${jobPostId}/candidates`);
