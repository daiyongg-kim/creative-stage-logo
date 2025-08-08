/**
 * Creative Stage Art - Profile Generator
 * JavaScript functionality for downloading profile images
 */

// Create SVG version of profile for download
function createSVGProfile(type) {
    const size = 400;
    const isCircle = type === 'circle';
    
    // SVG template
    const svgTemplate = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#ff6b9d"/>
                    <stop offset="16.66%" stop-color="#4ecdc4"/>
                    <stop offset="33.33%" stop-color="#45b7d1"/>
                    <stop offset="50%" stop-color="#f9ca24"/>
                    <stop offset="66.66%" stop-color="#f0932b"/>
                    <stop offset="83.33%" stop-color="#eb4d4b"/>
                    <stop offset="100%" stop-color="#6c5ce7"/>
                </linearGradient>
                <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffefba"/>
                    <stop offset="50%" stop-color="#ffffff"/>
                    <stop offset="100%" stop-color="#a8e6cf"/>
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            
            <!-- Background -->
            <rect width="${size}" height="${size}" fill="url(#bg-gradient)" ${isCircle ? `rx="${size/2}"` : 'rx="20"'}/>
            
            <!-- Container -->
            <g transform="translate(${size/2}, ${size/2})">
                <!-- Rainbow -->
                <path d="M -60 20 A 60 60 0 0 1 60 20" stroke="url(#rainbow)" stroke-width="12" fill="none" stroke-linecap="round"/>
                <path d="M -45 20 A 45 45 0 0 1 45 20" stroke="url(#bg-gradient)" stroke-width="8" fill="none"/>
                
                <!-- Lightbulb -->
                <g transform="translate(0, -10)">
                    <ellipse cx="0" cy="-15" rx="18" ry="22" fill="#ffd700" filter="url(#glow)"/>
                    <rect x="-12" y="7" width="24" height="8" rx="3" fill="#e6c200"/>
                    <rect x="-10" y="12" width="20" height="3" rx="2" fill="#ccac00"/>
                    <!-- Light rays -->
                    <g stroke="#ffd700" stroke-width="2" stroke-linecap="round" opacity="0.7">
                        <line x1="-35" y1="-15" x2="-25" y2="-15"/>
                        <line x1="25" y1="-15" x2="35" y2="-15"/>
                        <line x1="-25" y1="-35" x2="-20" y2="-28"/>
                        <line x1="20" y1="-28" x2="25" y2="-35"/>
                        <line x1="0" y1="-45" x2="0" y2="-38"/>
                    </g>
                </g>
                
                <!-- Brand Name -->
                <text x="0" y="60" text-anchor="middle" font-family="'Comic Neue', cursive" font-size="32" font-weight="900" fill="url(#rainbow)">
                    Creative Stage
                </text>
                
                <!-- Tagline -->
                <text x="0" y="85" text-anchor="middle" font-family="'Comic Neue', cursive" font-size="14" font-weight="600" fill="#666">
                    ${isCircle ? 'ART • LEARN • GROW' : 'PRESCHOOL • AFTERSCHOOL'}
                </text>
                
                <!-- Stars decoration -->
                <text x="-80" y="-60" font-size="20" fill="#ffd700">✨</text>
                <text x="80" y="-40" font-size="16" fill="#ff6b9d">✨</text>
                <text x="-70" y="80" font-size="18" fill="#4ecdc4">✨</text>
                <text x="75" y="75" font-size="14" fill="#a8e6cf">✨</text>
            </g>
        </svg>
    `;
    
    return svgTemplate;
}

// Convert SVG to downloadable image
async function downloadProfile(type) {
    showLoadingState(type);
    
    try {
        // Create SVG
        const svgString = createSVGProfile(type);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        
        // Try to create PNG using canvas method
        try {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = 800;  // High resolution
                canvas.height = 800;
                
                // White background
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw SVG
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Download PNG
                canvas.toBlob((blob) => {
                    const link = document.createElement('a');
                    link.download = `creative-stage-${type}-profile-${getCurrentTimestamp()}.png`;
                    link.href = URL.createObjectURL(blob);
                    link.click();
                    
                    // Cleanup
                    URL.revokeObjectURL(url);
                    URL.revokeObjectURL(link.href);
                    
                    showSuccessMessage(type);
                    trackDownload(type);
                }, 'image/png', 1.0);
            };
            
            img.onerror = () => {
                // Fallback: download SVG directly
                downloadSVGDirect(svgBlob, type);
            };
            
            img.src = url;
            
        } catch (canvasError) {
            console.log('Canvas method failed, downloading SVG:', canvasError);
            downloadSVGDirect(svgBlob, type);
        }
        
    } catch (error) {
        console.error('Download failed:', error);
        showErrorMessage('Download failed');
        showManualDownloadGuide(type);
    } finally {
        resetButtonStates();
    }
}

// Fallback: Download SVG directly
function downloadSVGDirect(svgBlob, type) {
    const link = document.createElement('a');
    link.download = `creative-stage-${type}-profile-${getCurrentTimestamp()}.svg`;
    link.href = URL.createObjectURL(svgBlob);
    link.click();
    
    URL.revokeObjectURL(link.href);
    
    showSuccessMessage(type);
    trackDownload(type);
}

// Show loading state on buttons
function showLoadingState(type) {
    const buttons = document.querySelectorAll('.download-btn');
    buttons.forEach(button => {
        if (button.textContent.includes(type === 'circle' ? '원형' : '사각형')) {
            button.dataset.originalText = button.textContent;
            button.textContent = '다운로드 중... 🎨';
            button.disabled = true;
        }
    });
}

// Reset button states
function resetButtonStates() {
    const buttons = document.querySelectorAll('.download-btn');
    buttons.forEach(button => {
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
            delete button.dataset.originalText;
            button.disabled = false;
        }
    });
}

// Show manual download guide
function showManualDownloadGuide(type) {
    const guide = document.createElement('div');
    guide.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 400px;
        text-align: center;
        font-family: 'Comic Neue', cursive, sans-serif;
    `;
    
    const lang = currentLanguage;
    const typeLabel = type === 'circle' ? 
        (lang === 'ko' ? '원형' : 'circle') : 
        (lang === 'ko' ? '사각형' : 'square');
    
    guide.innerHTML = `
        <h3 style="color: #8e44ad; margin-bottom: 20px; font-size: 24px;">${translations[lang].manualTitle}</h3>
        <div style="margin-bottom: 20px; font-size: 16px; line-height: 1.6;">
            <p><strong>${lang === 'ko' ? '1단계:' : 'Step 1:'}</strong> ${typeLabel} ${translations[lang].manualStep1}</p>
            <p><strong>${lang === 'ko' ? '2단계:' : 'Step 2:'}</strong> ${translations[lang].manualStep2}</p>
            <p><strong>${lang === 'ko' ? '3단계:' : 'Step 3:'}</strong> ${translations[lang].manualStep3}</p>
        </div>
        <div style="margin-bottom: 20px;">
            <p style="font-size: 14px; color: #666;">${translations[lang].manualTip}</p>
        </div>
        <button onclick="this.parentNode.remove()" style="
            background: linear-gradient(45deg, #ff6b9d, #4ecdc4);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
        ">${lang === 'ko' ? '확인' : 'OK'}</button>
    `;
    
    document.body.appendChild(guide);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
        if (guide.parentNode) {
            guide.remove();
        }
    }, 10000);
}

// Show success message
function showSuccessMessage(type) {
    const message = createNotification(
        `🎉 ${type === 'circle' ? '원형' : '사각형'} 프로필이 성공적으로 다운로드되었습니다!`,
        'success'
    );
    showNotification(message);
}

// Show error message
function showErrorMessage(errorText) {
    const message = createNotification(
        `❌ ${errorText}`,
        'error'
    );
    showNotification(message);
}

// Create notification element
function createNotification(text, type) {
    const notification = document.createElement('div');
    
    const colors = {
        success: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
        error: 'linear-gradient(45deg, #ff6b9d, #ff8a80)',
        info: 'linear-gradient(45deg, #95e1d3, #a8e6cf)'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        z-index: 1000;
        max-width: 350px;
        animation: slideIn 0.5s ease-out;
        cursor: pointer;
        font-family: 'Comic Neue', cursive, sans-serif;
    `;
    
    notification.innerHTML = text;
    
    // Add click to dismiss
    notification.addEventListener('click', () => {
        dismissNotification(notification);
    });
    
    return notification;
}

// Show notification with auto-dismiss
function showNotification(notification) {
    // Add CSS animations if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            dismissNotification(notification);
        }
    }, 5000);
}

// Dismiss notification
function dismissNotification(notification) {
    notification.style.animation = 'slideOut 0.5s ease-out';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 500);
}

// Language switching functionality
let currentLanguage = 'ko'; // Default language

// Language text data
const translations = {
    ko: {
        mainTitle: 'Creative Stage Art',
        subtitle: '프로필 사진 생성기',
        circleLabel: '원형 프로필 (SNS용)',
        squareLabel: '사각형 프로필 (비즈니스용)',
        downloadCircle: '📱 원형 다운로드',
        downloadSquare: '💼 사각형 다운로드',
        usageTitle: '🎯 사용 용도',
        usageCircle: '원형: Instagram, Facebook, Twitter 프로필',
        usageSquare: '사각형: LinkedIn, 비즈니스 카드, 웹사이트',
        footerText: 'Creative Stage Art를 위해 💖으로 만들어졌습니다',
        githubText: 'GitHub 저장소',
        downloading: '다운로드 중... 🎨',
        downloadSuccess: '프로필이 성공적으로 다운로드되었습니다!',
        downloadError: '다운로드 실패. 대안 방법을 시도해보세요.',
        manualTitle: '📸 수동 다운로드 방법',
        manualStep1: '프로필을 마우스 우클릭',
        manualStep2: '"이미지를 다른 이름으로 저장" 클릭',
        manualStep3: '원하는 위치에 저장',
        manualTip: '💡 또는 스크린샷을 찍어서 이미지 편집 프로그램에서 잘라내기'
    },
    en: {
        mainTitle: 'Creative Stage Art',
        subtitle: 'Profile Picture Generator',
        circleLabel: 'Circle Profile (for SNS)',
        squareLabel: 'Square Profile (for Business)',
        downloadCircle: '📱 Download Circle',
        downloadSquare: '💼 Download Square',
        usageTitle: '🎯 Usage Guide',
        usageCircle: 'Circle: Instagram, Facebook, Twitter profiles',
        usageSquare: 'Square: LinkedIn, business cards, websites',
        footerText: 'Made with 💖 for Creative Stage Art',
        githubText: 'GitHub Repository',
        downloading: 'Downloading... 🎨',
        downloadSuccess: 'Profile downloaded successfully!',
        downloadError: 'Download failed. Please try alternative method.',
        manualTitle: '📸 Manual Download Guide',
        manualStep1: 'Right-click on the profile',
        manualStep2: 'Click "Save image as"',
        manualStep3: 'Save to desired location',
        manualTip: '💡 Or take a screenshot and crop using image editor'
    }
};

// Switch language function
function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // Update all text elements
    document.querySelectorAll('[data-ko][data-en]').forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            if (element.tagName === 'STRONG') {
                element.textContent = text;
            } else {
                element.innerHTML = text;
            }
        }
    });
    
    // Update download buttons text content
    const circleBtn = document.querySelector('[onclick="downloadProfile(\'circle\')"]');
    const squareBtn = document.querySelector('[onclick="downloadProfile(\'square\')"]');
    
    if (circleBtn && !circleBtn.disabled) {
        circleBtn.innerHTML = translations[lang].downloadCircle;
    }
    if (squareBtn && !squareBtn.disabled) {
        squareBtn.innerHTML = translations[lang].downloadSquare;
    }
    
    // Save language preference
    localStorage.setItem('preferredLanguage', lang);
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', function() {
    // Get saved language preference or use browser language
    const savedLang = localStorage.getItem('preferredLanguage');
    const browserLang = navigator.language || navigator.userLanguage;
    const defaultLang = savedLang || (browserLang.startsWith('ko') ? 'ko' : 'en');
    
    switchLanguage(defaultLang);
    
    // Add event listeners to language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchLanguage(btn.dataset.lang);
        });
    });
});

// Update loading state function to support multiple languages
function showLoadingState(type) {
    const buttons = document.querySelectorAll('.download-btn');
    buttons.forEach(button => {
        const buttonType = button.textContent.includes('원형') || button.textContent.includes('Circle') ? 'circle' : 'square';
        if (buttonType === type) {
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = translations[currentLanguage].downloading;
            button.disabled = true;
        }
    });
}

// Update success message function
function showSuccessMessage(type) {
    const message = createNotification(
        `🎉 ${translations[currentLanguage].downloadSuccess}`,
        'success'
    );
    showNotification(message);
}

// Update error message function  
function showErrorMessage(errorText) {
    const message = createNotification(
        `❌ ${translations[currentLanguage].downloadError}`,
        'error'
    );
    showNotification(message);
}

// Get current timestamp for filename
function getCurrentTimestamp() {
    const now = new Date();
    return now.getFullYear() + 
           ('0' + (now.getMonth() + 1)).slice(-2) + 
           ('0' + now.getDate()).slice(-2) + '_' +
           ('0' + now.getHours()).slice(-2) + 
           ('0' + now.getMinutes()).slice(-2) + 
           ('0' + now.getSeconds()).slice(-2);
}

// Track download for analytics (optional)
function trackDownload(type) {
    console.log(`Downloaded: ${type} profile at ${new Date().toISOString()}`);
    // Add analytics tracking here if needed
}
