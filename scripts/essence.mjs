import {deriveEssence, essenceScope} from "./essence-data.mjs";
import {pendingEssenceBonus} from "./essence-rolls.mjs";

import {themeCategories} from "./theme-categories.mjs";

const t = key => game.i18n.localize("OTHERSCAPE_MIST_SKIN.Essence." + key);

function buildEssencePanel(app, element) {

    const actor = app.actor;
    const essence = deriveEssence(actor);
    const inPlay = !actor.system.editMode;
    element.classList.toggle("os-essence-avatar", essence.key === "avatar");
    const doc = element.ownerDocument;
    const panel = doc.createElement("section");
    panel.className = "os-essence";
    const heading = doc.createElement("h2");
    heading.textContent = t("Title") + " — " + t(essence.key + ".Name");
    panel.append(heading);
    const counts = doc.createElement("p");
    counts.className = "os-essence-counts";
    counts.textContent = ["self", "mythos", "noise"].map(key =>
        t("Categories." + key) + " " + essence.counts[key]
    ).join(" · ");
    panel.append(counts);
    if (!["incomplete", "sourcesRequired"].includes(essence.key)) {
        const description = doc.createElement("p");
        description.className = "os-essence-description";
        description.textContent = t(essence.key + ".Description");
        panel.append(description);
    }
    const ability = doc.createElement("p");
    ability.className = "os-essence-ability";
    ability.textContent = t(essence.key + ".Ability");
    panel.append(ability);

    const isReserved = () => {
        const lease = actor.getFlag(essenceScope, "essenceReservation");
        return !!lease && (lease.publishing || lease.expires > Date.now());
    };
    const save = async (operation, { inPlayAction = false } = {}) => {
        if (inPlayAction && isReserved()) {
            if (panel.isConnected) panel.replaceWith(buildEssencePanel(app, element));
            return;
        }
        try {
            await operation();
            if (panel.isConnected) panel.replaceWith(buildEssencePanel(app, element));
        }
        catch (error) {
            console.error("Otherscape Essence update failed.", error);
            ui.notifications.error(t("SaveError"));
        }
    };
    const button = (label, action) => {
        const control = doc.createElement("button");
        control.type = "button";
        control.textContent = label;
        control.disabled = !actor.isOwner || reserved;
        control.addEventListener("click", () => save(action, {inPlayAction: true}));
        return control;
    };
    const reserved = isReserved();
    const state = actor.getFlag(essenceScope, "essenceState") ?? {};
    const usage = doc.createElement("div");
    usage.className = "os-essence-controls";
    const actions = doc.createElement("div");
    actions.className = "os-essence-actions";
    const trackers = doc.createElement("div");
    trackers.className = "os-essence-trackers";
    const resets = doc.createElement("div");
    resets.className = "os-essence-resets";
    const track = (key, label) => {
        const wrap = doc.createElement("label");
        const check = doc.createElement("input");
        check.type = "checkbox";
        check.checked = !!state[key];
        check.disabled = !actor.isOwner || reserved;
        check.addEventListener("change", () => save(() => actor.setFlag(
            essenceScope, "essenceState." + key, check.checked
        ), {inPlayAction: true}));
        wrap.append(check, label);
        trackers.append(wrap);
    };
    const prepareBonus = category => actor.setFlag(essenceScope, "pendingEssenceBonus", {
        id: foundry.utils.randomID(), essence: essence.key, category,
    });
    if (essence.key === "spiritualist" && !state.spiritualist) {
        actions.append(button(t("AddSelf"), () => prepareBonus("self")));
        actions.append(button(t("AddMythos"), () => prepareBonus("mythos")));
    }
    if (essence.key === "cyborg") {
        if (!state.cyborgSelf) actions.append(button(t("AddSelf"), () => prepareBonus("self")));
        if (!state.cyborgNoise) actions.append(button(t("AddNoise"), () => prepareBonus("noise")));
        if (!state.cyborgSelf && !state.cyborgNoise) actions.append(button(t("AddBoth"), () => prepareBonus("both")));
    }
    const pending = pendingEssenceBonus(actor);
    if (pending && inPlay) {
        const note = doc.createElement("p");
        note.textContent = game.i18n.format("OTHERSCAPE_MIST_SKIN.Essence.BonusNote", {
            essence: t(essence.key + ".Name"), power: pending.power,
        });
        panel.append(note);
        actions.append(button(t("CancelBonus"), () => actor.unsetFlag(essenceScope, "pendingEssenceBonus")));
    }
    if (essence.key === "spiritualist") track("spiritualist", t("SessionUsed"));
    if (essence.key === "cyborg") {
        track("cyborgSelf", t("SelfUsed"));
        track("cyborgNoise", t("NoiseUsed"));
    }
    if (essence.key === "transhuman") track("transhuman", t("SceneUsed"));
    if (["spiritualist", "cyborg"].includes(essence.key)) {
        resets.append(button(t("ResetSession"), async () => {
            const keys = ["spiritualist", "cyborgSelf", "cyborgNoise"];
            await actor.update(Object.fromEntries(keys.map(key => [
                `flags.${essenceScope}.essenceState.${key}`, false,
            ])));
        }));
    }
    if (essence.key === "transhuman") {
        resets.append(button(t("ResetScene"), () => actor.setFlag(
            essenceScope, "essenceState.transhuman", false
        )));
    }
    if (essence.key === "avatar") {
        const label = doc.createElement("label");
        label.className = "os-essence-agenda";
        label.append(t("Agenda"));
        const agenda = doc.createElement("textarea");
        agenda.value = actor.getFlag(essenceScope, "agenda") ?? "";
        agenda.rows = 2;
        agenda.disabled = !actor.isOwner;
        agenda.addEventListener("change", () => save(() => actor.setFlag(essenceScope, "agenda", agenda.value)));
        if (inPlay) label.append(agenda);
        else {
            const value = doc.createElement("p");
            value.textContent = agenda.value;
            label.append(value);
        }
        panel.append(label);
        actions.append(button(t("RecoverTags"), async () => {
            const changes = essence.themes.filter(theme => theme.system.powertags?.some(tag => tag.burned))
                .map(theme => ({
                    _id: theme.id,
                    "system.powertags": theme.system.powertags.map(tag => ({...tag, burned: false, toBurn: false})),
                }));
            if (changes.length) await actor.updateEmbeddedDocuments("Item", changes);
        }));
    }
    for (const group of [actions, trackers, resets]) {
        if (group.childNodes.length) usage.append(group);
    }
    if (inPlay && usage.childNodes.length) panel.append(usage);

    if (actor.system.editMode) {
        for (const theme of essence.themes) {
            if (themeCategories[theme.system.type] !== "mythos") continue;
            const label = doc.createElement("label");
            label.className = "os-essence-source";
            label.append(theme.name + " — " + t("Source"));
            const input = doc.createElement("input");
            input.type = "text";
            input.value = theme.getFlag(essenceScope, "source") ?? "";
            input.disabled = !actor.isOwner;
            input.addEventListener("change", () => save(() => theme.setFlag(
                essenceScope, "source", input.value.trim()
            )));
            label.append(input);
            panel.append(label);
        }
    }
    return panel;
}

export function openEssence(actor) {
    const essence = deriveEssence(actor);
    const dialog = new foundry.applications.api.DialogV2({
        window: {title: t("Title") + ": " + t(essence.key + ".Name")},
        position: {width: 460},
        classes: ["os-essence-dialog"],
        content: '<div class="os-essence-content"></div>',
        buttons: [{action: "close", label: game.i18n.localize("Close"), default: true}],
    });
    dialog.osEssenceActor = actor;
    dialog.render(true);
}

Hooks.on("renderDialogV2", (app, element) => {
    if (!app.osEssenceActor) return;
    element.querySelector(".os-essence-content")?.replaceChildren(
        buildEssencePanel({actor: app.osEssenceActor}, element)
    );
});

Hooks.on("renderMistEngineLegendInTheMistCharacterSheet", (app, element) => {
    if (game.system.id !== "mist-engine-fvtt") return;
    if (!app.actor.system.editMode) {
        for (const row of element.querySelectorAll(".os-essence-tabs-row")) {
            row.querySelector(".os-essence-tabs-button")?.remove();
            row.replaceWith(...row.childNodes);
        }
        return;
    }
    const tabs = element.querySelector(".litm-character-sheet-tabs") ??
        element.querySelector('nav:has([data-group="litm-character-sheet"])');
    if (!tabs) return;
    const header = element.querySelector(".sheet-header");
    header?.parentElement.querySelector(":scope > .os-essence")?.remove();
    const doc = element.ownerDocument;
    let row = tabs.parentElement;
    if (!row.classList.contains("os-essence-tabs-row")) {
        row = doc.createElement("div");
        row.className = "os-essence-tabs-row";
        tabs.before(row);
        row.append(tabs);
    }
    let button = row.querySelector(".os-essence-tabs-button");
    if (!button) {
        button = doc.createElement("button");
        button.type = "button";
        button.className = "os-essence-tabs-button";
        button.addEventListener("click", () => openEssence(app.actor));
        row.prepend(button);
    }
    button.textContent = t("Title") + ": " + t(deriveEssence(app.actor).key + ".Name");
});
