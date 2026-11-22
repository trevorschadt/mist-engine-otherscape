// Display projection only: never write combined data back to the Actor.
export function combinePowerSetProperties(base, sets) {
    const result = structuredClone(base);
    const key = value => String(value ?? "").trim().toLowerCase();
    const parse = value => {
        if (value == null || String(value).trim() === "" || value === "-") return null;
        const number = parseInt(value, 10);
        return Number.isNaN(number) ? null : number;
    };
    for (const item of sets) {
        const source = item.system;
        result.difficulty = (Number(result.difficulty) || 0) + (Number(source.ratingIncrease) || 0);
        result.roles = [...new Map([...(result.roles ?? []), ...(source.roles ?? [])]
            .filter(role => key(role)).map(role => [key(role), role])).values()];
        result.limits ??= [];
        for (const limit of source.limits ?? []) {
            const existing = result.limits.find(entry => key(entry.name) === key(limit.name));
            if (!existing) result.limits.push(structuredClone(limit));
            else {
                const a = parse(existing.value), b = parse(limit.value);
                existing.value = a === 0 || b === 0 ? "0" : a === null && b === null ? "-"
                    : String(Math.max(a ?? -Infinity, b ?? -Infinity));
                if (limit.consequence?.trim()) existing.consequence = limit.consequence;
            }
        }
        for (const field of ["specialFeatures", "secrets", "threatsAndConsequences", "mightyAspects"]) {
            result[field] = [...(result[field] ?? []), ...structuredClone(source[field] ?? [])];
        }
    }
    return result;
}
