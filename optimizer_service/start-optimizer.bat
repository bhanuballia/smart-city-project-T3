@echo off
SETLOCAL
python -m venv .venv
CALL .venv\Scripts\activate
pip install -U pip
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
ENDLOCAL

