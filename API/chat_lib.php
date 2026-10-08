<?php
// Shared chat helpers. One conversation per tenant, between that tenant and the landlord.
// This file only defines functions.
require_once __DIR__ . '/auth.php';         // mb_strlen() fallback
require_once __DIR__ . '/billing_lib.php';

const CHAT_MAX_LEN = 1000;
const CHAT_PAGE = 100; // latest messages returned per request

// Messages with id > $afterId (newest CHAT_PAGE of them), oldest first
function chat_fetch($con, $tenantId, $afterId) {
    return bl_rows($con, "SELECT id, sender_role, body, created_at FROM (
                              SELECT id, sender_role, body, created_at FROM chat_messages
                              WHERE tenant_id = ? AND id > ? ORDER BY id DESC LIMIT " . CHAT_PAGE . "
                          ) x ORDER BY id ASC", 'ii', [$tenantId, $afterId]);
}

// The reader has now seen the other side's messages
function chat_mark_read($con, $tenantId, $readerRole) {
    $other = $readerRole === 'landlord' ? 'tenant' : 'landlord';
    $now = ph_now()->format('Y-m-d H:i:s');
    $stmt = mysqli_prepare($con, "UPDATE chat_messages SET read_at = ? WHERE tenant_id = ? AND sender_role = ? AND read_at IS NULL");
    mysqli_stmt_bind_param($stmt, "sis", $now, $tenantId, $other);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
}

// Returns the new message or an error string
function chat_send($con, $tenantId, $senderRole, $body) {
    $body = trim((string)$body);
    if ($body === '') return "Type a message first.";
    if (mb_strlen($body) > CHAT_MAX_LEN) return "The message is too long (maximum " . CHAT_MAX_LEN . " characters).";

    $now = ph_now()->format('Y-m-d H:i:s');
    $stmt = mysqli_prepare($con, "INSERT INTO chat_messages (tenant_id, sender_role, body, created_at) VALUES (?, ?, ?, ?)");
    mysqli_stmt_bind_param($stmt, "isss", $tenantId, $senderRole, $body, $now);
    if (!mysqli_stmt_execute($stmt)) return "Could not send the message.";
    $id = mysqli_insert_id($con);
    mysqli_stmt_close($stmt);
    return ['id' => (int)$id, 'sender_role' => $senderRole, 'body' => $body, 'created_at' => $now];
}
?>
