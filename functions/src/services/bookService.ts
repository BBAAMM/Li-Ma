import {db} from "../utils/firebase";
import {Book} from "../types/book.d";


/**
 * Get Book datas from library database.
 * @return {Book[]} book collections in the database.
 */
export async function getBook(): Promise<Book[]> {
  const snapshot = await db.collection("books").get();
  return snapshot.docs.map((doc)=> ({
    id: doc.id,
    ...doc.data(),
  } as Book));
}
