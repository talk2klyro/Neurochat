import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export async function saveUserProfile() {
  const user = auth.currentUser;
  if (!user) return;

  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    role: "member", // default role
  }, { merge: true });
}
