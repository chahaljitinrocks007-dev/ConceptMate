"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";

export default function Solve(){

const [file,setFile]=useState(null);
const [answer,setAnswer]=useState("");

const solve=async()=>{

const user=auth.currentUser;

const formData=new FormData();

formData.append("file",file);
formData.append("uid",user.uid);

const res=await fetch("/api/solve",{
method:"POST",
body:formData
});

const data=await res.json();

setAnswer(data.result);

}

return(

<div style={{padding:"40px"}}>

<input type="file" onChange={(e)=>setFile(e.target.files[0])} />

<button onClick={solve}>
Solve
</button>

<p>{answer}</p>

</div>

)

}