import * as functions from "firebase-functions/v2";
import express from "express";
import bookRoutes from "./routes/bookRoutes.js";

functions.setGlobalOptions({region: "asia-northeast3"});
const app=express();
app.use(express.json());

app.use("/", bookRoutes);

export const api = functions.https.onRequest(app);
