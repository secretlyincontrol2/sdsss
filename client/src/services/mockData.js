
// Mock Users (Rich Profiles)
export const MOCK_USERS = {
    student: {
        id: 1,
        email: 'student@demo.com',
        first_name: 'David',
        last_name: 'Adeleke',
        role: 'student',
        department: 'Computer Science',
        matric_number: '19/0452',
        avatar_url: null,
        level: '400'
    },
    supervisor: {
        id: 2,
        email: 'prof@demo.com',
        first_name: 'Dr.',
        last_name: 'Solomon',
        role: 'supervisor',
        staff_id: 'BU/STAFF/042',
        department: 'Computer Science',
        avatar_url: null,
        rank: 'Senior Lecturer'
    },
    admin: {
        id: 3,
        email: 'admin@demo.com',
        first_name: 'System',
        last_name: 'Admin',
        role: 'admin',
        department: 'Registry',
        avatar_url: null
    }
};

// Mock Projects (With "Joined" Data)
export const MOCK_PROJECTS = [
    {
        id: 1,
        title: 'Design and Implementation of an E-Voting System using Blockchain',
        description: 'A secure, decentralized voting platform designed to eliminate electoral fraud in student union elections. Uses Ethereum smart contracts for immutable record keeping.',
        status: 'in_progress',
        student_id: 1,
        student_first: 'David',
        student_last: 'Adeleke',
        matric_number: '19/0452',
        supervisor_id: 2,
        supervisor_first: 'Dr.',
        supervisor_last: 'Solomon',
        created_at: '2025-09-10T09:00:00Z',
        updated_at: '2025-10-15T14:30:00Z'
    },
    {
        id: 2,
        title: 'Automated Attendance Management using Facial Recognition',
        description: 'Comparison of LBPH and CNN algorithms for real-time classroom attendance tracking.',
        status: 'pending',
        student_id: 4,
        student_first: 'Sarah',
        student_last: 'Okon',
        matric_number: '19/0555',
        supervisor_id: 2,
        supervisor_first: 'Dr.',
        supervisor_last: 'Solomon',
        created_at: '2025-10-01T11:00:00Z',
        updated_at: '2025-10-01T11:00:00Z'
    },
    {
        id: 3,
        title: 'Impact of AI on Undergraduate Learning Outcomes',
        description: 'A statistical analysis of GPA trends pre and post-ChatGPT adoption.',
        status: 'completed',
        student_id: 5,
        student_first: 'Michael',
        student_last: 'Ibrahim',
        matric_number: '19/0601',
        supervisor_id: 2,
        supervisor_first: 'Dr.',
        supervisor_last: 'Solomon',
        created_at: '2025-08-20T10:00:00Z',
        updated_at: '2025-12-15T09:00:00Z'
    }
];

// Mock Milestones
export const MOCK_MILESTONES = [
    {
        id: 1,
        project_id: 1,
        title: 'Submit Chapter 1 (Introduction)',
        description: 'Include background of study, statement of problem, and objectives.',
        due_date: '2025-10-30',
        status: 'completed',
        created_at: '2025-09-15T10:00:00Z'
    },
    {
        id: 2,
        project_id: 1,
        title: 'Submit Chapter 2 (Literature Review)',
        description: 'Review at least 20 recent papers (2020-2025).',
        due_date: '2025-11-15',
        status: 'in_progress',
        created_at: '2025-09-15T10:00:00Z'
    },
    {
        id: 3,
        project_id: 1,
        title: 'System Design & Architecture',
        description: 'UML diagrams, ERD, and flowcharts.',
        due_date: '2025-12-01',
        status: 'pending',
        created_at: '2025-09-15T10:00:00Z'
    }
];

// Mock Notifications
export const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        type: 'info',
        title: 'Proposal Approved',
        message: 'Dr. Solomon approved your topic "E-Voting System".',
        is_read: true,
        created_at: '2025-09-12T14:30:00Z'
    },
    {
        id: 2,
        type: 'warning',
        title: 'Upcoming Deadline',
        message: 'Chapter 2 submission is due in 3 days.',
        is_read: false,
        created_at: new Date().toISOString() // Now
    }
];

// Mock Calendar Events
export const MOCK_EVENTS = [
    {
        id: 1,
        event_name: 'Project Defense (Group A)',
        description: 'Room A201, Main Building',
        start_date: '2026-02-25',
        end_date: '2026-02-25',
        created_at: '2025-01-10T10:00:00Z'
    },
    {
        id: 2,
        event_name: 'Final Submission Deadline',
        description: 'Hard copy + Soft copy CD',
        start_date: '2026-03-10',
        end_date: '2026-03-10',
        created_at: '2025-01-10T10:00:00Z'
    }
];

// Mock Documents
export const MOCK_DOCUMENTS = [
    {
        id: 1,
        project_id: 1,
        document_type: 'chapter_1',
        file_name: 'Chapter_1_v2.pdf',
        file_path: '#',
        version: 2,
        status: 'approved',
        uploaded_at: '2025-10-28T15:00:00Z'
    }
];

export const mockDelay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));
