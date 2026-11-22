// Promise is literal text in the upstream character template.
Hooks.on("renderMistEngineLegendInTheMistCharacterSheet", (app, element) => {
    if (game.system.id !== "mist-engine-fvtt") return;
    for (const label of element.querySelectorAll(".fellowship-promises-label")) {
        label.textContent = game.i18n.localize("OTHERSCAPE_MIST_SKIN.Evolution");
    }

    for (const track of element.querySelectorAll(
        '.development-partial-container[data-value-key="system.abandon"], ' +
        '.development-partial-container[data-value-key="system.improve"]'
    )) {
        if (track.querySelector(".os-development-label")) continue;
        const label = element.ownerDocument.createElement("span");
        label.className = "os-development-label";
        for (const node of Array.from(track.childNodes)) {
            if (node.nodeType === 3) label.append(node);
        }
        track.append(label);
    }

    if (app.actor.system.editMode) return;
    const motivationKeys = {
        "os-self": "Identity",
        "os-mythos": "Ritual",
        "os-noise": "Itch",
        "litm-greatness": "Identity",
        "litm-adventure": "Ritual",
        "litm-origin": "Itch",
    };
    for (const card of element.querySelectorAll('.themebook-container[data-card-key^="themebook:"]')) {
        const item = app.actor.items.get(card.dataset.cardKey.slice("themebook:".length));
        const key = motivationKeys[item?.system.type];
        const heading = card.querySelector(".quest-container > h3");
        if (key && heading) {
            heading.textContent = game.i18n.localize("OTHERSCAPE_MIST_SKIN.Motivation." + key);
        }
    }
});
