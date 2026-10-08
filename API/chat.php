<?php
header("Content-Type: application/json; charset=UTF-8");
include 'db.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/chat_lib.php';

// Landlord chat.
//   GET  ?action=threads                    -> tenants with a portal login, last message, unread count
//   GET  ?tenant_id=5&after_id=0            -> messages of one tenant (also marks the tenant's messages as read)
//   POST {tenant_id, body}                  -> send a message to that tenant
require_role(ROLE_LANDLORD);

function chat_tenant_has_login($con, $tenantId) {
    return (bool)bl_rows($con, "SELECT 1 FROM users WHERE tenant_id = ? AND role = 'tenant'", 'i', [$tenantId]);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true) ?: [];
    $tenantId = intval($data['tenant_id'] ?? 0);
    if ($tenantId <= 0 || !chat_tenant_has_login($con, $tenantId)) {
        echo json_encode(["success" => false, "message" => "That tenant has no portal login yet."]); exit();
    }
    $res = chat_send($con, $tenantId, 'landlord', $data['body'] ?? '');
    echo json_encode(is_array($res) ? ["success" => true, "message" => $res] : ["success" => false, "message" => $res]);
    exit();
}

if (($_GET['action'] ?? '') === 'threads') {
    $threads = bl_rows($con, "SELECT t.id AS tenant_id, t.fullname, un.name AS unit_name,
                                     (SELECT m.body FROM chat_messages m WHERE m.tenant_id = t.id ORDER BY m.id DESC LIMIT 1) AS last_body,
                                     (SELECT m.created_at FROM chat_messages m WHERE m.tenant_id = t.id ORDER BY m.id DESC LIMIT 1) AS last_at,
                                     (SELECT m.sender_role FROM chat_messages m WHERE m.tenant_id = t.id ORDER BY m.id DESC LIMIT 1) AS last_sender,
                                     (SELECT COUNT(*) FROM chat_messages m WHERE m.tenant_id = t.id AND m.sender_role = 'tenant' AND m.read_at IS NULL) AS unread
                              FROM tenants t
                              JOIN users ua ON ua.tenant_id = t.id AND ua.role = 'tenant'
                              LEFT JOIN units un ON un.id = t.unit_id
                              ORDER BY (last_at IS NULL), last_at DESC, t.fullname");
    foreach ($threads as &$th) { $th['unread'] = (int)$th['unread']; }
    echo json_encode(["success" => true, "threads" => $threads]);
    exit();
}

$tenantId = intval($_GET['tenant_id'] ?? 0);
if ($tenantId <= 0 || !chat_tenant_has_login($con, $tenantId)) {
    echo json_encode(["success" => false, "message" => "Conversation not found."]); exit();
}
$messages = chat_fetch($con, $tenantId, intval($_GET['after_id'] ?? 0));
chat_mark_read($con, $tenantId, 'landlord');
echo json_encode(["success" => true, "messages" => $messages]);
?>
