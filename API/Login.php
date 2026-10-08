<?php
header("Content-Type: application/json");
include 'db.php';
require_once __DIR__ . '/auth.php';

no_cache_headers();
start_secure_session();

const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 300;

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed."]);
    exit;
}

// Temporary lock after too many wrong attempts
if (!empty($_SESSION['lock_until']) && time() < $_SESSION['lock_until']) {
    $wait = $_SESSION['lock_until'] - time();
    echo json_encode(["status" => "error", "message" => "Too many failed attempts. Try again in " . ceil($wait / 60) . " minute(s)."]);
    exit;
}

function login_fail($msg) {
    $_SESSION['attempts'] = ($_SESSION['attempts'] ?? 0) + 1;
    if ($_SESSION['attempts'] >= MAX_ATTEMPTS) {
        $_SESSION['lock_until'] = time() + LOCK_SECONDS;
        $_SESSION['attempts'] = 0;
    }
    usleep(300000); // slow down brute-force
    echo json_encode(["status" => "error", "message" => $msg]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['gmail']) && isset($data['password'])) {
    $user = trim($data['gmail']);
    $pass = trim($data['password']);

    if (empty($user) || empty($pass)) {
        echo json_encode(["status" => "error", "message" => "All fields are required."]);
        exit;
    }

    if (!filter_var($user, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "Invalid Gmail format."]);
        exit;
    }

    $stmt = $con->prepare("SELECT password, names, role, tenant_id, must_change_password FROM users WHERE gmail = ?");
    if ($stmt) {
        $stmt->bind_param("s", $user);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $stmt->bind_result($hashed_password, $names, $role, $tenant_id, $must_change);
            $stmt->fetch();
            $stmt->close();

            if (password_verify($pass, $hashed_password)) {
                // A tenant login must point to a tenant record
                if ($role === 'tenant' && empty($tenant_id)) {
                    login_fail("This tenant account is not linked to a tenant record. Contact your landlord.");
                }

                // New session ID on login (prevents session fixation)
                session_regenerate_id(true);
                $_SESSION = [];
                $_SESSION['gmail'] = $user;
                $_SESSION['names'] = $names;
                $_SESSION['role'] = $role;
                $_SESSION['tenant_id'] = $role === 'tenant' ? (int)$tenant_id : null;
                $_SESSION['must_change_password'] = (int)$must_change;
                $_SESSION['last_activity'] = time();
                $_SESSION['ua'] = hash('sha256', $_SERVER['HTTP_USER_AGENT'] ?? '');

                echo json_encode([
                    "status" => "success",
                    "message" => "Login successful!",
                    "names" => $names,
                    "role" => $role,
                    "must_change_password" => (bool)$must_change
                ]);
            } else {
                login_fail("Invalid Gmail or password!");
            }
        } else {
            $stmt->close();
            login_fail("Invalid Gmail or password!");
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Database query preparation failed."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Incomplete data provided."]);
}
?>