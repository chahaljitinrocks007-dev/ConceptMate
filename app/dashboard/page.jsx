"use client";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [credits, setCredits] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setCredits(snap.data().credits);
      }
    });

    return () => unsub();
  }, []);

  const addCredits = async () => {
    const user = auth.currentUser;
    const docRef = doc(db, "users", user.uid);

    const newCredits = credits + 10;

    await updateDoc(docRef, {
      credits: newCredits
    });

    setCredits(newCredits);
  };

  if (credits === null) return <h1>Loading...</h1>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard</h1>
      <h2>Your Credits: {credits}</h2>

      <button
        onClick={addCredits}
        style={{
          marginTop: 20,
          padding: "12px 20px",
          background: "green",
          color: "white",
          borderRadius: "10px"
        }}
      >
        Add 10 Credits (Test)
      </button>

      <br /><br />

      <a href="/solve">
        <button style={{ padding: "12px 20px" }}>
          Solve a Question
        </button>
      </a>

    </div>
  );
}
