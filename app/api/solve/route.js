import OpenAI from "openai";

const requests = new Map();

function rateLimit(ip) {
  const now = Date.now();
  const window = 60000; // 1 minute
  const limit = 5;

  if (!requests.has(ip)) {
    requests.set(ip, []);
  }

  const timestamps = requests.get(ip).filter(t => now - t < window);

  if (timestamps.length >= limit) {
    return false;
  }

  timestamps.push(now);
  requests.set(ip, timestamps);
  return true;
}

export async function POST(req) {
  try {

    const ip = req.headers.get("x-forwarded-for") || "unknown";

    if (!rateLimit(ip)) {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }

    const data = await req.formData();
    const file = data.get("file");

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    // image size limit (5MB)
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

Rules:
- Very clear steps
- No skipping steps
- Simple language
- If image tilted, mentally rotate
- If multiple questions, solve all
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
    return Response.json({ error: "Failed to solve" }, { status: 500 });
  }
}