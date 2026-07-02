import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Shared Gemini Client Lazy Initialization
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in the environment. Using simulation mode for evaluations.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const POEM_TEXT = `BARBIE DOLL
by Marge Piercy

This girlchild was born as usual
and presented dolls that did pee-pee
and miniature GE stoves and irons
and wee lipsticks the color of cherry candy.
Then in the magic of puberty, a classmate said:
You have a great big nose and fat legs.

She was healthy, tested intelligent,
possessed strong arms and back,
abundant sexual drive and manual dexterity.
She went to and fro apologizing.
Everyone saw a fat nose on thick legs.

She was advised to play coy,
exhorted to come on hearty,
exercise, diet, smile and wheedle.
Her good nature wore out
like a fan belt.
So she cut off her nose and her legs
and offered them up.

In the casket displayed on satin she lay
with the undertaker's cosmetics painted on,
a turned-up putty nose,
dressed in a pink and white nightie.
Doesn't she look pretty? everyone said.
Consummation at last.
To every woman a happy ending.`;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // API endpoint for analyzing Stage 1 voice recording
  app.post('/api/analyze-reading', async (req, res) => {
    const { audio, studentName, mimeType = 'audio/webm' } = req.body;
    const client = getGeminiClient();

    // Helper to generate elegant fallback results
    const getFallbackReadingResult = (isQuotaFailure = false) => {
      console.log(`[FALLBACK] Serving simulated reading analysis for: ${studentName}. Quota issue: ${isQuotaFailure}`);
      const pronunciation = Math.floor(Math.random() * 4) + 16; // 16 - 19
      const rhythm = Math.floor(Math.random() * 4) + 16;        // 16 - 19
      const intonation = Math.floor(Math.random() * 4) + 16;    // 16 - 19
      const expression = Math.floor(Math.random() * 4) + 15;    // 15 - 18
      const fluency = Math.floor(Math.random() * 4) + 16;       // 16 - 19
      const score = pronunciation + rhythm + intonation + expression + fluency;

      return {
        simulated: true,
        quotaFallback: isQuotaFailure,
        score,
        pronunciation,
        rhythm,
        intonation,
        expression,
        fluency,
        strengths: [
          "Clear pronunciation of complex nouns like 'puberty' and 'dexterity'.",
          "Very steady pacing with appropriate pauses between stanzas."
        ],
        improvements: [
          "Could emphasize the emotional shift and irony in the third stanza.",
          "Watch the trailing intonation on list items like 'pee-pee' and 'miniature GE stoves'."
        ],
        suggestions: "Try adopting a more critical, sarcastic tone for the final stanza ('To every woman a happy ending') to reflect the author's satirical intent."
      };
    };

    if (!client) {
      return res.json(getFallbackReadingResult(false));
    }

    try {
      let geminiResponse;
      if (audio) {
        // We received real audio data from microphone
        const base64Data = audio.replace(/^data:audio\/\w+;base64,/, "");
        const prompt = `You are an expert English Language Speaking Assessor and Voice Coach. Assess this audio recording of a student reading the poem "Barbie Doll" by Marge Piercy.
The poem text is:
${POEM_TEXT}

Assess the student's reading based on these 5 dimensions (up to 20 marks each, for a total of 100 marks):
1. Pronunciation Accuracy: Correct articulation, word accuracy.
2. Rhythm and Pacing: Reading speed, natural pauses.
3. Stress and Intonation: Voice variation, emotional delivery.
4. Expression and Tone: Conforming to the poem's somber and satirical mood.
5. Fluency: Smoothness, minimal hesitations.

Respond ONLY with a JSON object. The response must be valid JSON in this exact structure:
{
  "score": number (sum of the five scores below, out of 100),
  "pronunciation": number (out of 20),
  "rhythm": number (out of 20),
  "intonation": number (out of 20),
  "expression": number (out of 20),
  "fluency": number (out of 20),
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "suggestions": "string containing specific pedagogical coaching tips"
}

Ensure the feedback is educational, constructive, highly encouraging, and targeted for a Form 4 ESL learner (B1 level).`;

        geminiResponse = await client.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                  }
                },
                {
                  text: prompt
                }
              ]
            }
          ],
          config: {
            responseMimeType: 'application/json'
          }
        });
      } else {
        // No audio provided - text review simulation via Gemini
        const prompt = `Generate a realistic evaluation for a student named ${studentName} who read the poem "Barbie Doll".
Give a score of 80 to 95. Return a JSON object with this exact structure:
{
  "score": number (total out of 100),
  "pronunciation": number (out of 20),
  "rhythm": number (out of 20),
  "intonation": number (out of 20),
  "expression": number (out of 20),
  "fluency": number (out of 20),
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "suggestions": "string containing coaching tips"
}
Ensure the feedback is educational and custom to the themes of Marge Piercy's Barbie Doll.`;

        geminiResponse = await client.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });
      }

      const rawText = geminiResponse.text || "{}";
      const result = JSON.parse(rawText.trim());
      res.json(result);

    } catch (err: any) {
      console.error("Error in analyze-reading API, initiating graceful fallback:", err);
      res.json(getFallbackReadingResult(true));
    }
  });

  // API endpoint for assessing Escape Room checkpoints
  app.post('/api/assess-checkpoint', async (req, res) => {
    const { checkpointId, question, inputType, studentAnswer, audio } = req.body;
    const client = getGeminiClient();

    // Helper for graceful fallback simulation with tailored keywords
    const getFallbackCheckpointResult = (isQuotaFailure: boolean) => {
      console.log(`[FALLBACK] Serving simulated checkpoint analysis for Clue ID ${checkpointId}. Quota issue: ${isQuotaFailure}`);
      
      const answer = (studentAnswer || "").trim().toLowerCase();
      const wordCount = answer.split(/\s+/).filter(Boolean).length;
      
      let score = 8; // Default good score
      let feedback = "";
      
      if (wordCount < 3) {
        score = 5;
        feedback = "Your answer is quite brief. Please write a full, complete sentence to explain your thoughts more clearly.";
      } else if (wordCount < 8) {
        score = 7;
        feedback = "Good start, but try to expand your response with more supporting details from the poem to strengthen your argument.";
      } else {
        score = 9;
        feedback = "Excellent analytical insight! You've successfully linked the textual evidence to the core themes of societal pressure and toxic beauty standards.";
      }

      // Specific keyword detections for checkpoints to make feedback feel amazingly tailored
      if (checkpointId === 1) {
        if (answer.includes("toy") || answer.includes("doll") || answer.includes("stove") || answer.includes("cook") || answer.includes("domestic") || answer.includes("role") || answer.includes("girl")) {
          score = Math.max(score, 9);
          feedback = "Outstanding! You correctly identified how traditional childhood toys reinforce predefined gender expectations and domestic roles from a young age.";
        } else if (wordCount >= 8) {
          feedback = "Well thought out. Reflect on how playthings like pee-pee dolls and stoves prepare young girls for household tasks and childcare.";
        }
      } else if (checkpointId === 2) {
        if (answer.includes("nose") || answer.includes("leg") || answer.includes("teas") || answer.includes("shame") || answer.includes("body") || answer.includes("peer") || answer.includes("classmate")) {
          score = Math.max(score, 9);
          feedback = "Excellent analysis! You accurately captured how classmate criticism of Alani's nose and legs triggered severe body-image issues and eroded her confidence.";
        } else if (wordCount >= 8) {
          feedback = "A neat interpretation. Be sure to consider how school peer comments on external features like a 'great big nose' alter a teenager's internal worth.";
        }
      } else if (checkpointId === 3) {
        score = Math.max(score, 8);
        feedback = "Superb verbal response! Your pronunciation of key words is clean and you've accurately explained the correlation between constant apologizing and low self-esteem.";
      } else if (checkpointId === 4) {
        if (answer.includes("makeup") || answer.includes("cosmetic") || answer.includes("contour") || answer.includes("shadow") || answer.includes("hide") || answer.includes("flaw") || answer.includes("mask")) {
          score = Math.max(score, 9);
          feedback = "Brilliant clue decryption! You've correctly linked her use of cosmetics and contouring shadow with an attempt to hide natural characteristics to fit in.";
        } else if (wordCount >= 8) {
          feedback = "Good response. Think about how beauty routines act as masks to cover up features criticized by others.";
        }
      } else if (checkpointId === 5) {
        if (answer.includes("fan belt") || answer.includes("exhaust") || answer.includes("tire") || answer.includes("wear") || answer.includes("spirit") || answer.includes("machine") || answer.includes("stress")) {
          score = Math.max(score, 9);
          feedback = "Excellent literary interpretation! The fan belt metaphor perfectly conveys the exhausting mechanical grind of constantly molding oneself for others.";
        } else if (wordCount >= 8) {
          feedback = "Thoughtful response. The 'fan belt' is a mechanical part that breaks under strain—apply that to a person's psychological limit.";
        }
      } else if (checkpointId === 6) {
        if (answer.includes("coy") || answer.includes("satire") || answer.includes("definition") || answer.includes("pretend") || answer.includes("play")) {
          score = Math.max(score, 9);
          feedback = "Precise semantic definition! Grasping how Alani had to act coy and wheedle reveals the core performative nature expected of her.";
        }
      } else if (checkpointId === 7) {
        if (answer.includes("casket") || answer.includes("coffin") || answer.includes("dead") || answer.includes("pretty") || answer.includes("cozy") || answer.includes("irony") || answer.includes("coffin") || answer.includes("pretty") || answer.includes("consummation")) {
          score = Math.max(score, 9);
          feedback = "Stellar critical evaluation! You clearly understand Marge Piercy's dark irony: she is only deemed beautiful, perfect, and peaceful when she is lifeless and artificial.";
        } else if (wordCount >= 8) {
          feedback = "Insightful answer. Pay attention to how society's compliment 'Doesn't she look pretty?' in the coffin reflects a tragic and hollow standard.";
        }
      }

      const isCorrect = score >= 8;

      return {
        simulated: true,
        quotaFallback: isQuotaFailure,
        score,
        correct: isCorrect,
        feedback,
        speakingMetrics: inputType === 'audio' ? {
          contentRelevance: score,
          grammar: Math.min(10, score + (Math.random() > 0.5 ? 1 : 0)),
          vocabulary: Math.min(10, score + (Math.random() > 0.5 ? 0 : 1)),
          fluency: Math.min(10, score - 1),
          confidence: Math.min(10, score)
        } : undefined
      };
    };

    if (!client) {
      return res.json(getFallbackCheckpointResult(false));
    }

    try {
      let prompt = "";
      let contents: any[] = [];

      if (inputType === 'audio' && audio) {
        const base64Data = audio.replace(/^data:audio\/\w+;base64,/, "");
        prompt = `You are a speaking examiner for English ESL learners (B1 level).
The student is answering this question for a Marge Piercy's "Barbie Doll" escape room checkpoint:
"${question}"

Assess their spoken answer in the audio recording based on:
1. Content Relevance (relevance to the question and poem)
2. Grammar accuracy
3. Vocabulary choice
4. Fluency
5. Confidence

Return a JSON object with this exact structure:
{
  "score": number (overall score out of 10),
  "correct": boolean (true if score >= 8, else false),
  "feedback": "string containing detailed pedagogical feedback",
  "speakingMetrics": {
    "contentRelevance": number (out of 10),
    "grammar": number (out of 10),
    "vocabulary": number (out of 10),
    "fluency": number (out of 10),
    "confidence": number (out of 10)
  }
}`;
        contents = [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: 'audio/webm',
                  data: base64Data
                }
              },
              {
                text: prompt
              }
            ]
          }
        ];
      } else {
        // Text-based response evaluation
        prompt = `You are an ESL learning evaluator assessing a Form 4 student (CEFR B1 level) answering a checkpoint in "The Barbie Doll Mystery Escape Room".
Question: "${question}"
Student's Answer: "${studentAnswer || '[No response provided]'}"

Assess their answer's reading comprehension, analytical insight, and writing quality based on Marge Piercy's poem "Barbie Doll".
Return a JSON object in this exact structure:
{
  "score": number (score out of 10, be encouraging but fair. Give at least 7-8 if they show reasonable B1 understanding),
  "correct": boolean (true if score >= 8, else false),
  "feedback": "string containing constructive, encouraging, brief feedback on their answer"
}`;
        contents = [prompt];
      }

      const geminiResponse = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contents,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const rawText = geminiResponse.text || "{}";
      const result = JSON.parse(rawText.trim());
      res.json(result);

    } catch (err: any) {
      console.error("Error in assess-checkpoint API, initiating graceful fallback:", err);
      res.json(getFallbackCheckpointResult(true));
    }
  });

  // Serve static assets or mount Vite dev server
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);
    app.get('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const indexHtmlPath = path.resolve('index.html');
        let html = fs.readFileSync(indexHtmlPath, 'utf-8');
        html = await vite.transformIndexHtml(url, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

startServer().catch(err => {
  console.error("Server startup error:", err);
});
