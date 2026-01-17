import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firestore";

export const createBooking = async (data: any) => {
  return addDoc(collection(db, "bookings"), {
    ...data,
    status: "pending",
    createdAt: new Date(),
  });
};

export const getUserBookings = async (userId: string) => {
  const q = query(
    collection(db, "bookings"),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};
