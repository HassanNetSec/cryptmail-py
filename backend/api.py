from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from disposableMailServer import create_account, receive_message
import traceback
from typing import Dict, Optional
from datetime import datetime
from HelperFunction.encryptData import encrypt, decrypt, validate_token
from pydantic import BaseModel

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app = FastAPI()

# Store active accounts in memory
active_accounts: Dict[str, dict] = {}

# Add expiration tracking
last_account_created = None
ACCOUNT_COOLDOWN = 60  # seconds between new account creations

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic model for validation endpoint
class TokenValidation(BaseModel):
    encryptedData: str


@app.get('/generateEmail')
async def generateEmail():
    """Generate a new temporary email account with cooldown"""
    global last_account_created
    
    try:
        # Check if we need to wait before creating a new account
        if last_account_created:
            elapsed = (datetime.now() - last_account_created).total_seconds()
            if elapsed < ACCOUNT_COOLDOWN:
                wait_time = int(ACCOUNT_COOLDOWN - elapsed)
                raise HTTPException(
                    status_code=429,
                    detail=f"Please wait {wait_time} seconds before creating a new email"
                )
        
        print("Starting email generation...")
        account_details = create_account()
        
        # Prepare data to encrypt
        serializable_account_details = {
            'email': account_details['email'],
            'password': account_details['password'],
            'token': account_details['token']
        }

        # Encrypt the data
        encryptedData = encrypt(serializable_account_details)
        
        print(f"Account created: {account_details['email']}")
        print(f"EncryptedData: {encryptedData[:50]}...")
        
        if not account_details:
            raise HTTPException(status_code=500, detail="Failed to create account")

        # Store account object in memory (with actual account object for receiving messages)
        email = account_details['email']
        active_accounts[email] = account_details
        last_account_created = datetime.now()
        
        # Return only email and encrypted data (don't send password separately!)
        return {
            'email': account_details['email'],
            'encryptedData': encryptedData  # Fixed: lowercase 'e' for consistency
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.get('/checkMessages')
async def checkMessages(
    x_auth_token: str = Header(..., alias="X-Auth-Token"),
    timeout: int = 30
):
    """
    Check messages for a specific email account using encrypted token
    
    Headers:
        X-Auth-Token: Encrypted token from /generateEmail
    """
    try:
        # Decrypt and validate token
        token_info = decrypt(x_auth_token)
        
        if not token_info['valid']:
            raise HTTPException(
                status_code=401, 
                detail="Token expired or invalid"
            )
        
        # Extract email from decrypted data
        email = token_info['data']['email']
        
        if email not in active_accounts:
            raise HTTPException(status_code=404, detail="Email account not found")
        
        # Get messages
        account_obj = active_accounts[email]['account']
        messages = receive_message(account_obj, timeout=timeout)
        
        return {
            'email': email,
            'messages': messages,
            'count': len(messages),
            'token_expires_at': token_info['expires_at']
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.post('/validateToken')
async def validateTokenEndpoint(token_data: TokenValidation):
    """
    Validate if encrypted token is still valid
    
    Body:
        {
            "encryptedData": "your_encrypted_token_here"
        }
    """
    try:
        if validate_token(token_data.encryptedData):
            # Get token info to return expiration time
            token_info = decrypt(token_data.encryptedData)
            return {
                'status': 200,
                'valid': True,
                'message': 'Token is valid',
                'expires_at': token_info['expires_at']
            }
        else:
            raise HTTPException(
                status_code=401,
                detail='Token expired or invalid'
            )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f'Invalid token: {str(e)}'
        )


@app.get('/health')
async def health_check():
    """Health check endpoint"""
    return {
        'status': 'healthy',
        'active_accounts': len(active_accounts),
        'timestamp': datetime.now().isoformat()
    }
