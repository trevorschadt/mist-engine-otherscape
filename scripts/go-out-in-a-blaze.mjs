const degrees = ["significant", "noReturn", "ultimate", "inescapable"];
const text = key => game.i18n.localize("OTHERSCAPE_MIST_SKIN.Blaze." + key);
const escape = value => {
    const element = document.createElement("span");
    element.textContent = value;
    return element.innerHTML;
};

Hooks.on("renderDialogV2", (app, element) => {
    if (!element.classList.contains("os-blaze-dialog")) return;
    const select = element.querySelector('select[name="level"]');
    const description = element.querySelector(".os-blaze-description");
    const update = () => {
        const degree = select.value;
        description.replaceChildren();
        for (const section of ["Outcome", "Consequences"]) {
            const paragraph = element.ownerDocument.createElement("p");
            const label = element.ownerDocument.createElement("strong");
            label.textContent = text(section) + " ";
            paragraph.append(label, text(degree + "." + section));
            description.append(paragraph);
        }
    };
    select.addEventListener("change", update);
    update();
});

async function rollBlaze(actor) {
    const options = degrees.map(degree =>
        `<option value="${degree}">${escape(text(degree + ".Name"))}</option>`
    ).join("");
    const result = await foundry.applications.api.DialogV2.prompt({
        window: {title: text("Title"), icon: "fa-solid fa-fire"},
        classes: ["mist-engine", "dialog", "sacrifice-roll-dialog", "os-blaze-dialog"],
        content: `<p class="hint">${escape(text("Hint"))}</p>
            <div class="form-group"><label>${escape(text("Degree"))}</label>
                <select name="level">${options}</select></div>
            <div class="os-blaze-description" aria-live="polite"></div>
            <div class="form-group"><label>${escape(game.i18n.localize("MIST_ENGINE.SACRIFICE.Modifier"))}</label>
                <input type="number" name="modifier" value="0"></div>`,
        ok: {
            label: game.i18n.localize("MIST_ENGINE.SACRIFICE.Roll"),
            icon: "fa-solid fa-dice",
            callback: (_event, button) => ({
                degree: button.form.elements.level.value,
                modifier: parseInt(button.form.elements.modifier.value, 10) || 0,
            }),
        },
        rejectClose: false,
    });
    if (!result || !degrees.includes(result.degree)) return;
    const roll = new Roll("2d6 + @modifier", {modifier: result.modifier});
    await roll.evaluate();
    if (game.dice3d) await game.dice3d.showForRoll(roll, game.user, true, null, false);

    const strong = roll.total >= 10;
    const success = roll.total >= 7;
    const color = strong ? "positive" : success ? "neutral" : "negative";
    const score = strong ? "10+" : success ? "7–9" : "6−";
    const consequenceKey = strong && result.degree !== "inescapable"
        ? result.degree + ".StrongConsequences"
        : result.degree + ".Consequences";
    const outcome = success ? text(result.degree + ".Outcome") : text("Failure");
    const content = `<form class="roll-card">
        <div class="card-title">${escape(text("Title"))} — ${escape(text(result.degree + ".Name"))}</div>
        <div class="roll-result">${await roll.render()}</div>
        <div class="consequence-container"><div class="consequence-result-${color}">
            <span class="heading"><i class="consequence-result-icon ${color}"></i>${score}</span>
            <p><strong>${escape(text("Outcome"))}</strong> ${escape(outcome)}</p>
            <p><strong>${escape(text("Consequences"))}</strong> ${escape(text(consequenceKey))}</p>
        </div></div></form>`;
    await ChatMessage.create({content, speaker: ChatMessage.getSpeaker({actor})});
}

const boundRoots = new WeakSet();
Hooks.on("renderMistEngineLegendInTheMistCharacterSheet", (app, element) => {
    if (game.system.id !== "mist-engine-fvtt" || boundRoots.has(element)) return;
    boundRoots.add(element);
    element.addEventListener("click", event => {
        const button = event.target.closest('[data-action="clickSacrificeRoll"]');
        if (!button || !element.contains(button)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        rollBlaze(app.actor).catch(error => {
            console.error("Otherscape Go Out in a Blaze failed.", error);
            ui.notifications.error(text("Error"));
        });
    }, {capture: true});
});
