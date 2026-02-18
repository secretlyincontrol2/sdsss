<?php

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';
require_once __DIR__ . '/utils/JWTHandler.php';
require_once __DIR__ . '/utils/Logger.php';

// Controllers
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/ProjectController.php';
require_once __DIR__ . '/controllers/ProposalController.php';
require_once __DIR__ . '/controllers/DocumentController.php';
require_once __DIR__ . '/controllers/MilestoneController.php';
require_once __DIR__ . '/controllers/GradeController.php';
require_once __DIR__ . '/controllers/MessageController.php';
require_once __DIR__ . '/controllers/NotificationController.php';
require_once __DIR__ . '/controllers/AdminController.php';
require_once __DIR__ . '/controllers/CalendarController.php';

// Parse the request
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Remove trailing slash
$uri = rtrim($uri, '/');

// Get JSON body
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// ============================================
// ROUTE DISPATCHER
// ============================================

// --- AUTH ROUTES ---
if ($uri === '/api/auth/register' && $method === 'POST') {
    AuthController::register($input);
}
elseif ($uri === '/api/auth/login' && $method === 'POST') {
    AuthController::login($input);
}
elseif ($uri === '/api/auth/me' && $method === 'GET') {
    AuthController::me();
}

// --- PROJECT ROUTES ---
elseif ($uri === '/api/projects' && $method === 'GET') {
    ProjectController::index();
}
elseif ($uri === '/api/projects' && $method === 'POST') {
    ProjectController::create($input);
}
elseif (preg_match('#^/api/projects/(\d+)$#', $uri, $m) && $method === 'GET') {
    ProjectController::show((int)$m[1]);
}
elseif (preg_match('#^/api/projects/(\d+)$#', $uri, $m) && $method === 'PUT') {
    ProjectController::update((int)$m[1], $input);
}
elseif (preg_match('#^/api/projects/(\d+)/members$#', $uri, $m) && $method === 'POST') {
    ProjectController::addMember((int)$m[1], $input);
}
elseif (preg_match('#^/api/projects/(\d+)/members/(\d+)$#', $uri, $m) && $method === 'DELETE') {
    ProjectController::removeMember((int)$m[1], (int)$m[2]);
}

// --- PROPOSAL ROUTES ---
elseif ($uri === '/api/proposals' && $method === 'POST') {
    ProposalController::create($input);
}
elseif (preg_match('#^/api/proposals/(\d+)$#', $uri, $m) && $method === 'GET') {
    ProposalController::show((int)$m[1]);
}
elseif (preg_match('#^/api/proposals/project/(\d+)$#', $uri, $m) && $method === 'GET') {
    ProposalController::getByProject((int)$m[1]);
}
elseif (preg_match('#^/api/proposals/(\d+)/review$#', $uri, $m) && $method === 'PUT') {
    ProposalController::review((int)$m[1], $input);
}

// --- DOCUMENT ROUTES ---
elseif ($uri === '/api/documents/upload' && $method === 'POST') {
    DocumentController::upload();
}
elseif (preg_match('#^/api/documents/project/(\d+)$#', $uri, $m) && $method === 'GET') {
    DocumentController::getByProject((int)$m[1]);
}
elseif (preg_match('#^/api/documents/(\d+)/versions$#', $uri, $m) && $method === 'GET') {
    DocumentController::getVersions((int)$m[1]);
}
elseif (preg_match('#^/api/documents/(\d+)/download$#', $uri, $m) && $method === 'GET') {
    DocumentController::download((int)$m[1]);
}
elseif (preg_match('#^/api/documents/(\d+)/comments$#', $uri, $m) && $method === 'GET') {
    DocumentController::getComments((int)$m[1]);
}
elseif (preg_match('#^/api/documents/(\d+)/comments$#', $uri, $m) && $method === 'POST') {
    DocumentController::addComment((int)$m[1], $input);
}

// --- MILESTONE ROUTES ---
elseif ($uri === '/api/milestones' && $method === 'POST') {
    MilestoneController::create($input);
}
elseif (preg_match('#^/api/milestones/project/(\d+)$#', $uri, $m) && $method === 'GET') {
    MilestoneController::getByProject((int)$m[1]);
}
elseif (preg_match('#^/api/milestones/(\d+)$#', $uri, $m) && $method === 'PUT') {
    MilestoneController::update((int)$m[1], $input);
}

// --- GRADE ROUTES ---
elseif ($uri === '/api/grades' && $method === 'POST') {
    GradeController::create($input);
}
elseif (preg_match('#^/api/grades/project/(\d+)$#', $uri, $m) && $method === 'GET') {
    GradeController::getByProject((int)$m[1]);
}

// --- MESSAGE ROUTES ---
elseif ($uri === '/api/messages' && $method === 'GET') {
    MessageController::index();
}
elseif ($uri === '/api/messages' && $method === 'POST') {
    MessageController::send($input);
}
elseif (preg_match('#^/api/messages/conversation/(\d+)$#', $uri, $m) && $method === 'GET') {
    MessageController::conversation((int)$m[1]);
}
elseif (preg_match('#^/api/messages/(\d+)/read$#', $uri, $m) && $method === 'PUT') {
    MessageController::markRead((int)$m[1]);
}

// --- NOTIFICATION ROUTES ---
elseif ($uri === '/api/notifications' && $method === 'GET') {
    NotificationController::index();
}
elseif (preg_match('#^/api/notifications/(\d+)/read$#', $uri, $m) && $method === 'PUT') {
    NotificationController::markRead((int)$m[1]);
}
elseif ($uri === '/api/notifications/read-all' && $method === 'PUT') {
    NotificationController::markAllRead();
}

// --- ADMIN ROUTES ---
elseif ($uri === '/api/admin/users' && $method === 'GET') {
    AdminController::listUsers();
}
elseif (preg_match('#^/api/admin/users/(\d+)$#', $uri, $m) && $method === 'PUT') {
    AdminController::updateUser((int)$m[1], $input);
}
elseif (preg_match('#^/api/admin/users/(\d+)$#', $uri, $m) && $method === 'DELETE') {
    AdminController::deleteUser((int)$m[1]);
}
elseif ($uri === '/api/admin/allocate' && $method === 'POST') {
    AdminController::allocateSupervisor($input);
}
elseif ($uri === '/api/admin/analytics' && $method === 'GET') {
    AdminController::analytics();
}
elseif ($uri === '/api/admin/logs' && $method === 'GET') {
    AdminController::getLogs();
}

// --- CALENDAR ROUTES ---
elseif ($uri === '/api/calendar' && $method === 'GET') {
    CalendarController::index();
}
elseif ($uri === '/api/calendar' && $method === 'POST') {
    CalendarController::create($input);
}
elseif (preg_match('#^/api/calendar/(\d+)$#', $uri, $m) && $method === 'PUT') {
    CalendarController::update((int)$m[1], $input);
}
elseif (preg_match('#^/api/calendar/(\d+)$#', $uri, $m) && $method === 'DELETE') {
    CalendarController::delete((int)$m[1]);
}

// --- 404 ---
else {
    http_response_code(404);
    echo json_encode(['error' => 'Route not found', 'uri' => $uri, 'method' => $method]);
}
