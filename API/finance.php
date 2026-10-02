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
require_login(); // session required


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

        $stmt = mysqli_prepare($con, "INSERT INTO finances (tenant_id, tenant_name, unit_name, payment_type, amount, payment_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        mysqli_stmt_bind_param($stmt, "isssdss", $tenant_id, $tenant_name, $unit_name, $payment_type, $amount, $payment_date, $status);

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