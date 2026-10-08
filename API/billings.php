<?php
header("Content-Type: application/json; charset=UTF-8");
include 'db.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/billing_lib.php';

// Landlord Billings page: every monthly installment of every ACTIVE contract, with calculated status.
// Uses the same calculation as the tenant dashboard and rent.php, so the numbers always match.
require_role(ROLE_LANDLORD);

$contracts = bl_rows($con, "SELECT t.id AS tenant_id, t.fullname, t.contact_no,
                                   c.id, c.start_date, c.end_date, c.contract_months, c.monthly_rent, c.downpayment_amount,
                                   u.name AS unit_name
                            FROM tenants t
                            JOIN contracts c ON c.tenant_id = t.id AND c.contract_status = 'Active'
                            LEFT JOIN units u ON c.unit_id = u.id
                            ORDER BY t.fullname");

$bills = [];
$sum = ["total_billed" => 0, "collected" => 0, "outstanding" => 0, "overdue_count" => 0, "overdue_amount" => 0,
        "due_this_month" => 0, "bills_total" => 0, "bills_paid" => 0, "tenants_overdue" => 0];
$thisMonth = substr(ph_today(), 0, 7);

foreach ($contracts as $c) {
    $sch = tenant_bill_schedule($con, (int)$c['tenant_id'], $c);
    $hasOverdue = false;
    foreach ($sch['bills'] as $b) {
        $b['bill_id'] = $b['id'];
        unset($b['id']);
        $b['tenant_id'] = (int)$c['tenant_id'];
        $b['tenant_name'] = $c['fullname'];
        $b['contact_no'] = $c['contact_no'];
        $b['unit_name'] = $c['unit_name'];
        $bills[] = $b;

        $sum['total_billed'] += $b['amount'];
        $sum['collected'] += $b['paid_amount'];
        $sum['outstanding'] += $b['balance'];
        $sum['bills_total']++;
        if ($b['status'] === 'Paid') $sum['bills_paid']++;
        if ($b['status'] === 'Overdue') { $sum['overdue_count']++; $sum['overdue_amount'] += $b['balance']; $hasOverdue = true; }
        if ($b['status'] !== 'Paid' && substr($b['due_date'], 0, 7) === $thisMonth) $sum['due_this_month'] += $b['balance'];
    }
    if ($hasOverdue) $sum['tenants_overdue']++;
}

foreach (['total_billed', 'collected', 'outstanding', 'overdue_amount', 'due_this_month'] as $k) $sum[$k] = round($sum[$k], 2);

// Soonest due date first; overdue bills therefore come first
usort($bills, fn($a, $b) => strcmp($a['due_date'], $b['due_date']) ?: strcmp($a['tenant_name'], $b['tenant_name']));

echo json_encode(["success" => true, "bills" => $bills, "summary" => $sum]);
?>
