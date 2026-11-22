const journeyType = "litm-journey";

Hooks.once("setup", () => {
    if (game.system.id !== "mist-engine-fvtt") return;

    // Filter the create dialog without changing the registered Actor types.
    const actorClass = CONFIG.Actor.documentClass;
    const createDialog = actorClass.createDialog;
    actorClass.createDialog = function (data, createOptions, dialogOptions = {}, renderOptions) {
        const types = dialogOptions.types ?? game.documentTypes.Actor;
        if (data?.type === journeyType) return Promise.resolve(null);
        if (!types.includes(journeyType)) {
            return createDialog.call(this, data, createOptions, dialogOptions, renderOptions);
        }

        const selectableTypes = types.filter(type => type !== journeyType);
        if (!selectableTypes.length) return Promise.resolve(null);
        return createDialog.call(this, data, createOptions, {
            ...dialogOptions,
            types: selectableTypes,
        }, renderOptions);
    };
});
