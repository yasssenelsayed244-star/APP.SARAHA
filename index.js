import express from "express";
import bootstrap from "./src/bootstrap.js";
import "dotenv/config";

const app = express();

bootstrap(app, express);
