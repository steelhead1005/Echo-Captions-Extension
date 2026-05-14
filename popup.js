document.getElementById('toggleBtn').addEventListener('click', async () => {
    // 1. Find the active tab the user is currently looking at
    let tabs = await browser.tabs.query({active: true, currentWindow: true});
    
    // 2. Send a "toggle" message to the content.js script running on that specific tab
    if (tabs[0]) {
        browser.tabs.sendMessage(tabs[0].id, { command: "toggle_captions" });
    }
});