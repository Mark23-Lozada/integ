<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

ini_set('display_errors', 0);
error_reporting(E_ALL);

$host = "localhost";
$db = "integ_admin";
$username = "root";
$password = "";

$con = mysqli_connect($host, $username, $password, $db);
if (!$con) {
    echo json_encode(["success" => false, "message" => "Connection Failed: " . mysqli_connect_error()]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $result = mysqli_query($con, "SELECT * FROM units ORDER BY id DESC");
        $units = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $row['isOccupied'] = (bool) $row['isOccupied'];
            
            // --- FIX: Automatic sync ng status kung may tenant o occupied ---
            if (!empty($row['tenantName']) || $row['isOccupied']) {
                $row['status'] = 'Occupied';
                $row['isOccupied'] = true;
            } else if (empty($row['status'])) {
                $row['status'] = 'Available';
            }
            
            $units[] = $row;
        }
        echo json_encode($units);
        break;

    case 'POST':
        $id = intval($_POST['id'] ?? 0);
        $name = mysqli_real_escape_string($con, trim($_POST['name'] ?? ''));
        
        if (empty($name)) {
            echo json_encode(["success" => false, "message" => "Room / Unit name is required."]);
            exit();
        }

        if ($id > 0) {
            $checkOrigQuery = "SELECT isOccupied FROM units WHERE id = $id";
            $checkOrigResult = mysqli_query($con, $checkOrigQuery);
            if ($checkOrigResult && mysqli_num_rows($checkOrigResult) > 0) {
                $origRow = mysqli_fetch_assoc($checkOrigResult);
                if ((int)$origRow['isOccupied'] === 1) {
                    echo json_encode(["success" => false, "message" => "Bawal i-edit ang unit na ito dahil kasalukuyan itong occupied!"]);
                    exit();
                }
            }
        }

        if ($id > 0) {
            $dupQuery = "SELECT id FROM units WHERE name = '$name' AND id != $id";
        } else {
            $dupQuery = "SELECT id FROM units WHERE name = '$name'";
        }
        
        $dupResult = mysqli_query($con, $dupQuery);
        if ($dupResult && mysqli_num_rows($dupResult) > 0) {
            echo json_encode(["success" => false, "message" => "Bawal ang duplicate! Mayroon na ring Unit/Room na may kapangalan nito sa database."]);
            exit();
        }

        $type = mysqli_real_escape_string($con, $_POST['type'] ?? 'Standard Room');
        $rate = floatval($_POST['rate'] ?? 0);
        $downpayment = floatval($_POST['downpayment'] ?? 0);
        
        if ($rate < 0 || $rate > 50000) {
            echo json_encode(["success" => false, "message" => "Monthly rent must be between ₱0 and ₱50,000."]);
            exit();
        }

        if ($downpayment < 0 || $downpayment > 5001) {
            echo json_encode(["success" => false, "message" => "Downpayment cannot exceed ₱5,000."]);
            exit();
        }
        if ($downpayment > $rate) {
            echo json_encode(["success" => false, "message" => "Bawal mas mataas ang downpayment kaysa sa monthly rent rate!"]);
            exit();
        }

        $description = mysqli_real_escape_string($con, $_POST['description'] ?? '');
        $status = mysqli_real_escape_string($con, $_POST['status'] ?? 'Available');
        
        $tenantName = mysqli_real_escape_string($con, $_POST['tenantName'] ?? '');
        
        // --- FIX: Kung may tenantName, piliting Occupied ang isOccupied at status ---
        if (!empty($tenantName)) {
            $isOccupied = 1;
            $status = 'Occupied';
        } else {
            $isOccupied = ($status === 'Occupied') ? 1 : 0;
        }

        function uploadImage($fileKey) {
            if (isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] === UPLOAD_ERR_OK) {
                $uploadDir = '../uploads/';
                if (!is_dir($uploadDir)) { mkdir($uploadDir, 0777, true); }
                $fileName = time() . '_' . rand(1000, 9999) . '_' . basename($_FILES[$fileKey]['name']);
                $targetFilePath = $uploadDir . $fileName;
                if (move_uploaded_file($_FILES[$fileKey]['tmp_name'], $targetFilePath)) {
                    return 'uploads/' . $fileName;
                }
            }
            return '';
        }

        $image = mysqli_real_escape_string($con, uploadImage('image') ?: ($_POST['existingImage'] ?? ''));
        $kitchenImage = mysqli_real_escape_string($con, uploadImage('kitchenImage') ?: ($_POST['existingKitchenImage'] ?? ''));
        $diningImage = mysqli_real_escape_string($con, uploadImage('diningImage') ?: ($_POST['existingDiningImage'] ?? ''));

        if ($id > 0) {
            $query = "UPDATE units SET name='$name', type='$type', rate='$rate', downpayment='$downpayment', description='$description', 
                      image='$image', kitchenImage='$kitchenImage', diningImage='$diningImage', status='$status', isOccupied=$isOccupied, tenantName='$tenantName' WHERE id=$id";
        } else {
            $query = "INSERT INTO units (name, type, rate, downpayment, description, image, kitchenImage, diningImage, status, isOccupied, tenantName) 
                      VALUES ('$name', '$type', '$rate', '$downpayment', '$description', '$image', '$kitchenImage', '$diningImage', '$status', $isOccupied, '$tenantName')";
        }
        
        if (mysqli_query($con, $query)) {
            echo json_encode(["success" => true, "message" => "Unit saved successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => mysqli_error($con)]);
        }
        break;

    case 'DELETE':
        $id = intval($_GET['id'] ?? 0);
        if ($id > 0) {
            $checkQuery = "SELECT isOccupied FROM units WHERE id=$id";
            $checkResult = mysqli_query($con, $checkQuery);
            
            if ($checkResult && mysqli_num_rows($checkResult) > 0) {
                $row = mysqli_fetch_assoc($checkResult);
                if ((int)$row['isOccupied'] === 1) {
                    echo json_encode(["success" => false, "message" => "Bawal idelete ang unit kapag ito ay occupied!"]);
                    exit();
                }
            }

            $query = "DELETE FROM units WHERE id=$id";
            if (mysqli_query($con, $query)) {
                echo json_encode(["success" => true, "message" => "Unit deleted successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => mysqli_error($con)]);
            }
        }
        break;
}
mysqli_close($con);
?>