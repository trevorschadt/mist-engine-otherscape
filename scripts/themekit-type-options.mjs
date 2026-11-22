Hooks.on("renderMistEngineItemThemekitSheet", async (app, element) => {
    if (game.system.id !== "mist-engine-fvtt") return;

    const input = element.querySelector('input[name="system.themekit_type"]');
    const category = element.querySelector('select[name="system.themebook_type"]');
    if (!input || !category) return;

    const select = element.ownerDocument.createElement("select");
    select.name = input.name;
    select.disabled = input.disabled || input.readOnly || !app.document.isOwner;
    select.setAttribute("aria-label", game.i18n.localize("OTHERSCAPE_MIST_SKIN.ThemebookChoice"));

    let kits = [];
    const refresh = () => {
        const value = select.options.length ? select.value : input.value || "";
        const names = new Map();
        for (const kit of kits) {
            const name = kit.system.themekit_type?.trim();
            if (kit.system.themebook_type === category.value && name) {
                const key = name.toLocaleLowerCase();
                if (!names.has(key)) names.set(key, name);
            }
        }
        // Existing or custom values must remain representable during form edits.
        if (value) names.set(value.toLocaleLowerCase(), value);
        select.replaceChildren();
        for (const name of ["", ...Array.from(names.values()).sort((a, b) => a.localeCompare(b))]) {
            const option = element.ownerDocument.createElement("option");
            option.value = name;
            option.textContent = name || "—";
            select.add(option);
        }
        select.value = value;
    };
    refresh();
    input.replaceWith(select);
    const categoryGroup = category.parentElement;
    const typeRow = select.parentElement;
    typeRow.prepend(categoryGroup);
    typeRow.classList.add("os-themekit-type-row");
    element.querySelector(".item-header")?.classList.add("os-themekit-header");
    category.addEventListener("change", refresh);

    const includeWorld = game.settings.get("mist-engine-fvtt", "themekitIncludeWorldItems") !== false;
    const allowedPacks = game.settings.get("mist-engine-fvtt", "themekitSourcePacks");
    kits = includeWorld ? game.items.filter(item => item.type === "themekit" && item.visible) : [];

    const packs = game.packs.filter(pack =>
        pack.documentName === "Item" && pack.visible &&
        (!Array.isArray(allowedPacks) || !allowedPacks.length || allowedPacks.includes(pack.collection))
    );
    const results = await Promise.allSettled(packs.map(pack => pack.getDocuments()));
    for (const result of results) {
        if (result.status === "fulfilled") {
            kits.push(...result.value.filter(item => item.type === "themekit" && item.visible));
        } else {
            console.warn("Otherscape themebook choices: unable to read a kit source.", result.reason);
        }
    }
    if (element.querySelector('select[name="system.themekit_type"]') === select) refresh();
});
