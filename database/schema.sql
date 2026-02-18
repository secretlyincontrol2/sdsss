-- FYP Management System — Database Schema (PostgreSQL)
-- Babcock University

-- Drop tables if they exist (for fresh setup)
DROP TABLE IF EXISTS academic_calendar CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS document_comments CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'supervisor', 'admin')),
    department VARCHAR(100),
    matric_number VARCHAR(50) UNIQUE,
    staff_id VARCHAR(50) UNIQUE,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    supervisor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(500),
    description TEXT,
    status VARCHAR(30) DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PROPOSALS
-- ============================================
CREATE TABLE proposals (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    abstract TEXT,
    objectives TEXT,
    methodology TEXT,
    file_path VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);

-- ============================================
-- DOCUMENTS (with versioning)
-- ============================================
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT TRUE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DOCUMENT COMMENTS
-- ============================================
CREATE TABLE document_comments (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MILESTONES / TASKS
-- ============================================
CREATE TABLE milestones (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assigned_by INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- GRADES
-- ============================================
CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    graded_by INTEGER NOT NULL REFERENCES users(id),
    component VARCHAR(100) NOT NULL,
    score DECIMAL(5,2),
    max_score DECIMAL(5,2) DEFAULT 100,
    remarks TEXT,
    graded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MESSAGES
-- ============================================
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    reference_type VARCHAR(50),
    reference_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ACADEMIC CALENDAR
-- ============================================
CREATE TABLE academic_calendar (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_projects_student ON projects(student_id);
CREATE INDEX idx_projects_supervisor ON projects(supervisor_id);
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_type_project ON documents(project_id, document_type);
CREATE INDEX idx_milestones_project ON milestones(project_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_proposals_project ON proposals(project_id);
CREATE INDEX idx_grades_project ON grades(project_id);
