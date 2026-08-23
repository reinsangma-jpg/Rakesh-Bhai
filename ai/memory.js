const KEY_CHAT = "maa_ai_chat";
const KEY_CTX = "maa_ai_context";

export function loadMemory(){
  try{
    const chat = JSON.parse(localStorage.getItem(KEY_CHAT) || "[]");
    const context = JSON.parse(localStorage.getItem(KEY_CTX) || "null");
    return { chat: Array.isArray(chat) ? chat : [], context: context || null };
  }catch{
    return { chat: [], context: null };
  }
}

export function saveMemory({ chat, context }){
  try{
    if (chat) localStorage.setItem(KEY_CHAT, JSON.stringify(chat.slice(-200)));
    if (context) localStorage.setItem(KEY_CTX, JSON.stringify(context));
  }catch{ /* ignore */ }
}

export function clearMemory(){
  try{
    localStorage.removeItem(KEY_CHAT);
    localStorage.removeItem(KEY_CTX);
  }catch{ /* ignore */ }
}
