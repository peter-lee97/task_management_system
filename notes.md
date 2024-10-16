## MySQL default credentials

- root | qwepoi!!

### Documentation

- [mysql2 documentation](https://sidorares.github.io/node-mysql2/docs)

### Email Information

- [Incoming Email Testing](https://www.wpoven.com/tools/free-smtp-server-for-testing)
- [Sending Mock Email](https://ethereal.email/create)
- Using `MailDev` for running local smtp server
  - Require to install docker image:
    - `docker pull maildev/maildev`
  - To Run: `docker run -p 1080:1080 -p 1025:1025 maildev/maildev`

Check who if admin right

- `cat /etc/passwd | grep <app_user>`

- TODO: Check how to remove home directory for user

### Docker commands

- Build `docker build -f <Dockerfile name> .`
- Create Container `docker run --name <container_name> <image_name>`
- Stop Container `docker stop <container_name>`
- Remove Container `docker rm <container_name>`

#### Dockerise backend (preparing internet to dev env)

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

#### Dockerise (DEV env)

- Build Image: `docker build -f Dockerfile.d2p -t tms-backend-dev .`
- Create container from image (auto remove): `docker run --env-file ./.env -d -p 3000:3000 --rm --name tms-backend-container-dev tms-backend-dev`
- Stop container: `docker stop tms-backend-container-dev`

#### Dockerise (PRODD env)

Using **Dockerfile** for production build

- Build Image `docker build -t tms-production .`
- Create Container (auto remove) `docker run --rm -p 3000:3000 --env-file .env --name tms-prod tms-production`
- Stop Container `docker stop tms-prod`
