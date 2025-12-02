# rebuild 1
FROM python:3.10-slim

#RUN apk update && apk add --no-cache mc

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

#CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
