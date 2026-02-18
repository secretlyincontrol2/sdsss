
// Mock Users
export const MOCK_USERS = {
    student: {
        id: 1,
        email: 'student@demo.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'student',
        department: 'Computer Science',
        matric_number: '19/1234',
        avatar_url: null
    },
    supervisor: {
        id: 2,
        email: 'prof@demo.com',
        first_name: 'Prof.',
        last_name: 'Smith',
        role: 'supervisor',
        staff_id: 'STAFF001',
        department: 'Computer Science',
        avatar_url: null
    },
    admin: {
        id: 3,
        email: 'admin@demo.com',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        department: 'Administration',
        avatar_url: null
    }
};

// Mock Projects
export const MOCK_PROJECTS = [
    {
        id: 1,
        title: 'AI-Powered Traffic Control System',
        description: 'Using computer vision to optimize traffic flow in Lagos.',
        status: 'in_progress',
        student_id: 1,
        supervisor_id: 2,
        created_at: '2023-09-01T10:00:00Z'
    },
    {
        id: 2,
        title: 'Blockchain voting System',
        description: 'Secure voting using Ethereum.',
        status: 'pending',
        student_id: 4,
        supervisor_id: 2,
        created_at: '2023-09-05T10:00:00Z'
    }
];

// Mock Notifications
export const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        type: 'info',
        message: 'Welcome to the FYP Portal!',
        is_read: false,
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        type: 'success',
        message: 'Your proposal was approved.',
        is_read: true,
        created_at: new Date(Date.now() - 86400000).toISOString()
    }
];

export const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));
