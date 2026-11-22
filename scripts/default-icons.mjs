import {themeCategories} from "./theme-categories.mjs";

const root = "modules/otherscape-mist-skin/icons/defaults/";
const gameIconsRoot = "modules/game-icons-net/whitetransparent/";
const gameIconNames = {
    character: "id-card", loadout: "briefcase", themebook: "book-cover",
    themekit: "card-pick", evolution: "upgrade", "power-set": "power-lightning", "scene-data": "clapperboard",
};
const iconPath = name => gameIconNames[name]
    ? gameIconsRoot + gameIconNames[name] + ".svg"
    : root + name + ".svg";
const scope = "otherscape-mist-skin";
const actors = {"litm-character": "character", "litm-fellowship-themecard": "crew", "litm-npc": "challenge"};
const items = {backpack: "loadout", themebook: "themebook", themekit: "themekit", quintessence: "evolution", "challenge-addon": "power-set", "scene-data": "scene-data"};
const migrationKey = "otherscapeDefaultsRestored";
const stock = new Set([
    "", "icons/svg/mystery-man.svg", "icons/svg/item-bag.svg", "icons/svg/mystery-man-black.svg",
    "systems/mist-engine-fvtt/assets/icons/item-themebook.svg",
    "systems/mist-engine-fvtt/assets/icons/item-backpack.svg",
    "systems/mist-engine-fvtt/assets/icons/icon-challenge.svg",
]);
const ownLegacy = new Set(
    [...Object.values(actors), ...Object.values(items), "self", "mythos", "noise"].map(name => root + name + ".svg")
);
const externalLegacy = new Set(Object.values(gameIconNames).map(name => gameIconsRoot + name + ".svg"));
const isManagedIcon = path => stock.has(path ?? "") || ownLegacy.has(path) || externalLegacy.has(path);

export function defaultIcon(documentName, data) {
    if (documentName === "Actor") return actors[data.type] ? iconPath(actors[data.type]) : null;
    if (documentName !== "Item" || !items[data.type]) return null;
    let category;
    if (data.type === "themebook") category = themeCategories[data.system?.type];
    if (data.type === "themekit") category = themeCategories[data.system?.themebook_type];
    if (data.type === "challenge-addon") {
        const value = data.flags?.[scope]?.themeType;
        if (["self", "mythos", "noise"].includes(value)) category = value;
    }
    return category ? root + category + ".svg" : iconPath(items[data.type]);
}

function iconUpdate(documentName, data) {
    const desired = defaultIcon(documentName, data);
    if (!desired) return {};
    const update = {};
    if (isManagedIcon(data.img) && data.img !== desired) update.img = desired;
    const texture = data.prototypeToken?.texture?.src;
    if (documentName === "Actor" && isManagedIcon(texture) && texture !== desired) {
        update["prototypeToken.texture.src"] = desired;
    }
    return update;
}

for (const documentName of ["Actor", "Item"]) {
    Hooks.on("preCreate" + documentName, document => {
        if (game.system.id !== "mist-engine-fvtt") return;
        const update = iconUpdate(documentName, document.toObject());
        if (Object.keys(update).length) document.updateSource(update);
    });
    Hooks.on("preUpdate" + documentName, (document, changes) => {
        if (game.system.id !== "mist-engine-fvtt") return;
        const next = foundry.utils.mergeObject(document.toObject(), foundry.utils.expandObject(changes), {inplace: false});
        const update = iconUpdate(documentName, next);
        if (update.img) changes.img = update.img;
        const texture = update["prototypeToken.texture.src"];
        if (!texture) return;
        if (changes.prototypeToken?.texture) changes.prototypeToken.texture.src = texture;
        else changes["prototypeToken.texture.src"] = texture;
    });
}

Hooks.once("ready", async () => {
    if (game.system.id !== "mist-engine-fvtt" || !game.user.isGM) return;
    if (game.users.activeGM && game.users.activeGM.id !== game.user.id) return;
    if (game.settings.get(scope, migrationKey)) return;
    try {
        const actorUpdates = [];
        const itemUpdates = [];
        const migrateEmbedded = async actor => {
            const embedded = [];
            for (const item of actor.items) {
                const update = iconUpdate("Item", item.toObject());
                if (Object.keys(update).length) embedded.push({_id: item.id, ...update});
            }
            if (embedded.length) await actor.updateEmbeddedDocuments("Item", embedded);
        };
        for (const actor of game.actors) {
            const update = iconUpdate("Actor", actor.toObject());
            if (Object.keys(update).length) actorUpdates.push({_id: actor.id, ...update});
            await migrateEmbedded(actor);
        }
        if (actorUpdates.length) await CONFIG.Actor.documentClass.updateDocuments(actorUpdates);
        for (const scene of game.scenes) {
            const tokens = [];
            for (const token of scene.tokens) {
                const actor = token.actor;
                if (!actor) continue;
                const desired = defaultIcon("Actor", actor);
                const texture = token.texture?.src;
                if (desired && isManagedIcon(texture) && texture !== desired) {
                    tokens.push({_id: token.id, "texture.src": desired});
                }
                if (token.actorLink) continue;
                if (desired && isManagedIcon(actor.img) && actor.img !== desired) {
                    await actor.update({img: desired});
                }
                await migrateEmbedded(actor);
            }
            if (tokens.length) await scene.updateEmbeddedDocuments("Token", tokens);
        }
        for (const item of game.items) {
            const update = iconUpdate("Item", item.toObject());
            if (Object.keys(update).length) itemUpdates.push({_id: item.id, ...update});
        }
        if (itemUpdates.length) await CONFIG.Item.documentClass.updateDocuments(itemUpdates);
        await game.settings.set(scope, migrationKey, true);
    } catch (error) {
        console.error("Otherscape default icon migration failed", error);
        ui.notifications.error(game.i18n.localize("OTHERSCAPE_MIST_SKIN.DefaultIcons.UpdateError"));
    }
});

Hooks.once("init", () => {
    game.settings.register(scope, migrationKey, {
        scope: "world", config: false, type: Boolean, default: false,
    });
});
