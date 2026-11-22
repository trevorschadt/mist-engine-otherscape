Hooks.on("renderMistEngineLegendInTheMistCharacterSheet", (app, element) => {
    if (game.system.id !== "mist-engine-fvtt" || !app.actor.system.editMode) return;
    const picker = element.querySelector('color-picker[name="system.customFontColor"]');
    if (!picker || picker.closest(".os-custom-text-color")) return;
    const doc = element.ownerDocument;
    const wrap = doc.createElement("div");
    wrap.className = "os-custom-text-color";
    const value = String(app.actor.system.customFontColor ?? "").trim();
    const selected = value.length > 0;
    if (selected) wrap.classList.add("os-custom-text-color--selected");
    const button = doc.createElement("button");
    button.type = "button";
    button.className = "change-custom-background-btn";
    button.textContent = game.i18n.localize("OTHERSCAPE_MIST_SKIN.CustomTextColor.Label");
    if (selected) {
        button.textContent = game.i18n.localize("OTHERSCAPE_MIST_SKIN.CustomTextColor.Clear");
        button.title = game.i18n.localize("OTHERSCAPE_MIST_SKIN.CustomTextColor.Clear");
        button.setAttribute("aria-label", button.title);
    }
    button.disabled = !app.actor.isOwner;
    const swatch = doc.createElement("input");
    swatch.type = "color";
    swatch.className = "os-custom-text-color-swatch";
    swatch.title = game.i18n.localize("OTHERSCAPE_MIST_SKIN.CustomTextColor.Label");
    swatch.tabIndex = -1;
    swatch.setAttribute("aria-hidden", "true");
    swatch.addEventListener("click", event => { if (!openingFromButton) event.preventDefault(); });
    swatch.disabled = !app.actor.isOwner;
    if (/^#[0-9a-f]{6}$/i.test(value)) swatch.value = value;
    else if (/^#[0-9a-f]{3}$/i.test(value)) swatch.value = "#" + [...value.slice(1)].map(c => c + c).join("");
    else swatch.value = "#000000";
    picker.before(wrap);
    // Retain the original form value, including an unset color. A color input
    // always has a value, so giving the new swatch a name would unintentionally
    // save black when another field submits the sheet.
    picker.hidden = true;
    const actions = doc.createElement("div");
    actions.className = "os-custom-text-color-actions";
    actions.append(button);
    wrap.append(actions);
    if (selected) {
        const hex = doc.createElement("output");
        hex.className = "os-custom-text-color-hex";
        hex.textContent = swatch.value.toUpperCase();
        actions.append(hex);
    }
    wrap.append(swatch, picker);
    let openingFromButton = false;
    button.addEventListener("click", async () => {
        if (swatch.disabled) return;
        if (selected) {
            button.disabled = true;
            picker.value = "";
            try { await app.actor.update({"system.customFontColor": ""}); }
            catch (error) {
                picker.value = value;
                console.error("Custom text color could not be cleared", error);
                ui.notifications.error(game.i18n.localize("OTHERSCAPE_MIST_SKIN.CustomTextColor.SaveError"));
            } finally { button.disabled = !app.actor.isOwner; }
            return;
        }
        openingFromButton = true;
        try {
            if (typeof swatch.showPicker === "function") swatch.showPicker();
            else swatch.click();
        } catch { swatch.click(); }
        finally { openingFromButton = false; }
    });
    swatch.addEventListener("change", async event => {
        event.stopImmediatePropagation();
        if (!app.actor.isOwner) return;
        picker.value = swatch.value;
        try { await app.actor.update({"system.customFontColor": swatch.value}); }
        catch (error) {
            console.error("Custom text color could not be saved", error);
            ui.notifications.error(game.i18n.localize("OTHERSCAPE_MIST_SKIN.CustomTextColor.SaveError"));
        }
    });
});
