(function() {
    'use strict';

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

        // --- THE INTERVAL LOGIC ---
        setInterval(() => {
            const icon = document.querySelector('svg[data-test-name="status-filled"]');
            
            if (!icon) {
                if (document.fullscreenElement) {
                    captionText.innerText = "[Error: Transcript hidden in Fullscreen]";
                    captionText.style.color = "red";
                } else {
                    // It will show this briefly when scrubbing through the video
                    captionText.innerText = "[Waiting for active icon...]";
                    captionText.style.color = "orange";
                }
                return;
            }
            
            const iconWrapperDiv = icon.parentElement;
            const textContainerDd = iconWrapperDiv.nextElementSibling;

            if (textContainerDd) {
                const span = textContainerDd.querySelector('span');
                const newText = span ? span.innerText.trim() : textContainerDd.innerText.trim();

                if (newText !== "" && newText !== lastSpokenText) {
                    lastSpokenText = newText;
                    captionText.innerText = lastSpokenText;
                    captionText.style.color = "white"; // Turns white when working!
                }
            } else {
                 captionText.innerText = "[Error: Traversal failed, can't find <dd>]";
                 captionText.style.color = "red";
            }
        }, 250); 
    }

    // Kick off the loop when the script runs
    initCaptions();

})();