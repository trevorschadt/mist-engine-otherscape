const readingPane = ".journal-entry-content";

function applicationsTheme() {
    const config = game.settings.get("core", "uiConfig")?.colorScheme;
    if (config?.applications === "dark" || config?.applications === "light") return config.applications;
    if (config?.interface === "dark" || config?.interface === "light") return config.interface;
    // An empty Applications setting inherits the interface, not the journal's sheet theme.
    if (document.body.classList.contains("theme-dark")) return "dark";
    if (document.body.classList.contains("theme-light")) return "light";
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyJournalTheme(element) {
    const root = element?.nodeType === 1 ? element : element?.[0];
    if (!root?.querySelector(readingPane)) return;
    root.dataset.osJournalTheme = applicationsTheme();
}

for (const hook of ["renderJournalEntrySheet", "renderMistEngineJournalEntrySheet"]) {
    Hooks.on(hook, (app, element) => applyJournalTheme(app.element?.nodeType === 1 ? app.element : element));
}

Hooks.on("updateSetting", setting => {
    if (setting.key !== "core.uiConfig") return;
    for (const pane of document.querySelectorAll(readingPane)) {
        applyJournalTheme(pane.closest(".application, .app"));
    }
});
