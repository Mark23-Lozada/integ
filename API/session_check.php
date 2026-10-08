<?php
header("Content-Type: application/json");
require_once __DIR__ . '/auth.php';

no_cache_headers();

// Only ?touch=1 (real user activity) resets the idle timer. Plain checks are passive.
$touch = (($_GET['touch'] ?? '') === '1');

if (is_logged_in($touch)) {
    echo json_encode([
        "authenticated" => true,
        "names" => $_SESSION['names'] ?? 'Admin',
        "role" => $_SESSION['role'],
        "mustChangePassword" => !empty($_SESSION['must_change_password'])
    ]);
} else {
    echo json_encode(["authenticated" => false]);
}
?>
