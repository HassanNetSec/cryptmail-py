# 📧 CryptMail-Py: Disposable Email Service

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)

**Protect your privacy with temporary, disposable email addresses**

[Features](#-features) • [Demo](#-screenshots) • [Installation](#-installation) • [Usage](#-usage) • [Contributing](#-contributing)

</div>

---

## 🌟 Overview

**CryptMail-Py** is a modern, full-stack disposable email service that helps you protect your primary inbox from spam, marketing lists, and trackers. Built with **FastAPI** (backend) and **Next.js** (frontend), it provides instant temporary email addresses for sign-ups and non-essential registrations.

### Why CryptMail-Py?

- 🚀 **Lightning Fast** - Generate emails in under 1 second
- 🔒 **Privacy First** - End-to-end encrypted email handling
- 💎 **Zero Registration** - No sign-up, no tracking, completely anonymous
- 🎨 **Modern UI** - Beautiful dark theme with smooth animations
- 🔄 **Auto-Refresh** - Real-time email monitoring with configurable intervals
- 🔍 **Smart Search** - Filter emails by sender, subject, or content

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Instant Generation** | Create temporary email addresses with one click |
| **Real-time Inbox** | Receive and view emails instantly within the app |
| **Auto-Refresh** | Configurable polling (10s, 20s, 30s intervals) |
| **Search & Filter** | Quickly find emails by sender, subject, or content |
| **Copy to Clipboard** | One-click email address copying |
| **Session Management** | Clear sessions to remove all data instantly |
| **Email Encryption** | Secure token-based authentication |
| **Rate Limiting** | Built-in cooldown to prevent abuse |
| **Responsive Design** | Works seamlessly on desktop and mobile |

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast Python web framework
- **pymailtm** - Temporary email service integration
- **Cryptography** - Token encryption and security
- **Uvicorn** - ASGI server

### Frontend
- **Next.js 14** - React framework with App Router
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **Lucide React** - Beautiful icon library

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/HassanNetSec/cryptmail-py.git
cd cryptmail-py
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
# or
yarn install
```

---

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
# Encryption Key (Generate using Python)
ENCRYPTION_KEY=your_generated_key_here
```

**Generate an Encryption Key:**

```python
# Run this in Python terminal
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
```

Or use this one-liner:
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### Frontend Configuration (Optional)

Create a `.env.local` file in the `frontend` directory if you need custom API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🏃 Running the Application

### Start Backend Server

```bash
# Make sure you're in the backend directory with venv activated
cd backend
uvicorn api:app --reload

# Server will start at http://localhost:8000
```

### Start Frontend Development Server

```bash
# In a new terminal, navigate to frontend directory
cd frontend
npm run dev
# or
yarn dev

# App will open at http://localhost:3000
```

---

## 📖 Usage

### Generating a Temporary Email

1. **Open the App**: Navigate to `http://localhost:3000`
2. **Click "Generate Email"**: A temporary email address will be created instantly
3. **Copy the Email**: Use the "Copy" button to copy your temporary address
4. **Use It**: Use this email for sign-ups, newsletters, or any service

### Receiving Emails

- Emails arrive in real-time with auto-refresh
- Click on any email row to view full details
- Search emails using the search bar
- Messages are automatically fetched based on your refresh interval

### Managing Your Session

- **Copy Button**: Copy the email address to clipboard
- **Clear Button**: Remove the current session and all emails
- **Auto-Refresh**: Choose between 10s, 20s, or 30s intervals

---

## 📸 Screenshots

### Landing Page
![Landing Page](https://github.com/user-attachments/assets/e045f59f-4b18-4d51-ac02-8a741d8b2219)

### Generated Email & Controls
![Email Controls](https://github.com/user-attachments/assets/08a52a5b-e82b-47cf-af85-e080484e5677)

### Inbox View
![Inbox](https://github.com/user-attachments/assets/4b95a10a-8b8b-4213-a11e-27e8cdc7059a)

### Terminal Setup
![Terminal](https://github.com/user-attachments/assets/9c29b2d7-60b8-4a6d-baa6-63e0d802d5df)

---

## 🏗️ Project Structure

```
cryptmail-py/
├── backend/
│   ├── api.py                      # FastAPI main application
│   ├── disposableMailServer.py     # Email service logic
│   ├── HelperFunction/
│   │   └── encryptData.py         # Encryption utilities
│   ├── requirements.txt           # Python dependencies
│   └── .env                       # Environment variables
│
├── frontend/
│   ├── app/
│   │   ├── page.jsx              # Main home page
│   │   ├── layout.jsx            # Root layout
│   │   └── components/
│   │       └── Navbar.jsx        # Navigation component
│   ├── package.json              # Node dependencies
│   └── .env.local               # Frontend env variables
│
└── README.md
```

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/generateEmail` | Generate a new temporary email |
| `GET` | `/checkMessages` | Check for new messages (requires auth token) |
| `POST` | `/validateToken` | Validate authentication token |
| `GET` | `/health` | Health check endpoint |

### Example API Request

```bash
# Generate email
curl http://localhost:8000/generateEmail

# Check messages
curl -H "X-Auth-Token: YOUR_TOKEN_HERE" \
     http://localhost:8000/checkMessages
```

---

## 🐛 Troubleshooting

### Common Issues

**1. HTTP 422 Error (Mail.tm Service)**
```bash
# The mail.tm service may be down. Try:
python disposableMailServer.py  # Test if service is available

# If it fails, wait a few minutes and try again
```

**2. CORS Errors**
```python
# Ensure your api.py has correct CORS settings:
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]
```

**3. Module Not Found**
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

**4. Port Already in Use**
```bash
# Change port in uvicorn command:
uvicorn api:app --reload --port 8001
```

---

## 🧪 Testing

### Test Backend

```bash
cd backend
python -m pytest tests/
```

### Test Frontend

```bash
cd frontend
npm run test
```

---

## 🤝 Contributing

We love contributions! Here's how you can help:

1. **Fork the Project**
2. **Create your Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Contribution Guidelines

- Follow existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed

---

## 📝 Roadmap

- [ ] Email forwarding to real inbox
- [ ] Custom domain support
- [ ] Email attachments support
- [ ] Browser extension
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Email templates
- [ ] API rate limiting dashboard

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Hassan Khan**
- GitHub: [@HassanNetSec](https://github.com/HassanNetSec)
- Project Link: [https://github.com/HassanNetSec/cryptmail-py](https://github.com/HassanNetSec/cryptmail-py)

---

## 🙏 Acknowledgments

- [mail.tm](https://mail.tm) - Temporary email service provider
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Next.js](https://nextjs.org/) - React framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide Icons](https://lucide.dev/) - Beautiful icon library

---

## ⭐ Show Your Support

If you found this project helpful, please give it a ⭐️!

---

<div align="center">

**Made with ❤️ by Hassan Khan**

[Report Bug](https://github.com/HassanNetSec/cryptmail-py/issues) • [Request Feature](https://github.com/HassanNetSec/cryptmail-py/issues)

</div>
why 
We’ve detected the file encoding as UTF-16LE. When you commit changes we will transcode it to UTF-8.

