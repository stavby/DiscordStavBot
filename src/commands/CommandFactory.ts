import { Message } from 'discord.js';
import { CommandDoesntExistError } from '../errors/CommandDoesntExistError';
import { Command } from './Command';
import { GayCommand } from './GayCommand';
import { LeaveCommand } from './LeaveCommand';
import { PauseCommand } from './PauseCommand';
import { PlayCommand } from './PlayCommand';
import { QueueCommand } from './QueueCommand';
import { RemoveCommand } from './RemoveCommand';
import { ResumeCommand } from './ResumeCommand';
import { SkipCommand } from './SkipCommand';
import { SummonCommand } from './SummonCommand';

const commands: {
    [commandName: string]: new (args: string[], message: Message) => Command;
} = {
    gay: GayCommand,
    summon: SummonCommand,
    leave: LeaveCommand,
    play: PlayCommand,
    pause: PauseCommand,
    resume: ResumeCommand,
    skip: SkipCommand,
    remove: RemoveCommand,
    queue: QueueCommand,
};

export const isCommandExists = (commandName: string) =>
    Object.keys(commands).includes(commandName);

export const createCommand = (args: string[], message: Message) => {
    const commandName = args[0];
    if (!isCommandExists(commandName)) {
        throw new CommandDoesntExistError();
    }

    return new commands[commandName](args, message);
};
