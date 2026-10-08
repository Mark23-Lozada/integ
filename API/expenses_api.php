<?php
ob_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

date_default_timezone_set('Asia/Manila'); // Oras ng Pilipinas (UTC+8) para tama ang pagpalit ng buwan
ini_set('display_errors', 0);
error_reporting(E_ALL);

include 'db.php';
require_once __DIR__ . '/auth.php';
require_role(ROLE_LANDLORD); // landlord only


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
mysqli_query($con, "SET time_zone = '+08:00'"); // Philippine Time din ang MySQL

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

// Kung ENUM ang category column, gawing VARCHAR para tanggapin ang mga bagong category (Taxes & Permits, Salaries & Benefits).
function ensureCategoryColumn($con) {
    $r = mysqli_query($con, "SHOW COLUMNS FROM property_expenses LIKE 'category'");
    if ($r && ($row = mysqli_fetch_assoc($r)) && stripos($row['Type'], 'enum') === 0) {
        mysqli_query($con, "ALTER TABLE property_expenses MODIFY category VARCHAR(60) NOT NULL DEFAULT 'Admin/Others'");
    }
}
// Revised expenses: a title, an optional room, and an optional link to a damage report.
function ensureExpenseColumns($con) {
    $cols = ['title' => 'VARCHAR(150) NULL DEFAULT NULL', 'unit_id' => 'INT NULL DEFAULT NULL', 'damage_report_id' => 'INT NULL DEFAULT NULL'];
    foreach ($cols as $col => $def) {
        $r = mysqli_query($con, "SHOW COLUMNS FROM property_expenses LIKE '$col'");
        if ($r && mysqli_num_rows($r) === 0) {
            mysqli_query($con, "ALTER TABLE property_expenses ADD COLUMN $col $def");
        }
    }
}
ensureColumns($con);
ensureCategoryColumn($con);
ensureExpenseColumns($con);

const EXPENSE_CATEGORIES = ['Supplies', 'Repairs', 'Taxes & Permits', 'Salaries & Benefits', 'Admin/Others', 'Utilities'];
const UTILITY_NAMES = ['Electricity', 'Water', 'WiFi'];
const UTILITY_KEYWORDS = [
    'electricity' => ['Electric', 'Meralco', 'Kuryente'],
    'water'       => ['Water', 'Tubig', 'Maynilad', 'Manila Water'],
    'internet'    => ['WiFi', 'Internet', 'Converge', 'PLDT', 'Globe']
];

// Older approved expenses (no budget_amount) count fully against the budget.
const SQL_BUDGET_PART = "COALESCE(budget_amount, amount)";
const SQL_OVERFLOW_PART = "COALESCE(overflow_amount, 0)";

// Rollover: ang hindi nagastong budget ng mga nakaraang BUWAN (kalendaryo, hindi 30-araw na bilang) ay napupunta sa susunod na buwan.
// Tumatakbong balanse kada buwan: balance = max(0, balance + 30% ng nakolekta - budget na nagamit)
function carryOver($con, $ym) {
    $start = $ym . '-01';
    $inc = rows($con, "SELECT DATE_FORMAT(payment_date, '%Y-%m') AS ym, SUM(amount) AS t FROM finances WHERE payment_date < ? GROUP BY ym", 's', [$start]);
    $use = rows($con, "SELECT DATE_FORMAT(expense_date, '%Y-%m') AS ym, SUM(" . SQL_BUDGET_PART . ") AS t FROM property_expenses WHERE status = 'Approved' AND expense_date < ? GROUP BY ym", 's', [$start]);
    $c = []; $u = [];
    foreach ($inc as $r) if ($r['ym']) $c[$r['ym']] = floatval($r['t']);
    foreach ($use as $r) if ($r['ym']) $u[$r['ym']] = floatval($r['t']);
    $months = array_unique(array_merge(array_keys($c), array_keys($u)));
    sort($months);
    $bal = 0.0;
    foreach ($months as $m) {
        $bal = max(0, round($bal + round(($c[$m] ?? 0) * BUDGET_RATE, 2) - ($u[$m] ?? 0), 2));
    }
    return $bal;
}

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
    $carry = carryOver($con, $ym);
    $available = round($pool + $carry, 2);
    $budgetUsed = floatval($a['budget_used']);
    $remaining = max(0, round($available - $budgetUsed, 2));

    return [
        "collected"       => $collected,
        "budgetPool"      => $pool,
        "carryOver"       => $carry,
        "budgetAvailable" => $available,
        "budgetUsed"      => $budgetUsed,
        "budgetRemaining" => $remaining,
        "overflow"        => floatval($a['overflow']),
        "totalSpent"      => floatval($a['spent']),
        "pending"         => $pending,
        "netProfit"       => $collected - floatval($a['spent'])
    ];
}

// Clause for utility bills: category 'Utilities' AND the name matches one of the keywords (English and older entries).
function likeClause($keywords, &$types, &$params) {
    $parts = [];
    foreach ($keywords as $k) {
        $parts[] = 'sub_category LIKE ?';
        $types .= 's';
        $params[] = '%' . $k . '%';
    }
    return $parts ? "(category = 'Utilities' AND (" . implode(' OR ', $parts) . '))' : '1=0';
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
        // Optional room filter: unit_id=5 -> that room, unit_id=none -> whole-property bills
        $unitFilter = $_GET['unit_id'] ?? '';
        if ($unitFilter === 'none') {
            $where .= ' AND e.unit_id IS NULL';
        } elseif (intval($unitFilter) > 0) {
            $where .= ' AND e.unit_id = ?'; $types .= 'i'; $params[] = intval($unitFilter);
        }
        $history = rows($con, "SELECT e.id, e.category, e.sub_category, e.amount, e.expense_date, e.status, e.unit_id, u.name AS unit_name
                               FROM property_expenses e LEFT JOIN units u ON u.id = e.unit_id
                               WHERE $where ORDER BY e.expense_date DESC, e.id DESC", $types, $params);
        out(["success" => true, "history" => $history]);
    }

    // Bar graph data for one utility: monthly totals per room for a year (room id 0 = whole property)
    if (($_GET['action'] ?? '') === 'utility_chart') {
        $type = $_GET['type'] ?? '';
        if (!isset(UTILITY_KEYWORDS[$type])) out(["success" => false, "message" => "Unknown utility type."]);
        $year = intval($_GET['year'] ?? date('Y'));
        if ($year < 2000 || $year > 2100) $year = intval(date('Y'));

        $types = ''; $params = []; $where = likeClause(UTILITY_KEYWORDS[$type], $types, $params);
        $rowsM = rows($con, "SELECT COALESCE(unit_id, 0) AS uid, MONTH(expense_date) AS m, SUM(amount) AS total
                             FROM property_expenses
                             WHERE $where AND expense_date >= ? AND expense_date < ?
                             GROUP BY uid, m", $types . 'ss', array_merge($params, [$year . '-01-01', ($year + 1) . '-01-01']));

        $byUnit = [];
        foreach ($rowsM as $r) {
            $uid = (string)intval($r['uid']);
            if (!isset($byUnit[$uid])) $byUnit[$uid] = array_fill(0, 12, 0);
            $byUnit[$uid][intval($r['m']) - 1] = floatval($r['total']);
        }
        $units = rows($con, "SELECT id, name FROM units ORDER BY name");
        out(["success" => true, "type" => $type, "year" => $year, "units" => $units, "by_unit" => (object)$byUnit]);
    }

    $month = $_GET['month'] ?? date('Y-m');
    if (!validMonth($month)) $month = date('Y-m');
    $year = intval($_GET['year'] ?? substr($month, 0, 4));
    if ($year < 2000 || $year > 2100) $year = intval(date('Y'));

    list($s, $e) = monthRange($month);

    $expenses = rows($con, "SELECT e.*, u.name AS unit_name FROM property_expenses e LEFT JOIN units u ON u.id = e.unit_id
                            WHERE e.expense_date >= ? AND e.expense_date < ? ORDER BY e.expense_date DESC, e.id DESC", 'ss', [$s, $e]);

    // Cash on hand (all time): total collected minus all approved expenses
    $allCollected = scalar($con, "SELECT COALESCE(SUM(amount),0) FROM finances");
    $allSpent = scalar($con, "SELECT COALESCE(SUM(amount),0) FROM property_expenses WHERE status = 'Approved'");

    out([
        "success"     => true,
        "budgetRate"  => BUDGET_RATE,
        "month"       => $month,
        "monthStats"  => monthStats($con, $month),
        "prevMonth"   => date('Y-m', strtotime($month . '-01 -1 month')),
        "prevMonthStats" => monthStats($con, date('Y-m', strtotime($month . '-01 -1 month'))),
        "expenses"    => $expenses,
        "units"       => rows($con, "SELECT id, name FROM units ORDER BY name"),
        "billComparison" => [
            "electricity" => utilityComparison($con, UTILITY_KEYWORDS['electricity']),
            "water"       => utilityComparison($con, UTILITY_KEYWORDS['water']),
            "internet"    => utilityComparison($con, UTILITY_KEYWORDS['internet'])
        ],
        "year"        => yearSummary($con, $year),
        "allCollected" => $allCollected,
        "allSpent"    => $allSpent,
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

    // ADD (Pending): ONE expense = title + category + amount + date (+ note, + room, + linked damage report)
    $category = trim($data['category'] ?? '');
    $title = trim($data['title'] ?? ($data['sub_category'] ?? ''));
    $amount = floatval($data['amount'] ?? 0);
    $expense_date = trim($data['expense_date'] ?? '');
    $description = trim($data['description'] ?? '');
    $unit_id = !empty($data['unit_id']) ? intval($data['unit_id']) : null;
    $damage_id = !empty($data['damage_report_id']) ? intval($data['damage_report_id']) : null;

    if (!in_array($category, EXPENSE_CATEGORIES, true)) out(["success" => false, "message" => "Please choose a valid category."]);
    if ($title === '' || mb_strlen($title) > 150) out(["success" => false, "message" => "The title is required (maximum 150 characters)."]);
    if (!($amount > 0) || $amount > 9999999) out(["success" => false, "message" => "Enter a valid amount."]);
    if (mb_strlen($description) > 255) out(["success" => false, "message" => "The description is too long (maximum 255 characters)."]);
    $dt = DateTime::createFromFormat('Y-m-d', $expense_date);
    if (!$dt || $dt->format('Y-m-d') !== $expense_date) out(["success" => false, "message" => "Enter a valid date."]);

    if ($unit_id !== null && !rows($con, "SELECT id FROM units WHERE id = ?", 'i', [$unit_id])) {
        out(["success" => false, "message" => "That room does not exist."]);
    }
    if ($damage_id !== null && !rows($con, "SELECT id FROM damage_reports WHERE id = ?", 'i', [$damage_id])) {
        out(["success" => false, "message" => "That damage report does not exist."]);
    }

    // Utility bills: the title is the utility name (the cards and the graph search it).
    // Electricity and water are billed per room, so a room is required for them.
    if ($category === 'Utilities') {
        if (!in_array($title, UTILITY_NAMES, true)) out(["success" => false, "message" => "Unknown utility type."]);
        if ($title !== 'WiFi' && $unit_id === null) out(["success" => false, "message" => "Choose the room this $title bill belongs to."]);
    }

    // sub_category keeps the same text as the title so older reports and searches keep working
    $stmt = mysqli_prepare($con, "INSERT INTO property_expenses (category, sub_category, title, amount, expense_date, description, status, unit_id, damage_report_id) VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?)");
    mysqli_stmt_bind_param($stmt, "sssdssii", $category, $title, $title, $amount, $expense_date, $description, $unit_id, $damage_id);
    if (mysqli_stmt_execute($stmt)) out(["success" => true, "message" => "Expense added (pending approval)."]);
    out(["success" => false, "message" => "Save error: " . mysqli_error($con)]);
}

out(["success" => false, "message" => "Invalid Request Method"]);