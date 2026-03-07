// ===== Tab Navigation =====
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active from all tabs
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        // Activate selected tab
        btn.classList.add('active');
        const tabId = 'tab-' + btn.dataset.tab;
        document.getElementById(tabId).classList.add('active');
    });
});

// ===== Sound Play =====
function soundPlay(index) {
    const audio = document.getElementById('fart' + index);
    const card = document.querySelector(`[data-sound="${index}"]`);

    // Reset if already playing
    audio.currentTime = 0;
    audio.play();

    // Add playing animation
    card.classList.add('playing');

    audio.onended = () => {
        card.classList.remove('playing');
    };

    // Haptic feedback on mobile (if supported)
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// ===== Health Check =====
document.getElementById('audio-input').addEventListener('change', function(event) {
    const audioInput = event.target;
    if (audioInput.files.length === 0) {
        alert('오디오 파일을 선택해주세요.');
        return;
    }

    const audioFile = audioInput.files[0];
    const resultElement = document.getElementById('result');

    // Show loading
    resultElement.innerHTML = '<div style="color: rgba(255,255,255,0.5); font-size: 14px;">분석 중...</div>';

    const reader = new FileReader();
    reader.onload = function(event) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContext.decodeAudioData(event.target.result, function(buffer) {
            const duration = buffer.duration;
            const rms = calculateRMS(buffer.getChannelData(0));

            let result = '';
            let resultClass = '';
            let emoji = '';

            if (rms > 0.02) {
                result = '아주 우렁찬 방귀입니다!';
                resultClass = 'healthy';
                emoji = '✅';
            } else {
                result = '힘이 좀 부족한 방귀네요...';
                resultClass = 'unhealthy';
                emoji = '⚠️';
            }

            resultElement.innerHTML = `
                <div class="${resultClass}">
                    ${emoji} ${result}
                </div>
                <div class="result-details">
                    길이: ${duration.toFixed(2)}초 | 강도: ${rms.toFixed(5)}
                </div>
            `;
        });
    };
    reader.readAsArrayBuffer(audioFile);
});

function calculateRMS(audioData) {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
        sum += audioData[i] * audioData[i];
    }
    return Math.sqrt(sum / audioData.length);
}
