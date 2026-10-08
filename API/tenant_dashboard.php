<?php
header("Content-Type: application/json; charset=UTF-8");
include 'db.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/billing_lib.php';

// Tenant dashboard data. The tenant comes from the SESSION only.
$tenantId = require_tenant();

$me = bl_rows($con, "SELECT fullname, email, contact_no FROM tenants WHERE id = ?", 'i', [$tenantId]);
if (!$me) json_deny(404, "Tenant record not found.");

$contract = tenant_active_contract($con, $tenantId);
$payments = bl_rows($con, "SELECT id, amount, payment_type, payment_date FROM finances
                           WHERE tenant_id = ? ORDER BY payment_date DESC, id DESC LIMIT 10", 'i', [$tenantId]);

$response = ["success" => true, "tenant" => $me[0], "contract" => $contract, "payments" => $payments,
             "bills" => [], "next_due" => null, "summary" => null];

if ($contract) {
    $sch = tenant_bill_schedule($con, $tenantId, $contract);
    $response["bills"] = $sch["bills"];
    $response["next_due"] = $sch["next_due"];
    $response["summary"] = $sch["summary"];
}

echo json_encode($response);
?>
