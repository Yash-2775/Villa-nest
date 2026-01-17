import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/firestore";

export const getAllVillas = async () => {
  const q = query(
    collection(db, "villas"),
    orderBy("createdAt", "asc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};
