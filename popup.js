const toggleBtn = document.getElementById('toggleBtn');
const fontSelect = document.getElementById('fontSelect');
const fontColourSelect = document.getElementById('fontColourSelect');
const fontSizeSelect = document.getElementById('fontSizeSelect');
const bgColourSelect = document.getElementById('bgColourSelect');

// Load saved settings when popup opens
document.addEventListener('DOMContentLoaded', () => {
    browser.storage.sync.get(['fontFamily', 'fontColour', 'fontSizePercent', 'bgColour'])
        .then((result) => {
            if (result.fontFamily)      fontSelect.value = result.fontFamily;
            if (result.fontColour)      fontColourSelect.value = result.fontColour;
            if (result.fontSizePercent) fontSizeSelect.value = result.fontSizePercent;
            if (result.bgColour)        bgColourSelect.value = result.bgColour;
        });
});

// Toggle caption visibility
toggleBtn.addEventListener('click', () => {
    browser.tabs.query({ active: true, currentWindow: true })
        .then((tabs) => {
            browser.tabs.sendMessage(tabs[0].id, { action: 'toggleVisibility' });
        });
});

// Save and apply font family
fontSelect.addEventListener('change', () => {
    browser.storage.sync.set({ fontFamily: fontSelect.value });
    sendUpdate();
});

// Save and apply font colour
fontColourSelect.addEventListener('change', () => {
    browser.storage.sync.set({ fontColour: fontColourSelect.value });
    sendUpdate();
});

// Save and apply font size
fontSizeSelect.addEventListener('change', () => {
    browser.storage.sync.set({ fontSizePercent: fontSizeSelect.value });
    sendUpdate();
});

// Save and apply background colour
bgColourSelect.addEventListener('change', () => {
    browser.storage.sync.set({ bgColour: bgColourSelect.value });
    sendUpdate();
});

// Send all current settings to the content script
function sendUpdate() {
    browser.tabs.query({ active: true, currentWindow: true })
        .then((tabs) => {
            browser.tabs.sendMessage(tabs[0].id, {
                action: 'updateStyles',
                fontFamily:      fontSelect.value,
                fontColour:      fontColourSelect.value,
                fontSizePercent: fontSizeSelect.value,
                bgColour:        bgColourSelect.value,
            });
        });
}