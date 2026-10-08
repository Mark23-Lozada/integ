<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

ini_set('display_errors', 0);
error_reporting(E_ALL);

// Any uncaught error (e.g. a database error) is returned as JSON,
// so the UI shows the real message instead of "Unexpected end of JSON input".
set_exception_handler(function ($e) {
    error_log('tenant.php: ' . $e->getMessage());
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
    exit();
});
require_once __DIR__ . '/auth.php';
require_role(ROLE_LANDLORD); // landlord only
require_once __DIR__ . '/billing_lib.php';

$host = "localhost";
$db = "integ_admin";
$username = "root";
$password = "";

$con = mysqli_connect($host, $username, $password, $db);

if (!$con) {
    echo json_encode([
        "success" => false, 
        "message" => "Connection Failed: " . mysqli_connect_error()
    ]);
    exit();
}

mysqli_set_charset($con, "utf8mb4");

// ---------- Tenant portal accounts ----------
function generate_temp_password($len = 10) {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'; // no look-alikes (0/O, 1/l/I)
    $out = '';
    for ($i = 0; $i < $len; $i++) $out .= $chars[random_int(0, strlen($chars) - 1)];
    return $out;
}

// Creates the portal login of a tenant, or resets its password if it already exists.
// Returns ['ok' => bool, 'password' => temp password, 'created' => bool, 'message' => error text]
function provision_tenant_account($con, $tenant_id, $email, $fullname) {
    $temp = generate_temp_password();
    $hash = password_hash($temp, PASSWORD_DEFAULT);

    $q = mysqli_prepare($con, "SELECT 1 FROM users WHERE tenant_id = ?");
    mysqli_stmt_bind_param($q, "i", $tenant_id);
    mysqli_stmt_execute($q);
    $exists = mysqli_fetch_assoc(mysqli_stmt_get_result($q));
    mysqli_stmt_close($q);

    if ($exists) {
        $u = mysqli_prepare($con, "UPDATE users SET password = ?, must_change_password = 1 WHERE tenant_id = ? AND role = 'tenant'");
        mysqli_stmt_bind_param($u, "si", $hash, $tenant_id);
        $ok = mysqli_stmt_execute($u);
        mysqli_stmt_close($u);
        return ['ok' => $ok, 'password' => $temp, 'created' => false, 'message' => $ok ? '' : mysqli_error($con)];
    }

    // The tenant's email becomes the login: it must not belong to another account
    $q = mysqli_prepare($con, "SELECT 1 FROM users WHERE gmail = ?");
    mysqli_stmt_bind_param($q, "s", $email);
    mysqli_stmt_execute($q);
    $taken = mysqli_fetch_assoc(mysqli_stmt_get_result($q));
    mysqli_stmt_close($q);
    if ($taken) {
        return ['ok' => false, 'password' => '', 'created' => false, 'message' => "This email is already used by another login account."];
    }

    $i = mysqli_prepare($con, "INSERT INTO users (gmail, password, names, role, tenant_id, must_change_password) VALUES (?, ?, ?, 'tenant', ?, 1)");
    mysqli_stmt_bind_param($i, "sssi", $email, $hash, $fullname, $tenant_id);
    $ok = mysqli_stmt_execute($i);
    $err = $ok ? '' : mysqli_error($con);
    mysqli_stmt_close($i);
    return ['ok' => $ok, 'password' => $temp, 'created' => true, 'message' => $err];
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action == 'available_units') {
            $result = mysqli_query($con, "SELECT id, name, type, rate, downpayment FROM units WHERE isOccupied = 0 AND (status = 'Available' OR status IS NULL)");
            $units = [];
            while ($row = mysqli_fetch_assoc($result)) {
                $units[] = $row;
            }
            echo json_encode($units);
            exit();
        }

        $query = "SELECT t.*, u.name as unit_name, u.rate as unit_rate, 
                  c.id as contract_id, c.start_date as contract_start, c.end_date as contract_end, 
                  c.contract_months, c.monthly_rent, c.downpayment_amount, c.downpayment_status, c.contract_status,
                  (ua.tenant_id IS NOT NULL) AS has_account 
                  FROM tenants t 
                  LEFT JOIN units u ON t.unit_id = u.id 
                  LEFT JOIN contracts c ON t.id = c.tenant_id AND c.contract_status = 'Active'
                  LEFT JOIN users ua ON ua.tenant_id = t.id
                  ORDER BY t.id DESC";
                  
        $result = mysqli_query($con, $query);
        $tenants = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $t_id = $row['id'];
            $mResult = mysqli_query($con, "SELECT * FROM tenant_members WHERE tenant_id = $t_id");
            $row['members'] = [];
            while ($mRow = mysqli_fetch_assoc($mResult)) {
                $row['members'][] = $mRow;
            }
            $tenants[] = $row;
        }
        echo json_encode($tenants);
        break;

    case 'POST':
        if ($action == 'renew_contract') {
            $tenant_id = intval($_POST['tenant_id'] ?? 0);
            $unit_id = intval($_POST['unit_id'] ?? 0);
            $new_start = trim($_POST['start_date'] ?? '');
            $extension_months = intval($_POST['contract_months'] ?? 6);

            if ($tenant_id <= 0 || $unit_id <= 0 || empty($new_start)) {
                echo json_encode(["success" => false, "message" => "Invalid renewal parameters!"]);
                exit();
            }

            // BACKEND CHECK: BAWAL EXTEND PAG HINDI PA FULLY PAID
            $checkBalQuery = "SELECT COALESCE(c.monthly_rent, u.rate, 5000) as monthly_rent,
                              COALESCE(c.contract_months, t.contract_months, 1) as contract_months,
                              COALESCE(c.downpayment_amount, t.downpayment_amount, 0) as downpayment_amount,
                              (SELECT COALESCE(SUM(f.amount), 0) FROM finances f WHERE f.tenant_id = $tenant_id AND f.payment_type != 'Downpayment' AND f.contract_id <=> c.id) as total_rent_paid
                              FROM tenants t
                              LEFT JOIN units u ON t.unit_id = u.id
                              LEFT JOIN contracts c ON t.id = c.tenant_id AND c.contract_status = 'Active'
                              WHERE t.id = $tenant_id";
            $balRes = mysqli_query($con, $checkBalQuery);
            if ($balRes && $bRow = mysqli_fetch_assoc($balRes)) {
                $mRent = floatval($bRow['monthly_rent']);
                $mMonths = intval($bRow['contract_months']);
                $dp = floatval($bRow['downpayment_amount']);
                $paid = floatval($bRow['total_rent_paid']);
                $totalContract = $mRent * ($mMonths > 0 ? $mMonths : 1);
                $rem = max(0, $totalContract - ($dp + $paid));

                if ($rem > 0) {
                    echo json_encode(["success" => false, "message" => "Bawal mag-extend ng kontrata kapag hindi pa fully paid! Natitirang balanse: ₱" . number_format($rem, 2)]);
                    exit();
                }
            }

            // PAGKALKULA NG BAGONG END DATE AT CONTRACT MODAL SAVING
            $new_end = date('Y-m-d', strtotime("+$extension_months months", strtotime($new_start)));

            $updateStmt = mysqli_prepare($con, "UPDATE contracts SET contract_status = 'Renewed' WHERE tenant_id = ? AND contract_status = 'Active'");
            mysqli_stmt_bind_param($updateStmt, "i", $tenant_id);
            mysqli_stmt_execute($updateStmt);

            $uStmt = mysqli_prepare($con, "SELECT rate FROM units WHERE id = ?");
            mysqli_stmt_bind_param($uStmt, "i", $unit_id);
            mysqli_stmt_execute($uStmt);
            $uRow = mysqli_fetch_assoc(mysqli_stmt_get_result($uStmt));
            $monthly_rent = $uRow ? floatval($uRow['rate']) : 0;

            $renewStmt = mysqli_prepare($con, "INSERT INTO contracts (tenant_id, unit_id, start_date, end_date, contract_months, monthly_rent, downpayment_amount, downpayment_status, contract_status) VALUES (?, ?, ?, ?, ?, ?, 0.00, 'Paid', 'Active')");
            mysqli_stmt_bind_param($renewStmt, "iissid", $tenant_id, $unit_id, $new_start, $new_end, $extension_months, $monthly_rent);
                           
            if (mysqli_stmt_execute($renewStmt)) {
                $newContractId = mysqli_insert_id($con);
                generate_contract_bills($con, $tenant_id, $newContractId, $new_start, $extension_months, $monthly_rent);
                echo json_encode(["success" => true, "message" => "Successfully added another contract extension!"]);
            } else {
                echo json_encode(["success" => false, "message" => mysqli_error($con)]);
            }
            exit();
        }

        if ($action == 'create_account') {
            $tenant_id = intval($_POST['tenant_id'] ?? 0);
            $tq = mysqli_prepare($con, "SELECT fullname, email FROM tenants WHERE id = ?");
            mysqli_stmt_bind_param($tq, "i", $tenant_id);
            mysqli_stmt_execute($tq);
            $t = mysqli_fetch_assoc(mysqli_stmt_get_result($tq));
            mysqli_stmt_close($tq);

            if (!$t) {
                echo json_encode(["success" => false, "message" => "Tenant not found."]);
                exit();
            }
            if (!filter_var($t['email'], FILTER_VALIDATE_EMAIL)) {
                echo json_encode(["success" => false, "message" => "This tenant has no valid email address, so a login cannot be created."]);
                exit();
            }

            $res = provision_tenant_account($con, $tenant_id, $t['email'], $t['fullname']);
            if ($res['ok']) {
                echo json_encode([
                    "success" => true,
                    "message" => $res['created'] ? "Tenant login created." : "Tenant password reset.",
                    "account" => ["email" => $t['email'], "temp_password" => $res['password'], "created" => $res['created']]
                ]);
            } else {
                echo json_encode(["success" => false, "message" => $res['message']]);
            }
            exit();
        }

        $fullname = trim($_POST['fullname'] ?? '');
        $birthdate = trim($_POST['birthdate'] ?? '');
        $gender = trim($_POST['gender'] ?? '');
        $contact_no = trim($_POST['contact_no'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $province_address = trim($_POST['province_address'] ?? '');
        $valid_id_type = trim($_POST['valid_id_type'] ?? '');
        $other_id_type = trim($_POST['other_id_type'] ?? '');
        $valid_id_number = trim($_POST['valid_id_number'] ?? '');
        $emergency_contact_name = trim($_POST['emergency_contact_name'] ?? '');
        $emergency_contact_no = trim($_POST['emergency_contact_no'] ?? '');
        $unit_id = intval($_POST['unit_id'] ?? 0);
        $start_date = trim($_POST['start_date'] ?? '');
        $contract_months = intval($_POST['contract_months'] ?? 6);
        $downpayment_amount = floatval($_POST['downpayment_amount'] ?? 0);
        $members_json = $_POST['members'] ?? '[]';

        if (empty($fullname) || empty($contact_no) || $unit_id <= 0 || empty($birthdate) || empty($email)) {
            echo json_encode(["success" => false, "message" => "Please fill in all required information including birthdate and email!"]);
            exit();
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(["success" => false, "message" => "Please enter a valid email address: it becomes the tenant's login."]);
            exit();
        }

        // Move-in date must be a valid date and cannot be in the past (Philippine time)
        $todayPH = (new DateTime('now', new DateTimeZone('Asia/Manila')))->format('Y-m-d');
        $startCheck = DateTime::createFromFormat('Y-m-d', $start_date);
        if (!$startCheck || $startCheck->format('Y-m-d') !== $start_date) {
            echo json_encode(["success" => false, "message" => "Invalid move-in date!"]);
            exit();
        }
        if ($start_date < $todayPH) {
            echo json_encode(["success" => false, "message" => "The move-in date cannot be in the past."]);
            exit();
        }

        $checkDuplicate = mysqli_prepare($con, "SELECT id, fullname, email, contact_no FROM tenants WHERE fullname = ? OR email = ? OR contact_no = ?");
        mysqli_stmt_bind_param($checkDuplicate, "sss", $fullname, $email, $contact_no);
        mysqli_stmt_execute($checkDuplicate);
        $duplicateResult = mysqli_stmt_get_result($checkDuplicate);

        if ($row = mysqli_fetch_assoc($duplicateResult)) {
            if (strcasecmp(trim($row['fullname']), $fullname) === 0) {
                echo json_encode(["success" => false, "message" => "Duplicate Error: A tenant with the name '$fullname' already exists!"]);
                exit();
            }
            if (strcasecmp(trim($row['email']), $email) === 0) {
                echo json_encode(["success" => false, "message" => "Duplicate Error: This email address is already registered!"]);
                exit();
            }
            if (trim($row['contact_no']) === $contact_no) {
                echo json_encode(["success" => false, "message" => "Duplicate Error: This contact number is already used by another tenant!"]);
                exit();
            }
        }

        $members = json_decode($members_json, true);
        if (is_array($members)) {
            foreach ($members as $m) {
                $m_name = trim($m['fullname'] ?? 'Family Member');
                $m_age = intval($m['member_age'] ?? 0);
                if ($m_age < 1 || $m_age > 100) {
                    echo json_encode(["success" => false, "message" => "Family member ($m_name) age must be between 1 and 100 years old."]);
                    exit();
                }
            }
        }

        $uQuery = mysqli_prepare($con, "SELECT name, rate, downpayment FROM units WHERE id = ?");
        mysqli_stmt_bind_param($uQuery, "i", $unit_id);
        mysqli_stmt_execute($uQuery);
        $uRow = mysqli_fetch_assoc(mysqli_stmt_get_result($uQuery));
        
        $unit_name = $uRow ? $uRow['name'] : 'Unassigned';
        $monthly_rent = $uRow ? floatval($uRow['rate']) : 0;
        $min_downpayment = $uRow ? floatval($uRow['downpayment']) : 0;
        $total_contract_amount = $monthly_rent * $contract_months;

        if ($downpayment_amount < $min_downpayment) {
            echo json_encode(["success" => false, "message" => "The downpayment is lower than the assigned minimum."]);
            exit();
        }

        if ($downpayment_amount > $total_contract_amount) {
            echo json_encode(["success" => false, "message" => "Error: Downpayment exceeds the total contract amount!"]);
            exit();
        }

        $downpayment_status = ($total_contract_amount > 0 && $downpayment_amount >= $total_contract_amount) ? 'Paid' : 'Partial';

        $query = "INSERT INTO tenants (fullname, birthdate, gender, contact_no, email, province_address, valid_id_type, valid_id_number, emergency_contact_name, emergency_contact_no, unit_id, start_date, contract_months, downpayment_status, downpayment_amount, status) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')";
                  
        mysqli_begin_transaction($con); // tenant + unit + contract + downpayment succeed or fail together

        $stmt = mysqli_prepare($con, $query);
        mysqli_stmt_bind_param($stmt, "ssssssssssisisd", $fullname, $birthdate, $gender, $contact_no, $email, $province_address, $valid_id_type, $valid_id_number, $emergency_contact_name, $emergency_contact_no, $unit_id, $start_date, $contract_months, $downpayment_status, $downpayment_amount);

        if (mysqli_stmt_execute($stmt)) {
            $tenant_id = mysqli_insert_id($con);
            
            $upUnitStmt = mysqli_prepare($con, "UPDATE units SET isOccupied = 1, status = 'Occupied', tenantName = ? WHERE id = ?");
            mysqli_stmt_bind_param($upUnitStmt, "si", $fullname, $unit_id);
            mysqli_stmt_execute($upUnitStmt);

            $end_date = date('Y-m-d', strtotime("+$contract_months months", strtotime($start_date)));

            $contractStmt = mysqli_prepare($con, "INSERT INTO contracts (tenant_id, unit_id, start_date, end_date, contract_months, monthly_rent, downpayment_amount, downpayment_status, contract_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')");
            mysqli_stmt_bind_param($contractStmt, "iissidds", $tenant_id, $unit_id, $start_date, $end_date, $contract_months, $monthly_rent, $downpayment_amount, $downpayment_status);
            if (!mysqli_stmt_execute($contractStmt)) {
                $err = mysqli_error($con);
                mysqli_rollback($con);
                echo json_encode(["success" => false, "message" => "Contract error: " . $err]);
                exit();
            }
            $contract_id = mysqli_insert_id($con);

            // Monthly installment bills (first one due after one month)
            generate_contract_bills($con, $tenant_id, $contract_id, $start_date, $contract_months, $monthly_rent);

            // Record the downpayment in finances (revenue, 30% budget, cash on hand).
            // payment_type 'Downpayment' keeps it out of the rent-paid sum, so balances are not double counted.
            if ($downpayment_amount > 0) {
                $paidAt = (new DateTime('now', new DateTimeZone('Asia/Manila')))->format('Y-m-d H:i:s');
                $fStmt = mysqli_prepare($con, "INSERT INTO finances (tenant_id, contract_id, tenant_name, unit_name, payment_type, amount, payment_date, status) VALUES (?, ?, ?, ?, 'Downpayment', ?, ?, 'Paid')");
                mysqli_stmt_bind_param($fStmt, "iissds", $tenant_id, $contract_id, $fullname, $unit_name, $downpayment_amount, $paidAt);
                if (!mysqli_stmt_execute($fStmt)) {
                    $err = mysqli_error($con);
                    mysqli_rollback($con);
                    echo json_encode(["success" => false, "message" => "Finance error: " . $err]);
                    exit();
                }
            }

            if (is_array($members)) {
                foreach ($members as $m) {
                    $m_name = trim($m['fullname'] ?? '');
                    $m_rel = trim($m['relationship'] ?? '');
                    $m_age = intval($m['member_age'] ?? 0);
                    
                    if (!empty($m_name)) {
                        $mStmt = mysqli_prepare($con, "INSERT INTO tenant_members (tenant_id, fullname, relationship, member_age) VALUES (?, ?, ?, ?)");
                        mysqli_stmt_bind_param($mStmt, "issi", $tenant_id, $m_name, $m_rel, $m_age);
                        mysqli_stmt_execute($mStmt);
                    }
                }
            }

            // Portal login (email + temporary password). Same transaction: all or nothing.
            $acc = provision_tenant_account($con, $tenant_id, $email, $fullname);
            if (!$acc['ok']) {
                mysqli_rollback($con);
                echo json_encode(["success" => false, "message" => "Login account error: " . $acc['message']]);
                exit();
            }

            mysqli_commit($con);
            echo json_encode([
                "success" => true,
                "message" => "Family tenant and lease contract successfully registered!",
                "account" => ["email" => $email, "temp_password" => $acc['password'], "created" => true]
            ]);
        } else {
            $err = mysqli_error($con);
            mysqli_rollback($con);
            echo json_encode(["success" => false, "message" => $err]);
        }
        break;

    case 'DELETE':
        $id = intval($_GET['id'] ?? 0);
        if ($id > 0) {
            $tStmt = mysqli_prepare($con, "SELECT unit_id FROM tenants WHERE id = ?");
            mysqli_stmt_bind_param($tStmt, "i", $id);
            mysqli_stmt_execute($tStmt);
            $tRow = mysqli_fetch_assoc(mysqli_stmt_get_result($tStmt));
            
            if ($tRow) {
                $uId = $tRow['unit_id'];
                $freeUnitStmt = mysqli_prepare($con, "UPDATE units SET isOccupied = 0, status = 'Available', tenantName = '' WHERE id = ?");
                mysqli_stmt_bind_param($freeUnitStmt, "i", $uId);
                mysqli_stmt_execute($freeUnitStmt);
            }

            try { // conversation goes with the tenant (damage reports stay: they are linked to repair expenses)
                $chatDel = mysqli_prepare($con, "DELETE FROM chat_messages WHERE tenant_id = ?");
                mysqli_stmt_bind_param($chatDel, "i", $id);
                mysqli_stmt_execute($chatDel);
            } catch (Throwable $e) { /* migration 03 not run yet */ }

            $billDel = mysqli_prepare($con, "DELETE FROM tenant_bills WHERE tenant_id = ?");
            mysqli_stmt_bind_param($billDel, "i", $id);
            mysqli_stmt_execute($billDel);

            $accDel = mysqli_prepare($con, "DELETE FROM users WHERE tenant_id = ? AND role = 'tenant'");
            mysqli_stmt_bind_param($accDel, "i", $id);
            mysqli_stmt_execute($accDel);

            $delStmt = mysqli_prepare($con, "DELETE FROM tenants WHERE id = ?");
            mysqli_stmt_bind_param($delStmt, "i", $id);
            
            if (mysqli_stmt_execute($delStmt)) {
                echo json_encode(["success" => true, "message" => "Tenant deleted successfully."]);
            } else {
                echo json_encode(["success" => false, "message" => mysqli_error($con)]);
            }
        }
        break;
}
mysqli_close($con);
?>