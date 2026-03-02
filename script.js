// ✅ Ensure libraries exist
if (!window.PDFLib || !window.Sortable) {
  console.error("Required libraries not loaded.");
}

const { PDFDocument } = PDFLib;

// DOM Elements
const pdfInput = document.getElementById("pdfInput");
const selectBtn = document.getElementById("selectBtn");
const dropArea = document.getElementById("dropArea");
const fileGrid = document.getElementById("fileGrid");
const mergeBtn = document.getElementById("mergeBtn");
const clearBtn = document.getElementById("clearBtn");
const fileCount = document.getElementById("fileCount");
const totalSize = document.getElementById("totalSize");
const themeToggle = document.getElementById("themeToggle");

let files = [];

/* ===============================
   ✅ DARK MODE (SAFE)
=================================*/
if (themeToggle) {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

/* ===============================
   ✅ FILE SELECTION
=================================*/
if (selectBtn && pdfInput) {
  selectBtn.addEventListener("click", () => pdfInput.click());
  pdfInput.addEventListener("change", (e) => addFiles(e.target.files));
}

if (dropArea) {
  dropArea.addEventListener("dragover", (e) => e.preventDefault());
  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  });
}

function addFiles(selectedFiles) {
  Array.from(selectedFiles).forEach((file) => {
    if (file.type === "application/pdf") {
      files.push(file);
    }
  });
  renderFiles();
}

/* ===============================
   ✅ RENDER FILE CARDS
=================================*/
function renderFiles() {
  fileGrid.innerHTML = "";

  let total = 0;

  files.forEach((file, index) => {
    total += file.size;

    const card = document.createElement("div");
    card.className = "file-card";

    card.innerHTML = `
      <div class="file-icon">📕</div>
      <div class="file-name">${file.name}</div>
      <div class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
      <button class="remove-btn">Remove</button>
    `;

    // ✅ Remove button event (NO inline onclick)
    card.querySelector(".remove-btn").addEventListener("click", () => {
      files.splice(index, 1);
      renderFiles();
    });

    fileGrid.appendChild(card);
  });

  fileCount.textContent = `${files.length} files`;
  totalSize.textContent = `${(total / 1024 / 1024).toFixed(2)} MB`;
}

/* ===============================
   ✅ CLEAR ALL
=================================*/
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    files = [];
    renderFiles();
  });
}

/* ===============================
   ✅ SORTABLE (CLEAN + STABLE)
=================================*/
if (fileGrid) {
  Sortable.create(fileGrid, {
    animation: 200,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    delay: 80,
    delayOnTouchOnly: true,
    touchStartThreshold: 4,

    forceFallback: true,
    fallbackTolerance: 3,
    fallbackClass: "dragging-item",
    chosenClass: "drag-active",

    swapThreshold: 0.7,

    onEnd: function (evt) {
      const from = evt.oldIndex;
      const to = evt.newIndex;
      if (from === to) return;

      const [moved] = files.splice(from, 1);
      files.splice(to, 0, moved);
      renderFiles();
    },
  });
}

/* ===============================
   ✅ MERGE PDF
=================================*/
if (mergeBtn) {
  mergeBtn.addEventListener("click", async () => {
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
    downloadFile(mergedBytes, "merged.pdf");
  });
}

function downloadFile(data, fileName) {
  const blob = new Blob([data], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
}
