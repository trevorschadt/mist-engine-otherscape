import {routeCategoryConfirmations} from "./roll-confirmation.mjs";
import {deriveEssence} from "./essence-data.mjs";
import {openEssence} from "./essence.mjs";

import {categories, characterThemes, themeCategories} from "./theme-categories.mjs";

const categoryLabel = category => game.i18n.localize("OTHERSCAPE_MIST_SKIN.RollWith." + category);
const retainModifier = tag => !tag.positive || Number(tag.value) > 0;

export function countThemes(actor, category) {
    return characterThemes(actor).filter(item => themeCategories[item.system.type] === category).length;
}

export function categoryTags(tags, category, count) {
    const kept = tags.filter(tag => tag.source !== "os-theme").filter(retainModifier)
        .map(tag => ({...tag, toBurn: false}));
    for (let index = 0; index < count; index++) {
        kept.push({name: categoryLabel(category), positive: true, source: "os-theme"});
    }
    return kept;
}

Hooks.once("ready", async () => {
    if (game.system.id !== "mist-engine-fvtt") return;
    const {DiceRollApp} = await import("/systems/mist-engine-fvtt/module/apps/dice-roll-app.mjs");

    const {RollConfirmation} = await import("/systems/mist-engine-fvtt/module/lib/roll-confirmation.mjs");
    routeCategoryConfirmations(DiceRollApp, RollConfirmation.SOCKET);

    const categoryDialogs = new Set();
    const refreshCategoryDialogs = () => {
        for (const dialog of categoryDialogs) {
            if (dialog.rendered && !dialog.pendingRequest && !dialog.osExecutingRoll) dialog.updateTagsAndStatuses(true);
        }
    };
    for (const hook of ["updateActor", "createItem", "updateItem", "deleteItem",
        "createToken", "updateToken", "deleteToken", "canvasReady"]) {
        Hooks.on(hook, refreshCategoryDialogs);
    }

    class ThemeTypeRoll extends DiceRollApp {
        constructor(actor, category) {
            // The base constructor assigns its singleton. This independent roll
            // keeps the normal tag-based roll dialog's singleton intact.
            const previous = DiceRollApp.instance;
            super({actor, type: "quick", id: "os-theme-roll-" + foundry.utils.randomID()});
            DiceRollApp.instance = previous;
            this.osCategory = category;
        }

        normalizeTags() {
            const count = countThemes(this.actor, this.osCategory);
            this.selectedTags = categoryTags(this.selectedTags, this.osCategory, count);
            for (const field of ["selectedGmTags", "selectedStoryTags", "challengeTags"]) {
                this[field] = this[field].filter(retainModifier).map(tag => ({...tag, toBurn: false}));
            }
            this.helpingTags = [];
        }

        updateTagsAndStatuses(renderFlag = false) {
            super.updateTagsAndStatuses(false);
            this.normalizeTags();
            if (renderFlag && this.rendered) this.render();
        }

        async _prepareContext(options) {
            this.normalizeTags();
            const context = await super._prepareContext(options);
            context.canRequestHelp = false;
            return context;
        }

        _onClose(options) {
            categoryDialogs.delete(this);
            super._onClose(options);
        }

        async executeRoll(values) {
            if (this.osExecutingRoll) return;
            this.osExecutingRoll = true;
            // A confirmed request is already a snapshot of the selected theme count.
            // Preserve its synthetic entries instead of recounting after approval.
            this.selectedTags = this.selectedTags.filter(tag => tag.source === "os-theme" || retainModifier(tag))
                .map(tag => ({...tag, toBurn: false}));
            for (const field of ["selectedGmTags", "selectedStoryTags", "challengeTags"]) {
                this[field] = this[field].filter(retainModifier).map(tag => ({...tag, toBurn: false}));
            }
            this.helpingTags = [];
            try {
                return await super.executeRoll(values);
            } finally {
                this.osExecutingRoll = false;
            }
        }

        isTagToBurn() {
            return false;
        }

        async resetTags() {
            try {
                // The base reset reads backpack burn flags from documents.
                // Clear those flags so category rolls can never consume a burn.
                for (const item of this.actor.items) {
                    if (item.type !== "backpack" || !item.system.items?.some(tag => tag.toBurn)) continue;
                    await item.update({"system.items": item.system.items.map(tag => ({...tag, toBurn: false}))});
                }
                // The base reset scratches relationship tags by their selected
                // document flag. Positive relationship tags were excluded here.
                const relationships = this.actor.system.fellowships ?? [];
                if (relationships.some(tag => tag.selected)) {
                    await this.actor.update({"system.fellowships": relationships.map(tag => ({...tag, selected: false}))});
                }
                await super.resetTags();
            } catch (error) {
                console.error("Otherscape theme roll cleanup failed.", error);
                ui.notifications.error(game.i18n.localize("OTHERSCAPE_MIST_SKIN.RollWith.CleanupError"));
            }
        }
    }

    Hooks.on("renderMistEngineLegendInTheMistCharacterSheet", (app, element) => {
        if (app.actor.system.editMode) return;
        const controls = element.querySelector(".sheet-header .col-status");
        if (!controls || controls.querySelector(".os-roll-with")) return;
        const group = element.ownerDocument.createElement("div");
        group.className = "os-roll-with";
        for (const category of categories) {
            const button = element.ownerDocument.createElement("button");
            button.type = "button";
            button.className = "roll-button";
            button.textContent = categoryLabel(category) + " (" + countThemes(app.actor, category) + ")";
            button.addEventListener("click", () => {
                const roll = new ThemeTypeRoll(app.actor, category);
                categoryDialogs.add(roll);
                roll.updateTagsAndStatuses();
                roll.render(true);
            });
            group.append(button);
        }
        const essence = deriveEssence(app.actor);
        const essenceButton = element.ownerDocument.createElement("button");
        essenceButton.type = "button";
        essenceButton.className = "roll-button os-essence-button";
        essenceButton.textContent = game.i18n.localize("OTHERSCAPE_MIST_SKIN.Essence.Title") + ": " +
            game.i18n.localize("OTHERSCAPE_MIST_SKIN.Essence." + essence.key + ".Name");
        essenceButton.addEventListener("click", () => openEssence(app.actor));
        group.append(essenceButton);
        controls.classList.add("os-status-with-controls");
        controls.append(group);
    });

    Hooks.on("renderThemeTypeRoll", (app, element) => {
        const form = element.querySelector("form");
        if (!form || form.querySelector(".os-domain-note")) return;
        const note = element.ownerDocument.createElement("p");
        note.className = "hint os-domain-note";
        note.textContent = categoryLabel(app.osCategory) + ". " +
            game.i18n.localize("OTHERSCAPE_MIST_SKIN.RollWith.Hint");
        form.prepend(note);
        const type = element.ownerDocument.createElement("select");
        type.setAttribute("aria-label", game.i18n.localize("OTHERSCAPE_MIST_SKIN.RollWith.ActionType"));
        for (const value of ["quick", "detailed", "reaction"]) {
            const option = element.ownerDocument.createElement("option");
            option.value = value;
            option.textContent = game.i18n.localize("MIST_ENGINE.ROLL_TYPES." + value);
            type.add(option);
        }
        type.value = app.rollType;
        type.disabled = !!app.pendingRequest;
        type.addEventListener("change", () => {
            app.setOptions({type: type.value});
            app.render();
        });
        note.after(type);
        element.querySelector('[data-action="clickRequestHelp"]')?.remove();
    });
});
