/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse JSON bodies with large limits to support base64 image uploads
  app.use(express.json({ limit: "50mb" }));

  // Shared server-side Gemini client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Secure API endpoint for AI quality grading suggestions
  app.post("/api/quality-grading-suggestion", async (req, res) => {
    try {
      const { image, mimeType, historicalPatterns, notes } = req.body;

      const promptParts: any[] = [
        {
          text: `You are an expert palm oil Fresh Fruit Bunch (FFB / Tandan Buah Segar - TBS) quality inspector at a palm oil weighbridge station.
Your job is to suggest grade classifications and defect percentage estimates based on historical patterns and optional visual uploads.

Here are the inputs provided to you:
1. Historical Defect Patterns for this batch context: ${JSON.stringify(historicalPatterns || {}, null, 2)}
2. Additional notes from the inspector: "${notes || 'None'}"
${image ? "3. An uploaded photograph showing the FFB batch in the truck or loading bay." : "No photograph was uploaded."}

Task Instructions:
- Carefully evaluate any visual details in the uploaded image (e.g., color, density of ripe orange/red fruit, green/unripe bunches, moldy/rotten bunches, long empty stems, excessive trash).
- Synthesize the image analysis with the provided historical defects. For instance, if historical data shows a supplier has high empty bunches or rotten rates, factor that in.
- Propose realistic values for:
  * ripePercent: Usually between 75 and 90% for standard quality.
  * unripePercent: Should be kept low, but if historical or image details suggest unripe bunches, increase accordingly.
  * overripePercent: Usually between 2 and 8%.
  * rottenPercent: Bunches showing blackness or white rot.
  * emptyBunchPercent: Bunches without loose fruit, typically 1 to 5%.
  * dirtPercent: Leaves, sand, and stalks left in the cargo.
  * moisturePercent: Usually a minor fraction (0.5 to 3.0%).
  * looseFruitKg: Weight of loose fruits, typically in the range of 50 to 250 kg.
  * grade: Recommend 'A', 'B', 'C', or 'Reject'. Use standard RAM rules:
    - 'Reject' if ripe < 70%, or rotten > 10%, or emptyBunch > 10%.
    - 'C' if ripe < 80% or unripe > 15% or emptyBunch > 5%.
    - 'B' if ripe < 85% or unripe > 10%.
    - 'A' for excellent quality bunches with high ripe percentage and low defects.
  * deductionPercent: Calculate a realistic deduction based on the defects. Base is 2.0% + excess penalties:
    - Unripe > 5%: +1% deduction per 2% unripe
    - Rotten > 2%: +1.5% deduction per 1% rotten
    - Empty bunch > 2%: +2% deduction per 1% empty bunch
    - Dirt > 2%: +1% deduction per 1% dirt
    - Moisture > 1%: +1% deduction per 1% moisture
  * explanation: Write a brief, high-quality, professional explanation in Bahasa Indonesia summarizing your reasoning based on the visual and historic defect context. Keep it concise.

Return your response strictly as a JSON object matching the requested schema.`
        }
      ];

      // Attach base64 image part if present
      if (image && mimeType) {
        promptParts.push({
          inlineData: {
            data: image,
            mimeType: mimeType
          }
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: promptParts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              ripePercent: { type: Type.INTEGER, description: "Percentage of ripe bunches (0-100)" },
              unripePercent: { type: Type.INTEGER, description: "Percentage of unripe bunches (0-100)" },
              overripePercent: { type: Type.INTEGER, description: "Percentage of overripe bunches (0-100)" },
              rottenPercent: { type: Type.INTEGER, description: "Percentage of rotten bunches (0-100)" },
              emptyBunchPercent: { type: Type.INTEGER, description: "Percentage of empty bunches (0-100)" },
              dirtPercent: { type: Type.INTEGER, description: "Percentage of dirt/long stalks (0-100)" },
              moisturePercent: { type: Type.NUMBER, description: "Percentage of moisture content" },
              looseFruitKg: { type: Type.INTEGER, description: "Weight of loose fruit in kg" },
              grade: { type: Type.STRING, description: "Grade: 'A', 'B', 'C', or 'Reject'" },
              deductionPercent: { type: Type.NUMBER, description: "Suggested weight deduction percentage" },
              explanation: { type: Type.STRING, description: "Explanation of suggestions in Bahasa Indonesia" }
            },
            required: [
              "ripePercent", "unripePercent", "overripePercent", "rottenPercent",
              "emptyBunchPercent", "dirtPercent", "moisturePercent", "looseFruitKg",
              "grade", "deductionPercent", "explanation"
            ]
          }
        }
      });

      const responseText = response.text || "{}";
      const result = JSON.parse(responseText.trim());
      res.json(result);
    } catch (error: any) {
      console.error("AI grading error:", error);
      res.status(500).json({ error: error.message || "Gagal menghasilkan saran kualitas AI." });
    }
  });

  // Secure API endpoint for AI Pricing and Market Trend Suggestion
  app.post("/api/market-intelligence-suggestion", async (req, res) => {
    try {
      const { region, cpoIndex, competitors, customQuery, isOffline } = req.body;

      // Provide simple, fast mock values if API is requested in offline/intermittent context
      if (isOffline) {
        return res.json({
          marketSentiment: "Konsolidasi Positif (Offline Mode)",
          suggestedFfbBuyPrice: Math.round(cpoIndex * 0.19),
          suggestedFfbSellPrice: Math.round(cpoIndex * 0.22),
          recommendedMargin: Math.round(cpoIndex * 0.03),
          strategicTactic: "Fokus pada stabilisasi harga beli demi menjaga loyalitas supplier lokal di wilayah " + (region || "Riau") + ".",
          detailedAnalysis: "Analisis pasar berjalan dalam mode offline lokal demi menghemat data internet. Menghitung rekomendasi margin aman berdasarkan indeks CPO terakhir sebesar Rp" + cpoIndex.toLocaleString('id-ID') + "/kg.",
          forecast: [
            { period: "Minggu Depan", trend: "STABLE", desc: "Perkiraan harga beli cenderung bertahan di tingkat Rp" + Math.round(cpoIndex * 0.19) + "." },
            { period: "Bulan Depan", trend: "BULLISH", desc: "Ada peluang harga merambat naik akibat curah hujan atau trek musiman." },
            { period: "Kuartal Depan", trend: "STABLE", desc: "Diprediksi stabil seiring kelancaran distribusi pabrik kelapa sawit." }
          ]
        });
      }

      const prompt = `You are an elite raw commodity buyer and palm oil industry strategist specializing in Fresh Fruit Bunch (FFB / Tandan Buah Segar - TBS) weighbridge operations (RAM) in Sumatera and Kalimantan, Indonesia.
Your job is to recommend real-time buying and selling prices for TBS, calculate safe margins, and provide high-value strategic tactical advice.

Here is the operational context:
1. Region: ${region || "Riau"}
2. Current Domestic CPO Price Index: Rp ${cpoIndex || 12800}/kg
3. Nearby Competitor Buy Prices: ${JSON.stringify(competitors || [])}
4. Custom Owner Scenario/Question: "${customQuery || "None"}"

Tasks:
- Compute suggestedFfbBuyPrice (integer, Rp/kg). It is typically between 18% to 20% of the CPO index (e.g. 2300 - 2550 Rp/kg). Match it competitively against near competitors. If the custom query requests adjustments (e.g. musiman trek, high fuel costs), adjust accordingly.
- Compute suggestedFfbSellPrice (integer, Rp/kg). This is the price at which the RAM sells to the Palm Oil Mill (PKS), typically 21% to 23% of the CPO index.
- recommendedMargin: suggestedFfbSellPrice minus suggestedFfbBuyPrice (usually 250 - 400 Rp/kg to cover transport loss, sorting shrink, and profit).
- strategicTactic: Write a single, highly actionable, ultra-professional 1-sentence business tactic in Bahasa Indonesia for the RAM owner.
- detailedAnalysis: Provide a deep, high-quality, professional market analysis in Bahasa Indonesia (approx 2-3 sentences) summarizing CPO index influence, competitor moves, and the owner query.
- forecast: Build a 3-item array representing short/medium/long term trends. Period options: "Minggu Depan", "Bulan Depan", "Kuartal Depan". Trend options: "BULLISH", "BEARISH", "STABLE". Include a concise Indonesian description (desc) for each.

Return your response strictly as a JSON object matching the requested schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [{ text: prompt }] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              marketSentiment: { type: Type.STRING, description: "Market sentiment (e.g. 'Bullish Kuat', 'Konsolidasi', 'Bearish')" },
              suggestedFfbBuyPrice: { type: Type.INTEGER, description: "Recommended buying price for FFB in Rp/kg" },
              suggestedFfbSellPrice: { type: Type.INTEGER, description: "Recommended selling price to PKS in Rp/kg" },
              recommendedMargin: { type: Type.INTEGER, description: "Recommended margin in Rp/kg" },
              strategicTactic: { type: Type.STRING, description: "Actionable strategic tactic in Bahasa Indonesia" },
              detailedAnalysis: { type: Type.STRING, description: "Detailed market analysis narrative in Bahasa Indonesia" },
              forecast: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    period: { type: Type.STRING, description: "Period: 'Minggu Depan', 'Bulan Depan', or 'Kuartal Depan'" },
                    trend: { type: Type.STRING, description: "Trend: 'BULLISH', 'BEARISH', or 'STABLE'" },
                    desc: { type: Type.STRING, description: "Brief forecast description in Bahasa Indonesia" }
                  },
                  required: ["period", "trend", "desc"]
                }
              }
            },
            required: [
              "marketSentiment", "suggestedFfbBuyPrice", "suggestedFfbSellPrice",
              "recommendedMargin", "strategicTactic", "detailedAnalysis", "forecast"
            ]
          }
        }
      });

      const responseText = response.text || "{}";
      const result = JSON.parse(responseText.trim());
      res.json(result);
    } catch (error: any) {
      console.error("AI pricing error:", error);
      res.status(500).json({ error: error.message || "Gagal memproses rekomendasi harga AI." });
    }
  });

  // Serve static client files in production, otherwise mount Vite dev middleware
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
