import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";

interface UserData {
  email: string;
  displayName: string;
  role: "user" | "admin";
}

export const createUserIfNotExists = async (
  uid: string,
  data: UserData
) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      ...data,
      createdAt: new Date(),
    });
  }
};
