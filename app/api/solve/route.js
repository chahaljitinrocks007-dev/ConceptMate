export const dynamic = "force-dynamic";
import OpenAI from "openai";
import { db } from "@/lib/firebase";
import { doc,getDoc,setDoc,updateDoc,collection,addDoc } from "firebase/firestore";

export async function POST(req){

try{

const data=await req.formData();

const file=data.get("file");
const uid=data.get("uid");

if(!uid) return Response.json({error:"Not logged in"});

const today=new Date().toISOString().slice(0,10);

const usageRef=doc(db,"usage",uid);
const usageSnap=await getDoc(usageRef);

if(usageSnap.exists()){

const usage=usageSnap.data();

if(usage.date===today && usage.count>=20){

return Response.json({error:"Daily limit reached"},{status:429});

}

if(usage.date===today){

await updateDoc(usageRef,{count:usage.count+1});

}

else{

await setDoc(usageRef,{count:1,date:today});

}

}

else{

await setDoc(usageRef,{count:1,date:today});

}

const bytes=await file.arrayBuffer();
const buffer=Buffer.from(bytes);
const base64=buffer.toString("base64");

const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});

const response=await openai.responses.create({

model:"gpt-4.1-mini",

input:[

{
role:"system",
content:`
Return solution JSON:

{
"difficulty":"",
"steps":[],
"finalAnswer":"",
"tip":""
}
`
},

{
role:"user",
content:[
{type:"input_text",text:"solve question"},
{
type:"input_image",
image_url:`data:image/jpeg;base64,${base64}`
}
]
}

]

});

const ai=response.output_text;

let parsed;

try{

parsed=JSON.parse(ai);

}catch{

parsed={
difficulty:"unknown",
steps:[ai],
finalAnswer:"",
tip:""
}

}

await addDoc(collection(db,"history",uid,"solves"),{

image:`data:image/jpeg;base64,${base64}`,
steps:parsed.steps,
finalAnswer:parsed.finalAnswer,
difficulty:parsed.difficulty,
tip:parsed.tip,
createdAt:new Date()

});

return Response.json({result:ai});

}

catch(e){

return Response.json({error:"solve failed"},{status:500});

}

}