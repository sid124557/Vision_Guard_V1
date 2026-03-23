import { saveDatasetEntries } from './firebase.js';

const STORAGE_KEY = 'visionguard-dataset';

const form = document.querySelector('#dataset-form');
const labelInput = document.querySelector('#label');
const splitInput = document.querySelector('#split');
const notesInput = document.querySelector('#notes');
const imagesInput = document.querySelector('#images');
const manifestPreview = document.querySelector('#manifest-preview');
const gallery = document.querySelector('#dataset-gallery');
const sampleCount = document.querySelector('#sample-count');
const missingCount = document.querySelector('#missing-count');
const normalCount = document.querySelector('#normal-count');
const otherCount = document.querySelector('#other-count');
const exportButton = document.querySelector('#export-manifest');
const clearButton = document.querySelector('#clear-dataset');

let dataset = loadDataset();
render();

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const files = Array.from(imagesInput.files || []);
  if (!files.length) return;

  const entries = await Promise.all(
    files.map(async (file) => ({
      id: crypto.randomUUID(),
      label: labelInput.value,
      split: splitInput.value,
      notes: notesInput.value.trim(),
      name: file.name,
      createdAt: new Date().toISOString(),
      previewUrl: await readAsDataUrl(file),
    })),
  );

  dataset = [...entries, ...dataset];
  persistDataset();
  await saveDatasetEntries(entries);
  form.reset();
  render();
});

exportButton.addEventListener('click', () => {
  const manifest = dataset.map(({ previewUrl, ...entry }) => ({
    ...entry,
    imageUrl: previewUrl,
  }));

  manifestPreview.textContent = JSON.stringify(manifest, null, 2);
  downloadJson(manifest);
});

clearButton.addEventListener('click', () => {
  dataset = [];
  persistDataset();
  render();
});

function loadDataset() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function persistDataset() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
}

function render() {
  sampleCount.textContent = String(dataset.length);
  missingCount.textContent = String(dataset.filter((entry) => entry.label === 'missing_breather').length);
  normalCount.textContent = String(dataset.filter((entry) => entry.label === 'normal').length);
  otherCount.textContent = String(dataset.filter((entry) => entry.label === 'other_defect').length);

  manifestPreview.textContent = JSON.stringify(
    dataset.slice(0, 3).map(({ previewUrl, ...entry }) => ({ ...entry, imageUrl: previewUrl })),
    null,
    2,
  );

  if (!dataset.length) {
    gallery.className = 'gallery empty-gallery';
    gallery.innerHTML = '<p>No samples saved yet. Upload images to build the dataset.</p>';
    return;
  }

  gallery.className = 'gallery';
  gallery.innerHTML = dataset
    .map(
      (entry) => `
        <article class="gallery-item">
          <img src="${entry.previewUrl}" alt="${entry.label}" />
          <div class="gallery-item-content">
            <div class="tag-row">
              <span class="tag">${formatLabel(entry.label)}</span>
              <span class="tag">${entry.split}</span>
            </div>
            <strong>${entry.name}</strong>
            <p>${entry.notes || 'No notes added.'}</p>
            <p class="helper-text">Saved ${new Date(entry.createdAt).toLocaleString()}</p>
          </div>
        </article>
      `,
    )
    .join('');
}

function formatLabel(label) {
  return label.replaceAll('_', ' ');
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function downloadJson(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'visionguard-manifest.json';
  link.click();
  URL.revokeObjectURL(url);
}
