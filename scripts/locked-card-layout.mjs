// Core themes have no separate rank field. Use the first four non-story
// themebooks in the saved Main-tab order without editing the actor's layout.
Hooks.on("renderMistEngineLegendInTheMistCharacterSheet", (app, element) => {
    if (game.system.id !== "mist-engine-fvtt") return;

    const grid = element.querySelector('.card-grid[data-tab-category="main"]');
    if (!grid || grid.classList.contains("os-locked-card-grid")) return;

    const core = [];
    const other = [];
    for (const card of Array.from(grid.children)) {
        const key = card.dataset.cardKey ?? "";
        const theme = key.startsWith("themebook:") && app.actor.items.get(key.slice("themebook:".length));
        const row = core.length < 4 && theme && !theme.system.options?.isStoryTheme ? core : other;
        row.push(card);
    }

    const lowerOrder = ["backpack", "fellowship-themecard", "fellowships", "quintessences"];
    const rank = card => {
        const index = lowerOrder.indexOf(card.dataset.cardKey);
        return index < 0 ? lowerOrder.length : index;
    };
    other.sort((a, b) => rank(a) - rank(b));

    grid.classList.add("os-locked-card-grid");
    for (const cards of [core, other]) {
        if (!cards.length) continue;

        const row = element.ownerDocument.createElement("div");
        row.className = "os-character-card-row";
        row.append(...cards);
        grid.append(row);
    }
});
