<?php
header("Content-Type: application/json; charset=UTF-8");
include 'db.php';
require_once __DIR__ . '/auth.php';

// Badges of the landlord menu (polled passively): pending damage reports + unread tenant messages.
require_role(ROLE_LANDLORD);

$out = ["success" => true, "pending_damage" => 0, "unread_chat" => 0];
try {
    $r = mysqli_query($con, "SELECT COUNT(*) AS c FROM damage_reports WHERE status = 'Pending'");
    $out["pending_damage"] = (int)mysqli_fetch_assoc($r)['c'];
    $r = mysqli_query($con, "SELECT COUNT(*) AS c FROM chat_messages WHERE sender_role = 'tenant' AND read_at IS NULL");
    $out["unread_chat"] = (int)mysqli_fetch_assoc($r)['c'];
} catch (Throwable $e) {
    // migration 03 not run yet: show no badges instead of breaking the menu
}
echo json_encode($out);
?>
