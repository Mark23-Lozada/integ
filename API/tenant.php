<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

ini_set('display_errors', 0);
error_reporting(E_ALL);

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
                  c.contract_months, c.monthly_rent, c.downpayment_amount, c.downpayment_status, c.contract_status 
                  FROM tenants t 
                  LEFT JOIN units u ON t.unit_id = u.id 
                  LEFT JOIN contracts c ON t.id = c.tenant_id AND c.contract_status = 'Active'
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
                echo json_encode(["success" => true, "message" => "Successfully added another contract extension!"]);
            } else {
                echo json_encode(["success" => false, "message" => mysqli_error($con)]);
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

        // ==========================================
        // BACKEND DUPLICATE VALIDATION (Name, Email, Contact)
        // ==========================================
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

        // Server-side validation for Family Members Age (1 to 100)
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
                  
        $stmt = mysqli_prepare($con, $query);
        mysqli_stmt_bind_param($stmt, "ssssssssssissds", $fullname, $birthdate, $gender, $contact_no, $email, $province_address, $valid_id_type, $valid_id_number, $emergency_contact_name, $emergency_contact_no, $unit_id, $start_date, $contract_months, $downpayment_status, $downpayment_amount);

        if (mysqli_stmt_execute($stmt)) {
            $tenant_id = mysqli_insert_id($con);
            
            $upUnitStmt = mysqli_prepare($con, "UPDATE units SET isOccupied = 1, status = 'Occupied', tenantName = ? WHERE id = ?");
            mysqli_stmt_bind_param($upUnitStmt, "si", $fullname, $unit_id);
            mysqli_stmt_execute($upUnitStmt);

            $end_date = date('Y-m-d', strtotime("+$contract_months months", strtotime($start_date)));

            $contractStmt = mysqli_prepare($con, "INSERT INTO contracts (tenant_id, unit_id, start_date, end_date, contract_months, monthly_rent, downpayment_amount, downpayment_status, contract_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')");
            mysqli_stmt_bind_param($contractStmt, "iissidds", $tenant_id, $unit_id, $start_date, $end_date, $contract_months, $monthly_rent, $downpayment_amount, $downpayment_status);
            mysqli_stmt_execute($contractStmt);

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

            echo json_encode(["success" => true, "message" => "Family tenant and lease contract successfully registered!"]);
        } else {
            echo json_encode(["success" => false, "message" => mysqli_error($con)]);
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