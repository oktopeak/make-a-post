document.addEventListener("DOMContentLoaded", () => {
    const apiKeyInput = document.getElementById("apiKey") as HTMLInputElement;
    const saveApiKeyButton = document.getElementById("saveApiKey")!;
    // Load saved API key
    chrome.storage.local.get("apiKey", (data) => {
        if (data.apiKey) {
            apiKeyInput.value = data.apiKey;
        }
    });

    // Save API Key
    saveApiKeyButton.addEventListener("click", () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            chrome.storage.local.set({ apiKey }, () => {
                alert("API Key saved!");
            });
        }
    });

    document.getElementById('generate')!.addEventListener('click', () => {
        console.log('chrome', chrome)

        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, (tabs: chrome.tabs.Tab[]) => {
            console.log(tabs)
            if (!tabs || tabs.length === 0 || !tabs[0].id) return;

            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: extractPageContent
            }, (results) => {
                if (results && results[0] && results[0].result) {
                    const { title, url, textContent } = results[0].result;
                    console.log("Extracted Content:", { title, url, textContent });
                    chrome.storage.local.get("apiKey", (data) => {
                        if (!data.apiKey) {
                            alert("Please enter an OpenAI API Key first!");
                            return;
                        }

                        // Send request to background script
                        chrome.runtime.sendMessage({
                            action: "sendToOpenAI",
                            apiKey: data.apiKey,
                            title,
                            url,
                            textContent
                        }, (response) => {
                            if (response && response.aiResponse) {
                                (document.getElementById("postContent") as HTMLTextAreaElement).value = response.aiResponse;
                            }
                        });
                    });
                }
            })
        })
    })
});
function extractPageContent() {
    return {
        title: document.title,
        url: window.location.href,
        textContent: document.body.innerText.slice(0, 500)
    }
}