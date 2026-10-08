<?php
header("Content-Type: application/json");
include 'db.php';

// Only LANDLORD accounts count: tenant logins must not close or open registration.
$query = "SELECT COUNT(*) as count FROM users WHERE role = 'landlord'";
$result = mysqli_query($con, $query);

if ($result) {
    $row = mysqli_fetch_assoc($result);
    $hasUser = $row['count'] > 0;
    echo json_encode(["status" => "success", "hasUser" => $hasUser]);
} else {
    echo json_encode(["status" => "error", "hasUser" => false]);
}
?>
