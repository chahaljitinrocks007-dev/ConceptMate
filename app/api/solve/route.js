import OpenAI from "openai";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export async function POST(req) {
  try {

    const ip = req.headers.get("x-forwarded-for") || "unknown";

    const today = new Date().toISOString().slice(0, 10);

    const usageRef = doc(db, "usage", ip);
    const usageSnap = await getDoc(usageRef);

    if (usageSnap.exists()) {

      const data = usageSnap.data();

      if (data.date === today && data.count >= 20) {
        return Response.json(
          { error: "Daily limit reached (20 questions/day)" },
          { status: 429 }
        );
      }

      if (data.date === today) {
        await updateDoc(usageRef, {
          count: data.count + 1
        });
      } else {
        await setDoc(usageRef, {
          count: 1,
          date: today
        });
      }

    } else {

      await setDoc(usageRef, {
        count: 1,
        date: today
      });

    }

    const data = await req.formData();
    const file = data.get("file");

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    // IMAGE SIZE LIMIT (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: "Image too large" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `
You are an expert math and physics teacher.

Your job:
1) Carefully read messy handwritten or printed questions from student notebook photos
2) Ignore background noise, shadows, lines, fingers
3) Detect the actual question
4) Solve step by step
5) Explain like teaching a weak student
6) At end give 1 learning tip
          `,
        },
        {
          role: "user",
          content: [
            { type: "input_text", text: "Read and solve this question from the photo" },
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${base64Image}`,
            },
          ],
        },
      ],
    });

    return Response.json({
      result: response.output_text,
    });

  } catch (error) {

    console.log(error);

    return Response.json(
      { error: "Failed to solve" },
      { status: 500 }
    );

  }
}