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

Hooks.once("ready", applyVars);
