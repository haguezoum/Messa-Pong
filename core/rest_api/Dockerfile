FROM python:3.11-slim

WORKDIR /api

RUN apt-get update && apt-get install -y \
    wget openssl \
    && rm -rf /var/lib/apt/lists/* 

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["bash", "./run.sh"] 
