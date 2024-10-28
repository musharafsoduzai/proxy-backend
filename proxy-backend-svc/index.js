import express from "express";
import "dotenv/config";
import cors from "cors";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";
import morgan from "morgan";
import router from "./routes/routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
const paths = `${process.cwd()}/routes/routes.js`;
// console.log("path here: ", paths);
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Account & Billing",
      version: "1.0.0",
      description: "Account & Billing module of Pelickan Dispatch",
    },
    servers: [{ url: process.env.SWAGGER_URL }],
  },
  apis: [paths],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
// console.log("swagger specifics: ", swaggerDocs);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(bodyParser.json());
const api = "/api";

app.use(cors());
app.use(morgan("dev"));

app.use(`${api}`, router);

app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(`${api}/api-docs/`, swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use("/swagger.json", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerDocs);
});

app.use(express.static(__dirname + "/uploads"));
app.use(`${api}/uploads/images`, express.static(__dirname + "/uploads/images"));

app.use("/", (req, res) => {
  return res.status(200).json({ message: "Hello" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
    ====================================================
       🌐 Server Status: RUNNING
    ----------------------------------------------------
       🟢 Listening on PORT: ${PORT}
       🌍 Base URL: ${process.env.BASE_URL}
    ----------------------------------------------------
       📅 Started at: ${new Date().toLocaleString()}
    ====================================================
    `);
});
