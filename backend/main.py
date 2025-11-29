from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional
from bson import ObjectId
import os
import aiofiles
import shutil
# 👇 1. THIS IMPORT IS PART OF THE FIX (though not strictly required, it's good practice)
from fastapi.encoders import jsonable_encoder 


MONGO_DETAILS = "mongodb://localhost:27017" 
DATABASE_NAME = "musicdb"
SONG_COLLECTION = "songs"

STATIC_DIR = "static"
MUSIC_DIR = os.path.join(STATIC_DIR, "music")
IMAGES_DIR = os.path.join(STATIC_DIR, "images")

os.makedirs(MUSIC_DIR, exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)


class Song(BaseModel):
    id: str
    title: str
    artist: str
    album: str
    file_path: str
    cover_art_path: str


class UpdateSong(BaseModel):
    title: Optional[str] = None
    artist: Optional[str] = None
    album: Optional[str] = None

# 👇 2. THIS IS THE MAIN FIX: CONFIGURE THE FASTAPI APP
app = FastAPI(
    json_encoders={
        ObjectId: str
    }
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = AsyncIOMotorClient(MONGO_DETAILS)
    app.mongodb = app.mongodb_client[DATABASE_NAME]
    print("✅ Connected to MongoDB!")


@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

def song_helper(song) -> dict:
    return {
        "id": str(song["_id"]),
        "title": song["title"],
        "artist": song["artist"],
        "album": song["album"],
        "file_name": song.get("file_name"), # Use .get for safety
        "cover_art_name": song.get("cover_art_name"),
        "file_path": f"/static/music/{song.get('file_name')}",
        "cover_art_path": f"/static/images/{song.get('cover_art_name')}"
    }


@app.get("/api/songs", response_model=List[Song])
async def get_all_songs():
    songs = []
    async for song in app.mongodb[SONG_COLLECTION].find():
        songs.append(song_helper(song))
    return songs


@app.get("/api/songs/search", response_model=List[Song])
async def search_songs(q: str = Query(..., min_length=1)):
    search_regex = {"$regex": q, "$options": "i"}
    query = {"$or": [{"title": search_regex}, {"artist": search_regex}, {"album": search_regex}]}
    songs = []
    async for song in app.mongodb[SONG_COLLECTION].find(query):
        songs.append(song_helper(song))
    if not songs:
        raise HTTPException(status_code=404, detail="No songs found")
    return songs


@app.post("/api/songs/upload")
async def upload_song(
    title: str = Form(...), artist: str = Form(...), album: str = Form(...),
    music_file: UploadFile = File(...), cover_art_file: UploadFile = File(...)
):
    music_filename = os.path.basename(music_file.filename)
    cover_art_filename = os.path.basename(cover_art_file.filename)
    music_path = os.path.join(MUSIC_DIR, music_filename)
    cover_art_path = os.path.join(IMAGES_DIR, cover_art_filename)

    try:
        async with aiofiles.open(music_path, 'wb') as out_file:
            while content := await music_file.read(1024): await out_file.write(content)
        async with aiofiles.open(cover_art_path, 'wb') as out_file:
            while content := await cover_art_file.read(1024): await out_file.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving files: {e}")

    song_document = {
        "title": title, "artist": artist, "album": album,
        "file_name": music_filename, "cover_art_name": cover_art_filename
    }
    await app.mongodb[SONG_COLLECTION].insert_one(song_document)
    return {"message": "Song uploaded successfully!", "song_details": song_document}


@app.delete("/api/songs/{song_id}")
async def delete_song(song_id: str):
    try:
        object_id = ObjectId(song_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid song ID format")

    song = await app.mongodb[SONG_COLLECTION].find_one({"_id": object_id})
    if song is None:
        raise HTTPException(status_code=404, detail="Song not found")

    try:
        music_file_path = os.path.join(MUSIC_DIR, song["file_name"])
        cover_art_path = os.path.join(IMAGES_DIR, song["cover_art_name"])
        if os.path.exists(music_file_path): os.remove(music_file_path)
        if os.path.exists(cover_art_path): os.remove(cover_art_path)
    except Exception as e:
        print(f"Error deleting files for song {song_id}: {e}")

    delete_result = await app.mongodb[SONG_COLLECTION].delete_one({"_id": object_id})
    if delete_result.deleted_count == 1:
        return {"message": f"Song {song_id} deleted successfully"}
    
    raise HTTPException(status_code=404, detail=f"Song {song_id} not found")


@app.put("/api/songs/{song_id}", response_model=Song)
async def update_song_details(song_id: str, song_update: UpdateSong):
    try:
        object_id = ObjectId(song_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid song ID format")

    update_data = {k: v for k, v in song_update.dict().items() if v is not None}

    if len(update_data) < 1:
        raise HTTPException(status_code=400, detail="No update data provided")

    update_result = await app.mongodb[SONG_COLLECTION].update_one(
        {"_id": object_id}, {"$set": update_data}
    )

    if update_result.matched_count == 1:
        updated_song = await app.mongodb[SONG_COLLECTION].find_one({"_id": object_id})
        return song_helper(updated_song)

    raise HTTPException(status_code=404, detail=f"Song {song_id} not found")