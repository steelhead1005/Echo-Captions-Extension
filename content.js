(function() {
    const browser = window.browser || window.chrome;
    'use strict';
    function openTranscriptPanel() {
        // Try to find and click the transcript button
        const transcriptBtn = document.querySelector('#transcripts-tab');
        
        if (transcriptBtn) {
            transcriptBtn.click();
            console.log("[EchoDebug] Transcript panel opened.");
            return true;
        }

        console.log("[EchoDebug] Transcript button not found, retrying...");
        return false;
    }

    function waitForTranscriptBtn() {
        if (!openTranscriptPanel()) {
            setTimeout(waitForTranscriptBtn, 1000);
        }
    }

    function initCaptions() {
        const defaultContainer = document.querySelector('#player');
        
        // THE FIX: If player isn't loaded yet, try again in 1 second
        if (!defaultContainer) {
            console.log("[EchoDebug] Waiting for player to load...");
            setTimeout(initCaptions, 1000);
            return; 
        }

        console.log("[EchoDebug] Player found! Injecting bubble.");

        defaultContainer.style.position = 'relative'; 
        

        const captionBox = document.createElement('div');
        captionBox.style.cssText = `
            position: absolute;
            bottom: 10%;
            width: 100%;
            text-align: center;
            pointer-events: none;
            z-index: 2147483647; 
        `;

        const captionText = document.createElement('span');
        captionText.style.cssText = `
            background-color: rgba(0, 0, 0, 0.75);
            color: yellow; 
            padding: 4px 8px;
            font-size: 24px;
            font-family: sans-serif;
            border-radius: 4px;
            display: inline-block;
            max-width: 80%;
        `;
        let currentStyles = {
            fontColour: 'white',
            fontFamily: 'sans-serif',
            fontSizePercent: 24,
            bgColour: 'rgba(0, 0, 0, 0.75)'
        };

        function applyStyles() {
            captionText.style.color = currentStyles.fontColour;
            captionText.style.fontFamily = currentStyles.fontFamily;
            captionText.style.fontSize = currentStyles.fontSizePercent + 'px';
            captionText.style.backgroundColor = currentStyles.bgColour;
        }

        (window.browser || window.chrome).storage.sync.get(['fontFamily', 'fontColour', 'fontSizePercent', 'bgColour'], (result) => {
            if (result.fontFamily)      currentStyles.fontFamily      = result.fontFamily;
            if (result.fontColour)      currentStyles.fontColour      = result.fontColour;
            if (result.fontSizePercent) currentStyles.fontSizePercent = result.fontSizePercent;
            if (result.bgColour)        currentStyles.bgColour        = result.bgColour;
            applyStyles();
        });
        captionText.innerText = "[Waiting to sync...]"; 

        captionBox.appendChild(captionText);
        defaultContainer.appendChild(captionBox);

        // --- THE FULLSCREEN LISTENER ---
        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                document.fullscreenElement.appendChild(captionBox);
            } else {
                defaultContainer.appendChild(captionBox);
            }
        });

        let lastSpokenText = "";
        let hasEverFoundIcon = false;
        let lastSpokenTime = null;
        const CLEAR_AFTER_MS = 5000;

        // --- THE INTERVAL LOGIC ---
        setInterval(() => {
            const icon = document.querySelector('svg[data-test-name="status-filled"]');

            if (!icon && !hasEverFoundIcon) {
                if (document.fullscreenElement) {
                    captionText.innerText = "[Error: Transcript hidden in Fullscreen]";
                    captionText.style.color = "red";
                } else {
                    captionText.innerText = "[Waiting for active icon...]";
                    captionText.style.color = "orange";
                }
                // Don't return early — still need to check the timeout below
            } else {
                hasEverFoundIcon = true;

                const iconWrapperDiv = icon.parentElement;
                const textContainerDd = iconWrapperDiv.nextElementSibling;
                if (textContainerDd) {
                    const span = textContainerDd.querySelector('span');
                    const newText = span ? span.innerText.trim() : textContainerDd.innerText.trim();
                    if (newText !== "" && newText !== lastSpokenText) {
                        lastSpokenText = newText;
                        lastSpokenTime = Date.now();
                        captionText.innerText = lastSpokenText;
                        applyStyles();
                    }
                } else {
                    captionText.innerText = "[Error: Traversal failed, can't find <dd>]";
                    captionText.style.color = "red";
                }
            }

            // Clear text if nothing new has been said for a while
            if (hasEverFoundIcon && lastSpokenTime && Date.now() - lastSpokenTime > CLEAR_AFTER_MS) {
                captionText.innerText = "";
            }

        }, 250); 

        let isVisible = true;

        // Listen for messages from the popup menu
        browser.runtime.onMessage.addListener((message) => {
        if (message.action === "toggleVisibility") {
            isVisible = !isVisible;
            
            // Use CSS display to completely hide or show the caption box
            if (isVisible) {
                captionBox.style.display = 'block';
            } else {
                captionBox.style.display = 'none';
            }
        }
        if (message.action === 'updateStyles') {
            currentStyles.fontColour = message.fontColour;
            currentStyles.fontFamily = message.fontFamily;
            currentStyles.fontSizePercent = message.fontSizePercent + 'px';
            currentStyles.bgColour = message.bgColour;
            applyStyles();
        }
    });
    }
    waitForTranscriptBtn();
    // Kick off the loop when the script runs
    initCaptions();
    

})();

