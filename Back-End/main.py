import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
from pathlib import Path
env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)

try:
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_KEY")
    role_key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print(f"Warning: Could not find environment variables in {env_path.absolute()}")
        # Attempt to load from parent if running from root
        env_path = Path('..') / 'Back-End' / '.env'
        load_dotenv(dotenv_path=env_path)
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
    if not url or not key:
        raise ValueError(f"Missing SUPABASE_URL or SUPABASE_KEY. Checked {env_path.absolute()}")
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"CRITICAL ERROR LOADING ENV: {e}")
    # We re-raise so it still fails, but now we should see it
    raise e

if not role_key:
    print("Warning: SUPABASE_SERVICE_ROLE_KEY not found. Operations requiring admin privileges might fail.")

# Use the service role key for the client to allow backend admin access (bypassing RLS)
# If you prefer to keep the 'anon' client separate, you can create two clients.
# For this backend logic (checking users table manually), service role is often preferred.
supabase: Client = create_client(url, role_key if role_key else key)

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserCredentials(BaseModel):
    user: str
    password: str

@app.post("/register")
async def register(credentials: UserCredentials):
    try:
        # Check if user already exists
        existing_user = supabase.table("Users").select("*").eq("user", credentials.user).execute()
        if existing_user.data:
            raise HTTPException(status_code=400, detail="Usuário já existe")

        # Insert new user
        response = supabase.table("Users").insert({
            "user": credentials.user,
            "password": credentials.password
        }).execute()
        
        return {"message": "Usuário criado com sucesso!"}

    except Exception as e:
        print(f"Error creating user: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/login")
async def login(credentials: UserCredentials):
    try:
        # Query the 'Users' table directly
        response = supabase.table("Users").select("*").eq("user", credentials.user).eq("password", credentials.password).execute()
        
        # Check if user exists
        if not response.data:
            raise HTTPException(status_code=401, detail="Credenciais inválidas")
            
        user_data = response.data[0]
        
        # If successful, return user info
        return {
            "message": "Login bem-sucedido",
            "user": user_data,
        }
    except Exception as e:
        # Supabase raises an exception on failure
        raise HTTPException(status_code=401, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "StreamMatch Backend is running"}

# --- Watchlist Feature ---

class WatchlistItem(BaseModel):
    id: int
    type: str # 'movie', 'tv', 'anime'

class CreateWatchlist(BaseModel):
    id_user: str
    nome_list: str
    items: list[dict] # List of objects with id and type

@app.post("/watchlist")
async def create_watchlist(data: CreateWatchlist):
    try:
        # Separate IDs by type
        movies = []
        series = []
        tv = []
        anime = []

        for item in data.items:
            media_id = item.get('id')
            media_type = item.get('type')
            
            if media_type == 'movie':
                movies.append(media_id)
            elif media_type == 'tv':
                tv.append(media_id)
            elif media_type == 'anime':
                anime.append(media_id)
            elif media_type == 'series':
                series.append(media_id)

        # Construct payload for Supabase
        payload = {
            "id_user": data.id_user,
            "nome_list": data.nome_list,
            "id_film": movies if movies else None,
            "id_serie": series if series else None,
            "id_tv": tv if tv else None,
            "id_anime": anime if anime else None
        }

        response = supabase.table("Watchlist").insert(payload).execute()
        return {"message": "Lista criada com sucesso!", "data": response.data}

    except Exception as e:
        print(f"Error creating watchlist: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/watchlist/{user_id}")
async def get_watchlists(user_id: str):
    try:
        response = supabase.table("Watchlist").select("*").eq("id_user", user_id).execute()
        return response.data
    except Exception as e:
        print(f"Error fetching watchlists: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/watchlist/{list_id}")
async def update_watchlist(list_id: str, data: CreateWatchlist):
    try:
        # Fetch existing list to get current arrays
        existing = supabase.table("Watchlist").select("*").eq("id", list_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Lista não encontrada")
        
        current_list = existing.data[0]
        
        # Current arrays (handle None)
        current_movies = current_list.get('id_film') or []
        current_series = current_list.get('id_serie') or []
        current_tv = current_list.get('id_tv') or []
        current_anime = current_list.get('id_anime') or []

        # New items to add
        new_movies = []
        new_series = []
        new_tv = []
        new_anime = []

        for item in data.items:
            media_id = item.get('id')
            media_type = item.get('type')
            
            if media_type == 'movie':
                if media_id not in current_movies:
                    new_movies.append(media_id)
            elif media_type == 'tv':
                if media_id not in current_tv:
                    new_tv.append(media_id)
            elif media_type == 'anime':
                if media_id not in current_anime:
                    new_anime.append(media_id)
            elif media_type == 'series':
                if media_id not in current_series:
                    new_series.append(media_id)

        # Merge
        updated_movies = current_movies + new_movies
        updated_series = current_series + new_series
        updated_tv = current_tv + new_tv
        updated_anime = current_anime + new_anime

        # Update payload
        payload = {
            "id_film": updated_movies if updated_movies else None,
            "id_serie": updated_series if updated_series else None,
            "id_tv": updated_tv if updated_tv else None,
            "id_anime": updated_anime if updated_anime else None
        }

        response = supabase.table("Watchlist").update(payload).eq("id", list_id).execute()
        return {"message": "Lista atualizada com sucesso!", "data": response.data}

    except Exception as e:
        print(f"Error updating watchlist: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.patch("/watchlist/{list_id}")
async def rename_watchlist(list_id: str, data: dict):
    try:
        new_name = data.get("nome_list")
        if not new_name:
            raise HTTPException(status_code=400, detail="Nome da lista é obrigatório")

        response = supabase.table("Watchlist").update({"nome_list": new_name}).eq("id", list_id).execute()
        return {"message": "Nome atualizado com sucesso!", "data": response.data}
    except Exception as e:
        print(f"Error renaming watchlist: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/watchlist/{list_id}")
async def delete_watchlist(list_id: str):
    try:
        response = supabase.table("Watchlist").delete().eq("id", list_id).execute()
        return {"message": "Lista deletada com sucesso!"}
    except Exception as e:
        print(f"Error deleting watchlist: {e}")
        raise HTTPException(status_code=400, detail=str(e))
