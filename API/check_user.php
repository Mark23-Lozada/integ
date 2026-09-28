<?php
header("Content-Type: application/json");
include 'db.php';

$query = "SELECT COUNT(*) as count FROM users";
$result = mysqli_query($con, $query);

if ($result) {
    $row = mysqli_fetch_assoc($result);
    $hasUser = $row['count'] > 0;
    echo json_encode(["status" => "success", "hasUser" => $hasUser]);
} else {
    echo json_encode(["status" => "error", "hasUser" => false]);
}
?>