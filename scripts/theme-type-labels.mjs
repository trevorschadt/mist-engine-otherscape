// The upstream fields accept strings, but their templates enumerate only LitM types.
const otherscapeTypes = new Map([
    ["os-noise", "OTHERSCAPE_MIST_SKIN.ThemeType.Noise"],
    ["os-mythos", "OTHERSCAPE_MIST_SKIN.ThemeType.Mythos"],
    ["os-self", "OTHERSCAPE_MIST_SKIN.ThemeType.Self"],
]);

const sheetFields = [
    ["renderMistEngineItemThemekitSheet", "themebook_type"],
    ["renderMistEngineThemebookItemSheet", "type"],
];

for (const [hook, field] of sheetFields) {
    Hooks.on(hook, (app, element) => {
        if (game.system.id !== "mist-engine-fvtt") return;

        const select = element.querySelector(`select[name="system.${field}"]`);
        if (!select) return;

        const storedType = app.document.system[field];
        // Preserve a saved legacy value so unrelated form edits can still submit it.
        const options = Array.from(select.options);
        for (const option of options) {
            if (option.value.startsWith("litm-") && option.value !== storedType) option.remove();
        }

        for (const [value, key] of otherscapeTypes) {
            if (options.some(option => option.value === value)) continue;

            const option = element.ownerDocument.createElement("option");
            option.value = value;
            option.textContent = game.i18n.localize(key);
            select.add(option);
        }
        if (otherscapeTypes.has(storedType) || storedType?.startsWith("litm-")) select.value = storedType;
    });
}
