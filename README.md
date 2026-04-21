# Automated Faculty Feedback Analysis System

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173  
Backend runs on http://localhost:5000

---

## CSV Format
Upload a CSV with these columns:
| Faculty Name | Subject Code | PDF Drive Link | Programme | Semester |
|---|---|---|---|---|

See `sample_sheet.csv` for reference.

---

## Roles
- **HOD**: Upload CSV → Process PDFs → Review → Send to VC
- **VC**: View all submissions → Approve / Reject / Comment

---

## How PDF Links Work
Google Drive share links are automatically converted to direct download links.  
Format: `https://drive.google.com/file/d/<FILE_ID>/view`

> Note: PDFs must be publicly accessible (Anyone with the link can view).
