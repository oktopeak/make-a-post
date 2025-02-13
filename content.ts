chrome.runtime.onMessage.addListener((request, sender, senderResponse) => {
    if (request.action === "getContent") {
        const title = document.title;
        const url = window.location.href;
        const textContent = document.body.innerText.slice(0, 500);
        console.log({
            title, url, textContent
        })
        senderResponse({ title, url, textContent })

    }
})