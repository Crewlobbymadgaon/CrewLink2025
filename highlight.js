document.addEventListener("DOMContentLoaded", () => {
  const table = document.querySelector("table");
  const rows = table?.querySelectorAll("tbody tr") || [];
  const totalDays = 8; // Sunday to Saturday
  const linkId = document.body.dataset.linkId;

  if (!table || !linkId) return;

  let savedRow = parseInt(localStorage.getItem("dutyRow"));
  let savedCol = parseInt(localStorage.getItem("dutyCol"));
  let lastDutyDate = localStorage.getItem("lastDutyDate");
  let activeLinkId = localStorage.getItem("activeLinkId");

  const today = new Date();
  const todayDateStr = today.toISOString().split("T")[0];
  let isClicking = false;

  // Remove all highlighting from cells
  function clearHighlights() {
    table.querySelectorAll("td").forEach(cell =>
      cell.classList.remove("duty-cell", "crew-cell-highlight")
    );
    table.querySelectorAll("tr").forEach(row =>
      row.classList.remove("active-row")
    );
  }

  // Clear stored duty data
  function clearSavedDuty() {
    localStorage.removeItem("dutyRow");
    localStorage.removeItem("dutyCol");
    localStorage.removeItem("lastDutyDate");
    localStorage.removeItem("activeLinkId");
    savedRow = savedCol = undefined;
  }

  // Smoothly scroll to the selected row
  function scrollToRow(rowIdx) {
    const row = rows[rowIdx];
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // Validate the clicked cell
  function isValidCell(cell, colIdx) {
    const text = cell?.textContent.trim();
    return colIdx > 0 && cell && text !== "" && text !== "-" && text !== "—";
  }

  // Highlight a selected duty cell
  function highlight(rowIdx, colIdx) {
    if (rowIdx >= rows.length || colIdx >= totalDays) return;

    const row = rows[rowIdx];
    const cell = row.cells[colIdx];
    const crewCell = row.cells[0];

    if (!isValidCell(cell, colIdx)) return;

    clearHighlights();
    cell.classList.add("duty-cell");
    crewCell.classList.add("crew-cell-highlight");
    row.classList.add("active-row");

    localStorage.setItem("dutyRow", rowIdx);
    localStorage.setItem("dutyCol", colIdx);
    localStorage.setItem("lastDutyDate", todayDateStr);
    localStorage.setItem("activeLinkId", linkId);

    scrollToRow(rowIdx);
  }

  // Automatically highlight the next duty if date changes
  function autoAdvance() {
    if (activeLinkId !== linkId) {
      clearHighlights();
      return;
    }

    if (isNaN(savedRow) || isNaN(savedCol)) return;

    if (lastDutyDate && todayDateStr !== lastDutyDate) {
      let nextRow = savedRow;
      let nextCol = savedCol;

      const maxAttempts = rows.length * (totalDays - 1);
      for (let i = 0; i < maxAttempts; i++) {
        nextCol++;

        if (nextCol >= totalDays) {
          nextCol = 1; // skip 0 (crew name column)
          nextRow = (nextRow + 1) % rows.length;
        }

        const nextCell = rows[nextRow]?.cells[nextCol];
        if (isValidCell(nextCell, nextCol)) {
          savedRow = nextRow;
          savedCol = nextCol;
          highlight(nextRow, nextCol);
          return;
        }
      }

      // If no valid cell found
      clearHighlights();
      clearSavedDuty();
    } else {
      highlight(savedRow, savedCol);
    }
  }

  // Add click listeners for all duty cells
  rows.forEach((row, rowIdx) => {
    row.querySelectorAll("td").forEach((cell, colIdx) => {
      if (colIdx === 0) return; // Skip crew name column

      cell.addEventListener("click", () => {
        if (isClicking) return;
        isClicking = true;
        setTimeout(() => (isClicking = false), 300);

        if (!isValidCell(cell, colIdx)) return;

        const duty = cell.textContent.trim();
        const crew = row.cells[0].textContent.trim();

        if (savedRow === rowIdx && savedCol === colIdx && activeLinkId === linkId) {
          showConfirmModal(`Clear duty for ${crew}?`).then(({ confirmed }) => {
            if (confirmed) {
              clearHighlights();
              clearSavedDuty();
            }
          });
        } else {
          showConfirmModal(`Confirm duty for ${crew} as "${duty}"?`).then(({ confirmed, lp, alp }) => {
            if (confirmed) {
              localStorage.setItem("lpName", lp);
              localStorage.setItem("alpName", alp);
              savedRow = rowIdx;
              savedCol = colIdx;
              highlight(rowIdx, colIdx);
            }
          });
        }
      });
    });
  });

  // Call auto highlight once after setup
  autoAdvance();

  // Dummy confirm modal (you can replace with your own modal UI)
  function showConfirmModal(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirmModal");
    const msgEl = document.getElementById("modalMessage");
    const lpInput = document.getElementById("lpName");
    const alpInput = document.getElementById("alpName");
    const confirmBtn = document.getElementById("confirmYes");
    const cancelBtn = document.getElementById("confirmNo");

    msgEl.textContent = message;
    lpInput.value = localStorage.getItem("lpName") || "";
    alpInput.value = localStorage.getItem("alpName") || "";

    modal.classList.remove("hidden");

    function cleanup() {
      modal.classList.add("hidden");
      confirmBtn.removeEventListener("click", onConfirm);
      cancelBtn.removeEventListener("click", onCancel);
    }

    function onConfirm() {
      const lp = lpInput.value.trim();
      const alp = alpInput.value.trim();
      cleanup();
      resolve({ confirmed: true, lp, alp });
    }

    function onCancel() {
      cleanup();
      resolve({ confirmed: false });
    }

    confirmBtn.addEventListener("click", onConfirm);
    cancelBtn.addEventListener("click", onCancel);
  });
}
