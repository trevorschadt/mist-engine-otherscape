const namespace = "mist-engine-fvtt";
const settingKey = "tidyTagsOnCharacterSheet";

export function syncPlannedTagVisibility() {
    if (game.system.id !== namespace) return;
    document.documentElement.classList.toggle(
        "os-hide-planned-tags",
        game.settings.get(namespace, settingKey) === true
    );
}

Hooks.once("ready", () => {
    if (game.system.id !== namespace) return;
    const setting = game.settings.settings.get(`${namespace}.${settingKey}`);
    if (setting) {
        const onChange = setting.onChange;
        setting.onChange = function (...args) {
            // Preserve any existing setting callback, including its return value.
            try { return onChange?.apply(this, args); }
            finally { syncPlannedTagVisibility(); }
        };
    }
    syncPlannedTagVisibility();
});

Hooks.on("renderMistEngineLegendInTheMistCharacterSheet", syncPlannedTagVisibility);
