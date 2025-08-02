import { auth, db } from "../firebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

async function generateUniqueUID() {
  while (true) {
    const uid = Math.floor(100000000 + Math.random() * 900000000).toString();
    const docSnap = await getDoc(doc(db, 'customUIDs', uid));
    if (!docSnap.exists()) return uid;
  }
}

export async function signUpWithGoogleAndSaveUID() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const user = result.user;
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      const customUID = await generateUniqueUID();

      // Firestoreにユーザーデータを保存（customUID含む）
      await setDoc(userDocRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date(),
        customUID,
      });

      // customUIDを別コレクションで管理
      await setDoc(doc(db, "customUIDs", customUID), {
        authUid: user.uid,
        createdAt: new Date(),
      });
    }

    console.log("Googleサインアップ成功 & Firestoreにユーザー情報を保存:", user);
    return user;
  } catch (error) {
    console.error("Googleサインアップエラー:", error.code, error.message);
    throw error;
  }
}
