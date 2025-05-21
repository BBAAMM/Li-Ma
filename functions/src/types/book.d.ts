import {Timestamp} from "firebase-admin/firestore";

export interface Book {
  id: string;
  author: string;
  avg_review: number;
  description: string;
  lendable: boolean;
  title: string;
  publish_date: Timestamp;
  reviews: Array<{ UUID: string; review: string; score: number}>;
}

