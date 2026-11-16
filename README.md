# TalentLens — AI Resume Parser & Matcher

A simple full-stack application that accepts a recruiter-provided job description and one PDF/DOCX resume, then returns the existing Groq LLM-based resume extraction and match evaluation.

## Project structure

```text
resume_parser_app/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── style.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── .env.example
```

## 1. Backend setup

Open a terminal in the `backend` folder.

```bash
python -m venv .venv
```

Activate it:

**Windows PowerShell**
```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside `backend` (same folder as `main.py`) and add:

```env
GROQ_API_KEY=your_actual_groq_api_key
```

Run the API:

```bash
uvicorn main:app --reload
```

Backend: http://localhost:8000  
API docs: http://localhost:8000/docs

## 2. Frontend setup

Open another terminal in the `frontend` folder.

```bash
npm install
```

Create a `.env` file inside `frontend`:

```env
VITE_API_URL=http://localhost:8000
```

Run:

```bash
npm run dev
```

Open the URL printed by Vite, normally http://localhost:5173.

## 3. How it works

1. Recruiter pastes a job description.
2. Recruiter uploads one PDF or DOCX resume.
3. Frontend sends both as `multipart/form-data` to `POST /analyze`.
4. Backend extracts the resume text, parses the job description with the LLM, parses the resume with the LLM, and calls the existing match-scoring prompt.
5. The frontend displays the score and the `details` returned by the model.

## Notes

- The original model name (`openai/gpt-oss-120b`), Pydantic schemas, prompts, resume parsing approach, and final scoring flow have been retained.
- The hardcoded job description and local `resumes/` directory loop have been removed. Each request now supplies one JD and one resume.
- No database is used. Uploaded files are written to a temporary file for extraction and deleted after the request.
- Text-based PDFs and DOCX files are supported. Scanned/image-only PDFs need OCR, which is not included.
- The Groq API key must remain on the backend. Never put it in a `VITE_` frontend environment variable or commit `.env`.
- AI-generated scores are decision-support signals, not objective measures of candidate quality. Recruiters should review the source resume and use job-related criteria.
