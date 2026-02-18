import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('fyp_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('fyp_token');
            localStorage.removeItem('fyp_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
};

// Projects
export const projectAPI = {
    list: () => api.get('/projects'),
    get: (id) => api.get(`/projects/${id}`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.put(`/projects/${id}`, data),
    addMember: (id, data) => api.post(`/projects/${id}/members`, data),
    removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
};

// Proposals
export const proposalAPI = {
    create: (data) => api.post('/proposals', data),
    get: (id) => api.get(`/proposals/${id}`),
    getByProject: (projectId) => api.get(`/proposals/project/${projectId}`),
    review: (id, data) => api.put(`/proposals/${id}/review`, data),
};

// Documents
export const documentAPI = {
    upload: (formData) => api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getByProject: (projectId) => api.get(`/documents/project/${projectId}`),
    getVersions: (docId) => api.get(`/documents/${docId}/versions`),
    download: (docId) => `${API_URL}/documents/${docId}/download`,
    getComments: (docId) => api.get(`/documents/${docId}/comments`),
    addComment: (docId, data) => api.post(`/documents/${docId}/comments`, data),
};

// Milestones
export const milestoneAPI = {
    create: (data) => api.post('/milestones', data),
    getByProject: (projectId) => api.get(`/milestones/project/${projectId}`),
    update: (id, data) => api.put(`/milestones/${id}`, data),
};

// Grades
export const gradeAPI = {
    create: (data) => api.post('/grades', data),
    getByProject: (projectId) => api.get(`/grades/project/${projectId}`),
};

// Messages
export const messageAPI = {
    list: () => api.get('/messages'),
    send: (data) => api.post('/messages', data),
    conversation: (partnerId) => api.get(`/messages/conversation/${partnerId}`),
    markRead: (id) => api.put(`/messages/${id}/read`),
};

// Notifications
export const notificationAPI = {
    list: () => api.get('/notifications'),
    markRead: (id) => api.put(`/notifications/${id}/read`),
    markAllRead: () => api.put('/notifications/read-all'),
};

// Admin
export const adminAPI = {
    listUsers: () => api.get('/admin/users'),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    allocate: (data) => api.post('/admin/allocate', data),
    allocate: (data) => api.post('/admin/allocate', data),
    analytics: () => api.get('/admin/analytics'),
    getLogs: () => api.get('/admin/logs'),
};

// Calendar
export const calendarAPI = {
    list: () => api.get('/calendar'),
    create: (data) => api.post('/calendar', data),
    update: (id, data) => api.put(`/calendar/${id}`, data),
    delete: (id) => api.delete(`/calendar/${id}`),
};

export default api;
