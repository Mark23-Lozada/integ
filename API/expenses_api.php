<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include 'db.php';

if (!$con) {
    echo json_encode(["success" => false, "message" => "Connection Failed: " . mysqli_connect_error()]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

// 1. DELETE ACTION
if (isset($data['action']) && $data['action'] === 'delete') {
    $id = intval($data['id'] ?? 0);
    
    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid ID para sa pag-delete.']);
        exit;
    }

    $del_query = "DELETE FROM property_expenses WHERE id = $id";
    
    if (mysqli_query($con, $del_query)) {
        echo json_encode(['success' => true, 'message' => 'Matagumpay na na-delete ang gastusin mula sa database.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database Error: ' . mysqli_error($con)]);
    }
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// Helper function para kalkulahin ang percentage batay sa huling dalawang bill
function calculateComparison($con, $subCategoryName) {
    // Kunin ang dalawang pinakahuling bill ayon sa petsa at ID
    $query = "SELECT amount, expense_date FROM property_expenses WHERE sub_category LIKE '%$subCategoryName%' ORDER BY expense_date DESC, id DESC LIMIT 2";
    $result = mysqli_query($con, $query);
    
    $rows = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $rows[] = $row;
    }

    $current = 0;
    $previous = 0;
    $percentage = 0;
    $isIncrease = false;

    if (count($rows) >= 2) {
        $current = floatval($rows[0]['amount']);
        $previous = floatval($rows[1]['amount']);
    } else if (count($rows) == 1) {
        $current = floatval($rows[0]['amount']);
        $previous = 0;
    }

    if ($previous > 0) {
        $diff = $current - $previous;
        $percentage = round((abs($diff) / $previous) * 100, 1);
        $isIncrease = $diff >= 0;
    } else {
        $percentage = 0;
        $isIncrease = true;
    }

    return [
        "current" => $current,
        "previous" => $previous,
        "percentage" => $percentage,
        "isIncrease" => $isIncrease
    ];
}

switch ($method) {
    case 'GET':
        // Handle Action para sa Utility History
        if (isset($_GET['action']) && $_GET['action'] === 'utility_history') {
            $subCategory = mysqli_real_escape_string($con, $_GET['sub_category'] ?? '');
            $history_query = "SELECT * FROM property_expenses WHERE sub_category LIKE '%$subCategory%' ORDER BY expense_date DESC, id DESC";
            $history_result = mysqli_query($con, $history_query);
            $history = [];
            while ($row = mysqli_fetch_assoc($history_result)) {
                $history[] = $row;
            }
            echo json_encode(["success" => true, "history" => $history]);
            exit();
        }

        // 1. Kabuuang Koleksyon mula sa Finances (Pera)
        $income_query = "SELECT SUM(amount) AS total_collected FROM finances";
        $income_result = mysqli_query($con, $income_query);
        $income_data = mysqli_fetch_assoc($income_result);
        $totalCollected = floatval($income_data['total_collected'] ?? 0);

        // 2. Kabuuang Gastusin na APPROVED na lang ang ibabawas sa tunay na balanse
        $exp_query = "SELECT 
                            SUM(CASE WHEN status = 'Approved' THEN amount ELSE 0 END) AS total_approved_expenses
                      FROM property_expenses";
        $exp_result = mysqli_query($con, $exp_query);
        $exp_data = mysqli_fetch_assoc($exp_result);

        $totalExpenses = floatval($exp_data['total_approved_expenses'] ?? 0);
        $netBalance = $totalCollected - $totalExpenses;

        // 3. Utility Bill Comparisons (Meralco, Tubig, WiFi)
        $meralcoComp = calculateComparison($con, 'Meralco');
        $waterComp = calculateComparison($con, 'Tubig');
        $wifiComp = calculateComparison($con, 'WiFi');

        // 4. Kunin ang listahan ng lahat ng expenses
        $list_query = "SELECT * FROM property_expenses ORDER BY expense_date DESC, id DESC";
        $list_result = mysqli_query($con, $list_query);
        $expenses = [];
        while ($row = mysqli_fetch_assoc($list_result)) {
            $expenses[] = $row;
        }

        echo json_encode([
            "success" => true,
            "totalCollected" => $totalCollected,
            "totalExpenses" => $totalExpenses,
            "netBalance" => $netBalance,
            "expenses" => $expenses,
            "billComparison" => [
                "meralco" => $meralcoComp,
                "water" => $waterComp,
                "wifi" => $wifiComp
            ]
        ]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data)) {
            $data = $_POST;
        }

        // Action para sa pag-approve ng gastusin
        if (isset($data['action']) && $data['action'] === 'approve') {
            $id = intval($data['id'] ?? 0);
            
            $chk = mysqli_query($con, "SELECT amount, status FROM property_expenses WHERE id = $id");
            if ($row = mysqli_fetch_assoc($chk)) {
                if ($row['status'] === 'Approved') {
                    echo json_encode(["success" => false, "message" => "Na-approve na ang gastusin na ito dati pa."]);
                    exit();
                }

                $inc_q = mysqli_query($con, "SELECT SUM(amount) AS total FROM finances");
                $inc_r = mysqli_fetch_assoc($inc_q);
                $totCol = floatval($inc_r['total'] ?? 0);

                $ex_q = mysqli_query($con, "SELECT SUM(amount) AS total FROM property_expenses WHERE status='Approved'");
                $ex_r = mysqli_fetch_assoc($ex_q);
                $totExp = floatval($ex_r['total'] ?? 0);

                $currentBalance = $totCol - $totExp;
                $expenseAmount = floatval($row['amount']);

                if ($currentBalance < $expenseAmount) {
                    echo json_encode(["success" => false, "message" => "Hindi ma-approve! Kulang ang pondo sa finance (Net Balance: ₱" . number_format($currentBalance, 2) . ")."]);
                    exit();
                }

                $up_q = "UPDATE property_expenses SET status = 'Approved' WHERE id = $id";
                if (mysqli_query($con, $up_q)) {
                    echo json_encode(["success" => true, "message" => "Tagumpay na na-approve ang gastusin at nabawasan ang pondo!"]);
                } else {
                    echo json_encode(["success" => false, "message" => "Database Error: " . mysqli_error($con)]);
                }
            } else {
                echo json_encode(["success" => false, "message" => "Hindi natagpuan ang gastusin."]);
            }
            exit();
        }

        // Normal Add Expense
        $category     = mysqli_real_escape_string($con, $data['category'] ?? '');
        $sub_category = mysqli_real_escape_string($con, $data['sub_category'] ?? '');
        $amount       = floatval($data['amount'] ?? 0);
        $expense_date = mysqli_real_escape_string($con, $data['expense_date'] ?? date('Y-m-d'));
        $description  = mysqli_real_escape_string($con, $data['description'] ?? '');

        if (empty($category) || empty($sub_category) || $amount <= 0) {
            echo json_encode([
                "success" => false, 
                "message" => "Mangyaring punan ang kategorya, uri ng gastusin, at wastong halaga."
            ]);
            exit();
        }

        $query = "INSERT INTO property_expenses (category, sub_category, amount, expense_date, description, status) 
                  VALUES ('$category', '$sub_category', $amount, '$expense_date', '$description', 'Pending')";
        
        if (mysqli_query($con, $query)) {
            echo json_encode([
                "success" => true, 
                "message" => "Tagumpay na naidagdag ang gastusin! (Pending approval)"
            ]);
        } else {
            echo json_encode([
                "success" => false, 
                "message" => "Error sa pag-save: " . mysqli_error($con)
            ]);
        }
        break;

    default:
        echo json_encode([
            "success" => false, 
            "message" => "Invalid Request Method"
        ]);
        break;
}

mysqli_close($con);
?>