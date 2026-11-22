import {characterThemes, themeCategories} from "./theme-categories.mjs";
export const essenceScope = "otherscape-mist-skin";
export function deriveEssence(actor) {
    const themes = characterThemes(actor);
    const counts = {self: 0, mythos: 0, noise: 0};
    for (const theme of themes) {
        const category = themeCategories[theme.system.type];
        if (category) counts[category]++;
    }
    const result = {themes, counts, key: "incomplete"};
    if (themes.length !== 4 || Object.values(counts).reduce((a, b) => a + b, 0) !== 4) return result;
    if (counts.self && counts.mythos && counts.noise) result.key = "nexus";
    else if (counts.self && counts.mythos) result.key = "spiritualist";
    else if (counts.self && counts.noise) result.key = "cyborg";
    else if (counts.mythos && counts.noise) result.key = "transhuman";
    else if (counts.self === 4) result.key = "real";
    else if (counts.noise === 4) result.key = "singularity";
    else {
        const sources = themes.map(theme => String(theme.getFlag(essenceScope, "source") ?? "").trim().toLocaleLowerCase());
        result.key = sources.some(source => !source) ? "sourcesRequired"
            : new Set(sources).size === 1 ? "avatar" : "conduit";
    }
    return result;
}
