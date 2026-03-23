import { logDetection } from './firebase.js';

const video = document.querySelector('#camera');
const overlay = document.querySelector('#overlay');
const context = overlay.getContext('2d');
const startButton = document.querySelector('#start-camera');
const stopButton = document.querySelector('#stop-camera');
const thresholdInput = document.querySelector('#threshold');
const thresholdValue = document.querySelector('#threshold-value');
const cameraStatus = document.querySelector('#camera-status');
const defectLabel = document.querySelector('#defect-label');
const defectConfidence = document.querySelector('#defect-confidence');
const frameCount = document.querySelector('#frame-count');
const eventCount = document.querySelector('#event-count');
const detectionLog = document.querySelector('#detection-log');
const emptyState = document.querySelector('#empty-state');

let stream = null;
let detectionTimer = null;
let analyzedFrames = 0;
let loggedEvents = 0;
let threshold = Number(thresholdInput.value);

thresholdInput.addEventListener('input', () => {
  threshold = Number(thresholdInput.value);
  thresholdValue.textContent = `${Math.round(threshold * 100)}%`;
});

startButton.addEventListener('click', startCamera);
stopButton.addEventListener('click', stopCamera);
window.addEventListener('beforeunload', stopCamera);

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });

    video.srcObject = stream;
    await video.play();
    syncCanvasSize();
    emptyState.hidden = true;
    startButton.disabled = true;
    stopButton.disabled = false;
    cameraStatus.textContent = 'Camera live';
    cameraStatus.className = 'badge success';
    runMockDetectionLoop();
  } catch (error) {
    cameraStatus.textContent = 'Camera blocked';
    cameraStatus.className = 'badge alert';
    pushLog(`Camera error: ${error.message}`);
  }
}

function stopCamera() {
  if (detectionTimer) {
    window.clearInterval(detectionTimer);
    detectionTimer = null;
  }

  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }

  context.clearRect(0, 0, overlay.width, overlay.height);
  startButton.disabled = false;
  stopButton.disabled = true;
  emptyState.hidden = false;
  cameraStatus.textContent = 'Camera idle';
  cameraStatus.className = 'badge muted';
}

function syncCanvasSize() {
  const bounds = video.getBoundingClientRect();
  overlay.width = bounds.width;
  overlay.height = bounds.height;
}

function runMockDetectionLoop() {
  if (detectionTimer) {
    window.clearInterval(detectionTimer);
  }

  detectionTimer = window.setInterval(async () => {
    analyzedFrames += 1;
    frameCount.textContent = String(analyzedFrames);
    syncCanvasSize();

    const result = mockDetector(overlay.width, overlay.height);
    renderOverlay(result);

    if (result.confidence >= threshold) {
      defectLabel.textContent = result.label;
      defectConfidence.textContent = `${Math.round(result.confidence * 100)}%`;
      const payload = {
        defectType: result.label,
        confidence: result.confidence,
        boundingBox: result.box,
        timestamp: new Date().toISOString(),
        source: 'mock-detector',
      };
      await logDetection(payload);
      loggedEvents += 1;
      eventCount.textContent = String(loggedEvents);
      pushLog(`${result.label} detected at ${Math.round(result.confidence * 100)}% confidence.`);
    } else {
      defectLabel.textContent = 'No defect';
      defectConfidence.textContent = `${Math.round(result.confidence * 100)}%`;
    }
  }, 1400);
}

function mockDetector(width, height) {
  const shouldDetect = Math.random() > 0.45;
  const confidence = shouldDetect ? 0.65 + Math.random() * 0.3 : 0.25 + Math.random() * 0.35;
  const box = {
    x: width * (0.15 + Math.random() * 0.4),
    y: height * (0.12 + Math.random() * 0.45),
    width: width * 0.24,
    height: height * 0.2,
  };

  return {
    label: 'missing_breather',
    confidence,
    box,
  };
}

function renderOverlay(result) {
  context.clearRect(0, 0, overlay.width, overlay.height);
  context.lineWidth = 4;
  context.strokeStyle = result.confidence >= threshold ? '#fb7185' : '#fbbf24';
  context.fillStyle = 'rgba(8, 17, 32, 0.72)';
  context.font = '600 16px Inter, sans-serif';
  context.strokeRect(result.box.x, result.box.y, result.box.width, result.box.height);
  context.fillRect(result.box.x, result.box.y - 30, 190, 26);
  context.fillStyle = '#e2e8f0';
  context.fillText(`${result.label} • ${Math.round(result.confidence * 100)}%`, result.box.x + 10, result.box.y - 12);
}

function pushLog(message) {
  const emptyItem = detectionLog.querySelector('.empty-list');
  if (emptyItem) {
    emptyItem.remove();
  }

  const item = document.createElement('li');
  item.textContent = `${new Date().toLocaleTimeString()} — ${message}`;
  detectionLog.prepend(item);

  while (detectionLog.children.length > 6) {
    detectionLog.removeChild(detectionLog.lastElementChild);
  }
}
