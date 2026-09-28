<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

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

// Set charset para maiwasan ang mga isyu sa special characters
mysqli_set_charset($con, "utf8mb4");
?>