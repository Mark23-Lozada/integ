<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

date_default_timezone_set('Asia/Manila');
ini_set('display_errors', 0);
error_reporting(E_ALL);

include 'db.php';
require_once __DIR__ . '/auth.php';
require_role(ROLE_LANDLORD); // landlord only

if (!$con) {
    echo json_encode(["success" => false, "message" => "Connection Failed: " . mysqli_connect_error()]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $action = $_GET['action'] ?? '';
        
        if ($action === 'balances') {
            $query = "SELECT t.id, t.fullname, u.name as unit_name, 
                      COALESCE(c.monthly_rent, u.rate, 5000) as monthly_rent,
                      COALESCE(c.contract_months, t.contract_months, 1) as contract_months,
                      COALESCE(c.downpayment_amount, t.downpayment_amount, 0) as downpayment_amount,
                      (SELECT COALESCE(SUM(f.amount), 0) FROM finances f WHERE f.tenant_id = t.id AND f.payment_type != 'Downpayment' AND f.contract_id <=> c.id) as total_rent_paid
                      FROM tenants t
                      LEFT JOIN units u ON t.unit_id = u.id
                      LEFT JOIN contracts c ON t.id = c.tenant_id AND c.contract_status = 'Active'";
            
            $result = mysqli_query($con, $query);
            $balances = [];
            $totalCollected = 0;

            while ($row = mysqli_fetch_assoc($result)) {
                $monthly = floatval($row['monthly_rent']);
                $months = intval($row['contract_months']);
                $downpayment = floatval($row['downpayment_amount']);
                $alreadyPaid = floatval($row['total_rent_paid']);
                
                $totalContractAmount = $monthly * ($months > 0 ? $months : 1);
                $totalPaidSoFar = $downpayment + $alreadyPaid;
                $remaining = max(0, $totalContractAmount - $totalPaidSoFar);

                $row['total_contract_amount'] = $totalContractAmount;
                $row['total_paid'] = $totalPaidSoFar;
                $row['remaining_balance'] = $remaining;
                
                if ($totalPaidSoFar >= $totalContractAmount && $totalContractAmount > 0) {
                    $row['payment_status'] = 'Fully Paid';
                } elseif ($totalPaidSoFar > 0) {
                    $row['payment_status'] = 'Partial';
                } else {
                    $row['payment_status'] = 'Unpaid';
                }

                $totalCollected += $totalPaidSoFar;
                $balances[] = $row;
            }

            echo json_encode([
                "success" => true,
                "balances" => $balances,
                "totalCollected" => $totalCollected
            ]);
        } else {
            $query = "SELECT f.id, f.tenant_id, f.tenant_name as fullname, f.unit_name, f.amount as amount_paid, f.payment_date, f.payment_type as remarks FROM finances f ORDER BY f.payment_date DESC";
            $result = mysqli_query($con, $query);
            $payments = [];
            $totalCollected = 0;

            while ($row = mysqli_fetch_assoc($result)) {
                $totalCollected += floatval($row['amount_paid']);
                $payments[] = $row;
            }

            echo json_encode([
                "success" => true,
                "payments" => $payments,
                "totalCollected" => $totalCollected
            ]);
        }
        break;

    case 'POST':
        $tenant_id = intval($_POST['tenant_id'] ?? 0);
        $amount_paid = floatval($_POST['amount_paid'] ?? 0);
        $remarks = mysqli_real_escape_string($con, $_POST['remarks'] ?? 'Monthly Rent');

        if ($tenant_id <= 0 || $amount_paid <= 0) {
            echo json_encode(["success" => false, "message" => "Invalid tenant o halaga ng bayad!"]);
            exit();
        }

        $balQuery = mysqli_query($con, "SELECT COALESCE(c.monthly_rent, u.rate, 5000) as monthly_rent, 
                                        COALESCE(c.contract_months, t.contract_months, 1) as contract_months,
                                        COALESCE(c.downpayment_amount, t.downpayment_amount, 0) as downpayment_amount,
                                        (SELECT COALESCE(SUM(f.amount), 0) FROM finances f WHERE f.tenant_id = $tenant_id AND f.payment_type != 'Downpayment' AND f.contract_id <=> c.id) as total_rent_paid,
                                        c.id AS contract_id,
                                        t.fullname, COALESCE(u.name, 'Unassigned') as unit_name
                                        FROM tenants t 
                                        LEFT JOIN units u ON t.unit_id = u.id 
                                        LEFT JOIN contracts c ON t.id = c.tenant_id AND c.contract_status = 'Active'
                                        WHERE t.id = $tenant_id");
        
        $tenantInfo = [];
        if ($balQuery && $balRow = mysqli_fetch_assoc($balQuery)) {
            $monthly = floatval($balRow['monthly_rent']);
            $months = intval($balRow['contract_months']);
            $downpayment = floatval($balRow['downpayment_amount']);
            $alreadyPaid = floatval($balRow['total_rent_paid']);
            
            $tenantInfo = $balRow;
            $totalContractAmount = $monthly * ($months > 0 ? $months : 1);
            $totalPaidSoFar = $downpayment + $alreadyPaid;
            $remaining = max(0, $totalContractAmount - $totalPaidSoFar);

            if ($amount_paid > $remaining) {
                echo json_encode(["success" => false, "message" => "Bawal ang sumobrang bayad! Ang natitirang balanse para sa kabuuang kontrata ay ₱" . number_format($remaining, 2) . " lamang."]);
                exit();
            }
        }

        $tenant_name = mysqli_real_escape_string($con, $tenantInfo['fullname'] ?? 'Unknown Tenant');
        $unit_name = mysqli_real_escape_string($con, $tenantInfo['unit_name'] ?? 'Unassigned');
        $payment_date = date('Y-m-d H:i:s');
        $contractIdSql = (isset($tenantInfo['contract_id']) && $tenantInfo['contract_id'] !== null) ? intval($tenantInfo['contract_id']) : 'NULL';

        $financeQuery = "INSERT INTO finances (tenant_id, contract_id, tenant_name, unit_name, payment_type, amount, payment_date, status) 
                         VALUES ($tenant_id, $contractIdSql, '$tenant_name', '$unit_name', '$remarks', $amount_paid, '$payment_date', 'Paid')";
        
        if (mysqli_query($con, $financeQuery)) {
            $payment_id = mysqli_insert_id($con);

            $mResult = mysqli_query($con, "SELECT fullname, relationship, birthdate FROM tenant_members WHERE tenant_id = $tenant_id");
            $members = [];
            while ($mRow = mysqli_fetch_assoc($mResult)) {
                $members[] = $mRow;
            }
            $tenantInfo['members'] = $members;
            $tenantInfo['payment_id'] = $payment_id;
            $tenantInfo['amount_paid'] = $amount_paid;
            $tenantInfo['remarks'] = $remarks;
            $tenantInfo['payment_date'] = $payment_date;

            echo json_encode([
                "success" => true, 
                "message" => "Tagumpay na naitala ang bayad sa finance records!",
                "receipt" => $tenantInfo
            ]);
        } else {
            echo json_encode(["success" => false, "message" => mysqli_error($con)]);
        }
        break;

    default:
        echo json_encode(["success" => false, "message" => "Invalid Request Method"]);
        break;
}

mysqli_close($con);
?>