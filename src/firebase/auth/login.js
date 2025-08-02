import { auth, db } from '/src/firebase/firebaseConfig'; // dbも使うので忘れずにimport
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

async function generateUniqueUID() {
  while (true) {
    const uid = Math.floor(100000000 + Math.random() * 900000000).toString();
    const docSnap = await getDoc(doc(db, 'customUIDs', uid));
    if (!docSnap.exists()) return uid;
  }
}

export async function loginWithGoogleAndEnsureUID() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const userDocRef = doc(db, 'users', user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    const userData = userDocSnap.data();

    if (!userData.customUID) {
      const customUID = await generateUniqueUID();

      await updateDoc(userDocRef, {
        customUID,
      });

      await setDoc(doc(db, 'customUIDs', customUID), {
        authUid: user.uid,
        createdAt: new Date(),
      });
    }
  } else {
    const customUID = await generateUniqueUID();

    await setDoc(userDocRef, {
      email: user.email,
      name: user.displayName || '',
      customUID,
      createdAt: new Date(),
      friends: [],
    });

    await setDoc(doc(db, 'customUIDs', customUID), {
      authUid: user.uid,
      createdAt: new Date(),
    });
  }

  return user;
}
