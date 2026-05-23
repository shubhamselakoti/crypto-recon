import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export const uploadCSVs = (formData, onProgress) =>
  api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  });

export const runReconciliation = (payload) => api.post('/reconcile', payload);

export const getReport = (runId, params) => api.get(`/report/${runId}`, { params });

export const getSummary = (runId) => api.get(`/report/${runId}/summary`);

export const getUnmatched = (runId) => api.get(`/report/${runId}/unmatched`);

export const getAllRuns = () => api.get('/report/runs');