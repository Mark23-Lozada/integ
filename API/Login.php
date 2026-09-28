<?php
header("Content-Type: application/json");
include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if(isset($data['gmail']) && isset($data['password'])) {
    $user = trim($data['gmail']);
    $pass = trim($data['password']);

    $stmt = $con->prepare("SELECT password, names FROM users WHERE gmail = ?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $stmt->store_result();

    if($stmt->num_rows > 0) {
        $stmt->bind_result($hashed_password, $names);
        $stmt->fetch();

        if(password_verify($pass, $hashed_password)) {
            echo json_encode([
                "status" => "success", 
                "message" => "Login successful!",
                "names" => $names 
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid gmail or password!"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid gmail or password!"]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Incomplete data."]);
}
?>