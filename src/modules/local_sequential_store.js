/**
 * This is local implementation of sequential store that gets persisted in key-value store.
 */

import StatefulClass from './stateful_class';
import { logInfo } from './utils';

const DEFAULT_STATE = {
    currentFileNum: 1,
    currentSeqNum: 1,
    buffer: [],
};

export const STATE_KEY = 'STATE-local-sequential-store.json';

export default class LocalSequentialStore extends StatefulClass {
    constructor(state = DEFAULT_STATE, { maxPagesPerFile }) {
        super('LocalSequentialStore', STATE_KEY);

        this.state = state;
        this.maxPagesPerFile = maxPagesPerFile;
    }

    put(record) {
        record.outputSeqNum = this.state.currentSeqNum;

        this.state.currentSeqNum ++;
        this.state.buffer.push(record);

        if (this.state.buffer.length >= this.maxPagesPerFile) this._outputFile();
    }

    _outputFile() {
        const key = `RESULTS-${this.state.currentFileNum}.json`;

        logInfo(`SequentialStore: outputting file ${key}`);

        this._emitValue({ key, body: this.state.buffer });
        this.state.currentFileNum ++;
        this.state.buffer = [];
    }

    destroy() {
        if (this.state.buffer.length) this._outputFile();
        super.destroy();
    }
}
