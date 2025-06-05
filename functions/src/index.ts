import * as functions from "firebase-functions/v2";
import express from "express";
import bookRoutes from "./routes/bookRoutes.js";
import sensorRoutes from "./routes/sensorRoutes";
import {corsMiddleware} from "./middleware/cors";

functions.setGlobalOptions({region: "asia-northeast3"});

const app=express();
app.use(corsMiddleware);
app.use(express.json());

app.use("/", bookRoutes);
app.use("/", sensorRoutes);

export const api = functions.https.onRequest(app);
