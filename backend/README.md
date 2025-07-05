# Online Judge Backend

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Install Redis (required for Celery):
   - Windows: Download and install from https://github.com/microsoftarchive/redis/releases
   - Linux: `sudo apt-get install redis-server`
   - macOS: `brew install redis`

3. Run migrations:
   ```
   python manage.py migrate
   ```

## Running the Application

1. Start Redis server:
   - Windows: Start the Redis service
   - Linux/macOS: `redis-server`

2. Start Django server:
   ```
   python manage.py runserver
   ```

3. Start Celery worker (in a separate terminal):
   ```
   celery -A backend worker --loglevel=info --pool=threads
   ```

## Troubleshooting

If submissions are stuck in "pending" state, check that:

1. The Celery worker is running
2. Redis server is running
3. The task is being properly queued (check Celery logs)

## Architecture

The submission processing workflow:

1. User submits code through the API
2. Submission is created with status="pending"
3. A Celery task is dispatched to process the submission asynchronously
4. The Celery worker picks up the task and executes the code
5. The submission status is updated with the results