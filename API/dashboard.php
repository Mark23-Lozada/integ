<?php
header("Content-Type: application/json");
include 'db.php';

$query = "SELECT names FROM users LIMIT 1";
$result = $con->query($query);

if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo json_encode([
        "success" => true,
        "adminName" => $row['names']
    ]);
} else {
    echo json_encode([
        "success" => false,
        "adminName" => "Admin"
    ]);
}
?>