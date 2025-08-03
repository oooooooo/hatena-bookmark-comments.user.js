// ==UserScript==
// @name         C-q to show Hatena Bookmark Comments
// @namespace    https://github.com/oooooooo/
// @version      1.2.0
// @description  Show styled Hatena comments on Ctrl+Q
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      b.hatena.ne.jp
// ==/UserScript==

(() => {

	document.addEventListener("keydown", (e) => {
		if (e.ctrlKey && e.key.toLowerCase() === "q") {
			e.preventDefault();

			const entryUrl = `https://b.hatena.ne.jp/entry/${location.href}`;

			GM_xmlhttpRequest({
				method: "GET",
				url: entryUrl,
				onload: (response) => {
					const parser = new DOMParser();
					const doc = parser.parseFromString(
						response.responseText,
						"text/html",
					);
					const comments = doc.querySelector(".entry-comments");

					if (!comments) {
						console.log("コメントが見つかりませんでした");
						return;
					}

					const styles = [...doc.querySelectorAll('link[rel="stylesheet"]')];
					const styleLinks = styles.map((link) => link.outerHTML).join("\n");

					// 既存の popover 削除
					const existing = document.querySelector("#hatena-comments-popover");
					if (existing) existing.remove();

					const popover = document.createElement("div");
					popover.id = "hatena-comments-popover";
					popover.setAttribute("popover", "manual");
					popover.style.position = "fixed";
					popover.style.top = "10%";
					popover.style.left = "50%";
					popover.style.transform = "translateX(-50%)";
					popover.style.width = "800px";
					popover.style.maxHeight = "80vh";
					popover.style.overflow = "auto";
					popover.style.border = "1px solid #ccc";
					popover.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
					popover.style.background = "white";
					popover.style.zIndex = 9999;
					popover.style.borderRadius = "8px";

					popover.innerHTML = `
            ${styleLinks}
            <style>
              body { font-family: sans-serif; }
              #hatena-comments-popover form {
                position: sticky;
                top: 0;
                background: #fff;
                padding: 5px;
                text-align: right;
                z-index: 10;
              }
              .entry-comments {
                text-align: left !important;
                margin-left: 0 !important;
                margin-right: auto !important;
              }
            </style>
            <form method="dialog">
              <button type="button" id="close-hatena-popover">×</button>
            </form>
            ${comments.outerHTML}
          `;

					document.body.appendChild(popover);
					popover.showPopover();

					// 閉じる処理
					popover
						.querySelector("#close-hatena-popover")
						.addEventListener("click", () => {
							popover.hidePopover();
							popover.remove();
						});

					// 背景クリックで閉じたい場合（任意）
					const onClickOutside = (event) => {
						if (!popover.contains(event.target)) {
							popover.hidePopover();
							popover.remove();
							document.removeEventListener("mousedown", onClickOutside);
						}
					};
					document.addEventListener("mousedown", onClickOutside);

					// Escキーで閉じる
					const onKeyDown = (event) => {
						if (event.key === "Escape") {
							popover.hidePopover();
							popover.remove();
							document.removeEventListener("keydown", onKeyDown);
							document.removeEventListener("mousedown", onClickOutside);
						}
					};
					document.addEventListener("keydown", onKeyDown);
				},
			});
		}
	});
})();
