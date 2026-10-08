<?php
header("Content-Type: application/json; charset=UTF-8");
include 'db.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/chat_lib.php';

// Tenant chat with the landlord. The conversation is the tenant's OWN (from the session).
//   GET  ?after_id=0   -> messages (also marks the landlord's messages as read)
//   POST {body}        -> send a message
$tenantId = require_tenant();

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true) ?: [];
    $res = chat_send($con, $tenantId, 'tenant', $data['body'] ?? '');
    echo json_encode(is_array($res) ? ["success" => true, "message" => $res] : ["success" => false, "message" => $res]);
    exit();
}

$messages = chat_fetch($con, $tenantId, intval($_GET['after_id'] ?? 0));
chat_mark_read($con, $tenantId, 'tenant');
echo json_encode(["success" => true, "messages" => $messages]);
?>
