const MOD = "chat-card-sizer";
const DEFAULTS = { fontSize: 14, buttonSize: 32, iconSize: 16 };
const LABELS = { fontSize: "FontSize", buttonSize: "ButtonSize", iconSize: "IconSize" };

function applyVars() {
  const root = document.documentElement.style;
  root.setProperty("--ccs-font-size", `${game.settings.get(MOD, "fontSize")}px`);
  root.setProperty("--ccs-button-size", `${game.settings.get(MOD, "buttonSize")}px`);
  root.setProperty("--ccs-icon-size", `${game.settings.get(MOD, "iconSize")}px`);
}

function register(key, min, max, step) {
  game.settings.register(MOD, key, {
    name: `CCS.${LABELS[key]}.Name`,
    hint: `CCS.${LABELS[key]}.Hint`,
    scope: "client",
    config: true,
    type: Number,
    default: DEFAULTS[key],
    range: { min, max, step },
    onChange: applyVars
  });
}

Hooks.once("init", () => {
  register("fontSize", 8, 32, 1);
  register("buttonSize", 16, 80, 1);
  register("iconSize", 8, 48, 1);

  game.settings.register(MOD, "reset", {
    name: "CCS.Reset.Name",
    hint: "CCS.Reset.Hint",
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: async (value) => {
      if (!value) return;
      for (const [k, v] of Object.entries(DEFAULTS)) await game.settings.set(MOD, k, v);
      await game.settings.set(MOD, "reset", false);
      applyVars();
    }
  });
});

/* Tag every clickable control inside chat messages so the CSS can size it,
   whatever markup the system or other modules use. Icon-only controls
   (no visible text) get an extra class so they become square buttons. */
const CLICKABLE = [
  "button",
  "a.button",
  "a[data-action]",
  "span[data-action]",
  "i[data-action]",
  "[role='button']"
].join(",");

function tagControls(root) {
  if (!(root instanceof Element)) return;
  const inMessage = root.closest?.(".chat-message") || root.querySelector?.(".chat-message");
  if (!inMessage) return;
  const els = root.matches(CLICKABLE) ? [root, ...root.querySelectorAll(CLICKABLE)] : root.querySelectorAll(CLICKABLE);
  for (const el of els) {
    if (!el.closest(".chat-message")) continue;
    if (el.closest(".message-header")) continue; // leave delete/visibility icons alone
    el.classList.add("ccs-btn");
    el.classList.toggle("ccs-icon-btn", !el.textContent.trim());
  }
}

Hooks.on("renderChatMessageHTML", (_msg, html) => tagControls(html));

Hooks.once("ready", () => {
  applyVars();
  document.querySelectorAll(".chat-message").forEach(tagControls);
  // Catch buttons that dnd5e or other modules add after the message renders
  new MutationObserver((mutations) => {
    for (const m of mutations) for (const n of m.addedNodes) tagControls(n);
  }).observe(document.body, { childList: true, subtree: true });
});
