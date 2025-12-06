What: The Bearer token from mail.gw API
Example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
Why: This is the authentication key - anyone with this can access the inbox
Where: Store encrypted in PostgreSQL
When: Immediately after receiving from mail.gw API
```

#### 2. **Complete Session Bundle (RECOMMENDED)**
```
What: {
  "token": "eyJhbGci...",
  "email": "user@domain.com",
  "account_id": "abc123",
  "password": "TempPass123!"
}
Why: All these together form the complete session credentials
Where: Store encrypted in PostgreSQL
When: After account creation, before storing
```

### ❌ **DON'T ENCRYPT THESE:**

#### 1. **Email Address (for display)**
```
What: user@domain.com
Why: User needs to see and copy this plaintext
Where: Store plain in PostgreSQL AND show in frontend
```

#### 2. **Session ID (UUID)**
```
What: "550e8400-e29b-41d4-a716-446655440000"
Why: This is just a reference ID, not sensitive
Where: Plain in database and frontend
```

#### 3. **Message Content**
```
What: Email subjects, body text, sender addresses
Why: Out of scope - you don't control mail.gw's storage
Where: Store plain in database (already received plain from API)
```

#### 4. **Metadata**
```
What: timestamps, message counts, activity logs
Why: Not sensitive, needed for queries and display
Where: Plain in database
```

---

## Which Algorithm to Use

### **Use: ChaCha20-Poly1305**

#### Why This Algorithm?

1. **Modern & Secure**: 
   - Designed by Daniel Bernstein (famous cryptographer)
   - Used in TLS 1.3, WhatsApp, Google
   - Industry standard for modern encryption

2. **Fast Performance**:
   - Faster than AES on devices without hardware acceleration
   - Software-friendly (good for Python)

3. **Authenticated Encryption**:
   - Combines encryption + authentication
   - Detects if data has been tampered with
   - Prevents attacks

4. **Academic Recognition**:
   - IETF RFC 8439 standard
   - Well-documented for your project report
   - Shows knowledge of modern cryptography

5. **Project Requirement**:
   - Your document specifically mentions ChaCha20-Poly1305
   - Objective BO-2 requires this

---

## Encryption Details

### **Algorithm Specifications:**
```
Algorithm: ChaCha20-Poly1305
Type: AEAD (Authenticated Encryption with Associated Data)
Key Size: 256 bits (32 bytes)
Nonce Size: 96 bits (12 bytes)
Tag Size: 128 bits (16 bytes) - automatically added
```

### **Key Components:**

#### 1. **Encryption Key**
```
Size: 32 bytes (256 bits)
Generation: Randomly generate ONCE for your application
Storage: Backend environment variable ONLY
Security: NEVER share, NEVER commit to Git
Lifetime: Can rotate periodically for better security
```

#### 2. **Nonce (Number Used Once)**
```
Size: 12 bytes (96 bits)
Generation: Generate NEW random nonce for EVERY encryption
Storage: Store with ciphertext (not secret)
Security: NEVER reuse with same key
Critical: Same key + same nonce = broken encryption
```

#### 3. **Ciphertext**
```
Contains: Encrypted data + authentication tag
Size: Same as plaintext + 16 bytes (for tag)
Storage: Store in database
Format: Base64 encode for database storage
```

---

## Encryption Flow

### **Step-by-Step Encryption Process:**

#### **When Creating Email Account:**

1. **Receive from mail.gw**:
```
   email: "user123@domain.com"
   token: "eyJhbGciOiJIUzI1NiIs..."
   account_id: "abc123"
   password: "TempPass123!"
```

2. **Prepare Data to Encrypt**:
```
   Bundle into JSON string:
   '{"token":"eyJhbGci...","email":"user123@domain.com","account_id":"abc123","password":"TempPass123!"}'
```

3. **Generate Nonce**:
```
   Create 12 random bytes
   Example: b'\x8a\x9f...' (12 bytes)
```

4. **Encrypt**:
```
   Input: JSON string + nonce + key
   Process: ChaCha20-Poly1305 encryption
   Output: ciphertext (includes auth tag)
```

5. **Encode for Storage**:
```
   Convert nonce to base64: "ip8K2m..."
   Convert ciphertext to base64: "aXj9K2m..."
```

6. **Store in Database**:
```
   session_id: "550e8400..." (plain UUID)
   email: "user123@domain.com" (plain - for display)
   encrypted_token: "aXj9K2m..." (base64 ciphertext)
   nonce: "ip8K2m..." (base64 nonce)
```

#### **When Fetching Inbox:**

1. **Retrieve from Database**:
```
   Get: encrypted_token and nonce (both base64)
```

2. **Decode from Base64**:
```
   nonce: base64 → bytes
   ciphertext: base64 → bytes
```

3. **Decrypt**:
```
   Input: ciphertext + nonce + key
   Process: ChaCha20-Poly1305 decryption
   Output: JSON string
```

4. **Parse JSON**:
```
   Extract: token, email, account_id, password
```

5. **Use Token**:
```
   Make API call to mail.gw with decrypted token
   Fetch messages
```

6. **Never Send to Frontend**:
```
   Decrypted token stays in backend memory only
   Frontend only receives messages (safe data)
```

---

## What Happens Where

### **Backend (Python/Flask)**:
```
✅ Generate encryption key (once, at setup)
✅ Encrypt token before storing
✅ Decrypt token when needed
✅ Use decrypted token to call mail.gw API
✅ Store encrypted data in database
❌ Never expose encryption key
❌ Never send decrypted token to frontend
```

### **Database (PostgreSQL)**:
```
✅ Store encrypted_token (base64 string)
✅ Store nonce (base64 string)
✅ Store email (plain - needed for display)
✅ Store session_id (plain - just reference)
❌ Never store plaintext tokens
❌ Never store encryption key
```

### **Frontend (React)**:
```
✅ Store session_id (safe to store)
✅ Store email (plain - user needs to see it)
✅ Display messages
❌ Never receives tokens (encrypted or not)
❌ Never receives encryption keys
❌ Never does encryption/decryption
```

---

## Security Principles

### **Why This Design is Secure:**

1. **Token Protection**:
   - Token encrypted at rest (in database)
   - Token only decrypted in backend (trusted environment)
   - Token never exposed to frontend (untrusted environment)

2. **Key Management**:
   - Key only exists in backend environment
   - Key never transmitted anywhere
   - Key never visible in code/logs/database

3. **Nonce Safety**:
   - New random nonce for every encryption
   - Nonce stored with ciphertext (safe to expose)
   - Prevents replay attacks

4. **Authentication**:
   - Poly1305 MAC detects tampering
   - Can't modify ciphertext without detection
   - Protects data integrity

5. **Minimal Exposure**:
   - Frontend only sees safe data
   - No sensitive data in browser storage
   - Reduces attack surface

---

## Alternative Algorithms (NOT Recommended for Your Project)

### **Don't Use These (Why):**

#### 1. **AES (Advanced Encryption Standard)**
```
Why not: Your document specifies ChaCha20-Poly1305
Status: Still secure, but not required
Note: Would need to add authentication separately (HMAC)
```

#### 2. **RSA**
```
Why not: Asymmetric encryption (slower, different use case)
Use case: For key exchange, not data encryption
Note: Overkill for your needs
```

#### 3. **DES / 3DES**
```
Why not: Outdated, insecure
Status: Deprecated
Note: Never use in modern systems
```

#### 4. **RC4**
```
Why not: Broken, insecure
Status: Completely compromised
Note: Never use
```

#### 5. **Simple XOR or Base64**
```
Why not: Not encryption, just encoding
Status: Easily reversible
Note: Provides zero security
```

---

## Summary: Your Encryption Plan

### **What to Encrypt:**
```
✅ Token (mandatory)
✅ Session bundle: {token, email, account_id, password} (recommended)
```

### **Algorithm:**
```
✅ ChaCha20-Poly1305 (as specified in your project doc)
```

### **Key Details:**
```
✅ 256-bit key (32 bytes)
✅ 96-bit nonce (12 bytes) - new for each encryption
✅ Store in backend environment variable
```

### **Storage:**
```
Database: encrypted_token (base64) + nonce (base64)
Backend: encryption key (environment variable)
Frontend: nothing encrypted (only session_id and plain email)
```

### **Libraries to Use:**
```
Python: cryptography.hazmat.primitives.ciphers.aead.ChaCha20Poly1305
(This is the official Python cryptography library)