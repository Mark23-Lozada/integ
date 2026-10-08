<?php
header("Content-Type: application/json; charset=UTF-8");
include 'db.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/billing_lib.php';

// Bell icon: GET = feed + unread count (polled passively), POST = "I opened the bell".
$tenantId = require_tenant();
$gmail = $_SESSION['gmail'];

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $now = ph_now()->format('Y-m-d H:i:s');
    $stmt = mysqli_prepare($con, "UPDATE users SET notif_seen_at = ? WHERE gmail = ?");
    mysqli_stmt_bind_param($stmt, "ss", $now, $gmail);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
    echo json_encode(["success" => true]);
    exit();
}

$bills = [];
$contract = tenant_active_contract($con, $tenantId);
if ($contract) {
    $bills = tenant_bill_schedule($con, $tenantId, $contract)["bills"];
}

$feed = tenant_notifications($con, $tenantId, $gmail, $bills);

// Unread chat messages from the landlord (badge on the Chat menu item)
$chatUnread = 0;
try {
    $c = bl_rows($con, "SELECT COUNT(*) AS c FROM chat_messages WHERE tenant_id = ? AND sender_role = 'landlord' AND read_at IS NULL", 'i', [$tenantId]);
    $chatUnread = (int)$c[0]['c'];
} catch (Throwable $e) { /* migration 03 not run yet */ }

echo json_encode(["success" => true, "unread" => $feed["unread"], "items" => $feed["items"], "chat_unread" => $chatUnread]);
?>
