chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log("Message received in background:", request);

    if (request.action === "sendToOpenAI") {
        if (!request.apiKey) {
            sendResponse({ error: "No API key provided." });
            return;
        }
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${request.apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                        { role: "system", content: "You are an AI that summarizes web content into LinkedIn posts." },
                        { role: "user", content: `Summarize this content as a LinkedIn post:\n\nTitle: ${request.title}\nURL: ${request.url}\nContent: ${request.textContent}` }
                    ],
                    max_tokens: 150
                })
            });

            const data = await response.json();
            console.log("OpenAI Response:", data);

            sendResponse({ aiResponse: data.choices[0].message.content });
        } catch (error) {
            console.error("Error contacting OpenAI:", error);
            // sendResponse({ error: error.message });
        }
    }

    return true; // Keeps sendResponse open for async messages
});
