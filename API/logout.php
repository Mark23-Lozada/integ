<?php
header("Content-Type: application/json");
require_once __DIR__ . '/auth.php';

no_cache_headers();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed."]);
    exit;
}

destroy_session();
echo json_encode(["status" => "success", "message" => "Logged out."]);
?>