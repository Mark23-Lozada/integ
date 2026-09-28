<?php
header("Content-Type: application/json");
include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if(isset($data['gmail']) && isset($data['password']) && isset($data['names'])) {
    $gmail = trim($data['gmail']);
    $pass = trim($data['password']);
    $names = trim($data['names']);

    if (!preg_match('/^[a-zA-Z0-9._%+-]+@gmail\.com$/', $gmail)) {
        echo json_encode(["status" => "error", "message" => "Invalid Gmail format."]);
        exit;
    }

    $hashed_password = password_hash($pass, PASSWORD_DEFAULT);

    $stmt = $con->prepare("INSERT INTO users (gmail, password, names) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $gmail, $hashed_password, $names);

    if($stmt->execute()) {
        echo json_encode([
            "status" => "success", 
            "message" => "Registered successfully!",
            "names" => $names
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Gmail might already exist in database."]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Incomplete data."]);
}
?>