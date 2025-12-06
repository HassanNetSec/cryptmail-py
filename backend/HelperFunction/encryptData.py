import base64
from cryptography.hazmat.primitives.ciphers.aead import ChaCha20Poly1305
import os
import json
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

EXPIRES_IN_MINUTES = 60

def encrypt(data: dict) -> str:
    """
    Encrypt data with expiration time included
    
    Args:
        data: Dictionary to encrypt
    
    Returns:
        Base64-encoded string containing nonce + ciphertext
    """
    # Get encryption key
    key = bytes.fromhex(os.getenv('ENCRYPTION_KEY'))
    cipher = ChaCha20Poly1305(key)
    
    # Add expiration to the data being encrypted
    expiration_time = datetime.now() + timedelta(minutes=EXPIRES_IN_MINUTES)
    
    token_data = {
        'data': data,  # Your actual data
        'expires_at': expiration_time.isoformat(),
        'created_at': datetime.now().isoformat()
    }
    
    # Convert to bytes
    json_str = json.dumps(token_data)
    data_bytes = json_str.encode('utf-8')
    
    # Generate nonce and encrypt
    nonce = os.urandom(12)
    ciphertext = cipher.encrypt(nonce, data_bytes, None)
    
    # Combine nonce + ciphertext (nonce is NOT secret)
    package = nonce + ciphertext
    
    # Return as base64 string
    return base64.b64encode(package).decode('utf-8')


def decrypt(encrypted_token: str) -> dict:
    """
    Decrypt token and validate expiration
    
    Args:
        encrypted_token: Base64-encoded encrypted token
    
    Returns:
        Dictionary with 'valid', 'data', 'expires_at', 'expired'
    
    Raises:
        Exception if decryption fails
    """
    try:
        # Get encryption key
        key = bytes.fromhex(os.getenv('ENCRYPTION_KEY'))
        cipher = ChaCha20Poly1305(key)
        
        # Decode from base64
        package = base64.b64decode(encrypted_token)
        
        # Extract nonce (first 12 bytes) and ciphertext (rest)
        nonce = package[:12]
        ciphertext = package[12:]
        
        # Decrypt
        data_bytes = cipher.decrypt(nonce, ciphertext, None)
        
        # Parse JSON
        json_str = data_bytes.decode('utf-8')
        token_data = json.loads(json_str)
        
        # Check expiration
        expires_at = datetime.fromisoformat(token_data['expires_at'])
        is_expired = datetime.now() > expires_at
        
        return {
            'valid': not is_expired,
            'data': token_data['data'],
            'expires_at': token_data['expires_at'],
            'created_at': token_data['created_at'],
            'expired': is_expired
        }
    
    except Exception as e:
        raise Exception(f"Decryption failed: {str(e)}")


def validate_token(encrypted_token: str) -> bool:
    """
    Quick validation - check if token is valid and not expired
    
    Args:
        encrypted_token: Base64-encoded encrypted token
    
    Returns:
        True if valid and not expired, False otherwise
    """
    try:
        result = decrypt(encrypted_token)
        return result['valid']
    except:
        return False


# ===== EXAMPLE USAGE =====
if __name__ == "__main__":
    # Test data
    user_data = {
        'email': 'test@example.com',
        'token': 'abc123xyz789',
        'password': 'secret123'
    }
    
    print("="*60)
    print("ENCRYPTION TEST")
    print("="*60)
    
    # Encrypt
    encrypted = encrypt(user_data)
    print(f"Original data: {user_data}")
    print(f"Encrypted token: {encrypted[:50]}...")
    print(f"Token length: {len(encrypted)} characters\n")
    
    # Decrypt immediately (should be valid)
    decrypted = decrypt(encrypted)
    print(f"Decrypted data: {decrypted['data']}")
    print(f"Valid: {decrypted['valid']}")
    print(f"Expired: {decrypted['expired']}")
    print(f"Expires at: {decrypted['expires_at']}")
    print(f"Created at: {decrypted['created_at']}\n")
    
    # Quick validation
    is_valid = validate_token(encrypted)
    print(f"Quick validation: {is_valid}")