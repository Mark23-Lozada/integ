<?php


const SESSION_IDLE_TIMEOUT = 9000; // 30 minutes of inactivity = auto logout

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

function is_logged_in() {
    start_secure_session();

    if (empty($_SESSION['gmail'])) return false;

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

    $_SESSION['last_activity'] = time();
    return true;
}

function require_login() {
    no_cache_headers();

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit();
    }

    if (!is_logged_in()) {
        http_response_code(401);
        header("Content-Type: application/json; charset=UTF-8");
        echo json_encode([
            "success" => false,
            "status" => "error",
            "authenticated" => false,
            "message" => "Session expired. Please log in again."
        ]);
        exit();
    }
}
?>