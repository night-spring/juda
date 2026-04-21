// Advanced scroll prevention for Streamlit
(function() {
    'use strict';
    
    let lastScrollPos = 0;
    let isLocked = false;
    let lockTimeout = null;
    
    // Store scroll position before any interaction
    function saveScrollPosition() {
        lastScrollPos = window.scrollY || document.documentElement.scrollTop;
    }
    
    // Restore scroll position
    function restoreScrollPosition() {
        if (isLocked) {
            setTimeout(() => {
                window.scrollTo(0, lastScrollPos);
            }, 50);
        }
    }
    
    // Enable scroll lock when user submits chat
    function lockScroll() {
        isLocked = true;
        saveScrollPosition();
        
        // Clear existing timeout
        if (lockTimeout) {
            clearTimeout(lockTimeout);
        }
        
        // Hold lock for 4 seconds (covers Streamlit rerun)
        lockTimeout = setTimeout(() => {
            isLocked = false;
        }, 4000);
    }
    
    // Listen for Enter key in chat input
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            const activeEl = document.activeElement;
            
            // Check if in chat input area
            if (activeEl && (
                activeEl.closest('[data-testid="stChatInputContainer"]') ||
                activeEl.closest('textarea') ||
                activeEl.tagName === 'TEXTAREA'
            )) {
                lockScroll();
            }
        }
    }, { capture: true, passive: true });
    
    // Listen for button clicks (send button)
    document.addEventListener('click', function(e) {
        const button = e.target.closest('button');
        if (button && (button.textContent.includes('Send') || button.textContent.includes('send'))) {
            lockScroll();
        }
    }, { capture: true, passive: true });
    
    // Continuously restore position while locked
    const restoreInterval = setInterval(() => {
        if (isLocked && Math.abs(window.scrollY - lastScrollPos) > 5) {
            restoreScrollPosition();
        }
    }, 50);
    
    // Override window.scrollTo to prevent jumps
    const originalScrollTo = window.scrollTo;
    window.scrollTo = function(x, y) {
        if (isLocked) {
            return; // Block scroll attempts while locked
        }
        return originalScrollTo.call(window, x, y);
    };
    
    // Override Element.scrollIntoView
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function(options) {
        // Don't scroll chat messages into view
        if (isLocked || this.classList.contains('stChatMessage')) {
            return;
        }
        return originalScrollIntoView.call(this, options);
    };
    
    // Disable page scroll with CSS injection
    const style = document.createElement('style');
    style.innerHTML = `
        html, body {
            scroll-behavior: auto !important;
        }
        
        /* Override any smooth scroll */
        * {
            scroll-behavior: auto !important;
        }
        
        /* Prevent message focusing/highlighting */
        .stChatMessage {
            scroll-margin: 0 !important;
            scroll-padding: 0 !important;
            pointer-events: auto;
        }
        
        /* Ensure container respects scroll position */
        .main {
            overflow-y: visible !important;
        }
        
        /* Disable smooth scroll on anchors */
        a {
            scroll-behavior: auto !important;
        }
    `;
    
    // Append style to head
    if (document.head) {
        document.head.appendChild(style);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            document.head.appendChild(style);
        });
    }
    
    // Log for debugging
    console.log('Scroll prevention system initialized');
})();
