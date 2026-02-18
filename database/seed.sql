-- FYP Management System — Seed Data
-- Passwords are bcrypt hashes of 'password123'

-- Admin account
INSERT INTO users (email, password_hash, first_name, last_name, role, department, staff_id)
VALUES (
    'admin@babcock.edu.ng',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'System',
    'Administrator',
    'admin',
    'Computer Science',
    'STAFF001'
);

-- Supervisor accounts
INSERT INTO users (email, password_hash, first_name, last_name, role, department, staff_id)
VALUES
(
    'dr.johnson@babcock.edu.ng',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'David',
    'Johnson',
    'supervisor',
    'Computer Science',
    'STAFF002'
),
(
    'dr.williams@babcock.edu.ng',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Grace',
    'Williams',
    'supervisor',
    'Software Engineering',
    'STAFF003'
);

-- Student accounts
INSERT INTO users (email, password_hash, first_name, last_name, role, department, matric_number)
VALUES
(
    'student1@babcock.edu.ng',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Adedayo',
    'Majuyi',
    'student',
    'Computer Science',
    '20/1234'
),
(
    'student2@babcock.edu.ng',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Timi',
    'Olanrewaju',
    'student',
    'Computer Science',
    '20/5678'
);

-- Sample project
INSERT INTO projects (student_id, supervisor_id, title, description, status)
VALUES (
    4, 2,
    'FYP Management and Supervision System',
    'A web-based platform to digitize and structure the undergraduate project supervision process at Babcock University.',
    'in_progress'
);

-- Sample milestone
INSERT INTO milestones (project_id, assigned_by, title, description, due_date, status)
VALUES
(1, 2, 'Submit Chapter 1 - Introduction', 'Complete the introduction chapter including background, problem statement, objectives, and scope.', '2026-03-15', 'pending'),
(1, 2, 'Submit Chapter 2 - Literature Review', 'Review at least 15 relevant academic papers and existing systems.', '2026-04-01', 'pending'),
(1, 2, 'Submit Chapter 3 - Methodology', 'Document the system design, architecture, and development methodology.', '2026-04-20', 'pending');

-- Sample academic calendar events
INSERT INTO academic_calendar (event_name, description, start_date, end_date, created_by)
VALUES
('Proposal Submission Deadline', 'Last day to submit project proposals for review', '2026-03-01', '2026-03-01', 1),
('Mid-Semester Review', 'Supervisors review student progress at mid-semester', '2026-04-15', '2026-04-17', 1),
('Final Project Submission', 'Deadline for submitting completed project reports', '2026-06-30', '2026-06-30', 1),
('Project Defense', 'Students present and defend their projects', '2026-07-10', '2026-07-14', 1);
