from pymailtm import MailTm
import time
import secrets
import random
import string

activetoken = {}

def generateToken(email):
    """Generate a unique token for an email address"""
    token_urlsafe = secrets.token_urlsafe(32)
    activetoken[token_urlsafe] = email
    return token_urlsafe

def verify_token(token):
    """Verify token and return associated email"""
    return activetoken.get(token)

def create_account(max_retries=3):
    """Create a temporary email account with retry logic"""
    
    for attempt in range(max_retries):
        try:
            print(f"Creating temporary email account (attempt {attempt + 1}/{max_retries})...")
            mailtm = MailTm()
            
            # Get available domains first
            try:
                domains = mailtm.get_domains()
                print(f"Available domains: {[d['domain'] for d in domains]}")
            except Exception as e:
                print(f"Warning: Could not fetch domains: {e}")
                domains = []
            
            if not domains:
                print("No domains available, trying default method...")
                # Try default method without specifying domain
                account = mailtm.get_account()
            else:
                # Use a random domain from available ones
                domain = random.choice(domains)
                domain_name = domain['domain']
                
                # Generate random username
                username = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
                address = f"{username}@{domain_name}"
                
                # Generate strong password
                password = ''.join(random.choices(
                    string.ascii_letters + string.digits + string.punctuation, 
                    k=16
                ))
                
                print(f"Attempting to create: {address}")
                
                # Create account with explicit credentials
                account = mailtm.get_account(address, password)
            
            print(f"\n✓ Account Created!")
            print(f"Email: {account.address}")
            print(f"Password: {account.password}")
            
            email = account.address
            token = generateToken(email)
            
            account_details = {
                'email': account.address,
                'password': account.password,
                'token': token,
                'account': account
            }
            
            return account_details
            
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {str(e)}")
            
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
                print(f"Waiting {wait_time} seconds before retry...")
                time.sleep(wait_time)
            else:
                print(f"\n❌ Failed to create account after {max_retries} attempts")
                raise Exception(
                    "Unable to create temporary email. The mail.tm service may be "
                    "experiencing issues. Please try again in a few minutes."
                )

def receive_message(account, timeout=3600):
    """Monitor account for incoming messages with timeout"""
    start_time = time.time()
    
    print(f"\nWaiting for messages (timeout: {timeout}s)...\n")
    
    try:
        while True:
            # Check if timeout reached
            if time.time() - start_time > timeout:
                print(f"\nTimeout reached after {timeout} seconds")
                return []
            
            messages = account.get_messages()
            
            if messages:
                print(f"\n{'='*60}")
                print(f"📧 Found {len(messages)} message(s)")
                print(f"{'='*60}\n")
                
                all_payloads = []
                for msg in messages:
                    payload = {
                        'from': msg.from_['address'],
                        'from_name': msg.from_.get('name', 'Unknown'),
                        'subject': msg.subject,
                        'date': msg.data['createdAt'],
                        'message_body': msg.text if msg.text else (msg.html[0] if msg.html else 'No content'),
                        'read': False
                    }
                    all_payloads.append(payload)
                    print(f"From: {payload['from_name']} <{payload['from']}>")
                    print(f"Subject: {payload['subject']}\n")
                
                return all_payloads
            
            time.sleep(5)
            print(".", end="", flush=True)
            
    except KeyboardInterrupt:
        print("\n\nStopped monitoring.")
        return []
    except Exception as e:
        print(f"Error receiving messages: {e}")
        return []

# Usage example
if __name__ == "__main__":
    try:
        # Create account
        account_info = create_account()
        print(f"\n✓ Account created successfully!")
        print(f"Email: {account_info['email']}")
        print(f"Token: {account_info['token']}")
        
        # Test token verification
        email = verify_token(account_info['token'])
        print(f"\n✓ Token verification: {email}")
        
        # Wait for messages (uncomment to test)
        # messages = receive_message(account_info['account'], timeout=60)
        # if messages:
        #     print("\n✓ Messages received successfully!")
        #     print(f"Total messages: {len(messages)}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")