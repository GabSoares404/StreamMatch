import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
from pathlib import Path
env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)

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
