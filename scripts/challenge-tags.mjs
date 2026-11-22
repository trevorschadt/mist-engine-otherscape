const key = value => String(value ?? "").trim().toLowerCase();
export const attachedPowerSets = actor => actor.items.filter(item => item.type === "challenge-addon");

export function effectiveChallengeTags(actor, sets = attachedPowerSets(actor)) {
    const rows = [];
    const byName = new Map();
    for (const document of [actor, ...sets]) {
        (document.system.floatingTagsAndStatuses ?? []).forEach((tag, index) => {
            const name = key(tag.name);
            if (!name && document !== actor) return;
            const source = {document, index, name: tag.name};
            const previous = name && byName.get(name);
            const row = {...tag, source};
            if (!previous || document === actor) {
                if (name && !previous) byName.set(name, row);
                rows.push(row);
                return;
            }
            if (!previous.isStatus && !tag.isStatus) return;
            const tier = Number(previous.value) || 0;
            const incoming = Number(tag.value) || 0;
            const markings = Array.from({length: 6}, (_, i) =>
                !!previous.markings?.[i] || !!tag.markings?.[i] || i + 1 === tier || i + 1 === incoming);
            if (tag.isStatus && (!previous.isStatus || incoming > tier)) Object.assign(previous, row);
            Object.assign(previous, {isStatus: true, value: Math.max(tier, incoming), markings});
        });
    }
    return rows;
}

export async function updateChallengeTagSource(source, patch) {
    const {document, index, name} = source;
    if (!document.isOwner) return;
    const tags = document.system.floatingTagsAndStatuses ?? [];
    if (!tags[index] || tags[index].name !== name) return;
    const updated = tags.flatMap((tag, i) => i !== index ? [tag] : patch ? [{...tag, ...patch}] : []);
    await document.update({"system.floatingTagsAndStatuses": updated});
}

function challenges(scene) {
    return [...new Set((scene?.tokens.contents ?? []).map(token => token.actor))]
        .filter(actor => actor?.type === "litm-npc");
}

export function integrateChallengeTags(MistSceneApp) {
    const collect = MistSceneApp.prototype.getCombinedSelectedNPCTags;
    MistSceneApp.prototype.getCombinedSelectedNPCTags = function () {
        const actors = challenges(this.getCurrentScene());
        const ids = new Set(actors.filter(actor => attachedPowerSets(actor).length).map(actor => actor.id));
        const native = collect.call(this).filter(entry => !ids.has(entry.actorId));
        for (const actor of actors.filter(actor => ids.has(actor.id))) {
            for (const tag of effectiveChallengeTags(actor)) {
                if (!tag.selected) continue;
                const {document, index} = tag.source;
                native.push({...tag, source: "litm-npc", actorId: actor.id, index: document.uuid + ":" + index});
            }
        }
        return native;
    };

    const reset = MistSceneApp.prototype.resetSelection;
    MistSceneApp.prototype.resetSelection = function (sceneId = this.currentSceneId) {
        const result = reset.call(this, sceneId);
        if (!game.user.isGM) return result;
        const operations = challenges(game.scenes.get(sceneId)).map(actor => {
            const changes = attachedPowerSets(actor).filter(item =>
                item.system.floatingTagsAndStatuses?.some(tag => tag.selected)
            ).map(item => ({
                _id: item.id,
                "system.floatingTagsAndStatuses": item.system.floatingTagsAndStatuses.map(tag => ({...tag, selected: false})),
            }));
            return changes.length ? actor.updateEmbeddedDocuments("Item", changes) : null;
        }).filter(Boolean);
        if (operations.length) return Promise.all(operations).then(() => this.sendUpdateHookEvent()).catch(error => {
            console.error("Power Set selection reset failed", error);
            ui.notifications.error(game.i18n.localize("OTHERSCAPE_MIST_SKIN.PowerSets.TagUpdateError"));
        });
        return result;
    };
}
