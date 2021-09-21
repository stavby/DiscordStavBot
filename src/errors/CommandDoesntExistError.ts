export class CommandDoesntExistError extends Error {
    constructor(message: string = 'Tried to create non existing command') {
        super(message);
    }
}
