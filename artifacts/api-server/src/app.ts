import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const publicDir = path.join(process.cwd(), "public");

app.use("/workspace", express.static(publicDir));
app.get("/workspace/*path", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.use("/api", router);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    service: "Walia Nexus Identity API",
    status: "online",
    version: "1.0.0",
  });
});

export default app;
