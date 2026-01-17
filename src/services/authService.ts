import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "@/firebase/auth";

let recaptchaVerifier: RecaptchaVerifier | null = null;

export const setupRecaptcha = (containerId: string) => {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(
      auth,
      containerId,
      { size: "invisible" }
    );
  }
  return recaptchaVerifier;
};

export const loginWithOTP = async (phone: string) => {
  const verifier = setupRecaptcha("recaptcha-container");
  return signInWithPhoneNumber(auth, phone, verifier);
};

export const logout = () => {
  return signOut(auth);
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
