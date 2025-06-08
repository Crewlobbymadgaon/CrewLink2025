document.addEventListener("DOMContentLoaded", () => {
    const table = document.querySelector("table");
    const rows = table.querySelectorAll("tbody tr");
    const totalDays = 7; // Sunday to Saturday

    let savedRow = parseInt(localStorage.getItem("dutyRow"));
    let savedCol = parseInt(localStorage.getItem("dutyCol"));
    let lastDutyDate = localStorage.getItem("lastDutyDate");

    const today = new Date();
    const todayDay = today.getDay(); // 0 = Sunday

    // Clear previous highlights
  function clearHighlights() {
  table.querySelectorAll("td").forEach(cell => {
    cell.classList.remove("duty-cell", "crew-cell-highlight");
  });
  table.querySelectorAll("tr").forEach(row => {
    row.classList.remove("active-row");
  });
}

    // Highlight selected duty and row
    function highlight(rowIdx, colIdx) {
  clearHighlights();

  const row = rows[rowIdx];
  const cell = row.cells[colIdx];
  const crewCell = row.cells[0];
  const text = cell?.textContent.trim();

  if (!cell || text === "" || text === "Rest" || text === "—") return;

  cell.classList.add("duty-cell");           // Yellow duty cell
  crewCell.classList.add("crew-cell-highlight"); // Blue crew number cell
  row.classList.add("active-row");           // Blue entire row

  localStorage.setItem("dutyRow", rowIdx);
  localStorage.setItem("dutyCol", colIdx);
  localStorage.setItem("lastDutyDate", today.toDateString());
}

    // Advance to next day automatically
    function autoAdvance() {
      if (isNaN(savedRow) || isNaN(savedCol)) return;

      if (lastDutyDate && today.toDateString() !== lastDutyDate) {
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

    // Handle clicks
    rows.forEach((row, rowIdx) => {
      row.querySelectorAll("td").forEach((cell, colIdx) => {
        if (colIdx === 0) return;

        cell.addEventListener("click", () => {
          const text = cell.textContent.trim();
          if (text === "" || text === "Rest" || text === "—") return;

          if (savedRow === rowIdx && savedCol === colIdx) {
            clearHighlights();
            localStorage.removeItem("dutyRow");
            localStorage.removeItem("dutyCol");
            localStorage.removeItem("lastDutyDate");
            savedRow = savedCol = undefined;
          } else {
            savedRow = rowIdx;
            savedCol = colIdx;
            highlight(rowIdx, colIdx);
          }
        });
      });
    });

    // Run on page load
    autoAdvance();
  });

