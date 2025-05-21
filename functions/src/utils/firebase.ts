import {initializeApp} from "firebase-admin/app";
import * as admin from "firebase-admin";

initializeApp({projectId: "li-ma-56446"});
export const db = admin.firestore();
