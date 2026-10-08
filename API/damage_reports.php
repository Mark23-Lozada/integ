<?php
header("Content-Type: application/json; charset=UTF-8");
include 'db.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/billing_lib.php';

// Landlord: all damage reports (GET) and status / note updates (POST).
require_role(ROLE_LANDLORD);

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true) ?: [];
    $id = intval($data['id'] ?? 0);
    $status = (string)($data['status'] ?? '');
    $note = trim((string)($data['landlord_note'] ?? ''));

    if (!in_array($status, ['Pending', 'In Progress', 'Resolved'], true)) {
        echo json_encode(["success" => false, "message" => "Invalid status."]); exit();
    }
    if (mb_strlen($note) > 1000) {
        echo json_encode(["success" => false, "message" => "The note is too long (maximum 1000 characters)."]); exit();
    }

    $exists = bl_rows($con, "SELECT id FROM damage_reports WHERE id = ?", 'i', [$id]);
    if (!$exists) { echo json_encode(["success" => false, "message" => "Report not found."]); exit(); }

    $now = ph_now()->format('Y-m-d H:i:s');
    $resolvedAt = $status === 'Resolved' ? $now : null;
    $stmt = mysqli_prepare($con, "UPDATE damage_reports SET status = ?, landlord_note = ?, updated_at = ?, resolved_at = ? WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "ssssi", $status, $note, $now, $resolvedAt, $id);
    echo json_encode(mysqli_stmt_execute($stmt)
        ? ["success" => true, "message" => "Report updated."]
        : ["success" => false, "message" => "Could not update the report."]);
    exit();
}

$reports = bl_rows($con, "SELECT d.id, d.tenant_id, d.unit_id, d.title, d.description, (d.photo IS NOT NULL) AS has_photo, d.status,
                                 d.landlord_note, d.created_at, d.updated_at, d.resolved_at,
                                 t.fullname AS tenant_name, t.contact_no, u.name AS unit_name,
                                 (SELECT COALESCE(SUM(e.amount), 0) FROM property_expenses e WHERE e.damage_report_id = d.id) AS expense_total
                          FROM damage_reports d
                          LEFT JOIN tenants t ON t.id = d.tenant_id
                          LEFT JOIN units u ON u.id = d.unit_id
                          ORDER BY FIELD(d.status, 'Pending', 'In Progress', 'Resolved'), d.created_at DESC, d.id DESC");

$counts = ['Pending' => 0, 'In Progress' => 0, 'Resolved' => 0];
$cost = 0;
foreach ($reports as $r) { $counts[$r['status']]++; $cost += floatval($r['expense_total']); }

echo json_encode(["success" => true, "reports" => $reports, "counts" => $counts, "repair_cost" => round($cost, 2)]);
?>
