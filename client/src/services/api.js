import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 120000 });
api.interceptors.request.use((config) => {
  const credentials = localStorage.getItem('mysteryCredentials');
  if (credentials) {
    const { caseId, accessToken } = JSON.parse(credentials);
    if (config.url?.includes(caseId)) config.headers['x-case-token'] = accessToken;
  }
  return config;
});

export const caseApi = {
  create: (payload) => api.post('/cases', payload),
  get: (id, token) => api.get(`/cases/${id}`, { headers: { 'x-case-token': token } }),
  discover: (id, clueId, token) => api.post(`/cases/${id}/clues/${clueId}/discover`, {}, { headers: { 'x-case-token': token } }),
  hint: (id, token) => api.post(`/cases/${id}/hints`, {}, { headers: { 'x-case-token': token } }),
  accuse: (id, suspectId, token) => api.post(`/cases/${id}/accuse`, { suspectId }, { headers: { 'x-case-token': token } }),
  result: (id, token) => api.get(`/cases/${id}/result`, { headers: { 'x-case-token': token } })
};

export function errorMessage(error) {
  return error?.response?.data?.message || 'We could not reach the case server. Check your connection and try again.';
}
