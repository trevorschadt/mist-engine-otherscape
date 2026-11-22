// Adapted from Mist Engine 14.5.5 DiceRollApp.executeRoll under the MIT license.
// The native quick/reaction paths do not await chat creation.
import { DiceRollApp } from "/systems/mist-engine-fvtt/module/apps/dice-roll-app.mjs";
import {essenceScope} from "./essence-data.mjs";
import * as DetailedSpend from "/systems/mist-engine-fvtt/module/lib/detailed-spend.mjs";
import { Collaboration } from "/systems/mist-engine-fvtt/module/lib/collaboration.mjs";

export async function executeEssenceRoll({ numModPositive, numModNegative, mightScale }, {receipt, beforePublish, onCanceled, commit}) {
    let numPositiveTags = numModPositive;
    let numNegativeTags = numModNegative;

    let tagsAndStatusForRoll = DiceRollApp.applyRulesToSelectedTags(this.selectedTags, this.selectedGmTags, this.selectedStoryTags, this.challengeTags);
    let countTags = DiceRollApp.calculatePowerTags(tagsAndStatusForRoll);
    numPositiveTags += countTags.positive;
    numNegativeTags += countTags.negative;

    // Helping Each Other (p. 158): +1 Power per contributed tag (never burned).
    const helpingContribs = (this.helpingTags ?? []).map(h => ({ name: `${h.name} (${h.helperName})`, positive: true, source: "help" }));
    numPositiveTags += helpingContribs.length;


    const dicePromises = [];

    let rollFormula = `2d6`;
    if (numPositiveTags > 0) rollFormula += ` + ${numPositiveTags}`;
    if (numNegativeTags > 0) rollFormula += ` - ${numNegativeTags}`;

    let numPowerTags = parseInt(numPositiveTags) - parseInt(numNegativeTags);

    if (mightScale != 0) {
        rollFormula += ` + ${mightScale}`;
        numPowerTags += mightScale;
    }

    // clamp only AFTER might is applied, otherwise a negative tag total
    // gets lifted to 1 first and might is added on top (issue #97)
    if (numPowerTags <= 0) numPowerTags = 1; // at least 1 power tag

    const diceRoll = new Roll(rollFormula, this.actor.getRollData());
    await diceRoll.evaluate();

    this.addShowDicePromise(dicePromises, diceRoll);
    await Promise.all(dicePromises);

    let diceResults = [...diceRoll.terms[0].results].map(r => r.result);

    let isCritical = (diceResults[0] === 6 && diceResults[1] === 6);
    let isFumble = (diceResults[0] === 1 && diceResults[1] === 1);

    let diceRollHTML = await diceRoll.render();

    let consequenceResult = -1;
    if (diceRoll.total >= 10) {
        consequenceResult = 1;
    }
    else if (diceRoll.total >= 7 && diceRoll.total <= 9) {
        consequenceResult = 0;
    }

    // double sixes always mean Success without Consequences, double ones
    // always Consequences without Success — regardless of Power!!!!
    if (isCritical) consequenceResult = 1;
    if (isFumble) consequenceResult = -1;

    let positiveTags = [...tagsAndStatusForRoll.filter(t => t.positive), ...helpingContribs];
    let negativeTags = tagsAndStatusForRoll.filter(t => !t.positive);

    const chatVars = {
        diceRollHTML: diceRollHTML,
        label: game.i18n.localize(`MIST_ENGINE.ROLL_TYPES.${this.rollType}`),
        tagsAndStatusForRoll: this.tagsAndStatusForRoll,
        positiveTags: positiveTags,
        negativeTags: negativeTags,
        consequenceResult: consequenceResult,
        isCritical: isCritical,
        isFumble: isFumble,
        numPowerTags: numPowerTags,
    };

    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const flags = {[essenceScope]: {essenceReceipt: receipt}};
    let content;
    if (this.rollType === "detailed") {
        const spend = {...chatVars, total: numPowerTags, entries: []};
        flags["mist-engine-fvtt"] = {detailedSpend: spend};
        content = await DetailedSpend.renderDetailedCard(spend);
    } else {
        content = await foundry.applications.handlebars.renderTemplate(
            `systems/mist-engine-fvtt/templates/chat/${this.rollType}-result.hbs`,
            chatVars
        );
    }
    await beforePublish();
    const message = await ChatMessage.create({content, speaker, flags});

    if (!message) {
        onCanceled();
        throw new Error("Essence roll chat message was not created");
    }
    try {
        await commit();
    } catch (error) {
        // The chat card exists. Finish normal roll cleanup even if state saving fails.
        console.error("Otherscape Essence usage could not be recorded", error);
        ui.notifications.error(game.i18n.localize("OTHERSCAPE_MIST_SKIN.Essence.SaveError"));
    }

    // the roll is made: spend the helping tags that were actually used —
    // removed ones never reach this point, a cancelled/rejected roll neither
    Collaboration.reportHelpUsed(this.helpingTags);

    this.numModPositive = 0;
    this.numModNegative = 0;
    this.mightScale = 0;
    this.helpingTags = [];
    this.pendingHelpReqId = null;
    this.invertedTags.clear(); // #35: the inversion only applied to this roll
    this.invertedChallengeEntries.clear(); // #104: the inversion only applied to this roll

    await this.resetTags();
    await this.close();
}
