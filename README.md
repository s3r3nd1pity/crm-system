
# CRM System

Full-stack CRM application built with **Django REST Framework (backend)** and **Next.js (frontend)**.  
Implements authentication (JWT), manager/admin roles, orders management, comments, export to Excel, and password recovery/activation flows.

---

## 🛠️ Tech Stack
**Backend:** Django, DRF, MySQL, JWT, Docker  
**Frontend:** Next.js (App Router, TypeScript, TailwindCSS, Axios)  
**Docs:** DRF Spectacular (Swagger / Redoc)  
**Extras:** Postman collection and environment for API testing

---

## ⚙️ Setup & Run

### 1️⃣ Clone the repository
```bash
git clone https://github.com/s3r3nd1pity/crm-system.git
cd crm-system
```

### 2️⃣ Environment variables
Create `.env` in the root folder using `.env.example` as a template.

Example:
```env
DEBUG=True
SECRET_KEY=

DB_NAME=crmsystem
DB_USER=
DB_PASSWORD=
DB_HOST=owu.linkpc.net
DB_PORT=3306

BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

> The project uses OWU cloud MySQL as required by the task.

---

### 3️⃣ Run with Docker
```bash
docker-compose up --build
```
This starts both containers:
- `crm_backend` → Django + DRF on port **8000**
- `crm_frontend` → Next.js on port **5173**

Swagger docs: [http://localhost:8000/api/docs/swagger/](http://localhost:8000/api/docs/swagger/)  
Frontend: [http://localhost:3000](http://localhost:3000)

---

## 🧰 API Testing

Postman collection and environment are included in `/backend`:
- **CRM -System.postman_collection.json**
- **CRM -System.postman_environment.json**

Import them into Postman → set up variables → test endpoints.

---

## 📦 Migrations & Admin

To apply migrations manually (if needed):
```bash
docker exec -it crm_backend python manage.py migrate
docker exec -it crm_backend python manage.py createsuperuser
```

Access Django admin: [http://localhost:8000/admin/](http://localhost:8000/admin/)

---

## 👤 Author
**Oleksandra Shcherbinina**
