// Mist Engine 14.5.5 delivers confirmation replies to its standard singleton.
// Route replies separately for category dialogs, keyed by the native request ID.
export function routeCategoryConfirmations(DiceRollApp, channel) {
    const requests = new Map();
    const request = DiceRollApp.prototype.requestGmConfirmation;
    DiceRollApp.prototype.requestGmConfirmation = function (values) {
        const result = request.call(this, values);
        if (this.osCategory && this.pendingRequest) requests.set(this.pendingRequest.requestId, this);
        return result;
    };
    const cancel = DiceRollApp.prototype.cancelPendingRequest;
    DiceRollApp.prototype.cancelPendingRequest = function () {
        requests.delete(this.pendingRequest?.requestId);
        return cancel.call(this);
    };
    game.socket.on(channel, message => {
        if (message?.action !== "rollConfirmResponse" || message.userId !== game.user.id) return;
        const dialog = requests.get(message.requestId);
        requests.delete(message.requestId);
        dialog?.handleConfirmationResponse(message);
    });
}
