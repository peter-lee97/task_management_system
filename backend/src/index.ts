import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import express from "express";

import { auth, usergroup } from "./routes/";
import createConnection, { getDb } from "./services/db";

// configures dotenv to work in your application
config();

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT as string;
const ENV = process.env.ENV as string;
const username = process.env.USERNAME as string;
const password = process.env.PASSWORD as string;
const database = process.env.DATABASE as string;

createConnection({
  host: `localhost`,
  password,
  username,
  database,
});

const init = async () => {
  app.get("/", (_, response) => {
    response.status(200).send(`
      <body>
        <h1>Main page</h1>
      </body>
      `);
  });

  // Handlers
  app.use("/api/v1/auth", auth);
  app.use("/api/v1/user_group", usergroup);

  app
    .listen(PORT, () => {
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
