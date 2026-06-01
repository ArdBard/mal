(async () => {
  const res = await fetch(`/`);
  const html = await res.text();

  const found =
    /Jméno:<\/label>\s*<div class="col-sm-9">\s*<p class="form-control-static">\s*Bc\. Jan Kupsa\s*<\/p>/s.test(
      html
    );

  if (found) {
    const body = new URLSearchParams({
      sso: 212628051,
      desc: "oblast Data Security: \nposuzování bezpečnosti AI nástrojů a jejich využití\nICT Risk Analýza aplikací\nschvalování ticektů/žádostí:\nProcesy v oblasti databází a dat, CAR změny, COPR + CyberSec Vendor Checks, DTR žádosti, UAM - matice rolí\nReverzní Bodybuilder",
      table: "6C6/6",
      mobile: "+420720234843"
    });

    try {
      const response = await fetch("/edit_desc.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: body.toString(),
      });

      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error("POST failed:", error);
    }
  }
})();
