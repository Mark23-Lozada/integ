<?php
header("Content-Type: application/json");
include 'db.php';
require_once __DIR__ . '/auth.php';
no_cache_headers();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed."]);
    exit;
}

// Registration is only allowed while NO admin account exists yet.
$countRes = mysqli_query($con, "SELECT COUNT(*) AS c FROM users");
$countRow = $countRes ? mysqli_fetch_assoc($countRes) : ['c' => 0];
if (intval($countRow['c']) > 0) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Registration is closed. An admin account already exists."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['gmail']) && isset($data['password']) && isset($data['names'])) {
    $gmail = trim($data['gmail']);
    $pass = trim($data['password']);
    $names = trim($data['names']);

    if (!preg_match('/^[a-zA-Z0-9._%+-]+@gmail\.com$/', $gmail)) {
        echo json_encode(["status" => "error", "message" => "Invalid Gmail format."]);
        exit;
    }

    if (strlen($pass) < 8) {
        echo json_encode(["status" => "error", "message" => "Password must be at least 8 characters."]);
        exit;
    }

    if ($names === '') {
        echo json_encode(["status" => "error", "message" => "Full name is required."]);
        exit;
    }

    $hashed_password = password_hash($pass, PASSWORD_DEFAULT);

    $stmt = $con->prepare("INSERT INTO users (gmail, password, names) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $gmail, $hashed_password, $names);

    if ($stmt->execute()) {
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