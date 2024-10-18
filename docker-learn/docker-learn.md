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

### Docker Learning - 17 Oct

#### Managing Docker Data using Volumes

> Image: read-only, source code should not be edited

> Container: additional read-write layer ontop of the Image

Volume used for persistent data, creates connection to host machine to RW.
Define in `Dockerfile`

- Two types of volumes: Anonymous & Named Volumes, managed by docker (docker handles the creation volume).
  For data that are not required to edit directly by dev

> Anonymous volumes will be deleted by docker after container shuts down. Named volumes will remaining persistent

Creating container named volume `docker run -v <volume_name>:<volume_path_defined_in_dockerfile> <image_name>`

#### Bind Mount

- Handled by user, defined where to save
- Persistent data to be edited by user (e.g. src code)
  - Defining path: `docker run -v <absolute_path>:<image_path>:<optional_readwrite_flags> <image_name>`. Can refer single file as well

### Environment Variables

ARGuments: Set during buildtime, creation of images
ENVironment: Set during runtime, running containers

### Docker Compose

- Combine multiple docker images to build with more configurations
