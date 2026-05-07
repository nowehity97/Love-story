import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DB_PATH = path.join(__dirname, 'lovestory.db');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initialize SQLite database
const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    caption TEXT NOT NULL,
    date TEXT,
    createdAt INTEGER NOT NULL,
    userId TEXT
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  CREATE TABLE IF NOT EXISTS bucket_list (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    isCompleted INTEGER DEFAULT 0,
    createdAt INTEGER NOT NULL
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Multer config
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });
  const upload = multer({ storage });

  // Emulacja API PHP dla podglądu (aby frontend działał tak samo tutaj i na hostingu)
  const SECRET_DATE = "13.11.2014";
  const SECRET_ISO = "2014-11-13";

  app.get('/api.php', (req, res) => {
    // Obsługa akcji weryfikacji
    if (req.query.action === 'verify') {
      const dateParam = req.query.date as string;
      try {
        const row = db.prepare("SELECT value FROM settings WHERE key = 'start_date'").get() as { value: string } | undefined;
        const startDate = row ? row.value : "";

        if (!startDate) {
          return res.json({ status: "ok", startDate: "" });
        }

        // startDate format is YYYY-MM-DD. Convert to DD.MM.YYYY for comparison
        const [y, m, d] = startDate.split('-');
        const formattedSecret = `${d}.${m}.${y}`;

        if (dateParam === formattedSecret) {
          return res.json({ status: "ok", startDate });
        } else {
          return res.status(401).json({ status: "error" });
        }
      } catch (error) {
        return res.status(500).json({ error: 'Database error' });
      }
    }

    if (req.query.action === 'bucket_list') {
      try {
        const items = db.prepare('SELECT * FROM bucket_list ORDER BY createdAt DESC').all();
        return res.json(items);
      } catch (error) {
        return res.status(500).json({ error: 'Database error' });
      }
    }

    if (req.query.action === 'get_settings') {
      try {
        const rows = db.prepare('SELECT * FROM settings').all() as { key: string, value: string }[];
        const settings: any = {};
        rows.forEach(row => {
          try {
            settings[row.key] = JSON.parse(row.value);
          } catch {
            settings[row.key] = row.value;
          }
        });
        return res.json(settings);
      } catch (error) {
        return res.status(500).json({ error: 'Database error' });
      }
    }

    try {
      const photos = db.prepare('SELECT * FROM photos ORDER BY createdAt DESC').all();
      res.json(photos);
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api.php', (req, res, next) => {
    // If it's a JSON request (like AI generation or settings), skip multer
    if (req.is('json')) {
      return next();
    }
    // Otherwise use multer for uploads
    upload.single('photo')(req, res, next);
  }, async (req, res) => {
    // Bucket list actions
    if (req.query.action) {
      const action = req.query.action;
      const { title, isCompleted } = req.body;
      const id = req.query.id as string || Date.now().toString();

      try {
        if (action === 'bucket_add') {
          db.prepare('INSERT INTO bucket_list (id, title, createdAt) VALUES (?, ?, ?)')
            .run(id, title, Math.floor(Date.now() / 1000));
          return res.json({ status: 'added', id });
        }
        if (action === 'bucket_toggle') {
          db.prepare('UPDATE bucket_list SET isCompleted = ? WHERE id = ?')
            .run(isCompleted ? 1 : 0, id);
          return res.json({ status: 'updated' });
        }
        if (action === 'bucket_delete') {
          db.prepare('DELETE FROM bucket_list WHERE id = ?').run(id);
          return res.json({ status: 'deleted' });
        }
        if (action === 'update_settings') {
          const { key, value } = req.body;
          db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
            .run(key, typeof value === 'string' ? value : JSON.stringify(value));
          return res.json({ status: 'updated' });
        }
        if (action === 'generate_story') {
          const { prompt } = req.body;
          const apiKey = process.env.GEMINI_API_KEY;
          
          console.log('Generating story with prompt length:', prompt?.length);

          if (!apiKey) {
            console.error('GEMINI_API_KEY missing in environment variables');
            return res.status(400).json({ error: 'Brak klucza API Gemini w środowisku.' });
          }

          try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'X-goog-api-key': apiKey
              },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
              })
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              console.error('Gemini API Error:', errorData);
              return res.status(response.status).json({ error: errorData.error?.message || 'Błąd API Gemini' });
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return res.json({ text });
          } catch (error: any) {
            console.error('Fetch error during generation:', error);
            return res.status(500).json({ error: 'Nie udało się połączyć z API Gemini: ' + error.message });
          }
        }
      } catch (error) {
        return res.status(500).json({ error: 'Database error' });
      }
    }

    // Obsługa edycji (nowe)
    if (req.query.update) {
      const id = req.query.update;
      const { caption, date } = req.body;
      try {
        db.prepare('UPDATE photos SET caption = ?, date = ? WHERE id = ?')
          .run(caption, date, id);
        return res.json({ success: true, id, caption, date });
      } catch (error) {
        return res.status(500).json({ error: 'Update failed' });
      }
    }

    if (req.query.action === 'upload_profile_pic') {
      const person = (req.query.person as string) || 'HE';
      if (req.file) {
        const url = `uploads/${req.file.filename}`;
        
        try {
          const row = db.prepare("SELECT value FROM settings WHERE key = 'profile_pics'").get() as { value: string } | undefined;
          let pics = row ? JSON.parse(row.value) : { HE: '', SHE: '' };
          pics[person] = url;
          
          db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
            .run('profile_pics', JSON.stringify(pics));
            
          return res.json({ status: 'uploaded', url, pics });
        } catch (error) {
          return res.status(500).json({ error: 'Database error' });
        }
      }
      return res.status(400).json({ error: 'No file' });
    }

    // Obsługa usuwania
    if (req.query.delete) {
      const id = req.query.delete;
      try {
        const photo = db.prepare('SELECT url FROM photos WHERE id = ?').get(id) as { url: string } | undefined;
        if (photo) {
          const filePath = path.join(__dirname, photo.url);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        db.prepare('DELETE FROM photos WHERE id = ?').run(id);
        return res.json({ success: true });
      } catch (error) {
        return res.status(500).json({ error: 'Delete failed' });
      }
    }

    // Obsługa uploadu
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { caption, date } = req.body;
    const id = Date.now().toString();
    const url = `uploads/${req.file.filename}`;
    const createdAt = Date.now();

    try {
      db.prepare('INSERT INTO photos (id, url, caption, date, createdAt, userId) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id, url, caption, date, createdAt, 'preview-user');
      res.json({ id, url, caption, date, createdAt, userId: 'preview-user' });
    } catch (error) {
      res.status(500).json({ error: 'Save failed' });
    }
  });

  // Oryginalne endpointy (opcjonalne, zachowane dla zgodności)
  app.get('/api/photos', (req, res) => {
    try {
      const photos = db.prepare('SELECT * FROM photos ORDER BY createdAt DESC').all();
      res.json(photos);
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/upload', upload.single('photo'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { caption, date } = req.body;
    const id = Date.now().toString(); // Simple ID
    const url = `uploads/${req.file.filename}`;
    const createdAt = Date.now();
    const userId = 'local-user';

    try {
      const insert = db.prepare(`
        INSERT INTO photos (id, url, caption, date, createdAt, userId)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insert.run(id, url, caption, date, createdAt, userId);
      
      res.json({ id, url, caption, date, createdAt, userId });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save to database' });
    }
  });

  app.delete('/api/photos/:id', (req, res) => {
    const { id } = req.params;
    try {
      const photo = db.prepare('SELECT url FROM photos WHERE id = ?').get(id) as { url: string } | undefined;
      
      if (photo) {
        const filePath = path.join(__dirname, photo.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      db.prepare('DELETE FROM photos WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
