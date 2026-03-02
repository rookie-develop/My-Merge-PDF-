const { PDFDocument } = PDFLib;

const pdfInput = document.getElementById("pdfInput");
const selectBtn = document.getElementById("selectBtn");
const dropArea = document.getElementById("dropArea");
const fileGrid = document.getElementById("fileGrid");
const mergeBtn = document.getElementById("mergeBtn");
const clearBtn = document.getElementById("clearBtn");
const fileCount = document.getElementById("fileCount");
const totalSize = document.getElementById("totalSize");

let files = [];
// ✅ ✅ ✅ PASTE DARK MODE CODE HERE ✅ ✅ ✅

// ✅ Dark Mode Fix + Persistent
const themeToggle = document.getElementById("themeToggle");

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeToggle.textContent = "☀️";
    localStorage.setItem("theme", "dark");
  } else {
    themeToggle.textContent = "🌙";
    localStorage.setItem("theme", "light");
  }
});
// Open file selector
selectBtn.onclick = () => pdfInput.click();
pdfInput.onchange = (e) => addFiles(e.target.files);

// Drag upload
dropArea.ondragover = (e) => e.preventDefault();
dropArea.ondrop = (e) => {
  e.preventDefault();
  addFiles(e.dataTransfer.files);
};

function addFiles(selectedFiles) {
  for (let file of selectedFiles) {
    if (file.type === "application/pdf") {
      files.push(file);
    }
  }
  renderFiles();
}

function renderFiles() {
  fileGrid.innerHTML = "";

  let total = 0;

  files.forEach((file, index) => {
    total += file.size;

    const card = document.createElement("div");
    card.className = "file-card";
    card.dataset.index = index;

    card.innerHTML = `
      <div class="file-icon">📕</div>
      <div class="file-name">${file.name}</div>
      <div class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
      <button class="remove-btn" onclick="removeFile(${index})">Remove</button>
    `;

    fileGrid.appendChild(card);
  });

  fileCount.textContent = `${files.length} files`;
  totalSize.textContent = `${(total / 1024 / 1024).toFixed(2)} MB`;
}

// Remove file
function removeFile(index) {
  files.splice(index, 1);
  renderFiles();
}

// Clear all
clearBtn.onclick = () => {
  files = [];
  renderFiles();
};

// ✅ SortableJS for drag reorder (Mobile + PC)
new Sortable(fileGrid, {
  animation: 200,
  ghostClass: "sortable-ghost",
  delay: 150,                // ✅ Long press delay for mobile
  delayOnTouchOnly: true,    // ✅ Only delay on touch devices
  touchStartThreshold: 5,
  fallbackOnBody: true,
  swapThreshold: 0.65,

  onEnd: function (evt) {
    if (evt.oldIndex === evt.newIndex) return;

    const movedItem = files.splice(evt.oldIndex, 1)[0];
    files.splice(evt.newIndex, 0, movedItem);
    renderFiles();
  }
});

// Merge PDFs
mergeBtn.onclick = async () => {
  if (files.length < 2) {
    alert("Please select at least 2 PDFs.");
    return;
  }

  const mergedPdf = await PDFDocument.create();

  for (let file of files) {
    const buffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(buffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save();
  download(mergedBytes, "merged.pdf");
};

function download(data, name) {
  const blob = new Blob([data], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
}

