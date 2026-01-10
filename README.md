# EventFlow 🎉

EventFlow is a backend-first event management system built using Django and Django REST Framework. It provides scalable REST APIs for managing events, users, and registrations, following real-world backend architecture and best practices. The backend is tested using Swagger / OpenAPI while the frontend is planned for later stages.

## Features

Version 1 (Current):
- User authentication and authorization
- Event creation, update, and deletion (CRUD)
- Event listing and detail APIs
- Event registration system
- PostgreSQL database integration
- REST APIs using serializers and viewsets
- Interactive API documentation with Swagger UI

Planned Features:
- Ticketing and payment integration
- Role-based permissions (organizer and attendee)
- Event analytics and reporting
- Email and notification system
- Event recommendations
- Performance optimization and caching

## Tech Stack

- Backend: Django, Django REST Framework
- Database: PostgreSQL
- API Documentation: Swagger / OpenAPI
- Authentication: JWT / Session-based (configurable)
- Version Control: Git and GitHub

## Project Structure

eventflow/
├── apps/
│   ├── users/
│   ├── events/
│   └── registrations/
├── config/
│   ├── settings/
│   ├── urls.py
│   └── wsgi.py
├── manage.py
└── requirements.txt



## Setup Instructions

1. Clone the repository:

git clone https://github.com/your-username/eventflow.git
cd eventflow

2. Create and activate a virtual environment:

python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

3. Install dependencies:

pip install -r requirements.txt

4. Configure environment variables by creating a .env file:

DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_NAME=eventflow
DATABASE_USER=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_HOST=localhost
DATABASE_PORT=5432

5. Run database migrations:

python manage.py makemigrations
python manage.py migrate

6. Start the development server:

python manage.py runserver

## API Documentation

After starting the server, access Swagger UI at:

http://127.0.0.1:8000/swagger/


---

## Project Goals

- Build production-ready backend systems
- Learn scalable Django architecture
- Practice REST API design
- Prepare for real-world backend development roles

---

## Contributing

Contributions are welcome.  
Please open an issue before making major changes.

---

## License

This project is licensed under the **MIT License**.

---


