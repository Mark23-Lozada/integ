<?php
// Shared billing helpers (included by tenant.php and the tenant_* endpoints).
// This file only defines functions. It never prints anything.

const REMINDER_DAYS = 3; // remind this many days before a bill is due

function ph_now() { return new DateTime('now', new DateTimeZone('Asia/Manila')); }
function ph_today() { return ph_now()->format('Y-m-d'); }

// start date + k months, clamped to the end of the month (Jan 31 + 1 month = Feb 28).
// Same result as MySQL DATE_ADD(start, INTERVAL k MONTH), which the SQL backfill uses.
function add_months_clamped($ymd, $k) {
    $d = new DateTime($ymd);
    $day = (int)$d->format('j');
    $d->modify('first day of this month');
    $d->modify('+' . (int)$k . ' months');
    $d->setDate((int)$d->format('Y'), (int)$d->format('n'), min($day, (int)$d->format('t')));
    return $d->format('Y-m-d');
}

function bl_rows($con, $sql, $types = '', $params = []) {
    $stmt = mysqli_prepare($con, $sql);
    if ($types !== '') mysqli_stmt_bind_param($stmt, $types, ...$params);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    $list = [];
    while ($r = mysqli_fetch_assoc($res)) $list[] = $r;
    mysqli_stmt_close($stmt);
    return $list;
}

// One bill per month of the contract. Call it inside the same transaction that creates the contract.
function generate_contract_bills($con, $tenant_id, $contract_id, $start_date, $months, $monthly_rent) {
    $n = 0; $due = ''; $amount = floatval($monthly_rent);
    $stmt = mysqli_prepare($con, "INSERT IGNORE INTO tenant_bills (tenant_id, contract_id, installment_no, amount, due_date) VALUES (?, ?, ?, ?, ?)");
    mysqli_stmt_bind_param($stmt, "iiids", $tenant_id, $contract_id, $n, $amount, $due);
    for ($n = 1; $n <= (int)$months; $n++) {
        $due = add_months_clamped($start_date, $n);
        mysqli_stmt_execute($stmt);
    }
    mysqli_stmt_close($stmt);
}

function tenant_active_contract($con, $tenant_id) {
    $r = bl_rows($con, "SELECT c.id, c.start_date, c.end_date, c.contract_months, c.monthly_rent,
                               c.downpayment_amount, c.contract_status, u.name AS unit_name
                        FROM contracts c LEFT JOIN units u ON c.unit_id = u.id
                        WHERE c.tenant_id = ? AND c.contract_status = 'Active'
                        ORDER BY c.id DESC LIMIT 1", 'i', [$tenant_id]);
    return $r ? $r[0] : null;
}

// Bills of the active contract with their calculated status, plus the money summary.
// Money rule (same as rent.php): remaining = monthly_rent * months - (downpayment + rent payments).
// The credit is applied to the oldest bill first.
function tenant_bill_schedule($con, $tenant_id, $contract) {
    $cid = (int)$contract['id'];

    // Safety net: contracts created before the bills feature get their bills on first use
    $count = bl_rows($con, "SELECT COUNT(*) AS c FROM tenant_bills WHERE contract_id = ?", 'i', [$cid]);
    if ((int)$count[0]['c'] === 0) {
        generate_contract_bills($con, $tenant_id, $cid, $contract['start_date'], $contract['contract_months'], $contract['monthly_rent']);
    }

    $paidRow = bl_rows($con, "SELECT COALESCE(SUM(amount), 0) AS s FROM finances
                              WHERE tenant_id = ? AND contract_id = ? AND payment_type != 'Downpayment'", 'ii', [$tenant_id, $cid]);
    $downpayment = floatval($contract['downpayment_amount']);
    $rentPaid = floatval($paidRow[0]['s']);
    $credit = $downpayment + $rentPaid;

    $today = new DateTime(ph_today());
    $bills = bl_rows($con, "SELECT id, installment_no, amount, due_date FROM tenant_bills WHERE contract_id = ? ORDER BY installment_no", 'i', [$cid]);

    $out = [];
    $nextDue = null;
    $paidCount = 0;
    foreach ($bills as $b) {
        $amount = floatval($b['amount']);
        $alloc = min($amount, $credit);
        $credit = round($credit - $alloc, 2);

        $days = (int)$today->diff(new DateTime($b['due_date']))->format('%r%a'); // negative = overdue
        if ($alloc >= $amount - 0.005) { $status = 'Paid'; $paidCount++; }
        elseif ($days < 0) $status = 'Overdue';
        elseif ($alloc > 0) $status = 'Partial';
        else $status = 'Unpaid';

        $row = [
            'id' => (int)$b['id'],
            'installment_no' => (int)$b['installment_no'],
            'amount' => $amount,
            'due_date' => $b['due_date'],
            'paid_amount' => round($alloc, 2),
            'balance' => round($amount - $alloc, 2),
            'status' => $status,
            'days_until_due' => $days
        ];
        if ($nextDue === null && $status !== 'Paid') $nextDue = $row;
        $out[] = $row;
    }

    $total = floatval($contract['monthly_rent']) * max(1, (int)$contract['contract_months']);
    $totalPaid = $downpayment + $rentPaid;
    return [
        'bills' => $out,
        'next_due' => $nextDue,
        'summary' => [
            'total_contract' => round($total, 2),
            'downpayment' => round($downpayment, 2),
            'total_paid' => round($totalPaid, 2),
            'remaining_balance' => round(max(0, $total - $totalPaid), 2),
            'paid_percent' => $total > 0 ? round(min(100, $totalPaid / $total * 100), 1) : 0,
            'bills_total' => count($out),
            'bills_paid' => $paidCount,
            'overdue_count' => count(array_filter($out, fn($x) => $x['status'] === 'Overdue'))
        ]
    ];
}

// Notification feed = REMINDERS (calculated now, nothing stored) + RECEIPTS (one per payment).
// Opening the bell stores users.notif_seen_at: receipts newer than it are "new", and reminders
// count as unread again on the next day.
function tenant_notifications($con, $tenant_id, $gmail, $bills) {
    $seenRow = bl_rows($con, "SELECT notif_seen_at FROM users WHERE gmail = ?", 's', [$gmail]);
    $seenAt = $seenRow ? $seenRow[0]['notif_seen_at'] : null;
    $remindersSeenToday = $seenAt && substr($seenAt, 0, 10) === ph_today();

    $items = [];
    foreach ($bills as $b) {
        if ($b['status'] === 'Paid') continue;
        $money = '₱' . number_format($b['balance'], 2);
        if ($b['status'] === 'Overdue') {
            $late = abs($b['days_until_due']);
            $items[] = ['type' => 'reminder', 'level' => 'overdue', 'bill_id' => $b['id'],
                'title' => 'Payment overdue',
                'message' => "Installment #{$b['installment_no']}: $money was due on {$b['due_date']} ($late day" . ($late === 1 ? '' : 's') . " late).",
                'date' => $b['due_date'], 'is_new' => !$remindersSeenToday];
        } elseif ($b['days_until_due'] <= REMINDER_DAYS) {
            $when = $b['days_until_due'] === 0 ? 'today' : ('in ' . $b['days_until_due'] . ' day' . ($b['days_until_due'] === 1 ? '' : 's'));
            $items[] = ['type' => 'reminder', 'level' => 'due_soon', 'bill_id' => $b['id'],
                'title' => 'Payment due ' . $when,
                'message' => "Installment #{$b['installment_no']}: $money is due on {$b['due_date']}.",
                'date' => $b['due_date'], 'is_new' => !$remindersSeenToday];
        }
    }

    $payments = bl_rows($con, "SELECT id, amount, payment_type, payment_date FROM finances
                               WHERE tenant_id = ? ORDER BY payment_date DESC, id DESC LIMIT 10", 'i', [$tenant_id]);
    foreach ($payments as $p) {
        $items[] = ['type' => 'receipt', 'payment_id' => (int)$p['id'],
            'title' => 'Payment received',
            'message' => '₱' . number_format($p['amount'], 2) . ' - ' . $p['payment_type'],
            'date' => $p['payment_date'],
            'is_new' => !$seenAt || $p['payment_date'] > $seenAt];
    }

    return [
        'items' => $items,
        'unread' => count(array_filter($items, fn($i) => $i['is_new']))
    ];
}
?>
