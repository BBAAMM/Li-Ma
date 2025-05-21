import {Router, Request, Response, NextFunction} from "express";
import {getBook} from "../services/bookService.js";

const router = Router();

/*
 * Check Connection
 * @call /api/healthz
 * @return "OK"
 */
router.get("/healthz", (req, res)=>{
  res.send("OK");
});

/*
 * Get Book data
 * @call /api/books
 * @return Book[]
 */
router.get("/books", async (req:Request, res:Response, next: NextFunction)=> {
  try {
    const books = await getBook();
    res.json(books);
  } catch (error) {
    next(error);
  }
});

export default router;
