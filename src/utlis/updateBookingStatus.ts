import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { isBefore, parseISO, startOfDay } from "date-fns";

/**
 * Auto-completes bookings whose end_date is before today
 */
export const updateBookingStatus = async () => {
  const today = startOfDay(new Date());

  const q = query(
    collection(db, "bookings"),
    where("status", "==", "confirmed")
  );

  const snapshot = await getDocs(q);

  for (const booking of snapshot.docs) {
    const data = booking.data();

    if (!data.end_date) continue;

    const endDate = parseISO(data.end_date);

    if (isBefore(endDate, today)) {
      await updateDoc(doc(db, "bookings", booking.id), {
        status: "completed",
      });
    }
  }
};