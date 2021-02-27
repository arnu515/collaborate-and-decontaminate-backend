# Collaborate to decontaminate (BACKEND)

This app allows you to chat with other users and make plans with them to save the world!

## Quickstart

0. Have a redis and postgres database

1. Clone this repository

```bash
git clone https://github.com/arnu515/collaborate-to-decontaminate-backend.git backend

cd backend
```

2. Set environment variables

```
REDIS_URL=url_of_redis
POSTGRES_URL=url_of_postgres
SESSION_REDIS_URL=optional_other_redis_database
SECRET=a_strong_secret
WEBSITE_URL=url_of_frontend
```

3. Up and away!

```bash
# Install dependencies
npm i # or yarn

# Run the server
npm run dev # or yarn dev

# OR

# Build for production
npm run build
```

Or use docker:

```bash
docker run -dp 5000:80 -e REDIS_URL=url_of_redis -e POSTGRES_URL=url_of_postgres -e SESSION_REDIS_URL=optional_other_redis_database -e WEBSITE_URL=url_of_frontend -e SECRET=any_strong_secret "$(docker build -q .)"
```

Your website will be live on <http://localhost:5000>

Or visit the live version:

<https://api.collaboratedecontaminate.gq>
