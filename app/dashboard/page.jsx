"use client";

import { auth,db } from "@/lib/firebase";
import { doc,getDoc,collection,getDocs } from "firebase/firestore";
import { useEffect,useState } from "react";
import jsPDF from "jspdf";

export default function Dashboard(){

const [usage,setUsage]=useState(0);
const [history,setHistory]=useState([]);

useEffect(()=>{

const load=async()=>{

const user=auth.currentUser;

if(!user) return;

const usageRef=doc(db,"usage",user.uid);
const usageSnap=await getDoc(usageRef);

if(usageSnap.exists()) setUsage(usageSnap.data().count);

const ref=collection(db,"history",user.uid,"solves");
const snap=await getDocs(ref);

const items=[];

snap.forEach(doc=>items.push(doc.data()));

setHistory(items.reverse());

}

load();

},[])

const downloadPDF=(item)=>{

const pdf=new jsPDF();

pdf.text("AI Solver",20,20);

let y=40;

item.steps.forEach((s,i)=>{

pdf.text(`Step ${i+1}: ${s}`,20,y);
y+=10;

});

pdf.text(`Answer: ${item.finalAnswer}`,20,y+10);

pdf.save("solution.pdf");

}

return(

<div style={{padding:"40px"}}>

<h1>Dashboard</h1>

<h3>Usage Today: {usage} / 20</h3>

<h2>History</h2>

{history.map((item,i)=>(

<div key={i} style={{border:"1px solid #ddd",padding:"20px",marginTop:"20px"}}>

<img src={item.image} width="100%" />

<p>Difficulty: {item.difficulty}</p>

{item.steps?.map((s,i)=>(

<p key={i}>Step {i+1}: {s}</p>

))}

<p>Answer: {item.finalAnswer}</p>

<button onClick={()=>downloadPDF(item)}>
Download PDF
</button>

</div>

))}

</div>

)

}