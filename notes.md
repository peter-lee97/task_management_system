# Table of Content

1. [(Pre requisite) Database setup](#pre-requisite-database-setup)
1. [Docker commands](#docker-commands)
1. [Launching App](#to-launch)
1. [Frontend](#frontend-sveltekit)
1. [Backend](#backend-nodejs)
1. [Other Services](#email-server-local-development)

## (Pre requisite) Database setup

- Use `backend/scripts/schema/exports.sql` script to create the schema
- Database of choice: `MySql`
- [mysql2 documentation](https://sidorares.github.io/node-mysql2/docs)

# To launch

## All-in-one setup (local)

Using `docker-compose.yaml` to build a multi container application.

Build images used in docker compose: `docker compose build`

1. Start app
   `docker compose up`
   - force rebuild `docker compose up --build`
2. Stop app
   `docker compose down`

### Docker commands

- Build `docker build -f <Dockerfile name> .`
- Create Container `docker run --name <container_name> <image_name>`
- Stop Container `docker stop <container_name>`
- Remove Container `docker rm <container_name>`

## Frontend (SvelteKit)

### Env setup

Create a `.env` file in the same level as `/frontend`

1. `PUBLIC_API_END_POINT=localhost`
2. `PUBLIC_API_PORT=3000`

### Dockerise frontend

1. Build app: `docker build -f Dockerfile.internet -t tms-fe .`

   > Internally using `port 3000`

2. Run app: `docker run --rm -p 3001:3000 --env-file .env --name tms-fe-container tms-fe`

## Backend (NodeJS)

### Env setup

Create a `.env` file with the following variables in the same level as `./backend`
(change the values when necessary)

1. `PORT=3000`
2. `USERNAME=root`
3. `PASSWORD=qwepoi!!`
4. `DATABASE=tms`
5. `ENV=DEV`
6. `DB_HOST=host.docker.internal`
7. `ENV_SECRET=this_is_a_very_long_password`
8. `TOKEN_EXPIRY=1d`
9. `COOKIE_EXPIRY=5 # in hours`
10. `EMAIL_HOST=mailsvc`
11. `EMAIL_PORT=1025`

### Dockerise Backend (Internet Environment)

- Build image: `docker build -f Dockerfile.internet -t tms-backend .`

- Create container from image: `docker run  --env-file ./.env -d -p 3000:3000 --name tms-backend-container tms-backend`
- Create container from image (With auto remove): `docker run --env-file ./.env -d -p 3000:3000 --rm --name tms-backend-container tms-backend`

- Start existing container: `docker start tms-backend-container`

- Stop container: `docker stop tms-backend-container`

#### Airgap Preparation (With Internet)

1. `cd prep`

Download image from docker hub

- pull base image from dockerhub repo: `docker image pull node:20-alpine`
- save image to tar file and compress: `docker save node:20-alpine | gzip > node-alpine-20.tar.gz`

=== Air Gap ===

> Clear cache to ensure loading from local file `docker image rm <image name>`

1. Install docker image from local repo
   `docker load < ./base_image/njs-image.tar.gz`
   `docker load < <filename>`
   `docker load --input <filename>`

### A. Dockerise DEV (Airgap) Environment

- Build Image: `docker build -f Dockerfile.d2p -t tms-backend-dev .`
- Create container from image (auto remove): `docker run --env-file ./.env -d -p 3000:3000 --rm --name tms-backend-container-dev tms-backend-dev`
- Stop container: `docker stop tms-backend-container-dev`

### B. Dockerise (PROD env)

Using **Dockerfile** for production build, with mutli stage build.

- Build Image `docker build -t tms-production .`
- Create Container (auto remove) `docker run --rm -p 3000:3000 --env-file .env --name tms-prod tms-production`
- Stop Container `docker stop tms-prod`

## Email Server (Local development)

- [Incoming Email Testing](https://www.wpoven.com/tools/free-smtp-server-for-testing)
- [Sending Mock Email](https://ethereal.email/create)
- Using `MailDev` for running local smtp server
  - Require to install docker image:
    - `docker pull maildev/maildev`
  - To Run: `docker run -p 1080:1080 -p 1025:1025 --name mailsvc maildev/maildev`

### Access control in container

Checking user rights in container

- `cat /etc/passwd | grep <app_user>`

- TODO: Check how to remove home directory for user
