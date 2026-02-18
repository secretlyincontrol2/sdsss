import { MOCK_USERS, MOCK_PROJECTS, MOCK_NOTIFICATIONS, mockDelay } from './mockData';

// Helper to simulate API response format
const mockResponse = (data) => ({ data });

// Auth
export const authAPI = {
    register: async (data) => {
        await mockDelay();
        return mockResponse({
            user: { ...data, id: Math.floor(Math.random() * 1000), role: 'student' },
            token: 'mock-token'
        });
    },
    login: async (data) => {
        await mockDelay();
        // Check for special demo emails, otherwise default to student
        let user = MOCK_USERS.student;
        if (data.email.includes('prof')) user = MOCK_USERS.supervisor;
        if (data.email.includes('admin')) user = MOCK_USERS.admin;

        return mockResponse({ user, token: 'mock-token-' + user.role });
    },
    me: async () => {
        // In a real app we'd decode token, here we cheat and check localStorage or return default
        const stored = localStorage.getItem('fyp_user');
        return mockResponse(stored ? JSON.parse(stored) : MOCK_USERS.student);
    },
};

// Projects
export const projectAPI = {
    list: async () => { await mockDelay(); return mockResponse(MOCK_PROJECTS); },
    get: async (id) => { await mockDelay(); return mockResponse(MOCK_PROJECTS.find(p => p.id == id)); },
    create: async (data) => { await mockDelay(); return mockResponse({ ...data, id: Date.now() }); },
    update: async (id, data) => { await mockDelay(); return mockResponse({ ...data, id }); },
    addMember: async () => { await mockDelay(); return mockResponse({}); },
    removeMember: async () => { await mockDelay(); return mockResponse({}); },
};

// Proposals
export const proposalAPI = {
    create: async () => { await mockDelay(); return mockResponse({}); },
    get: async () => { await mockDelay(); return mockResponse({}); }, // Return empty or mock proposal
    getByProject: async () => { await mockDelay(); return mockResponse([]); },
    review: async () => { await mockDelay(); return mockResponse({}); },
};

// Documents
export const documentAPI = {
    upload: async () => { await mockDelay(); return mockResponse({ id: 1, file_path: 'mock.pdf' }); },
    getByProject: async () => { await mockDelay(); return mockResponse([]); },
    getVersions: async () => { await mockDelay(); return mockResponse([]); },
    download: (id) => '#',
    getComments: async () => { await mockDelay(); return mockResponse([]); },
    addComment: async () => { await mockDelay(); return mockResponse({}); },
};

// Milestones
export const milestoneAPI = {
    create: async () => { await mockDelay(); return mockResponse({}); },
    getByProject: async () => { await mockDelay(); return mockResponse([]); },
    update: async () => { await mockDelay(); return mockResponse({}); },
};

// Grades
export const gradeAPI = {
    create: async () => { await mockDelay(); return mockResponse({}); },
    getByProject: async () => { await mockDelay(); return mockResponse([]); },
};

// Messages
export const messageAPI = {
    list: async () => { await mockDelay(); return mockResponse([]); },
    send: async () => { await mockDelay(); return mockResponse({}); },
    conversation: async () => { await mockDelay(); return mockResponse([]); },
    markRead: async () => { await mockDelay(); return mockResponse({}); },
};

// Notifications
export const notificationAPI = {
    list: async () => {
        await mockDelay();
        return mockResponse({ notifications: MOCK_NOTIFICATIONS, unread_count: 1 });
    },
    markRead: async () => { await mockDelay(); return mockResponse({}); },
    markAllRead: async () => { await mockDelay(); return mockResponse({}); },
};

// Admin
export const adminAPI = {
    listUsers: async () => { await mockDelay(); return mockResponse(Object.values(MOCK_USERS)); },
    updateUser: async () => { await mockDelay(); return mockResponse({}); },
    deleteUser: async () => { await mockDelay(); return mockResponse({}); },
    allocate: async () => { await mockDelay(); return mockResponse({}); },
    analytics: async () => {
        await mockDelay();
        return mockResponse({
            projects: 24,
            students: 150,
            supervisors: 12,
            avg_score: 78
        });
    },
    getLogs: async () => {
        await mockDelay();
        return mockResponse([
            { id: 1, action: 'LOGIN', details: 'User logged in', created_at: new Date().toISOString(), user_name: 'John Doe' }
        ]);
    },
};

// Calendar
export const calendarAPI = {
    list: async () => { await mockDelay(); return mockResponse([]); },
    create: async () => { await mockDelay(); return mockResponse({}); },
    update: async () => { await mockDelay(); return mockResponse({}); },
    delete: async () => { await mockDelay(); return mockResponse({}); },
};

export default {
    ...authAPI,
    ...projectAPI,
    // ... export others if needed by default import
};
