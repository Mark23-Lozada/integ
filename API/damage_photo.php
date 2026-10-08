<?php
include 'db.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/billing_lib.php';

// Serves ONE damage photo, only to the landlord or to the tenant who made the report.
// The files live in uploads/damage/ (blocked from direct access) and have random names.
require_login();
if (current_role() === ROLE_TENANT) {
    $tenantId = require_tenant();
} else {
    require_role(ROLE_LANDLORD);
    $tenantId = null;
}

$id = intval($_GET['id'] ?? 0);
$r = bl_rows($con, "SELECT tenant_id, photo FROM damage_reports WHERE id = ?", 'i', [$id]);
if (!$r || !$r[0]['photo'] || ($tenantId !== null && (int)$r[0]['tenant_id'] !== $tenantId)) {
    json_deny(404, "Photo not found.");
}

$file = $r[0]['photo'];
if (!preg_match('/^[a-f0-9]{32}\.(jpg|png|webp)$/', $file)) json_deny(404, "Photo not found.");
$path = __DIR__ . '/../uploads/damage/' . $file;
if (!is_file($path)) json_deny(404, "Photo not found.");

$types = ['jpg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'];
header_remove("Content-Type");
header("Content-Type: " . $types[pathinfo($file, PATHINFO_EXTENSION)]);
header("X-Content-Type-Options: nosniff");
header("Content-Length: " . filesize($path));
readfile($path);
exit();
?>
