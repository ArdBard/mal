(function () {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__observerMethod = method;
    this.__observerUrl = url;
    return originalOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function (body) {
    this.addEventListener("load", function () {
      try {
        const url = this.__observerUrl || "";
        const method = (this.__observerMethod || "").toUpperCase();

        if (method === "POST" && url.includes("/account/transaction/list")) {
          let data;

          if (this.responseType === "json") {
            data = this.response;
          } else {
            data = JSON.parse(this.responseText);
          }

          console.log("Matched XHR JSON:", data);
        }
      } catch (err) {
        console.error("Failed to inspect XHR response", err);
      }
    });

    return originalSend.call(this, body);
  };
})();
