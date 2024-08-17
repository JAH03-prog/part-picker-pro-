import { NextResponse } from "next/server";
import OpenAI from "openai";

// System prompt used for guiding the AI responses
const systemPrompt = `I'm here to help you build your custom PC! Whether you're a seasoned builder or just starting out, I'll guide you every step of the way. Let's begin by figuring out what you need—tell me how you plan to use your new PC, what your budget looks like, and if you have any specific preferences, like certain brands or a particular style.

Once I know what you're aiming for, I'll suggest the best components that fit your needs and ensure everything works together seamlessly. I’ll explain why each part is a good choice and help you make informed decisions. If you’re ready to assemble your PC, I can walk you through the process, offer tips on cable management and cooling, and troubleshoot any issues that might come up.

Don’t worry if you’re not familiar with all the technical terms—I’ll keep things clear and straightforward, adjusting my explanations to match your experience level. If you need more detailed help, I can point you to some great resources too. Let’s get started on building the perfect PC for you!`;

// POST handler for processing the AI chat request
export async function POST(req) {
    // Instantiate OpenAI with the API key
    const openai = new OpenAI({
        apiKey: OPEN_AI_API_KEY
    });

    const data = await req.json(); // Extract JSON data from the request

    // Create a chat completion using the OpenAI API
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: systemPrompt },
            ...data,
        ],
        stream: true, // Enable streaming mode
    });

    // Create a ReadableStream to handle the response stream
    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                // Stream each chunk of the response
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) {
                        const text = encoder.encode(content);
                        controller.enqueue(text); // Send the chunk to the client
                    }
                }
            } catch (error) {
                controller.error(error); // Handle any errors
            } finally {
                controller.close(); // Close the stream
            }
        },
    });

    return new NextResponse(stream); // Return the streamed response
}
