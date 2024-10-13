# Learn Docker

- Software with built in dependencies in a single package

  - Containerised, run on different platforms
  - Ensure same production and development environments are the same

- Virtual Machines/ Virtual OS

  - Higher overhead with standalone OS with liraries, deps & tools
  - Redundant duplication
    > Performance might be slower. Boot time, takes up more resouces

- Docker
  - Runs **Docker Engine** on top of host OS
    - Virtual machine to run containers
    - Contains container tools
  - Directly runs container on top of **Container**
  - (Lightweight)
  - Layer based architecture. Bottom up approach, rebuild all top layer if current layer is changed.

## Docker Playground

- [Webbased docker playground](https://labs.play-with-docker.com/)

## Configurations

- Building docker image: `docker build .`

- Running docker image:
  `docker run -p <host>:<container> <image_id>`
- Stop docker container: `docker stop <docker_name>`

Docker image spins up containers

NOTE: When running the applicaiton, we need enable the port to be exposed to the host. Adding `EXPOSE <PORT_NUMBER>` in Dockerfile does not enable to the container to expose by default.

We need to expose the port during command execution: - `docker run -p <host-port>:<container-port>`
