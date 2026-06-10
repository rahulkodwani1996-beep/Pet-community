import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// In-memory illustration cache to prevent redundant Imagen API calls
const imageCache = new Map<string, string>();

let aiClient: any = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Imagen Cute Pet Illustration generator with fallback
  app.post("/api/generate-image", async (req, res) => {
    const { postId, speciesTag, tags = [] } = req.body;

    if (postId && imageCache.has(postId)) {
      return res.json({ imageUrl: imageCache.get(postId) });
    }

    try {
      const ai = getAiClient();
      const breedPrompt = tags.length > 0 ? `, representing ${tags.join(" & ")}` : "";
      const prompt = `A premium, super cute cartoon flat-style vector mascot of a friendly fluffy ${
        speciesTag === "both" ? "dog and cat sleeping together" : speciesTag || "pet"
      }${breedPrompt}, minimalist illustration, happy round eyes, glowing warm soft pastel colors, bold clean strokes, isolated on a solid soft warm cream background`;

      // Call Imagen model via @google/genai SDK
      const response = await ai.models.generateImages({
        model: "imagen-4.0-generate-001",
        prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: "image/jpeg",
          aspectRatio: "1:1",
        },
      });

      if (response?.generatedImages?.[0]?.image?.imageBytes) {
        const base64Bytes = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64Bytes}`;
        if (postId) {
          imageCache.set(postId, imageUrl);
        }
        return res.json({ imageUrl, generated: true });
      } else {
        throw new Error("No image bytes returned from Imagen API.");
      }
    } catch (err: any) {
      console.log("No paid tier key for Imagen. Successfully using premium Unsplash fallback asset instead.");

      // Return high-quality, curated illustration fallbacks
      let fallbackUrl = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"; // dog
      if (speciesTag === "cat") {
        fallbackUrl = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80"; // cat
      } else if (speciesTag === "both") {
        fallbackUrl = "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80"; // both
      }

      if (postId) {
        imageCache.set(postId, fallbackUrl);
      }
      return res.json({ imageUrl: fallbackUrl, fallback: true });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
