<?php
header("Content-Type: application/json; charset=UTF-8");
include 'db.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/billing_lib.php';

// Receipt of ONE payment of the logged-in tenant. Returns the same fields that
// RentController.printReceipt() already prints for the landlord.
$tenantId = require_tenant();
$paymentId = intval($_GET['id'] ?? 0);

// The payment must belong to this tenant (an id from another tenant simply returns 404)
$pay = bl_rows($con, "SELECT id, contract_id, amount, payment_type, payment_date FROM finances WHERE id = ? AND tenant_id = ?", 'ii', [$paymentId, $tenantId]);
if (!$pay) json_deny(404, "Receipt not found.");
$pay = $pay[0];

$t = bl_rows($con, "SELECT t.fullname, t.contact_no, t.email, t.province_address, t.valid_id_type, t.valid_id_number,
                           t.emergency_contact_name, t.emergency_contact_no, u.name AS unit_name
                    FROM tenants t LEFT JOIN units u ON t.unit_id = u.id WHERE t.id = ?", 'i', [$tenantId]);
if (!$t) json_deny(404, "Tenant record not found.");
$t = $t[0];

// Contract the payment belongs to (falls back to the active one for older rows)
$contract = null;
if ($pay['contract_id'] !== null) {
    $c = bl_rows($con, "SELECT id, contract_months, monthly_rent, downpayment_amount FROM contracts WHERE id = ? AND tenant_id = ?", 'ii', [(int)$pay['contract_id'], $tenantId]);
    $contract = $c ? $c[0] : null;
}
if (!$contract) $contract = tenant_active_contract($con, $tenantId);

$monthly = $contract ? floatval($contract['monthly_rent']) : 0;
$months = $contract ? max(1, (int)$contract['contract_months']) : 1;
$total = $monthly * $months;
$dp = $contract ? floatval($contract['downpayment_amount']) : 0;

// Balance AFTER this payment = total - (downpayment + rent payments up to this one)
$paidToDate = $dp;
if ($contract) {
    $s = bl_rows($con, "SELECT COALESCE(SUM(amount), 0) AS s FROM finances
                        WHERE tenant_id = ? AND contract_id = ? AND payment_type != 'Downpayment' AND id <= ?", 'iii', [$tenantId, (int)$contract['id'], $paymentId]);
    $paidToDate += floatval($s[0]['s']);
}

// tenant_members stores an age (no birthdate), so the receipt's third column shows "Age n"
$members = bl_rows($con, "SELECT fullname, relationship, CONCAT('Age ', member_age) AS birthdate FROM tenant_members WHERE tenant_id = ?", 'i', [$tenantId]);

echo json_encode(["success" => true, "receipt" => array_merge($t, [
    "payment_id" => (int)$pay['id'],
    "monthly_rent" => $monthly,
    "contract_months" => $months,
    "total_contract_amount" => $total,
    "downpayment_amount" => $dp,
    "amount_paid" => floatval($pay['amount']),
    "remarks" => $pay['payment_type'],
    "payment_date" => $pay['payment_date'],
    "remaining_balance" => max(0, $total - $paidToDate),
    "members" => $members
])]);
?>
