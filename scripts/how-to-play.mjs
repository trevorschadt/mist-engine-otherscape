import {HowToPlayApp} from "/systems/mist-engine-fvtt/module/apps/how-to-play-app.mjs";

Hooks.once("init", () => {
    if (game.system.id !== "mist-engine-fvtt") return;
    // In 14.5.5 the upstream override returns an undefined context variable.
    if (game.system.version === "14.5.5") {
        delete HowToPlayApp.prototype._prepareContext;
    }
    HowToPlayApp.PARTS = {
        ...HowToPlayApp.PARTS,
        dialog: {
            ...HowToPlayApp.PARTS.dialog,
            template: "modules/otherscape-mist-skin/templates/how-to-play.hbs",
        },
    };
});
