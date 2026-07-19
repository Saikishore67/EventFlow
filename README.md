# ⚡ EventFlow

A full-stack event management platform where attendees can discover and book events, and organizers can create and manage their own events — complete with QR code tickets and real-time notifications.

---

## ✨ Features

### Attendee
- Browse all published events with title, description, dates, capacity and live vacancy
- Book a ticket for any event with one click
- Automatic QR code generated per ticket
- View and manage all tickets in My Tickets
- Cancel a registration at any time
- Real-time notifications for event updates

### Organizer
- Create events with title, description, start/end time and capacity
- View only your own events in My Events — scoped exclusively to the logged-in organizer
- Edit event details at any time
- Delete events
- Edit/Delete access is enforced on both frontend and backend — organizers cannot touch each other's events

### General
- JWT authentication — login, register, access token + refresh token
- Automatic token refresh via axios interceptor — seamless re-auth on expiry
- Light / Dark mode toggle — persistent across sessions via localStorage
- Fully responsive — works on mobile and desktop
- Notifications — mark individual or all notifications as read

---

## 🛠 Tech Stack

### Backend
| Tool | Purpose |
|---|---|
| Django 5.x | Web framework |
| Django REST Framework | API layer |
| Simple JWT | JWT authentication |
| django-cors-headers | CORS handling for React frontend |
| Pillow | QR code image handling |
| PostgreSQL | Database |

### Frontend
| Tool | Purpose |
|---|---|
| React 18 + Vite | UI framework and build tool |
| React Router v6 | Client-side routing |
| Axios | HTTP client with interceptors |
| react-hot-toast | Toast notifications |
| lucide-react | Icons |
| date-fns | Date formatting |

---

## 📁 Project Structure

```
EventFlow/
├── apps/
│   ├── users/
│   │   ├── models.py         # Custom user model with is_organizer / is_attendee
│   │   ├── serializers.py    # RegisterSerializer, MeAPIView payload
│   │   └── views.py          # RegisterAPIView, MeAPIView, LoginAPIView
│   ├── events/
│   │   ├── models.py         # Event model
│   │   ├── serializers.py    # EventSerializer (with registered_count), EventMiniSerializer
│   │   └── views.py          # EventViewSet with owner-only write permissions
│   ├── registrations/
│   │   ├── models.py         # Registration model with ticket_code and qr_code
│   │   ├── serializers.py    # RegistrationCreateSerializer, RegistrationReadSerializer
│   │   └── views.py          # Register, cancel, mine endpoints
│   └── notifications/
│       ├── models.py         # Notification model
│       ├── serializers.py
│       └── views.py          # List, mark read, mark all read
├── eventflow/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── eventflow-frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js           # Axios instance + JWT interceptors
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Auth state, login, register, logout
│   │   │   └── ThemeContext.jsx    # Light/dark theme toggle
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Sticky navbar, theme toggle, notifications
│   │   │   ├── EventCard.jsx       # Event card with vacancy badge
│   │   │   ├── ProtectedRoute.jsx  # Route guard for auth + organizer roles
│   │   │   └── QRModal.jsx         # QR code modal for tickets
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Landing page
│   │   │   ├── Login.jsx           # Login form
│   │   │   ├── Register.jsx        # Register form with role selection
│   │   │   ├── Events.jsx          # All events listing with search
│   │   │   ├── EventDetail.jsx     # Event detail + book ticket
│   │   │   ├── MyTickets.jsx       # User's registrations + QR codes
│   │   │   ├── Notifications.jsx   # Notifications list
│   │   │   ├── MyEvents.jsx        # Organizer's own events
│   │   │   └── EventForm.jsx       # Create / Edit event form (shared)
│   │   ├── App.jsx                 # Routes
│   │   ├── main.jsx
│   │   └── index.css               # Design tokens, light/dark CSS variables
│   ├── .env
│   └── package.json
├── requirements.txt
└── README.md
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register/` | Create account | No |
| POST | `/api/auth/login/` | Get JWT tokens | No |
| POST | `/api/auth/refresh/` | Refresh access token | No |
| GET | `/api/auth/me/` | Get current user | Yes |

### Events
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/events/` | List all published events | No |
| POST | `/api/events/` | Create event | Organizer |
| GET | `/api/events/{id}/` | Get event detail | No |
| PUT | `/api/events/{id}/` | Full update event | Owner only |
| PATCH | `/api/events/{id}/` | Partial update event | Owner only |
| DELETE | `/api/events/{id}/` | Delete event | Owner only |

### Registrations
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/registrations/events/{event_id}/register/` | Book a ticket | Yes |
| GET | `/api/registrations/mine/` | Get my tickets | Yes |
| DELETE | `/api/registrations/{id}/cancel/` | Cancel a ticket | Yes |

### Notifications
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/notifications/` | List notifications | Yes |
| PATCH | `/api/notifications/{id}/read/` | Mark one as read | Yes |
| PATCH | `/api/notifications/read-all/` | Mark all as read | Yes |

---

## ⚙️ Setup and Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL

---

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/Saikishore67/EventFlow.git
cd EventFlow

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file in project root
cp .env.example .env
# Fill in your DATABASE_URL, SECRET_KEY etc.

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend Setup

```bash
cd eventflow-frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://127.0.0.1:8000" > .env

# Start dev server
npm run dev
```

App runs at `http://localhost:5173`

---

### CORS Configuration

In `settings.py`, make sure this is set:

```python
INSTALLED_APPS = [
    ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # must be first
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

---

## 🔐 Authentication Flow

```
User logs in
    → POST /api/auth/login/ → { access, refresh }
    → tokens stored in localStorage
    → every request attaches Authorization: Bearer <access>
    → on 401 → axios interceptor calls /api/auth/refresh/
    → new access token stored → original request retried
    → on refresh failure → localStorage cleared → redirect to /login
```

---

## 👤 User Roles

| Role | Registered with | Access |
|---|---|---|
| Attendee | `is_attendee: true` | Browse events, book tickets, view own tickets |
| Organizer | `is_organizer: true` | All attendee access + create/edit/delete own events |

Role is selected at registration. Organizer-only routes are protected by `ProtectedRoute` on the frontend and permission classes on the backend.

---

## 🎟 Ticket & QR Code Flow

```
Attendee books event
    → POST /api/registrations/events/{id}/register/
    → Registration created with status: "confirmed"
    → Unique ticket_code generated (e.g. EVT-35D8F7F2)
    → QR code image auto-generated and saved to media/qrcodes/
    → Ticket appears in My Tickets
    → Click "QR" button → modal shows QR code image + ticket code
```

---

## 🚧 Known Limitations / Planned Features

- [ ] Email notifications on booking confirmation
- [ ] Event search and filter by date / category
- [ ] Organizer dashboard with registration analytics
- [ ] Attendee count visible to organizers per event
- [ ] Payment integration
- [ ] Event image upload
- [ ] Public event detail page without login requirement

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

---

## 👨‍💻 Author

**Saikishore**
- GitHub: [@Saikishore67](https://github.com/Saikishore67)

---

> Built with Django REST Framework + React. Every bug was a lesson.
