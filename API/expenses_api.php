<?php
ob_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

ini_set('display_errors', 0);
error_reporting(E_ALL);

include 'db.php';

const BUDGET_RATE = 0.30; // 30% of each month's collected rent goes to the Monthly Budget

function out($arr) {
    ob_clean();
    echo json_encode($arr);
    exit();
}

if (!$con) {
    out(["success" => false, "message" => "Connection Failed: " . mysqli_connect_error()]);
}
mysqli_set_charset($con, "utf8mb4");

// ---------- Helpers ----------
function rows($con, $sql, $types = '', $params = []) {
    $stmt = mysqli_prepare($con, $sql);
    if ($types !== '') mysqli_stmt_bind_param($stmt, $types, ...$params);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    $list = [];
    while ($r = mysqli_fetch_assoc($res)) $list[] = $r;
    mysqli_stmt_close($stmt);
    return $list;
}

function scalar($con, $sql, $types = '', $params = []) {
    $r = rows($con, $sql, $types, $params);
    if (!$r) return 0.0;
    return floatval(array_values($r[0])[0] ?? 0);
}

function monthRange($ym) {
    $start = $ym . '-01';
    $end = date('Y-m-d', strtotime($start . ' +1 month'));
    return [$start, $end];
}

function validMonth($ym) {
    return is_string($ym) && preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $ym);
}

// Auto-add columns that record how much of an expense came from the budget and how much went over.
function ensureColumns($con) {
    foreach (['budget_amount', 'overflow_amount'] as $col) {
        $r = mysqli_query($con, "SHOW COLUMNS FROM property_expenses LIKE '$col'");
        if ($r && mysqli_num_rows($r) === 0) {
            mysqli_query($con, "ALTER TABLE property_expenses ADD COLUMN $col DECIMAL(12,2) NULL DEFAULT NULL");
        }
    }
}
ensureColumns($con);

// Older approved expenses (no budget_amount) count fully against the budget.
const SQL_BUDGET_PART = "COALESCE(budget_amount, amount)";
const SQL_OVERFLOW_PART = "COALESCE(overflow_amount, 0)";

function monthStats($con, $ym) {
    list($s, $e) = monthRange($ym);

    $collected = scalar($con, "SELECT COALESCE(SUM(amount),0) FROM finances WHERE payment_date >= ? AND payment_date < ?", 'ss', [$s, $e]);

    $a = rows($con, "SELECT COALESCE(SUM(amount),0) AS spent,
                            COALESCE(SUM(" . SQL_BUDGET_PART . "),0) AS budget_used,
                            COALESCE(SUM(" . SQL_OVERFLOW_PART . "),0) AS overflow
                     FROM property_expenses
                     WHERE status = 'Approved' AND expense_date >= ? AND expense_date < ?", 'ss', [$s, $e])[0];

    $pending = scalar($con, "SELECT COALESCE(SUM(amount),0) FROM property_expenses WHERE status = 'Pending' AND expense_date >= ? AND expense_date < ?", 'ss', [$s, $e]);

    $pool = round($collected * BUDGET_RATE, 2);
    $budgetUsed = floatval($a['budget_used']);
    $remaining = max(0, round($pool - $budgetUsed, 2));

    return [
        "collected"       => $collected,
        "budgetPool"      => $pool,
        "budgetUsed"      => $budgetUsed,
        "budgetRemaining" => $remaining,
        "overflow"        => floatval($a['overflow']),
        "totalSpent"      => floatval($a['spent']),
        "pending"         => $pending,
        "netProfit"       => $collected - floatval($a['spent'])
    ];
}

// Clause matching any of the given keywords in sub_category (English and older entries).
function likeClause($keywords, &$types, &$params) {
    $parts = [];
    foreach ($keywords as $k) {
        $parts[] = 'sub_category LIKE ?';
        $types .= 's';
        $params[] = '%' . $k . '%';
    }
    return $parts ? '(' . implode(' OR ', $parts) . ')' : '1=0';
}

// Finds the latest month with a bill and compares it with the previous month that has a bill.
function utilityComparison($con, $keywords) {
    $types = ''; $params = []; $where = likeClause($keywords, $types, $params);
    $list = rows($con, "SELECT DATE_FORMAT(expense_date, '%Y-%m') AS ym, SUM(amount) AS total
                        FROM property_expenses
                        WHERE $where
                        GROUP BY ym
                        ORDER BY ym DESC
                        LIMIT 2", $types, $params);

    $current = isset($list[0]) ? floatval($list[0]['total']) : 0;
    $previous = isset($list[1]) ? floatval($list[1]['total']) : 0;
    $diff = $current - $previous;
    $percentage = $previous > 0 ? round((abs($diff) / $previous) * 100, 1) : 0;

    return [
        "current"       => $current,
        "previous"      => $previous,
        "currentMonth"  => $list[0]['ym'] ?? null,
        "previousMonth" => $list[1]['ym'] ?? null,
        "diff"          => $diff,
        "percentage"    => $percentage,
        "isIncrease"    => $diff >= 0
    ];
}

function yearSummary($con, $year) {
    $months = [];
    for ($m = 1; $m <= 12; $m++) {
        $months[$m] = ["month" => $m, "collected" => 0, "budgetPool" => 0, "budgetUsed" => 0, "overflow" => 0, "spent" => 0, "netProfit" => 0];
    }

    $ys = $year . '-01-01';
    $ye = ($year + 1) . '-01-01';

    $inc = rows($con, "SELECT MONTH(payment_date) AS m, SUM(amount) AS total FROM finances WHERE payment_date >= ? AND payment_date < ? GROUP BY MONTH(payment_date)", 'ss', [$ys, $ye]);
    foreach ($inc as $r) $months[intval($r['m'])]['collected'] = floatval($r['total']);

    $exp = rows($con, "SELECT MONTH(expense_date) AS m, SUM(amount) AS spent,
                              SUM(" . SQL_BUDGET_PART . ") AS b, SUM(" . SQL_OVERFLOW_PART . ") AS o
                       FROM property_expenses
                       WHERE status = 'Approved' AND expense_date >= ? AND expense_date < ?
                       GROUP BY MONTH(expense_date)", 'ss', [$ys, $ye]);
    foreach ($exp as $r) {
        $i = intval($r['m']);
        $months[$i]['spent'] = floatval($r['spent']);
        $months[$i]['budgetUsed'] = floatval($r['b']);
        $months[$i]['overflow'] = floatval($r['o']);
    }

    $totals = ["collected" => 0, "budgetPool" => 0, "budgetUsed" => 0, "overflow" => 0, "spent" => 0, "netProfit" => 0];
    foreach ($months as $i => $mm) {
        $months[$i]['budgetPool'] = round($mm['collected'] * BUDGET_RATE, 2);
        $months[$i]['netProfit'] = $mm['collected'] - $mm['spent'];
        foreach ($totals as $k => $_) $totals[$k] += $months[$i][$k];
    }

    return ["year" => intval($year), "months" => array_values($months), "totals" => $totals];
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') out(["success" => true]);

// ---------- GET ----------
if ($method === 'GET') {
    if (($_GET['action'] ?? '') === 'utility_history') {
        $types = ''; $params = []; $where = likeClause(array_filter(array_map('trim', explode(',', $_GET['sub_category'] ?? ''))), $types, $params);
        $history = rows($con, "SELECT id, category, sub_category, amount, expense_date, status FROM property_expenses WHERE $where ORDER BY expense_date DESC, id DESC", $types, $params);
        out(["success" => true, "history" => $history]);
    }

    $month = $_GET['month'] ?? date('Y-m');
    if (!validMonth($month)) $month = date('Y-m');
    $year = intval($_GET['year'] ?? substr($month, 0, 4));
    if ($year < 2000 || $year > 2100) $year = intval(date('Y'));

    list($s, $e) = monthRange($month);

    $expenses = rows($con, "SELECT * FROM property_expenses WHERE expense_date >= ? AND expense_date < ? ORDER BY expense_date DESC, id DESC", 'ss', [$s, $e]);

    // Cash on hand (all time): total collected minus all approved expenses
    $allCollected = scalar($con, "SELECT COALESCE(SUM(amount),0) FROM finances");
    $allSpent = scalar($con, "SELECT COALESCE(SUM(amount),0) FROM property_expenses WHERE status = 'Approved'");

    out([
        "success"     => true,
        "budgetRate"  => BUDGET_RATE,
        "month"       => $month,
        "monthStats"  => monthStats($con, $month),
        "expenses"    => $expenses,
        "billComparison" => [
            "electricity" => utilityComparison($con, ['Electric', 'Meralco']),
            "water"       => utilityComparison($con, ['Water', 'Tubig']),
            "internet"    => utilityComparison($con, ['WiFi', 'Internet'])
        ],
        "year"        => yearSummary($con, $year),
        "cashOnHand"  => $allCollected - $allSpent
    ]);
}

// ---------- POST ----------
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true) ?: $_POST;
    $action = $data['action'] ?? 'add';

    // DELETE
    if ($action === 'delete') {
        $id = intval($data['id'] ?? 0);
        if ($id <= 0) out(["success" => false, "message" => "Invalid ID for deletion."]);
        $stmt = mysqli_prepare($con, "DELETE FROM property_expenses WHERE id = ?");
        mysqli_stmt_bind_param($stmt, "i", $id);
        if (mysqli_stmt_execute($stmt)) out(["success" => true, "message" => "Expense deleted."]);
        out(["success" => false, "message" => "Database Error: " . mysqli_error($con)]);
    }

    // APPROVE (this is where budget vs. overflow is decided)
    if ($action === 'approve') {
        $id = intval($data['id'] ?? 0);
        $confirm = !empty($data['confirm_overbudget']);

        $found = rows($con, "SELECT * FROM property_expenses WHERE id = ?", 'i', [$id]);
        if (!$found) out(["success" => false, "message" => "Expense not found."]);
        $exp = $found[0];

        if ($exp['status'] === 'Approved') out(["success" => false, "message" => "This expense is already approved."]);

        $amount = floatval($exp['amount']);
        $ym = substr($exp['expense_date'], 0, 7);

        // 1) There must be enough cash on hand (all-time net profit)
        $cash = scalar($con, "SELECT COALESCE(SUM(amount),0) FROM finances")
              - scalar($con, "SELECT COALESCE(SUM(amount),0) FROM property_expenses WHERE status = 'Approved'");
        if ($cash < $amount) {
            out(["success" => false, "message" => "Insufficient funds. Cash on hand is ₱" . number_format($cash, 2) . " but ₱" . number_format($amount, 2) . " is required."]);
        }

        // 2) How much of this the month's Monthly Budget can cover
        $ms = monthStats($con, $ym);
        $fromBudget = min($amount, $ms['budgetRemaining']);
        $overflow = round($amount - $fromBudget, 2);

        // 3) If it exceeds the budget, ask for confirmation. The excess is taken from profit.
        if ($overflow > 0 && !$confirm) {
            out([
                "success" => false,
                "needs_confirmation" => true,
                "overflow" => $overflow,
                "fromBudget" => $fromBudget,
                "budgetRemaining" => $ms['budgetRemaining'],
                "message" => "This exceeds the month's Monthly Budget by ₱" . number_format($overflow, 2) . " (remaining: ₱" . number_format($ms['budgetRemaining'], 2) . "). The excess will be taken from your profit. Continue?"
            ]);
        }

        $stmt = mysqli_prepare($con, "UPDATE property_expenses SET status = 'Approved', budget_amount = ?, overflow_amount = ? WHERE id = ?");
        mysqli_stmt_bind_param($stmt, "ddi", $fromBudget, $overflow, $id);
        mysqli_stmt_execute($stmt);

        $msg = $overflow > 0
            ? "Approved. ₱" . number_format($fromBudget, 2) . " from the budget, ₱" . number_format($overflow, 2) . " over budget (taken from profit)."
            : "Expense approved (within the Monthly Budget).";
        out(["success" => true, "message" => $msg]);
    }

    // ADD MANY (several items in one save, all Pending)
    if ($action === 'add_many') {
        $items = $data['items'] ?? [];
        $expense_date = trim($data['expense_date'] ?? '');
        $description = trim($data['description'] ?? '');
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $expense_date)) $expense_date = date('Y-m-d');

        if (!is_array($items) || count($items) === 0 || count($items) > 50) {
            out(["success" => false, "message" => "Add between 1 and 50 items."]);
        }

        $clean = [];
        $total = 0;
        foreach ($items as $it) {
            $cat = trim($it['category'] ?? '');
            $sub = trim($it['sub_category'] ?? '');
            $amt = floatval($it['amount'] ?? 0);
            if ($cat === '' || $sub === '' || $amt <= 0) {
                out(["success" => false, "message" => "An item is missing its category, name, or amount."]);
            }
            $clean[] = [$cat, $sub, $amt];
            $total += $amt;
        }

        mysqli_begin_transaction($con);
        $stmt = mysqli_prepare($con, "INSERT INTO property_expenses (category, sub_category, amount, expense_date, description, status) VALUES (?, ?, ?, ?, ?, 'Pending')");
        mysqli_stmt_bind_param($stmt, "ssdss", $c, $sc, $a, $expense_date, $description);
        foreach ($clean as $row) {
            list($c, $sc, $a) = $row;
            if (!mysqli_stmt_execute($stmt)) {
                mysqli_rollback($con);
                out(["success" => false, "message" => "Save error: " . mysqli_error($con)]);
            }
        }
        mysqli_commit($con);
        out(["success" => true, "message" => count($clean) . " item(s) added (₱" . number_format($total, 2) . ", pending approval)."]);
    }

    // ADD (Pending)
    $category = trim($data['category'] ?? '');
    $sub_category = trim($data['sub_category'] ?? '');
    $amount = floatval($data['amount'] ?? 0);
    $expense_date = trim($data['expense_date'] ?? '');
    $description = trim($data['description'] ?? '');

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $expense_date)) $expense_date = date('Y-m-d');

    if ($category === '' || $sub_category === '' || $amount <= 0) {
        out(["success" => false, "message" => "Please fill in the category, item name, and a valid amount."]);
    }

    $stmt = mysqli_prepare($con, "INSERT INTO property_expenses (category, sub_category, amount, expense_date, description, status) VALUES (?, ?, ?, ?, ?, 'Pending')");
    mysqli_stmt_bind_param($stmt, "ssdss", $category, $sub_category, $amount, $expense_date, $description);
    if (mysqli_stmt_execute($stmt)) out(["success" => true, "message" => "Expense added (pending approval)."]);
    out(["success" => false, "message" => "Save error: " . mysqli_error($con)]);
}

out(["success" => false, "message" => "Invalid Request Method"]);