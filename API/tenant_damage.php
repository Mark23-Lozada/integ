<?php
header("Content-Type: application/json; charset=UTF-8");
include 'db.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/billing_lib.php';

// Tenant: submit a damage report (GET = my reports, POST = new report).
// The tenant AND the unit come from the SESSION / database, never from the request.
$tenantId = require_tenant();

const DAMAGE_MAX_BYTES = 3 * 1024 * 1024; // 3 MB
const DAMAGE_MAX_OPEN = 15;               // unresolved reports per tenant (anti-spam)

// Returns [ok, stored file name | null | error message]
function save_damage_photo($file) {
    if (!$file || $file['error'] === UPLOAD_ERR_NO_FILE) return [true, null];
    if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE) return [false, "The photo is too large (maximum 3 MB)."];
    if ($file['error'] !== UPLOAD_ERR_OK) return [false, "The photo could not be uploaded. Please try again."];
    if ($file['size'] > DAMAGE_MAX_BYTES) return [false, "The photo is too large (maximum 3 MB)."];

    // Judge the real file content, never the name or the browser's content-type
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][$mime] ?? null;
    if (!$ext || @getimagesize($file['tmp_name']) === false) return [false, "Only JPG, PNG or WEBP photos are allowed."];

    $dir = __DIR__ . '/../uploads/damage/';
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    // Apache: never serve these files directly. They are only reachable through api/damage_photo.php
    if (!is_file($dir . '.htaccess')) file_put_contents($dir . '.htaccess', "Require all denied\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n");

    $name = bin2hex(random_bytes(16)) . '.' . $ext; // random name: the original name is never used
    if (!move_uploaded_file($file['tmp_name'], $dir . $name)) return [false, "The photo could not be saved."];
    return [true, $name];
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');

    if (mb_strlen($title) < 3 || mb_strlen($title) > 150) {
        echo json_encode(["success" => false, "message" => "The title must be 3 to 150 characters."]); exit();
    }
    if (mb_strlen($description) < 5 || mb_strlen($description) > 1000) {
        echo json_encode(["success" => false, "message" => "The description must be 5 to 1000 characters."]); exit();
    }

    $open = bl_rows($con, "SELECT COUNT(*) AS c FROM damage_reports WHERE tenant_id = ? AND status != 'Resolved'", 'i', [$tenantId]);
    if ((int)$open[0]['c'] >= DAMAGE_MAX_OPEN) {
        echo json_encode(["success" => false, "message" => "You have too many unresolved reports. Please wait for the landlord to resolve some."]); exit();
    }

    [$ok, $photo] = save_damage_photo($_FILES['photo'] ?? null);
    if (!$ok) { echo json_encode(["success" => false, "message" => $photo]); exit(); }

    $t = bl_rows($con, "SELECT unit_id FROM tenants WHERE id = ?", 'i', [$tenantId]);
    $unitId = $t && $t[0]['unit_id'] ? (int)$t[0]['unit_id'] : null;
    $now = ph_now()->format('Y-m-d H:i:s');

    $stmt = mysqli_prepare($con, "INSERT INTO damage_reports (tenant_id, unit_id, title, description, photo, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?)");
    mysqli_stmt_bind_param($stmt, "iisssss", $tenantId, $unitId, $title, $description, $photo, $now, $now);
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(["success" => true, "message" => "Your report was sent to the landlord.", "id" => mysqli_insert_id($con)]);
    } else {
        echo json_encode(["success" => false, "message" => "Could not save the report."]);
    }
    exit();
}

$reports = bl_rows($con, "SELECT d.id, d.title, d.description, (d.photo IS NOT NULL) AS has_photo, d.status, d.landlord_note,
                                 d.created_at, d.updated_at, d.resolved_at, u.name AS unit_name
                          FROM damage_reports d LEFT JOIN units u ON u.id = d.unit_id
                          WHERE d.tenant_id = ?
                          ORDER BY d.created_at DESC, d.id DESC", 'i', [$tenantId]);
echo json_encode(["success" => true, "reports" => $reports]);
?>
