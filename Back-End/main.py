import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in .env file")

supabase: Client = create_client(url, key)

app = FastAPI()

class UserCredentials(BaseModel):
    user: str
    password: str

@app.post("/login")
async def login(credentials: UserCredentials):
    try:
        # Attempt to sign in with password
        response = supabase.auth.sign_in_with_password({
            "user": credentials.user,
            "password": credentials.password
        })
        
        # If successful, return user info
        return {
            "message": "Login successful",
            "user": response.user,
        }
    except Exception as e:
        # Supabase raises an exception on failure
        raise HTTPException(status_code=401, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "StreamMatch Backend is running"}
