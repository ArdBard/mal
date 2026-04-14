(function () {
  const expectedAmounts = new Map();

  function readAmountFromRow(row) {
    const amountEl = row.querySelector("div.t-amount");
    return amountEl?.textContent?.replace(/\s+/g, " ").trim() ?? "";
  }

  function normalizeExpectedAmount(tx) {
    // adjust this to match exactly how the UI formats it
    return `${tx.direction === "DEBIT" ? "-" : ""}${Number(tx.amount).toLocaleString("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${tx.currencyCode}`.replace(/\s+/g, " ").trim();
  }

  function checkRowAmount(row) {
    const expected = expectedAmounts.get(row.id);
    if (!expected) return;

    const actual = readAmountFromRow(row);

    if (actual !== expected) {
      console.warn("Amount mismatch detected", {
        rowId: row.id,
        expected,
        actual,
      });

      alert(`Amount mismatch detected! \nExpected: ${expected}\nActual: ${actual}`);
    }
  }

  function attachObserver() {
    const tbody = document.querySelector("table.c-contentTable > tbody");
    if (!tbody || tbody.__amountObserverAttached) return;

    const observer = new MutationObserver((mutations) => {
      const rowsToCheck = new Set();

      for (const mutation of mutations) {
        const el =
          mutation.target.nodeType === Node.TEXT_NODE
            ? mutation.target.parentElement
            : mutation.target;

        const row = el?.closest?.("tr[id]");
        if (row) rowsToCheck.add(row);

        if (mutation.type === "childList") {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const addedRow =
                node.matches?.("tr[id]") ? node : node.querySelector?.("tr[id]");
              if (addedRow) rowsToCheck.add(addedRow);
            }
          }
        }
      }

      for (const row of rowsToCheck) {
        checkRowAmount(row);
      }
    });

    observer.observe(tbody, {
      subtree: true,
      childList: true,
      characterData: true,
    });

    tbody.__amountObserverAttached = true;
    console.log("Amount observer attached");
  }

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__observerMethod = method;
    this.__observerUrl = String(url);
    return originalOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function (body) {
    this.addEventListener("load", function () {
      try {
        const url = this.__observerUrl || "";
        const method = (this.__observerMethod || "").toUpperCase();

        if (method === "POST" && url.includes("/account/transaction/list")) {
          const data =
            this.responseType === "json"
              ? this.response
              : JSON.parse(this.responseText);

          for (const tx of data.transactions || []) {
            expectedAmounts.set(
              `collapsible-row-${tx.transactionId}`,
              normalizeExpectedAmount(tx)
            );
          }

          attachObserver();
        }
      } catch (err) {
        console.error("Failed to inspect XHR response", err);
      }
    });

    return originalSend.call(this, body);
  };
})();
