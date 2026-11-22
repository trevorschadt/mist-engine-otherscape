import {effectiveChallengeTags, integrateChallengeTags} from "./challenge-tags.mjs";
import {wireCombinedTagControls} from "./combined-tag-controls.mjs";
import {combinePowerSetProperties} from "./power-set-properties.mjs";

const scope = "otherscape-mist-skin";
const text = key => game.i18n.localize("OTHERSCAPE_MIST_SKIN.PowerSets." + key);
const category = item => {
    const value = item.getFlag(scope, "themeType");
    return ["self", "mythos", "noise"].includes(value) ? value : "unassigned";
};

Hooks.once("ready", async () => {
    if (game.system.id !== "mist-engine-fvtt") return;
    const [{MistEngineLegendInTheMistNpcSheet: Sheet}, {ChallengeAddonAdapter}, {enrichTextWithTags}, {FloatingTagAndStatusAdapter}, {MistEngineChallengeAddonItemSheet: PowerSetSheet}, {MistSceneApp}] = await Promise.all([
        import("/systems/mist-engine-fvtt/module/sheets/litm-npc-sheet.mjs"),
        import("/systems/mist-engine-fvtt/module/lib/challenge-addon-adapter.mjs"),
        import("/systems/mist-engine-fvtt/module/lib/tag-status-text-helper.mjs"),
        import("/systems/mist-engine-fvtt/module/lib/floating-tag-and-status-adapter.mjs"),
        import("/systems/mist-engine-fvtt/module/sheets/item-challenge-addon-sheet.mjs"),
        import("/systems/mist-engine-fvtt/module/apps/scene-app.mjs"),
    ]);
    integrateChallengeTags(MistSceneApp);
    PowerSetSheet.PARTS = {...PowerSetSheet.PARTS, form: {
        ...PowerSetSheet.PARTS.form,
        template: "modules/otherscape-mist-skin/templates/power-set-form.hbs",
        templates: [
            ...(PowerSetSheet.PARTS.form.templates ?? []),
            "modules/otherscape-mist-skin/templates/power-set-limits.hbs",
            "modules/otherscape-mist-skin/templates/power-set-threats.hbs",
        ],
    }};
    Sheet.PARTS = {...Sheet.PARTS, details: {
        ...Sheet.PARTS.details,
        template: "modules/otherscape-mist-skin/templates/challenge-details.hbs",
        templates: [
            ...(Sheet.PARTS.details.templates ?? []),
            "modules/otherscape-mist-skin/templates/power-set-limits.hbs",
            "modules/otherscape-mist-skin/templates/power-set-threats.hbs",
        ],
    }, powersets: {
        id: "powersets", template: "modules/otherscape-mist-skin/templates/power-sets.hbs",
        scrollable: [".scrollable"],
    }};
    const group = Sheet.TABS["npc-sheet"];
    Sheet.TABS = {...Sheet.TABS, "npc-sheet": {...group, tabs: [
        ...group.tabs, {id: "powersets", group: "npc-sheet"},
    ]}};

    // Keep modular Power Sets as embedded documents. Never flatten them into
    // the base Challenge: removal must not erase the Challenge's own content.
    ChallengeAddonAdapter.applyToChallenge = async (actor, item) => {
        if (actor?.type !== "litm-npc" || !actor.isOwner) return;
        const source = item.getFlag(scope, "sourceUuid") || item.uuid;
        if (actor.items.some(entry => entry.type === "challenge-addon" &&
            (entry.uuid === item.uuid || entry.getFlag(scope, "sourceUuid") === source))) {
            ui.notifications.warn(text("AlreadyAttached"));
            return;
        }
        const data = item.toObject();
        delete data._id;
        foundry.utils.setProperty(data, `flags.${scope}.sourceUuid`, source);
        await actor.createEmbeddedDocuments("Item", [data]);
    };

    const prepare = Sheet.prototype._prepareContext;
    Sheet.prototype._prepareContext = async function (options) {
        const items = this.actor.items.filter(item => ["challenge-addon", "shortchallenge"].includes(item.type));
        const legacy = this.actor.system.appliedAddons ?? [];
        const show = !!this.actor.system.editMode || items.length > 0 || legacy.length > 0;
        if (!show && this.tabGroups?.["npc-sheet"] === "powersets") this.tabGroups["npc-sheet"] = "details";
        const context = await prepare.call(this, options);
        if (!this.actor.isOwner) {
            context.system.secrets = [];
            context.hasSecrets = false;
        }
        context.osShowPowerSets = show;
        context.osCanEditPowerSets = !!this.actor.system.editMode && this.actor.isOwner;
        const enrich = value => enrichTextWithTags(value, this.actor);
        context.osPowerSets = await Promise.all(items.map(async item => {
            const s = item.system;
            const cat = category(item);
            const sections = async entries => Promise.all((entries ?? []).map(async entry => ({
                name: entry.name ?? "", html: await enrich(entry.description ?? ""),
            })));
            return {
                id: item.id, name: item.name, category: cat, categoryLabel: text(cat),
                rating: s.ratingIncrease ?? 0, roles: (s.roles ?? []).join(", "),
                descriptionHTML: await enrich(s.description || s.shortDescription || ""),
                limits: await Promise.all((s.limits ?? []).map(async limit => ({...limit, html: await enrich(limit.consequence)}))),
                tags: (s.floatingTagsAndStatuses ?? []).map(tag => ({...tag, label: tag.name + (tag.isStatus ? "-" + tag.value : "")})),
                features: await sections(s.specialFeatures),
                secrets: this.actor.isOwner ? await sections(s.secrets) : [],
                aspects: s.mightyAspects ?? [],
                threats: await Promise.all((s.threatsAndConsequences ?? []).map(async threat => ({
                    name: threat.name, html: await enrich(threat.description),
                    consequences: await Promise.all((threat.list ?? []).map(enrich)),
                }))),
                list: await Promise.all((s.list ?? []).map(enrich)),
            };
        }));
        const attached = items.filter(item => item.type === "challenge-addon");
        if (!this.actor.system.editMode && attached.length) {
            const combined = combinePowerSetProperties(context.system, attached);
            combined.floatingTagsAndStatuses = FloatingTagAndStatusAdapter.sortedFloatingView(
                effectiveChallengeTags(this.actor, attached).map(({source, ...tag}) => tag)
            );
            for (const limit of combined.limits ?? []) limit.consequenceHTML = await enrich(limit.consequence);
            if (!this.actor.isOwner) combined.secrets = [];
            for (const entry of combined.secrets ?? []) entry.descriptionHTML = await enrich(entry.description);
            for (const entry of combined.specialFeatures ?? []) {
                entry.nameHTML = await enrich(entry.name);
                entry.descriptionHTML = await enrich(entry.description);
            }
            for (const threat of combined.threatsAndConsequences ?? []) {
                threat.descriptionHTML = await enrich(threat.description);
                threat.listHTML = await Promise.all((threat.list ?? []).map(enrich));
            }
            context.system = combined;
            context.hasSecrets = !!combined.secrets?.length;
            context.hasSpecialFeatures = !!combined.specialFeatures?.length;
            context.osCombinedPowerSets = true;
        }
        context.osLegacyPowerSets = legacy.map((name, index) => ({name, index}));
        return context;
    };
});

Hooks.on("renderMistEngineChallengeAddonItemSheet", (app, element) => {
    if (game.system.id !== "mist-engine-fvtt") return;
    element.classList.add("os-power-set-form");
    const host = element.querySelector(".scrollable");
    if (!host || element.querySelector(".os-power-set-category")) return;
    const doc = element.ownerDocument;
    const label = doc.createElement("label");
    label.className = "form-group os-power-set-category";
    label.append(text("ThemeType"));
    const select = doc.createElement("select");
    select.name = `flags.${scope}.themeType`;
    select.disabled = !app.document.isOwner;
    for (const value of ["unassigned", "self", "mythos", "noise"]) {
        const option = doc.createElement("option");
        option.value = value;
        option.textContent = text(value);
        select.append(option);
    }
    select.value = category(app.document);
    label.append(select);
    host.prepend(label);
    const descriptionLabel = doc.createElement("label");
    descriptionLabel.className = "form-group os-power-set-description-field";
    descriptionLabel.append(text("Description"));
    const description = doc.createElement("textarea");
    description.name = "system.description";
    description.rows = 3;
    description.value = app.document.system.description ?? "";
    description.disabled = !app.document.isOwner;
    descriptionLabel.append(description);
    label.after(descriptionLabel);
});

Hooks.on("renderMistEngineLegendInTheMistNpcSheet", (app, element) => {
    if (game.system.id !== "mist-engine-fvtt") return;
    wireCombinedTagControls(app, element);
    // Templates previously occupied the bottom of Details.
    element.querySelectorAll('.npc-challenges-container').forEach(node => node.remove());
    const hasSets = app.actor.items.some(item => ["challenge-addon", "shortchallenge"].includes(item.type)) ||
        !!app.actor.system.appliedAddons?.length;
    if (!app.actor.system.editMode && !hasSets) {
        element.querySelectorAll('[data-tab="powersets"]').forEach(node => node.remove());
    }
    for (const button of element.querySelectorAll(".os-delete-power-set")) {
        button.addEventListener("click", async event => {
            event.preventDefault();
            if (!app.actor.isOwner || !app.actor.system.editMode) return;
            try {
                if (button.dataset.itemId) await app.actor.deleteEmbeddedDocuments("Item", [button.dataset.itemId]);
                else {
                    const names = [...(app.actor.system.appliedAddons ?? [])];
                    names.splice(Number(button.dataset.legacyIndex), 1);
                    await app.actor.update({"system.appliedAddons": names});
                }
            } catch (error) {
                console.error("Power Set removal failed", error);
                ui.notifications.error(text("DeleteError"));
            }
        });
    }
    for (const button of element.querySelectorAll(".os-edit-power-set")) {
        button.addEventListener("click", () => {
            if (app.actor.isOwner && app.actor.system.editMode) app.actor.items.get(button.dataset.itemId)?.sheet.render(true);
        });
    }
});
