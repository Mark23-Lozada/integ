<?php
header("Content-Type: application/json");
include 'db.php';
require_once __DIR__ . '/auth.php';

require_login(); // any role: landlords and tenants can change their own password

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_deny(405, "Method not allowed.");
}

$data = json_decode(file_get_contents("php://input"), true);
$current = (string)($data['current_password'] ?? '');
$new     = (string)($data['new_password'] ?? '');

if ($current === '' || $new === '') {
    echo json_encode(["status" => "error", "success" => false, "message" => "All fields are required."]);
    exit;
}
if (strlen($new) < 8) {
    echo json_encode(["status" => "error", "success" => false, "message" => "New password must be at least 8 characters."]);
    exit;
}
if ($new === $current) {
    echo json_encode(["status" => "error", "success" => false, "message" => "The new password must be different from the current one."]);
    exit;
}

// The account is identified by the SESSION, never by anything the browser sends
$gmail = $_SESSION['gmail'];

$stmt = $con->prepare("SELECT password FROM users WHERE gmail = ?");
$stmt->bind_param("s", $gmail);
$stmt->execute();
$stmt->bind_result($hash);
$found = $stmt->fetch();
$stmt->close();

if (!$found || !password_verify($current, $hash)) {
    usleep(300000); // slow down guessing
    echo json_encode(["status" => "error", "success" => false, "message" => "Current password is incorrect."]);
    exit;
}

$newHash = password_hash($new, PASSWORD_DEFAULT);
$up = $con->prepare("UPDATE users SET password = ?, must_change_password = 0 WHERE gmail = ?");
$up->bind_param("ss", $newHash, $gmail);
$ok = $up->execute();
$up->close();

if ($ok) {
    session_regenerate_id(true); // new session id after a credential change
    $_SESSION['must_change_password'] = 0;
    echo json_encode(["status" => "success", "success" => true, "message" => "Password changed."]);
} else {
    echo json_encode(["status" => "error", "success" => false, "message" => "Could not update the password."]);
}
?>
