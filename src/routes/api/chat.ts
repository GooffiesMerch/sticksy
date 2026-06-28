import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SUPPORT_EMAIL = "hamzakayani371@gmail.com";

const SYSTEM_PROMPT = `You are Sticksy Support, a friendly AI assistant for Sticksy — a Pakistan-based store that sells premium vinyl stickers for split AC indoor units (cars, anime, football, Marvel themes, plus fully custom designs).

What you can help with:
- Product info, themes/collections, sizes, materials (durable AC-grade vinyl)
- How to apply / peel / care for stickers
- Custom sticker upload flow and turnaround
- Shipping within Pakistan, order tracking guidance, payment options
- General questions about using the storefront

Tone: warm, concise, helpful. Use markdown. Keep answers short (1–4 short paragraphs or a small list). Never invent prices, order numbers, tracking IDs, refund amounts, or policies you don't know.

ESCALATION RULE — very important:
If the customer asks something you genuinely cannot answer (specific order status, refund/exchange decisions, complaints, custom bulk pricing, anything requiring the owner Hamza), do NOT make up an answer.
Instead reply with a brief apology and end your message with EXACTLY this markdown line on its own (replace the placeholders, keep the format):

[📧 Email Hamza directly](mailto:${SUPPORT_EMAIL}?subject=Sticksy%20support%20request&body=ENCODED_BODY_HERE)

Build ENCODED_BODY_HERE by URL-encoding a short summary of the customer's question and any context they provided (name, order number, etc.). The customer will click this link and their email app will open pre-filled to Hamza.

Always escalate (using the link above) for: order status, refunds, damaged items, shipping problems, anything urgent, or anything you are unsure about.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const MAX_BODY_BYTES = 64 * 1024; // 64KB total request body
        const MAX_MESSAGES = 30;
        const MAX_CHARS_PER_MESSAGE = 2000;

        const contentLength = Number(request.headers.get("content-length") ?? 0);
        if (contentLength && contentLength > MAX_BODY_BYTES) {
          return new Response("Request body too large", { status: 413 });
        }

        const rawBody = await request.text();
        if (rawBody.length > MAX_BODY_BYTES) {
          return new Response("Request body too large", { status: 413 });
        }

        let parsed: { messages?: unknown };
        try {
          parsed = JSON.parse(rawBody);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const { messages } = parsed;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        if (messages.length > MAX_MESSAGES) {
          return new Response("Too many messages", { status: 400 });
        }
        const tooLong = (messages as UIMessage[]).some((m) =>
          m?.parts?.some((p) => p.type === "text" && typeof p.text === "string" && p.text.length > MAX_CHARS_PER_MESSAGE)
        );
        if (tooLong) {
          return new Response("Message too long", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }



        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
