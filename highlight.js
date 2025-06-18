document.addEventListener("DOMContentLoaded", () => {
  const table = document.querySelector("table");
  const rows = table.querySelectorAll("tbody tr");
  const totalDays = 7; // Sunday to Saturday
  const linkId = document.body.dataset.linkId;

  let savedRow = parseInt(localStorage.getItem("dutyRow"));
  let savedCol = parseInt(localStorage.getItem("dutyCol"));
  let lastDutyDate = localStorage.getItem("lastDutyDate");
  let activeLinkId = localStorage.getItem("activeLinkId");

  const today = new Date();
  const todayDateStr = today.toISOString().split('T')[0];

  // Clear all highlights
  function clearHighlights() {
    table.querySelectorAll("td").forEach(cell => {
      cell.classList.remove("duty-cell", "crew-cell-highlight");
    });
    table.querySelectorAll("tr").forEach(row => {
      row.classList.remove("active-row");
    });
  }

  function clearSavedDuty() {
    localStorage.removeItem("dutyRow");
    localStorage.removeItem("dutyCol");
    localStorage.removeItem("lastDutyDate");
    localStorage.removeItem("activeLinkId");
    savedRow = savedCol = undefined;
  }

  function highlight(rowIdx, colIdx) {
    clearHighlights();

    const row = rows[rowIdx];
    const cell = row.cells[colIdx];
    const crewCell = row.cells[0];
    const text = cell?.textContent.trim();

    if (!cell || ["", "—"].includes(text)) return;

    cell.classList.add("duty-cell");
    crewCell.classList.add("crew-cell-highlight");
    row.classList.add("active-row");

    localStorage.setItem("dutyRow", rowIdx);
    localStorage.setItem("dutyCol", colIdx);
    localStorage.setItem("lastDutyDate", todayDateStr);
    localStorage.setItem("activeLinkId", linkId);
  }

  function autoAdvance() {
    if (activeLinkId !== linkId) {
      clearHighlights(); // Make sure no old highlight shows
      return;
    }

    if (isNaN(savedRow) || isNaN(savedCol)) return;

    if (lastDutyDate && todayDateStr !== lastDutyDate) {
      let nextCol = (savedCol + 1) % totalDays;
      let nextRow = savedRow;

      if (nextCol === 0) {
        nextRow = (savedRow + 1) % rows.length;
      }

      savedRow = nextRow;
      savedCol = nextCol;
      highlight(savedRow, savedCol);
    } else {
      highlight(savedRow, savedCol);
    }
  }

  // Click logic
  rows.forEach((row, rowIdx) => {
    row.querySelectorAll("td").forEach((cell, colIdx) => {
      if (colIdx === 0) return;

      cell.addEventListener("click", () => {
        const text = cell.textContent.trim();
        if (["", "—"].includes(text)) return;

        // If same cell clicked again, unselect
        if (savedRow === rowIdx && savedCol === colIdx && activeLinkId === linkId) {
          clearHighlights();
          clearSavedDuty();
        } else {
          savedRow = rowIdx;
          savedCol = colIdx;
          highlight(rowIdx, colIdx);
        }
      });
    });
  });

  autoAdvance();
});
