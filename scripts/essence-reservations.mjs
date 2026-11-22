import {essenceScope as scope} from "./essence-data.mjs";

const queues = new Map();
const root = "flags." + scope;
const leaseDuration = 10 * 60 * 1000;

function serialize(actor, operation) {
    const next = (queues.get(actor.uuid) ?? Promise.resolve()).catch(() => {}).then(operation);
    queues.set(actor.uuid, next);
    return next.finally(() => {
        if (queues.get(actor.uuid) === next) queues.delete(actor.uuid);
    });
}

export function setupEssenceReservations(getBonus) {
    return (actor, action, token, planId, category) => {
        if (!actor.isOwner) return Promise.resolve(null);
        return serialize(actor, async () => {
            let lease = actor.getFlag(scope, "essenceReservation");
            async function commit() {
                const changes = {
                    [`${root}.-=essenceReservation`]: null,
                    [`${root}.lastEssenceCommit`]: lease.token,
                };
                for (const key of lease.uses) changes[`${root}.essenceState.${key}`] = true;
                if (actor.getFlag(scope, "pendingEssenceBonus")?.id === lease.planId) {
                    changes[`${root}.-=pendingEssenceBonus`] = null;
                }
                return Boolean(await actor.update(changes));
            }
            if (action === "reserve") {
                if (lease?.publishing) {
                    const receipt = game.messages.find(message => {
                        const roll = message.getFlag(scope, "essenceReceipt");
                        return roll?.actorUuid === actor.uuid && roll.token === lease.token;
                    });
                    if (!receipt || !await commit()) return null;
                    lease = null;
                }
                if (lease?.expires > Date.now()) return null;
                const bonus = getBonus(actor, category);
                if (!bonus || bonus.id !== planId) return null;
                const saved = await actor.setFlag(scope, "essenceReservation", {
                    token, userId: game.user.id, planId, uses: bonus.uses,
                    expires: Date.now() + leaseDuration, publishing: false,
                });
                return saved && actor.getFlag(scope, "essenceReservation")?.token === token ? bonus : null;
            }
            if (action === "commit" && actor.getFlag(scope, "lastEssenceCommit") === token) return true;
            if (lease?.token !== token || lease.userId !== game.user.id) return null;
            if (action === "publish") {
                if (lease.expires <= Date.now()) return null;
                return Boolean(await actor.setFlag(scope, "essenceReservation", {...lease, publishing: true}));
            }
            if (action === "commit") return commit();
            if (action === "release") return Boolean(await actor.unsetFlag(scope, "essenceReservation"));
            return null;
        });
    };
}
