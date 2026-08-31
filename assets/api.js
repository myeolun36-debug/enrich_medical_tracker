// 共用的資料抓取小工具:跟 Google Apps Script Web App 要資料。
async function fetchData(type) {
  const base = window.APPS_SCRIPT_URL;
  if (!base || base.indexOf("PASTE_YOUR") === 0) {
    throw new Error("CONFIG_MISSING");
  }
  const url = base + (base.indexOf("?") === -1 ? "?" : "&") + "type=" + type;
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP_" + res.status);
  return res.json();
}

// 寫入資料(給 admin.html 用)。故意用 text/plain 送出,避免瀏覽器對 JSON 內容類型
// 發出的 CORS 預檢請求(Apps Script 沒有處理預檢請求,會被擋下來)。
async function postData(action, data, token) {
  const base = window.APPS_SCRIPT_URL;
  if (!base || base.indexOf("PASTE_YOUR") === 0) {
    throw new Error("CONFIG_MISSING");
  }
  const res = await fetch(base, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ token, action, data }),
  });
  if (!res.ok) throw new Error("HTTP_" + res.status);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "寫入失敗");
  return json;
}

function renderState(containerEl, kind, extra) {
  if (kind === "loading") {
    containerEl.innerHTML = '<div class="state-msg">資料讀取中…</div>';
  } else if (kind === "config-missing") {
    containerEl.innerHTML =
      '<div class="state-msg error">還沒接上資料來源。請照部署步驟說明部署 Google Apps Script,' +
      '把拿到的網址貼到 <code>assets/config.js</code> 裡的 APPS_SCRIPT_URL,再重新整理這頁。</div>';
  } else if (kind === "error") {
    containerEl.innerHTML =
      '<div class="state-msg error">資料讀取失敗(' + (extra || "") + ')。' +
      '請確認 Google Apps Script 有部署成功、網址有貼對,或 Google Sheet 內容格式對不對。</div>';
  }
}
