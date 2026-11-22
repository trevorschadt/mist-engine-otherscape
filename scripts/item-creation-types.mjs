const hiddenItemTypes = new Set(["rote", "shortchallenge"]);

Hooks.once("setup", () => {
    if (game.system.id !== "mist-engine-fvtt") return;

    const itemClass = CONFIG.Item.documentClass;
    const createDialog = itemClass.createDialog;
    itemClass.createDialog = function (data, createOptions, dialogOptions = {}, renderOptions) {
        if (hiddenItemTypes.has(data?.type)) return Promise.resolve(null);
        const types = dialogOptions.types ?? game.documentTypes.Item;
        const selectableTypes = types.filter(type => !hiddenItemTypes.has(type));
        if (!selectableTypes.length) return Promise.resolve(null);
        return createDialog.call(this, data, createOptions, {
            ...dialogOptions,
            types: selectableTypes,
        }, renderOptions);
    };
});
