export const themeCategories = {
    "os-self": "self", "litm-greatness": "self",
    "os-mythos": "mythos", "litm-adventure": "mythos",
    "os-noise": "noise", "litm-origin": "noise",
};
export const categories = ["self", "mythos", "noise"];

export function characterThemes(actor) {
    return actor.items.filter(item => item.type === "themebook" && !item.system.options?.isStoryTheme);
}
