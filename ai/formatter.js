function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;").replaceAll("<","&lt;")
    .replaceAll(">","&gt;").replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function mdLite(text){
  // very small markdown-like formatting: **bold**, bullets
  let s = escapeHtml(text);
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\n/g, "<br/>");
  return s;
}

export function formatUserMessage(text){
  return { role: "user", html: mdLite(text), raw: text };
}

export function formatAssistantMessage(text, resultMeta = null){
  const meta = resultMeta || {};
  let html = mdLite(text);

  // Sources block (if present)
  if (meta.sources?.length){
    const sid = `src_${Math.random().toString(16).slice(2)}`;
    const items = meta.sources.map(s=>{
      const title = escapeHtml(s.title || s.id || "Source");
      const url = s.url ? `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">Open</a>` : "";
      const note = s.note ? `<div class="pill">${escapeHtml(s.note)}</div>` : "";
      return `<div class="pill">${title} ${url}</div>${note}`;
    }).join("");

    html += `
      <div class="metaRow">
        <button class="pill pillBtn" data-source-toggle="${sid}">📖 Source / Info</button>
        ${meta.confidence != null ? `<span class="pill">Confidence: ${(meta.confidence*100).toFixed(0)}%</span>` : ""}
      </div>
      <div class="metaRow" data-source-panel="${sid}" hidden>${items}</div>
    `;
  } else if (meta.confidence != null){
    html += `<div class="metaRow"><span class="pill">Confidence: ${(meta.confidence*100).toFixed(0)}%</span></div>`;
  }

  // Quiz options buttons
  if (meta.quizOptions?.length){
    const btns = meta.quizOptions.map((opt, idx)=>{
      const label = String.fromCharCode(65+idx);
      return `<button data-quiz-answer="${escapeHtml(label)}">${escapeHtml(label)}. ${escapeHtml(opt)}</button>`;
    }).join("");
    html += `<div class="metaRow">${btns}</div>`;
  }

  return { role: "ai", html, raw: text, meta };
}
