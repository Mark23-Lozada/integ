<?php
ob_start(); // swallow any stray output so the response is always clean JSON
// Public (no login) endpoint used by the login/landing page.
// Returns ONLY available units and hides private data (tenant names, status, etc.).
header("Content-Type: application/json; charset=UTF-8");
header("Cache-Control: no-store");
ini_set('display_errors', 0);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit();
}

$con = mysqli_connect("localhost", "root", "", "integ_admin");
if (!$con) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Connection failed"]);
    exit();
}
mysqli_set_charset($con, 'utf8mb4');

$result = mysqli_query($con, "SELECT id, name, type, rate, downpayment, description, image, kitchenImage, diningImage, status, isOccupied, tenantName FROM units ORDER BY id DESC");
if (!$result) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Query failed"]);
    exit();
}

$units = [];
$total = 0;
$occupied = 0;

while ($row = mysqli_fetch_assoc($result)) {
    $total++;

    // Same occupied rule as units.php
    $isOccupied = ((int)$row['isOccupied'] === 1)
        || trim((string)$row['tenantName']) !== ''
        || $row['status'] === 'Occupied';

    if ($isOccupied) { $occupied++; continue; }

    // Skip anything that is not available (e.g. maintenance)
    if (!empty($row['status']) && $row['status'] !== 'Available') { continue; }

    $units[] = [
        "id"           => (int)$row['id'],
        "name"         => $row['name'],
        "type"         => $row['type'],
        "rate"         => (float)$row['rate'],
        "downpayment"  => (float)$row['downpayment'],
        "description"  => $row['description'],
        "image"        => $row['image'],
        "kitchenImage" => $row['kitchenImage'],
        "diningImage"  => $row['diningImage'],
    ];
}

ob_clean();
echo json_encode([
    "success"  => true,
    "total"    => $total,
    "occupied" => $occupied,
    "units"    => $units
]);
mysqli_close($con);