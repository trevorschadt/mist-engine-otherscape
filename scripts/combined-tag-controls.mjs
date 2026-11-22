import {attachedPowerSets, effectiveChallengeTags, updateChallengeTagSource} from "./challenge-tags.mjs";
const t = key => game.i18n.localize("OTHERSCAPE_MIST_SKIN.PowerSets." + key);

export function wireCombinedTagControls(app, element) {
    const actor = app.actor;
    const sets = attachedPowerSets(actor);
    if (actor.system.editMode || !sets.length) return;
    const combined = effectiveChallengeTags(actor, sets);
    for (const container of element.querySelectorAll(".npc-floating-tags-and-status-container")) {
        // Strip old element listeners, then route each synthetic row to its
        // original document(s). Header create/lock actions remain native.
        const copy = container.cloneNode(true);
        container.replaceWith(copy);
        copy.addEventListener("contextmenu", event => {
            if (event.target.closest(".floating-tag-and-status-entry")) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        }, true);
        const run = async operation => {
            if (!actor.isOwner || copy.dataset.busy) return;
            copy.dataset.busy = "true";
            try {
                await operation();
                app.sendFloatableTagOrStatusUpdate?.();
                const {DiceRollApp} = await import("/systems/mist-engine-fvtt/module/apps/dice-roll-app.mjs");
                DiceRollApp.instance?.updateTagsAndStatuses(true);
                await app.render({force: true});
            } catch (error) {
                console.error("Combined Challenge tag update failed", error);
                ui.notifications.error(t("TagUpdateError"));
            } finally { delete copy.dataset.busy; }
        };
        for (const row of copy.querySelectorAll(".floating-tag-and-status-entry")) {
            const entry = combined[Number(row.dataset.index)];
            if (!entry) continue;
            row.title = game.i18n.format("OTHERSCAPE_MIST_SKIN.PowerSets.TagSource", {name: entry.source.document.name});
            for (const control of row.querySelectorAll("[data-action]")) {
                const action = control.dataset.action;
                control.removeAttribute("data-action");
                control.addEventListener("click", event => {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    run(async () => {
                        const {source} = entry;
                        const latest = source.document.system.floatingTagsAndStatuses?.[source.index];
                        if (!latest || latest.name !== source.name) return;
                        let patch;
                        if (action === "deleteFloatingTagOrStatus") {
                            if (control.dataset.confirm && !(await foundry.applications.api.DialogV2.confirm({
                                window: {title: t("DeleteTag")}, content: t("DeleteSourceHelp"), rejectClose: false,
                            }))) return;
                            patch = null;
                        } else if (action === "toggleFloatingTagOrStatusSelected") patch = {selected: !latest.selected};
                        else if (action === "toggleFloatingTagOrStatusModifier") patch = {positive: latest.positive === false};
                        else if (action === "toggleFloatingTagOrStatus") patch = latest.isStatus
                            ? {isStatus: false, value: 0, might: 0, markings: Array(6).fill(false)}
                            : {isStatus: true, value: 1, might: 0, markings: [true, false, false, false, false, false]};
                        else if (action === "toggleFloatingTagOrStatusMarking") {
                            const markings = Array.from({length: 6}, (_, index) => !!latest.markings?.[index]);
                            const index = Number(control.dataset.markingIndex);
                            if (!Number.isInteger(index) || index < 0 || index > 5) return;
                            markings[index] = !markings[index];
                            patch = {markings, value: markings.lastIndexOf(true) + 1};
                        } else return;
                        await updateChallengeTagSource(entry.source, patch);
                    });
                });
            }
            for (const input of row.querySelectorAll(".updateable-fts-stat")) {
                input.classList.remove("updateable-fts-stat");
                input.disabled = !actor.isOwner;
                input.addEventListener("change", event => {
                    event.stopImmediatePropagation();
                    run(() => updateChallengeTagSource(entry.source, {[input.dataset.key]: input.value}));
                });
            }
            if (!actor.isOwner) continue;
            const edit = element.ownerDocument.createElement("button");
            edit.type = "button";
            edit.className = "os-edit-combined-tag";
            edit.textContent = t("Edit");
            edit.addEventListener("click", () => run(async () => {
                const doc = element.ownerDocument;
                const original = entry.source.document.system.floatingTagsAndStatuses[entry.source.index];
                if (!original || original.name !== entry.source.name) return;
                const escape = value => {const span = doc.createElement("span");span.textContent = String(value ?? "");return span.innerHTML.replaceAll('"', '&quot;');};
                const result = await foundry.applications.api.DialogV2.prompt({
                    window: {title: t("EditTag")},
                    content: `<div class="form-group"><label>${t("TagName")}</label><input name="tagName" value="${escape(entry.name)}"></div>
                      <div class="form-group"><label>${t("IsStatus")}</label><input name="isStatus" type="checkbox" ${original.isStatus ? "checked" : ""}></div>
                      <div class="form-group"><label>${t("Tier")}</label><input name="tier" type="number" min="0" max="6" value="${Number(original.value) || 0}"></div>
                      <div class="form-group"><label>${t("Positive")}</label><input name="positive" type="checkbox" ${original.positive !== false ? "checked" : ""}></div>`,
                    ok: {label: t("Save"), callback: (_event, button) => {
                        const fields = button.form.elements;
                        return {name: fields.tagName.value.trim(), isStatus: fields.isStatus.checked,
                            value: Math.max(0, Math.min(6, Number(fields.tier.value) || 0)), positive: fields.positive.checked};
                    }}, rejectClose: false,
                });
                if (!result?.name) return;
                result.value = result.isStatus ? result.value : 0;
                result.markings = Array.from({length: 6}, (_, index) => index + 1 === result.value);
                await updateChallengeTagSource(entry.source, result);
            }));
            row.querySelector(".fts-tag-container")?.append(edit);
        }
    }
}
