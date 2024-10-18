# Task Management System (TMS)

The Task Management System (TMS) is a standalone application that follows a kanban-style workflow. The TMS contains project `application`, which include `tasks` and can be associated with a `plan`. There are 4 user roles in the system: `admin`, `project manager`, `project lead` and `developer`. Tasks progress through 5 distinct states, `open`, `todo`, `doing`, `done` and `closed`.

The project also Air gap measure providing an isolated environment for development and deployment without internet access. Specially packaging `node_modules` and downloading base docker images for development.

## Technical Overview

The application follows an N-tier architecture with an MVC (Model-View-Controller) design pattern. It is containerized using Docker for streamlined deployment and scalability. The server secures its endpoints with protected routes to prevent unauthorized and unauthenticated access.

The tech stack used are as follows:

- Backend: NodeJS
- Frontend: Svelte, SvelteKit
- Database: MySQL
- Additional services/applications:
  - Local Mail Server: MailDev
  - Containerisation: Docker

Note:

- Infomation to run the application, checkout [notes](./notes.md)
- Project requirements [pdf](./TMS_US.pdf)
