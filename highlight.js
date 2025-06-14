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

  function clearHighlights() {
    table.querySelectorAll("td").forEach(cell =>
      cell.classList.remove("duty-cell", "crew-cell-highlight")
    );
    table.querySelectorAll("tr").forEach(row =>
      row.classList.remove("active-row")
    );
  }

  function clearSavedDuty() {
    localStorage.removeItem("dutyRow");
    localStorage.removeItem("dutyCol");
    localStorage.removeItem("lastDutyDate");
    localStorage.removeItem("activeLinkId");
    savedRow = savedCol = undefined;
  }

  function scrollToRow(rowIdx) {
    const row = rows[rowIdx];
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
function isValidCell(cell, colIdx) {
  const text = cell?.textContent.trim();
  return colIdx > 0 && cell && text !== "" && text !== "-" && text !== "—";
}
  
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
        nextCol = nextCol + 1;

        if (nextCol >= totalDays) {
          nextCol = 1; // skip 0 (crew column)
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

  // Click logic
  rows.forEach((row, rowIdx) => {
    row.querySelectorAll("td").forEach((cell, colIdx) => {
      if (colIdx === 0) return; // Skip crew column

      cell.addEventListener("click", () => {
        if (isClicking) return;
        isClicking = true;
        setTimeout(() => (isClicking = false), 300); // prevent rapid clicking

        if (!isValidCell(cell, colIdx)) return;

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
