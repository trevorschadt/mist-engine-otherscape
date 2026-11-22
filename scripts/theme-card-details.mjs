import {themeCategories} from "./theme-categories.mjs";

Hooks.on("renderMistEngineLegendInTheMistCharacterSheet", (app, element) => {
    if (game.system.id !== "mist-engine-fvtt" || app.actor.system.editMode) return;

    for (const card of element.querySelectorAll('.themebook-container[data-card-key^="themebook:"]')) {
        const item = app.actor.items.get(card.dataset.cardKey.slice("themebook:".length));
        if (!item || card.classList.contains("os-illustrated-theme")) continue;
        card.classList.add("os-illustrated-theme");
        const category = themeCategories[item.system.type];
        if (category) card.dataset.osCategory = category;

        const tags = card.querySelector(".powertags-container");
        for (const [field, rowClass, tagClass] of [
            ["powertags", "item-powertag-line", "litm-pc-powertag"],
            ["weaknesstags", "item-weakness-line", "litm-pc-weakness"],
        ]) {
            // The upstream template omits planned tags or renders blank rows.
            // Replace only its display rows, retaining active tag elements/listeners.
            const rows = Array.from(tags.querySelectorAll(":scope > ." + rowClass));
            const active = rows.filter(row => row.querySelector(".pt-selectable, .wt-selectable"));
            rows.filter(row => !active.includes(row)).forEach(row => row.remove());
            const fragment = element.ownerDocument.createDocumentFragment();
            let activeIndex = 0;
            const sourceTags = item.system[field] ?? [];
            // Sort only the display copy. Keep stored indices and native row
            // listeners intact, with stable ordering inside each group.
            const displayTags = field === "powertags"
                ? [...sourceTags].sort((a, b) => Number(!!a.planned) - Number(!!b.planned))
                : sourceTags;
            for (const tag of displayTags) {
                if (!tag.name?.trim()) continue;
                if (!tag.planned) {
                    const row = active[activeIndex++];
                    if (row) fragment.append(row);
                    continue;
                }
                if (field === "weaknesstags") continue;
                const row = element.ownerDocument.createElement("div");
                row.className = rowClass + " os-planned-tag";
                const label = element.ownerDocument.createElement("span");
                label.className = tagClass;
                label.textContent = tag.name;
                row.append(label);
                fragment.append(row);
            }
            const specials = tags.querySelector(".special-improvement-section-label, .item-special-improvement-line");
            tags.insertBefore(fragment, specials);
        }

        const motivation = card.querySelector(".quest-container");
        if (motivation && item.system.story?.trim()) {
            const story = element.ownerDocument.createElement("p");
            story.className = "os-theme-story";
            story.textContent = item.system.story;
            motivation.append(story);
        }
        if (motivation) {
            const specialBlock = element.ownerDocument.createElement("div");
            specialBlock.className = "os-theme-specials";
            for (const row of tags.querySelectorAll(":scope > .special-improvement-section-label, :scope > .item-special-improvement-line")) {
                specialBlock.append(row);
            }
            motivation.after(specialBlock);
        }
        const labels = card.querySelectorAll(".item-special-improvement-line .special-improvement-label");
        const specials = (item.system.specialImprovements ?? []).filter(s => s.name && s.active);
        labels.forEach((label, index) => {
            const description = specials[index]?.description;
            if (!description) return;
            const paragraph = element.ownerDocument.createElement("div");
            paragraph.className = "os-theme-special-description";
            // Use the platform's sanitized enrichment for existing rich text.
            foundry.applications.ux.TextEditor.implementation.enrichHTML(description, {
                secrets: app.actor.isOwner,
                relativeTo: item,
            }).then(html => {
                paragraph.innerHTML = html;
            }).catch(error => console.warn("Otherscape theme special description", error));
            label.parentElement.append(paragraph);
        });
    }
});
