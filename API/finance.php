<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

date_default_timezone_set('Asia/Manila'); // Oras ng Pilipinas (UTC+8)
ini_set('display_errors', 0);
error_reporting(E_ALL);

include 'db.php';
require_once __DIR__ . '/auth.php';
require_role(ROLE_LANDLORD); // landlord only


if (!$con) {
    echo json_encode(["success" => false, "message" => "Connection Failed: " . mysqli_connect_error()]);
    exit();
}

mysqli_set_charset($con, "utf8mb4");
mysqli_query($con, "SET time_zone = '+08:00'");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    echo json_encode(["success" => true]);
    exit();
}

switch ($method) {
    case 'GET':
        $query = "SELECT * FROM finances ORDER BY payment_date DESC, id DESC";
        $result = mysqli_query($con, $query);
        
        $finances = [];
        $totalCollected = 0;

        while ($row = mysqli_fetch_assoc($result)) {
            $totalCollected += floatval($row['amount']);
            $finances[] = $row;
        }
        
        echo json_encode([
            "success" => true,
            "data" => $finances,
            "totalCollected" => $totalCollected
        ]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data)) {
            $data = $_POST;
        }

        $tenant_id    = !empty($data['tenant_id']) ? intval($data['tenant_id']) : null;
        $tenant_name  = trim($data['tenant_name'] ?? '');
        $unit_name    = trim($data['unit_name'] ?? '');
        $payment_type = trim($data['payment_type'] ?? '');
        $amount       = floatval($data['amount'] ?? $data['amount_paid'] ?? 0);
        $payment_date = trim($data['payment_date'] ?? '');
        $status       = trim($data['status'] ?? '');

        if ($unit_name === '') $unit_name = 'Unassigned';
        if ($payment_type === '') $payment_type = 'Monthly Rent';
        if ($status === '') $status = 'Paid';
        // Kung walang petsa (o mali ang format), gamitin ang oras ngayon sa Pilipinas
        if (!preg_match('/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/', $payment_date)) {
            $payment_date = date('Y-m-d H:i:s');
        }

        if ($tenant_name === '' || $amount <= 0) {
            echo json_encode([
                "success" => false,
                "message" => "Mangyaring ilagay ang pangalan ng tenant at wastong halaga ng bayad."
            ]);
            exit();
        }

        // Tie the payment to the tenant's ACTIVE contract and block overpayment for that contract.
        $contract_id = null;
        if ($tenant_id) {
            $bq = mysqli_prepare($con, "SELECT c.id AS contract_id,
                        COALESCE(c.monthly_rent, u.rate, 5000) AS monthly_rent,
                        COALESCE(c.contract_months, t.contract_months, 1) AS contract_months,
                        COALESCE(c.downpayment_amount, t.downpayment_amount, 0) AS downpayment_amount,
                        (SELECT COALESCE(SUM(f.amount), 0) FROM finances f
                          WHERE f.tenant_id = t.id AND f.payment_type != 'Downpayment' AND f.contract_id <=> c.id) AS total_rent_paid
                    FROM tenants t
                    LEFT JOIN units u ON t.unit_id = u.id
                    LEFT JOIN contracts c ON t.id = c.tenant_id AND c.contract_status = 'Active'
                    WHERE t.id = ?
                    ORDER BY c.id DESC LIMIT 1");
            mysqli_stmt_bind_param($bq, "i", $tenant_id);
            mysqli_stmt_execute($bq);
            $b = mysqli_fetch_assoc(mysqli_stmt_get_result($bq));
            mysqli_stmt_close($bq);

            if ($b) {
                $contract_id = $b['contract_id'] !== null ? (int)$b['contract_id'] : null;

                if ($payment_type !== 'Downpayment') {
                    $months = intval($b['contract_months']);
                    $total = floatval($b['monthly_rent']) * ($months > 0 ? $months : 1);
                    $remaining = max(0, $total - (floatval($b['downpayment_amount']) + floatval($b['total_rent_paid'])));
                    if (round($amount, 2) > round($remaining, 2)) {
                        echo json_encode([
                            "success" => false,
                            "message" => "Bawal ang sumobrang bayad! Ang natitirang balanse para sa kabuuang kontrata ay ₱" . number_format($remaining, 2) . " lamang."
                        ]);
                        exit();
                    }
                }
            }
        }

        $stmt = mysqli_prepare($con, "INSERT INTO finances (tenant_id, contract_id, tenant_name, unit_name, payment_type, amount, payment_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        mysqli_stmt_bind_param($stmt, "iisssdss", $tenant_id, $contract_id, $tenant_name, $unit_name, $payment_type, $amount, $payment_date, $status);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "success" => true,
                "message" => "Tagumpay na naitala ang bayad sa finance records!"
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Error sa pag-save: " . mysqli_error($con)
            ]);
        }
        mysqli_stmt_close($stmt);
        break;

    default:
        echo json_encode([
            "success" => false, 
            "message" => "Invalid Request Method"
        ]);
        break;
}

mysqli_close($con);
?>