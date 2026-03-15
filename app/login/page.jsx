"use client";

import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Login() {

  const router = useRouter();

  const login = async () => {

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    const ref = doc(db,"users",user.uid);
    const snap = await getDoc(ref);

    if(!snap.exists()){

      await setDoc(ref,{
        email:user.email,
        createdAt:new Date()
      });

    }

    router.push("/dashboard");

  }

  return(

  <div style={{height:"100vh",display:"flex",justifyContent:"center",alignItems:"center"}}>

  <button onClick={login}>
  Continue with Google
  </button>

  </div>

  )

}