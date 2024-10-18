import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import express from "express";

import { auth, demo, tms, usergroup } from "./routes/";
import createConnection, { getDb } from "./services/db";
import { createTransporter } from "./services/nodemailer";

// configures dotenv to work in your application
config();

const app = express();

const allowedOrigins = ["http://localhost:5173", "http://localhost:3001"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT as string;
const ENV = process.env.ENV as string;
const host = process.env.DB_HOST as string;
const username = process.env.USERNAME as string;
const password = process.env.PASSWORD as string;
const database = process.env.DATABASE as string;

try {
  createConnection({
    host: host,
    password,
    username,
    database,
  });
} catch (error) {
  console.error("error in connecting db", error);
}

try {
  createTransporter(
    process.env.EMAIL_HOST as string,
    parseInt(process.env.EMAIL_PORT as string)
  );
} catch (error) {
  console.error("error connecting to email client", error);
}
// getTransporter
//   .verify()
//   .then((e) => console.log(`nodemailer established: ${e}`));

const init = async () => {
  app.get("/", (_, response) => {
    response.status(200).send(`
      <body>
        <h1>Main page</h1>
      </body>
      `);
  });

  app.use("/api/v1/auth", auth);
  app.use("/api/v1/user_group", usergroup);
  app.use("/api/v1/tms", tms);

  app.use("/api/demo", demo);

  app
    .listen(PORT, () => {
      const script = process.env.npm_lifecycle_event;
      if (script) console.log(`Current script: ${script}`);
      console.log(`Environment: ${ENV}`);
      console.log("Server running at PORT:", PORT);
    })
    .on("error", (error) => {
      getDb().end(() => {
        console.log(`Database connection closed`);
      });
      throw new Error(error.message);
    });
};

init().catch((e) => console.error(`Error from init: ${e}`));
