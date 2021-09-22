export class InteractionDoesntExistError extends Error {
    constructor(message: string = 'Tried to create non existing interaction') {
        super(message);
    }
}
