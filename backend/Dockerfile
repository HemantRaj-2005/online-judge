# Use official Python image as base
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y gcc libpq-dev && \
    pip install --upgrade pip

# Copy requirements
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install -r requirements.txt

# Copy project files
COPY . /app/

# Expose port 8000 for Django
EXPOSE 8000

# Run migrations and start server
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]

# yes sir, 
# sir code to run docker, please give on chat, yes sir
# sir that I deleted, it was of another folder