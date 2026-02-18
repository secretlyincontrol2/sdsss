import { MOCK_USERS, MOCK_PROJECTS, MOCK_NOTIFICATIONS, MOCK_MILESTONES, MOCK_EVENTS, MOCK_DOCUMENTS, mockDelay } from './mockData';

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
        let user = MOCK_USERS.student;
        if (data.email.includes('prof')) user = MOCK_USERS.supervisor;
        if (data.email.includes('admin')) user = MOCK_USERS.admin;
        return mockResponse({ user, token: 'mock-token-' + user.role });
    },
    me: async () => {
        const stored = localStorage.getItem('fyp_user');
        return mockResponse({ user: stored ? JSON.parse(stored) : MOCK_USERS.student });
    },
};

// Projects
export const projectAPI = {
    list: async () => { await mockDelay(); return mockResponse({ projects: MOCK_PROJECTS }); },
    get: async (id) => {
        await mockDelay();
        return mockResponse(MOCK_PROJECTS.find(p => p.id == id) || MOCK_PROJECTS[0]);
    },
    create: async (data) => { await mockDelay(); return mockResponse({ ...data, id: Date.now() }); },
    update: async (id, data) => { await mockDelay(); return mockResponse({ ...data, id }); },
    addMember: async () => { await mockDelay(); return mockResponse({}); },
    removeMember: async () => { await mockDelay(); return mockResponse({}); },
};

// Proposals
export const proposalAPI = {
    create: async () => { await mockDelay(); return mockResponse({}); },
    get: async () => { await mockDelay(); return mockResponse({ proposal: null }); },
    getByProject: async () => { await mockDelay(); return mockResponse({ proposal: null }); },
    review: async () => { await mockDelay(); return mockResponse({}); },
};

// Documents
export const documentAPI = {
    upload: async () => { await mockDelay(); return mockResponse({ id: 1, file_path: 'mock.pdf' }); },
    getByProject: async () => { await mockDelay(); return mockResponse({ documents: MOCK_DOCUMENTS }); },
    getVersions: async () => { await mockDelay(); return mockResponse({ versions: [] }); },
    download: () => '#',
    getComments: async () => { await mockDelay(); return mockResponse({ comments: [] }); },
    addComment: async () => { await mockDelay(); return mockResponse({}); },
};

// Milestones
export const milestoneAPI = {
    create: async () => { await mockDelay(); return mockResponse({}); },
    getByProject: async () => { await mockDelay(); return mockResponse({ milestones: MOCK_MILESTONES }); },
    update: async () => { await mockDelay(); return mockResponse({}); },
};

// Grades
export const gradeAPI = {
    create: async () => { await mockDelay(); return mockResponse({}); },
    getByProject: async () => { await mockDelay(); return mockResponse({ grades: [] }); },
};

// Messages
export const messageAPI = {
    list: async () => { await mockDelay(); return mockResponse({ messages: [] }); },
    send: async () => { await mockDelay(); return mockResponse({}); },
    conversation: async () => { await mockDelay(); return mockResponse({ messages: [] }); },
    markRead: async () => { await mockDelay(); return mockResponse({}); },
};

// Notifications
export const notificationAPI = {
    list: async () => {
        await mockDelay();
        return mockResponse({ notifications: MOCK_NOTIFICATIONS, unread_count: MOCK_NOTIFICATIONS.filter(n => !n.is_read).length });
    },
    markRead: async () => { await mockDelay(); return mockResponse({}); },
    markAllRead: async () => { await mockDelay(); return mockResponse({}); },
};

// Admin
export const adminAPI = {
    listUsers: async () => { await mockDelay(); return mockResponse({ users: Object.values(MOCK_USERS) }); },
    updateUser: async () => { await mockDelay(); return mockResponse({}); },
    deleteUser: async () => { await mockDelay(); return mockResponse({}); },
    allocate: async () => { await mockDelay(); return mockResponse({}); },
    analytics: async () => {
        await mockDelay();
        return mockResponse({
            stats: {
                total_users: 165,
                total_students: 150,
                total_supervisors: 12,
                total_projects: 24
            },
            projects_by_status: [
                { status: 'pending', count: 6 },
                { status: 'in_progress', count: 12 },
                { status: 'completed', count: 6 }
            ],
            supervisor_workload: [
                { id: 2, first_name: 'Dr.', last_name: 'Solomon', project_count: 5 },
                { id: 10, first_name: 'Dr.', last_name: 'Adekunle', project_count: 4 },
                { id: 11, first_name: 'Prof.', last_name: 'Nwosu', project_count: 3 }
            ],
            recent_activity: [
                { title: 'Proposal Submitted', first_name: 'David', last_name: 'Adeleke', created_at: new Date().toISOString() },
                { title: 'Chapter 1 Approved', first_name: 'Sarah', last_name: 'Okon', created_at: new Date(Date.now() - 86400000).toISOString() },
                { title: 'Supervisor Assigned', first_name: 'Michael', last_name: 'Ibrahim', created_at: new Date(Date.now() - 172800000).toISOString() }
            ]
        });
    },
    getLogs: async () => {
        await mockDelay();
        return mockResponse({
            logs: [
                { id: 1, action: 'LOGIN', details: 'Admin logged in', created_at: new Date().toISOString(), user_name: 'System Admin' },
                { id: 2, action: 'ALLOCATE', details: 'Assigned David Adeleke to Dr. Solomon', created_at: new Date(Date.now() - 3600000).toISOString(), user_name: 'System Admin' }
            ]
        });
    },
};

// Calendar
export const calendarAPI = {
    list: async () => { await mockDelay(); return mockResponse({ events: MOCK_EVENTS }); },
    create: async () => { await mockDelay(); return mockResponse({}); },
    update: async () => { await mockDelay(); return mockResponse({}); },
    delete: async () => { await mockDelay(); return mockResponse({}); },
};

export default {
    ...authAPI,
    ...projectAPI,
};
