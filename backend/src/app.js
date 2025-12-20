import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; //cookie-parser is a middleware for Express.js that helps you read cookies sent by the browser in incoming requests.//

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "https://wondrous-cassata-2d6676.netlify.app",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js"; // added

app.use("/api/v1/user", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/tweet", tweetRouter); // added

export { app };
