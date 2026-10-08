<?php

// Fallback so the code also runs on a PHP without the mbstring extension (XAMPP has it enabled)
if (!function_exists('mb_strlen')) {
    function mb_strlen($s) { return preg_match_all('/./us', (string)$s, $m); }
}

const SESSION_IDLE_TIMEOUT = 1800; // 30 minutes of inactivity = auto logout
const ROLE_LANDLORD = 'landlord';
const ROLE_TENANT   = 'tenant';

function start_secure_session() {
    if (session_status() === PHP_SESSION_ACTIVE) return;

    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');

    ini_set('session.use_strict_mode', '1');   // reject unknown/forged session IDs
    ini_set('session.use_only_cookies', '1');  // never accept session ID from URL
    session_name('POCKETPADS_SESSID');
    session_set_cookie_params([
        'lifetime' => 0,          // cookie dies when browser closes
        'path'     => '/',
        'secure'   => $https,     // HTTPS only when site runs on HTTPS
        'httponly' => true,       // JavaScript cannot read the cookie
        'samesite' => 'Lax'       // blocks cross-site POST (CSRF)
    ]);
    session_start();
}

// Tells the browser/proxies never to store API responses (so Back button can't show old data)
function no_cache_headers() {
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Pragma: no-cache");
    header("Expires: 0");
}

function destroy_session() {
    start_secure_session();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

// $touch = false -> check the session WITHOUT resetting the idle timer (used by background polling)
function is_logged_in($touch = true) {
    start_secure_session();

    if (empty($_SESSION['gmail'])) return false;

    // Sessions made before the role migration carry no role: force a fresh login
    if (!isset($_SESSION['role']) || !in_array($_SESSION['role'], [ROLE_LANDLORD, ROLE_TENANT], true)) {
        destroy_session();
        return false;
    }

    // Bind session to the same browser
    $ua = hash('sha256', $_SERVER['HTTP_USER_AGENT'] ?? '');
    if (!isset($_SESSION['ua']) || !hash_equals($_SESSION['ua'], $ua)) {
        destroy_session();
        return false;
    }

    // Idle timeout
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > SESSION_IDLE_TIMEOUT) {
        destroy_session();
        return false;
    }

    if ($touch) $_SESSION['last_activity'] = time();
    return true;
}

// Role of the logged-in user ('landlord' | 'tenant' | null)
function current_role() {
    start_secure_session();
    return $_SESSION['role'] ?? null;
}

// Tenant id of the logged-in TENANT, taken from the SESSION only (never from the request)
function current_tenant_id() {
    start_secure_session();
    return isset($_SESSION['tenant_id']) ? (int)$_SESSION['tenant_id'] : null;
}

function json_deny($status, $message, $extra = []) {
    http_response_code($status);
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode(array_merge([
        "success" => false,
        "status" => "error",
        "message" => $message
    ], $extra));
    exit();
}

// Session check shared by require_login() and require_role()
function enforce_session() {
    no_cache_headers();

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit();
    }

    // Background polling (GET requests sent with X-Passive: 1) must not keep the session alive,
    // otherwise the idle timeout can never fire while a page is open.
    $passive = (($_SERVER['HTTP_X_PASSIVE'] ?? '') === '1') && (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET');

    if (!is_logged_in(!$passive)) {
        json_deny(401, "Session expired. Please log in again.", ["authenticated" => false]);
    }
}

// Any logged-in user, whatever the role (login/logout/change password only)
function require_login() {
    enforce_session();
}

// Only the given role(s): require_role('landlord') or require_role(['landlord','tenant'])
function require_role($roles) {
    enforce_session();
    if (!in_array($_SESSION['role'], (array)$roles, true)) {
        json_deny(403, "You do not have access to this resource.", ["authenticated" => true]);
    }
}

// For tenant endpoints. Returns the tenant id from the session.
// Use the returned id in every query: NEVER read a tenant id from $_GET / $_POST.
function require_tenant($allowPendingPasswordChange = false) {
    require_role(ROLE_TENANT);
    $tid = current_tenant_id();
    if (!$tid) {
        json_deny(403, "This account is not linked to a tenant.");
    }
    if (!$allowPendingPasswordChange && !empty($_SESSION['must_change_password'])) {
        json_deny(403, "Please change your temporary password first.", ["must_change_password" => true]);
    }
    return $tid;
}
?>
