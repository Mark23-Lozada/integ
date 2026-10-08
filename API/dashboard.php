<?php
header("Content-Type: application/json");
require_once __DIR__ . '/auth.php';
require_role(ROLE_LANDLORD); // landlord only

// The name comes from the logged-in session, not "the first row of users"
// (users now also holds tenant accounts).
echo json_encode([
    "success" => true,
    "adminName" => $_SESSION['names'] ?? "Admin"
]);
?>
