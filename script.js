/**
 * Creative Stage Art - Profile Generator
 * JavaScript functionality for downloading profile images
 */

// Alternative download method with wrapper container (IMPROVED)
async function downloadProfileAlternative(type) {
    const originalElement = type === 'circle' 
        ? document.querySelector('.profile-circle') 
        : document.querySelector('.square-version');
    
    if (!originalElement) {
        showErrorMessage('Profile element not found');
        return;
    }
    
    // Create wrapper container with generous padding
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        padding: 50px;
        background: transparent;
        display: inline-block;
        position: fixed;
        top: -9999px;
        left: -9999px;
        z-index: -1;
    `;
    
    // Clone the element with all styles
    const clonedElement = originalElement.cloneNode(true);
    wrapper.appendChild(clonedElement);
    document.body.appendChild(wrapper);
    
    try {
        const canvas = await html2canvas(wrapper, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            imageTimeout: 15000
        });
        
        // Convert and download
        const link = document.createElement('a');
        link.download = `creative-stage-${type}-profile-${getCurrentTimestamp()}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccessMessage(type);
        trackDownload(type);
        
    } catch (error) {
        console.error('Alternative download error:', error);
        throw error;
    } finally {
        // Clean up
        if (wrapper.parentNode) {
            document.body.removeChild(wrapper);
        }
    }
}

// Main download function with multiple fallbacks
async function downloadProfile(type) {
    const element = type === 'circle' 
        ? document.querySelector('.profile-circle') 
        : document.querySelector('.square-version');
    
    if (!element) {
        showErrorMessage('Profile element not found');
        return;
    }
    
    // Show loading state
    showLoadingState(type);
    
    try {
        // Try alternative method first (better for capturing full element)
        await downloadProfileAlternative(type);
        return;
        
    } catch (primaryError) {
        console.log('Primary method failed, trying fallback...');
        
        try {
            // Fallback method with expanded capture area
            const rect = element.getBoundingClientRect();
            const canvas = await html2canvas(document.body, {
                x: rect.left - 50,
                y: rect.top - 50, 
                width: rect.width + 100,
                height: rect.height + 100,
                backgroundColor: null,
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                imageTimeout: 15000
            });
            
            // Convert and download
            const link = document.createElement('a');
            link.download = `creative-stage-${type}-profile-${getCurrentTimestamp()}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showSuccessMessage(type);
            trackDownload(type);
            
        } catch (fallbackError) {
            console.error('Both download methods failed:', fallbackError);
            showErrorMessage('다운로드 실패. 대안 방법을 시도해보세요.');
            showManualDownloadGuide(type);
        }
    } finally {
        resetButtonStates();
    }
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
            button.textContent = button.dataset.originalText;
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
    
    guide.innerHTML = `
        <h3 style="color: #8e44ad; margin-bottom: 20px; font-size: 24px;">📸 수동 다운로드 방법</h3>
        <div style="margin-bottom: 20px; font-size: 16px; line-height: 1.6;">
            <p><strong>1단계:</strong> ${type === 'circle' ? '원형' : '사각형'} 프로필을 <strong>마우스 우클릭</strong></p>
            <p><strong>2단계:</strong> "이미지를 다른 이름으로 저장" 클릭</p>
            <p><strong>3단계:</strong> 원하는 위치에 저장</p>
        </div>
        <div style="margin-bottom: 20px;">
            <p style="font-size: 14px; color: #666;">💡 또는 스크린샷을 찍어서 이미지 편집 프로그램에서 잘라내기</p>
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
        ">확인</button>
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
