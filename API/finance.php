<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

ini_set('display_errors', 0);
error_reporting(E_ALL);

include 'db.php';

if (!$con) {
    echo json_encode(["success" => false, "message" => "Connection Failed: " . mysqli_connect_error()]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

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

        $tenant_id    = !empty($data['tenant_id']) ? intval($data['tenant_id']) : NULL;
        $tenant_name  = mysqli_real_escape_string($con, $data['tenant_name'] ?? '');
        $unit_name    = mysqli_real_escape_string($con, $data['unit_name'] ?? 'Unassigned');
        $payment_type = mysqli_real_escape_string($con, $data['payment_type'] ?? 'Monthly Rent');
        $amount       = floatval($data['amount'] ?? $data['amount_paid'] ?? 0);
        $payment_date = mysqli_real_escape_string($con, $data['payment_date'] ?? date('Y-m-d H:i:s'));
        $status       = mysqli_real_escape_string($con, $data['status'] ?? 'Paid');

        if (empty($tenant_name) || $amount <= 0) {
            echo json_encode([
                "success" => false, 
                "message" => "Mangyaring ilagay ang pangalan ng tenant at wastong halaga ng bayad."
            ]);
            exit();
        }

        $query = "INSERT INTO finances (tenant_id, tenant_name, unit_name, payment_type, amount, payment_date, status) 
                  VALUES (" . ($tenant_id ? $tenant_id : "NULL") . ", '$tenant_name', '$unit_name', '$payment_type', $amount, '$payment_date', '$status')";
        
        if (mysqli_query($con, $query)) {
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