import {runExit} from 'clipanion';
import GenerateCommand from './GenerateCommand.js';

export function run() {
    void runExit([GenerateCommand]);
}
