# Gemini Music - Full Stack Project

A simple music library/player built with a FastAPI backend and a vanilla HTML/CSS/JS frontend. Users can list, search, play, upload, edit, and delete songs. Static audio files and cover images are served from the backend.

## Features
- **Song list and search** via `GET /api/songs` and `GET /api/songs/search?q=`
- **Audio playback UI** with play/pause, previous/next, progress, and volume controls
- **Song upload** (audio + cover art) stored on disk; metadata in MongoDB
- **Edit and delete** song metadata
- **Static file serving** for music and cover art from `backend/static/`
- **CORS enabled** for local frontend development

## Tech Stack
- **Backend:** FastAPI, Uvicorn, Motor (MongoDB), Pydantic, AIOFiles, python-multipart
- **Database:** MongoDB (local by default `mongodb://localhost:27017`)
- **Frontend:** HTML, CSS, JavaScript (no framework)

## Project Structure
```
learning Project 1.1/
├─ backend/
│  ├─ main.py                  # FastAPI app and API endpoints
│  ├─ requirements.txt         # Backend Python dependencies
│  └─ static/
│     ├─ music/                # Uploaded audio files
│     └─ images/               # Uploaded cover art
├─ frontend/
│  ├─ index.html               # Music player UI
│  ├─ script.js                # Frontend logic (uses http://127.0.0.1:8000)
│  ├─ style.css                # Global styles for player
│  ├─ admin.html/.js/.css      # Admin page (if used)
│  ├─ manage.html/.js/.css     # Manage page (if used)
│  └─ login.html/.js/.css      # Login page (if used)
└─ README.md
```

## Backend: Setup & Run
1. **Prerequisites**
   - Python 3.10+ (tested with 3.11)
   - MongoDB running locally on `mongodb://localhost:27017`
2. **Install dependencies**
   ```bash
   # from project root
   python -m venv .venv
   .venv/Scripts/activate   # Windows PowerShell
   pip install -r backend/requirements.txt
   ```
3. **Run the API server**
   ```bash
   # Run from the backend directory for convenience
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```
   - Base URL: `http://127.0.0.1:8000`
   - Static files: `http://127.0.0.1:8000/static/...`

### Configuration
- Connection string is set in `backend/main.py`:
  ```python
  MONGO_DETAILS = "mongodb://localhost:27017"
  DATABASE_NAME = "musicdb"
  SONG_COLLECTION = "songs"
  ```
- Change `MONGO_DETAILS` if your MongoDB runs elsewhere.

## Frontend: Run
- The frontend points to `http://127.0.0.1:8000` in `frontend/script.js` via `API_BASE_URL`.
- Options:
  - Open `frontend/index.html` directly in a browser, or
  - Serve `frontend/` with a simple static server or your editor's Live Server.

## API Reference
Base URL: `http://127.0.0.1:8000`

- **List songs**
  - GET `/api/songs`
  - Response: `[{ id, title, artist, album, file_path, cover_art_path }]`

- **Search songs**
  - GET `/api/songs/search?q=<query>`
  - 404 if no matches

- **Upload a song**
  - POST `/api/songs/upload`
  - Multipart form-data fields:
    - `title` (string)
    - `artist` (string)
    - `album` (string)
    - `music_file` (file; audio)
    - `cover_art_file` (file; image)
  - Example (PowerShell):
    ```powershell
    curl -Method POST "http://127.0.0.1:8000/api/songs/upload" `
      -ContentType "multipart/form-data" `
      -Form @{ 
        title = "Song Title"; 
        artist = "Artist"; 
        album = "Album"; 
        music_file = Get-Item .\path\to\song.mp3; 
        cover_art_file = Get-Item .\path\to\cover.jpg 
      }
    ```

- **Delete a song**
  - DELETE `/api/songs/{song_id}`
  - Deletes DB record and associated files if present

- **Update song details**
  - PUT `/api/songs/{song_id}`
  - JSON body (any subset):
    ```json
    {
      "title": "New Title",
      "artist": "New Artist",
      "album": "New Album"
    }
    ```
  - Response: updated song object

## Data Model
- Stored in MongoDB collection `songs` with fields:
  - `title`, `artist`, `album`, `file_name`, `cover_art_name`
- API converts documents to client shape via `song_helper()` in `backend/main.py`:
  - `id`, `title`, `artist`, `album`, `file_path`, `cover_art_path`

## Troubleshooting
- **Frontend shows “Failed to load songs”**: Ensure backend is running at `http://127.0.0.1:8000` and MongoDB is up.
- **CORS errors**: CORS is allowed for all origins in the app; restart the backend if you changed config.
- **Uploads not appearing**: Confirm write permissions to `backend/static/music/` and `backend/static/images/` and check server logs.
- **Invalid ID errors**: Ensure you're using the `_id` returned by the API as `song.id`.

## Scripts & Useful Commands
```bash
# Install backend deps
pip install -r backend/requirements.txt

# Run FastAPI (from backend dir)
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## Roadmap / Ideas
- Authentication for admin/manage pages
- Drag-and-drop upload with progress
- Playlists, favorites, and ratings
- Pagination and better search
- Docker compose for API + MongoDB

## Contributing
- Open issues and PRs are welcome. Please describe the change and test steps.

## License
Add your license here (e.g., MIT). 
