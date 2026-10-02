<?php
header("Content-Type: application/json");
require_once __DIR__ . '/auth.php';

no_cache_headers();

if (is_logged_in()) {
    echo json_encode(["authenticated" => true, "names" => $_SESSION['names'] ?? 'Admin']);
} else {
    echo json_encode(["authenticated" => false]);
}
?>