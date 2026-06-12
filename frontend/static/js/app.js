/**
 * FullStack AI — Frontend JavaScript
 * Handles conversation state, streaming responses, and UI updates.
 */

(() => {
  "use strict";

  // ---- State ----
  const state = {
    conversations: [],
    activeId: null,
    isStreaming: false,
  };

  // ---- DOM refs ----
  const messagesEl = document.getElementById("messages");
  const inputEl = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const newChatBtn = document.getElementById("newChatBtn");
  const historyList = document.getElementById("historyList");
  const chatTitle = document.getElementById("chatTitle");
  const modelBadge = document.getElementById("modelBadge");

  // ---- Utility: escape HTML ----
  function escapeHtml(text) {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  // ---- Utility: simple markdown-like formatting ----
  function formatMessage(text) {
    // Code blocks (```lang\n...\n```)
    text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const langLabel = lang ? `<span class="code-lang">${escapeHtml(lang)}</span>` : "";
      return `<pre>${langLabel}<code>${escapeHtml(code.trimEnd())}</code></pre>`;
    });
    // Inline code
    text = text.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);
    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Italic
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // Line breaks
    text = text.replace(/\n/g, "<br>");
    return text;
  }

  // ---- Get or create active conversation ----
  function getActiveConversation() {
    return state.conversations.find((c) => c.id === state.activeId);
  }

  function createConversation() {
    const id = Date.now().toString();
    const conv = { id, title: "New Conversation", messages: [] };
    state.conversations.unshift(conv);
    state.activeId = id;
    renderHistoryList();
    return conv;
  }

  // ---- Render sidebar history ----
  function renderHistoryList() {
    historyList.innerHTML = "";
    state.conversations.forEach((conv) => {
      const item = document.createElement("div");
      item.className = "history-item" + (conv.id === state.activeId ? " active" : "");
      item.textContent = conv.title;
      item.addEventListener("click", () => loadConversation(conv.id));
      historyList.appendChild(item);
    });
  }

  function loadConversation(id) {
    state.activeId = id;
    renderHistoryList();
    const conv = getActiveConversation();
    chatTitle.textContent = conv.title;
    messagesEl.innerHTML = "";
    conv.messages.forEach((m) => appendMessage(m.role, m.content));
    scrollToBottom();
  }

  // ---- Append a message bubble ----
  function appendMessage(role, content, streaming = false) {
    const welcome = messagesEl.querySelector(".welcome");
    if (welcome) welcome.remove();

    const msgEl = document.createElement("div");
    msgEl.className = `message ${role}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = role === "user" ? "U" : "AI";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    if (streaming) {
      bubble.innerHTML = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
    } else {
      bubble.innerHTML = formatMessage(content);
    }

    msgEl.appendChild(avatar);
    msgEl.appendChild(bubble);
    messagesEl.appendChild(msgEl);
    scrollToBottom();
    return bubble;
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  // ---- Show toast error ----
  function showToast(msg) {
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // ---- Send message ----
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || state.isStreaming) return;

    let conv = getActiveConversation();
    if (!conv) conv = createConversation();

    // Add user message
    conv.messages.push({ role: "user", content: text });
    if (conv.title === "New Conversation") {
      conv.title = text.slice(0, 40) + (text.length > 40 ? "…" : "");
      chatTitle.textContent = conv.title;
    }
    renderHistoryList();
    appendMessage("user", text);

    // Clear input
    inputEl.value = "";
    inputEl.style.height = "auto";
    setStreaming(true);

    // Add streaming bubble
    const bubble = appendMessage("assistant", "", true);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conv.messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(err.detail || `HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      bubble.innerHTML = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.token) {
              fullText += parsed.token;
              bubble.innerHTML = formatMessage(fullText);
              scrollToBottom();
            }
          } catch (parseErr) {
            if (parseErr.message !== "Unexpected end of JSON input") {
              throw parseErr;
            }
          }
        }
      }

      // Save assistant message
      conv.messages.push({ role: "assistant", content: fullText });
      // Update model badge from response header (best-effort)
      const model = response.headers.get("x-model");
      if (model) modelBadge.textContent = model;

    } catch (err) {
      bubble.innerHTML = `<em style="color:#f87171">Error: ${escapeHtml(err.message)}</em>`;
      showToast("Failed to get response. Check your API key or server.");
    } finally {
      setStreaming(false);
    }
  }

  function setStreaming(val) {
    state.isStreaming = val;
    sendBtn.disabled = val;
    inputEl.disabled = val;
  }

  // ---- Auto-resize textarea ----
  inputEl.addEventListener("input", () => {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 180) + "px";
  });

  // ---- Enter to send (Shift+Enter for newline) ----
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener("click", sendMessage);
  newChatBtn.addEventListener("click", () => {
    createConversation();
    messagesEl.innerHTML = `
      <div class="welcome">
        <div class="welcome-icon">&#129302;</div>
        <h2>How can I help you today?</h2>
        <p>Ask me anything — I'm an AI assistant ready to help with coding, writing, analysis, and more.</p>
        <div class="suggestions">
          <button class="suggestion-chip" data-text="Explain how neural networks work in simple terms.">Explain neural networks</button>
          <button class="suggestion-chip" data-text="Write a Python function to reverse a linked list.">Reverse a linked list</button>
          <button class="suggestion-chip" data-text="What are the pros and cons of REST vs GraphQL?">REST vs GraphQL</button>
          <button class="suggestion-chip" data-text="Give me 5 tips for writing clean, maintainable code.">Clean code tips</button>
        </div>
      </div>`;
    chatTitle.textContent = "New Conversation";
    attachSuggestionChips();
  });

  // ---- Suggestion chips ----
  function attachSuggestionChips() {
    document.querySelectorAll(".suggestion-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        inputEl.value = btn.dataset.text;
        sendMessage();
      });
    });
  }

  // ---- Init ----
  attachSuggestionChips();
  createConversation();
})();
