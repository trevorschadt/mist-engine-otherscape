import {setupEssenceReservations} from "./essence-reservations.mjs";
import {deriveEssence, essenceScope} from "./essence-data.mjs";

export function pendingEssenceBonus(actor, rollCategory) {
    if (!actor) return null;
    const plan = actor.getFlag(essenceScope, "pendingEssenceBonus");
    const essence = deriveEssence(actor);
    const used = actor.getFlag(essenceScope, "essenceState") ?? {};
    if (!plan || plan.essence !== essence.key) return null;
    if (essence.key === "spiritualist") {
        if (used.spiritualist || !["self", "mythos"].includes(plan.category)) return null;
        if (rollCategory === "noise") return null;
        const category = rollCategory === "self" ? "mythos" : rollCategory === "mythos" ? "self" : plan.category;
        return {...plan, category, power: essence.counts[category], uses: ["spiritualist"]};
    }
    if (essence.key === "cyborg") {
        const categories = plan.category === "both" ? ["self", "noise"] : [plan.category];
        if (categories.some(category => !["self", "noise"].includes(category))) return null;
        const uses = categories.map(category => category === "self" ? "cyborgSelf" : "cyborgNoise");
        if (uses.some(key => used[key])) return null;
        return {...plan, power: categories.reduce((sum, category) => sum + essence.counts[category], 0), uses};
    }
    return null;
}

Hooks.once("ready", async () => {
    if (game.system.id !== "mist-engine-fvtt") return;
    const {DiceRollApp} = await import("/systems/mist-engine-fvtt/module/apps/dice-roll-app.mjs");
    const {executeEssenceRoll} = await import("./execute-essence-roll.mjs");
    const reservation = setupEssenceReservations(pendingEssenceBonus);
    const compute = DiceRollApp.prototype.computePowerAmount;
    DiceRollApp.prototype.computePowerAmount = function () {
        const bonus = pendingEssenceBonus(this.actor, this.osCategory);
        // Add before the native minimum-Power clamp.
        if (!bonus) return compute.call(this);
        const previous = this.numModPositive;
        this.numModPositive = (previous || 0) + bonus.power;
        try { return compute.call(this); }
        finally { this.numModPositive = previous; }
    };

    const request = DiceRollApp.prototype.requestGmConfirmation;
    DiceRollApp.prototype.requestGmConfirmation = function (values) {
        const bonus = pendingEssenceBonus(this.actor, this.osCategory);
        const adjusted = bonus ? {
            ...values,
            numModPositive: values.numModPositive + bonus.power,
            osEssenceBonus: bonus,
        } : {...values, osEssenceBonus: null};
        return request.call(this, adjusted);
    };

    const executing = new WeakSet();
    const execute = DiceRollApp.prototype.executeRoll;
    DiceRollApp.prototype.executeRoll = async function (values) {
        if (executing.has(this)) return;
        const confirmed = Object.hasOwn(values, "osEssenceBonus");
        const planned = confirmed ? values.osEssenceBonus : pendingEssenceBonus(this.actor, this.osCategory);
        if (!planned) return execute.call(this, values);

        const actor = this.actor;
        const token = foundry.utils.randomID();
        const fields = ["selectedTags", "selectedGmTags", "selectedStoryTags", "challengeTags", "helpingTags"];
        const snapshot = Object.fromEntries(fields.map(field => [field, foundry.utils.deepClone(this[field])]));
        const rollType = this.rollType;
        let publicationStarted = false;
        executing.add(this);
        try {
            const bonus = await reservation(actor, "reserve", token, planned.id, this.osCategory);
            if (!bonus || (confirmed && bonus.power !== planned.power)) {
                ui.notifications.warn(game.i18n.localize("OTHERSCAPE_MIST_SKIN.Essence.BonusUnavailable"));
                if (this.rendered) await this.render();
                return;
            }
            if (!this.rendered || this.actor !== actor || this.rollType !== rollType) return;
            Object.assign(this, snapshot);
            const adjusted = confirmed ? values : {...values, numModPositive: values.numModPositive + bonus.power};
            return await executeEssenceRoll.call(this, adjusted, {
                receipt: {actorUuid: actor.uuid, token},
                beforePublish: async () => {
                    if (!await reservation(actor, "publish", token)) throw new Error("Could not mark Essence roll for publication");
                    publicationStarted = true;
                },
                onCanceled: () => { publicationStarted = false; },
                commit: async () => {
                    if (await reservation(actor, "commit", token)) return;
                    if (!await reservation(actor, "commit", token)) throw new Error("Could not record Essence use");
                },
            });
        } catch (error) {
            console.error("Otherscape Essence roll failed", error);
            ui.notifications.error(game.i18n.localize("OTHERSCAPE_MIST_SKIN.Essence.SaveError"));
        } finally {
            if (!publicationStarted) await reservation(actor, "release", token).catch(console.error);
            executing.delete(this);
        }
    };

    Hooks.on("renderDiceRollApp", (app, element) => {
        const bonus = pendingEssenceBonus(app.actor, app.osCategory);
        if (!bonus || element.querySelector(".os-essence-roll-note")) return;
        const note = element.ownerDocument.createElement("p");
        note.className = "hint os-essence-roll-note";
        note.textContent = game.i18n.format("OTHERSCAPE_MIST_SKIN.Essence.BonusNote", {
            essence: game.i18n.localize("OTHERSCAPE_MIST_SKIN.Essence." + bonus.essence + ".Name"),
            power: bonus.power,
        });
        element.querySelector("form")?.prepend(note);
    });
});
