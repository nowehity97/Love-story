<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$db_file = 'lovestory.sqlite';
$upload_dir = 'uploads/';
$secret_date = "01.01.2024";
$secret_iso = "2024-01-01";
$gemini_api_key = ""; // Wstaw swój klucz API z https://aistudio.google.com/app/apikey

// Tworzenie bazy danych jeśli nie istnieje
$db = new SQLite3($db_file);
$db->exec("CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    caption TEXT NOT NULL,
    date TEXT,
    createdAt INTEGER NOT NULL,
    userId TEXT
)");
$db->exec("CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
)");
$db->exec("CREATE TABLE IF NOT EXISTS bucket_list (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    isCompleted INTEGER DEFAULT 0,
    createdAt INTEGER NOT NULL
)");

// Folder na upload
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$method = $_SERVER['REQUEST_METHOD'];

// Akcje konfiguracyjne
if ($method === 'GET' && isset($_GET['action'])) {
    if ($_GET['action'] === 'verify' && isset($_GET['date'])) {
        $stmt = $db->prepare("SELECT value FROM settings WHERE key = 'start_date'");
        $res = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
        $startDate = $res ? $res['value'] : "";

        // If no date is set in settings yet, allow any entry (or return error if user wants forced setup)
        // But the user said: first enter without date, then after adding it asks.
        if (!$startDate) {
            echo json_encode(["status" => "ok", "startDate" => ""]);
            exit;
        }

        // Format date from settings (YYYY-MM-DD) to compare with user input (DD.MM.YYYY)
        $isoDate = $startDate;
        $formattedSecret = date("d.m.Y", strtotime($isoDate));

        if ($_GET['date'] === $formattedSecret) {
            echo json_encode(["status" => "ok", "startDate" => $isoDate]);
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error"]);
        }
        exit;
    }
    
    if ($_GET['action'] === 'bucket_list') {
        $results = $db->query("SELECT * FROM bucket_list ORDER BY createdAt DESC");
        $items = [];
        while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
            $items[] = $row;
        }
        echo json_encode($items);
        exit;
    }

    if ($_GET['action'] === 'get_settings') {
        $results = $db->query("SELECT * FROM settings");
        $settings = [];
        while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
            $val = json_decode($row['value'], true);
            $settings[$row['key']] = ($val === null) ? $row['value'] : $val;
        }
        echo json_encode($settings);
        exit;
    }
}

// Pobieranie zdjęć
if ($method === 'GET') {
    $results = $db->query("SELECT * FROM photos ORDER BY createdAt DESC");
    $photos = [];
    while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
        $photos[] = $row;
    }
    echo json_encode($photos);
}

// Dodawanie/Usuwanie
if ($method === 'POST') {
    // Bucket list actions
    if (isset($_GET['action'])) {
        $action = $_GET['action'];
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if ($action === 'bucket_add') {
            $id = uniqid();
            $title = $data['title'] ?? '';
            $createdAt = time();
            $stmt = $db->prepare("INSERT INTO bucket_list (id, title, createdAt) VALUES (:id, :title, :createdAt)");
            $stmt->bindValue(':id', $id);
            $stmt->bindValue(':title', $title);
            $stmt->bindValue(':createdAt', $createdAt);
            $stmt->execute();
            echo json_encode(["status" => "added", "id" => $id]);
            exit;
        }

        if ($action === 'bucket_toggle') {
            $id = $_GET['id'] ?? '';
            $isCompleted = ($data['isCompleted'] === true) ? 1 : 0;
            $stmt = $db->prepare("UPDATE bucket_list SET isCompleted = :isCompleted WHERE id = :id");
            $stmt->bindValue(':isCompleted', $isCompleted);
            $stmt->bindValue(':id', $id);
            $stmt->execute();
            echo json_encode(["status" => "updated"]);
            exit;
        }

        if ($action === 'bucket_delete') {
            $id = $_GET['id'] ?? '';
            $stmt = $db->prepare("DELETE FROM bucket_list WHERE id = :id");
            $stmt->bindValue(':id', $id);
            $stmt->execute();
            echo json_encode(["status" => "deleted"]);
            exit;
        }

        if ($action === 'update_settings') {
            $key = $data['key'] ?? '';
            $value = $data['value'] ?? '';
            if (is_array($value)) $value = json_encode($value);
            
            $stmt = $db->prepare("INSERT INTO settings (key, value) VALUES (:key, :value) ON CONFLICT(key) DO UPDATE SET value = :value");
            $stmt->bindValue(':key', $key);
            $stmt->bindValue(':value', $value);
            $stmt->execute();
            echo json_encode(["status" => "updated"]);
            exit;
        }

        if ($action === 'generate_story') {
            $key = $gemini_api_key ?: getenv('GEMINI_API_KEY') ?: ($_ENV['GEMINI_API_KEY'] ?? '');
            if (!$key) {
                http_response_code(400);
                echo json_encode(["error" => "Brak klucza API Gemini. Skonfiguruj go w api.php w zmiennej \$gemini_api_key"]);
                exit;
            }

            $prompt = $data['prompt'] ?? '';
            
            // Using v1beta and gemini-flash-latest from user example
            $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";
            
            $postData = [
                "contents" => [
                    ["parts" => [["text" => $prompt]]]
                ]
            ];

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'X-goog-api-key: ' . $key
            ]);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
            
            $response = curl_exec($ch);
            $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpcode == 200) {
                $result = json_decode($response, true);
                $text = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';
                echo json_encode(["text" => $text]);
            } else {
                http_response_code($httpcode);
                echo $response;
            }
            exit;
        }
    }

    // Edycja danych (nowe)
    if (isset($_GET['update'])) {
        $id = $_GET['update'];
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        $caption = $data['caption'] ?? $_POST['caption'] ?? '';
        $date = $data['date'] ?? $_POST['date'] ?? '';

        $stmt = $db->prepare("UPDATE photos SET caption = :caption, date = :date WHERE id = :id");
        $stmt->bindValue(':caption', $caption);
        $stmt->bindValue(':date', $date);
        $stmt->bindValue(':id', $id);
        $stmt->execute();
        echo json_encode(["status" => "updated"]);
        exit;
    }

    if (isset($_GET['action']) && $_GET['action'] === 'upload_profile_pic') {
        $person = $_GET['person'] ?? 'HE';
        if (isset($_FILES['photo'])) {
            $file = $_FILES['photo'];
            $file_name = 'profile_' . $person . '_' . time() . '_' . basename($file['name']);
            $target_file = $upload_dir . $file_name;
            
            if (move_uploaded_file($file['tmp_name'], $target_file)) {
                $url = $target_file;
                // Update settings in DB immediately
                $stmt = $db->prepare("SELECT value FROM settings WHERE key = 'profile_pics'");
                $res = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
                $pics = $res ? json_decode($res['value'], true) : ['HE' => '', 'SHE' => ''];
                $pics[$person] = $url;
                
                $stmt = $db->prepare("INSERT INTO settings (key, value) VALUES ('profile_pics', :val) ON CONFLICT(key) DO UPDATE SET value = :val");
                $stmt->bindValue(':val', json_encode($pics));
                $stmt->execute();
                
                echo json_encode(["status" => "uploaded", "url" => $url, "pics" => $pics]);
                exit;
            }
        }
        http_response_code(400);
        exit;
    }

    if (isset($_GET['action']) && $_GET['action'] === 'upload_background') {
        if (isset($_FILES['photo'])) {
            $file = $_FILES['photo'];
            $file_name = 'bg_' . time() . '_' . basename($file['name']);
            $target_file = $upload_dir . $file_name;
            
            if (move_uploaded_file($file['tmp_name'], $target_file)) {
                $url = $target_file;
                $bg = ["type" => "image", "value" => $url];
                
                $stmt = $db->prepare("INSERT INTO settings (key, value) VALUES ('background', :val) ON CONFLICT(key) DO UPDATE SET value = :val");
                $stmt->bindValue(':val', json_encode($bg));
                $stmt->execute();
                
                echo json_encode(["status" => "uploaded", "url" => $url]);
                exit;
            }
        }
        http_response_code(400);
        exit;
    }

    // Usuwanie (uproszczone przez POST z parametrem)
    if (isset($_GET['delete'])) {
        $id = $_GET['delete'];
        $stmt = $db->prepare("SELECT url FROM photos WHERE id = :id");
        $stmt->bindValue(':id', $id);
        $res = $stmt->execute();
        $row = $res->fetchArray(SQLITE3_ASSOC);
        
        if ($row) {
            $file_path = ltrim($row['url'], '/');
            if (file_exists($file_path)) {
                unlink($file_path);
            }
        }
        
        $stmt = $db->prepare("DELETE FROM photos WHERE id = :id");
        $stmt->bindValue(':id', $id);
        $stmt->execute();
        echo json_encode(["status" => "deleted"]);
        exit;
    }

    // Wgrywanie pliku
    if (isset($_FILES['photo'])) {
        $caption = $_POST['caption'] ?? '';
        $date = $_POST['date'] ?? '';
        $id = time() . '-' . rand(1000, 9999);
        
        $ext = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
        $filename = $id . '.' . $ext;
        $target_file = $upload_dir . $filename;
        
        if (move_uploaded_file($_FILES['photo']['tmp_name'], $target_file)) {
            $createdAt = time() * 1000;
            $url = $target_file;
            
            $stmt = $db->prepare("INSERT INTO photos (id, url, caption, date, createdAt, userId) VALUES (:id, :url, :caption, :date, :createdAt, :userId)");
            $stmt->bindValue(':id', $id);
            $stmt->bindValue(':url', $url);
            $stmt->bindValue(':caption', $caption);
            $stmt->bindValue(':date', $date);
            $stmt->bindValue(':createdAt', $createdAt);
            $stmt->bindValue(':userId', 'php-user');
            $stmt->execute();
            
            echo json_encode([
                "id" => $id,
                "url" => $url,
                "caption" => $caption,
                "date" => $date,
                "createdAt" => $createdAt,
                "userId" => "php-user"
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Upload failed"]);
        }
    }
}
?>
