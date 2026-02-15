export function ledger(stateOrChargedState: any): {
    readonly round: bigint;
};
export class Contract {
    constructor(...args_0: any[]);
    witnesses: any;
    circuits: {
        increment: (...args_1: any[]) => {
            result: any[];
            context: any;
            proofData: {
                input: {
                    value: never[];
                    alignment: never[];
                };
                output: undefined;
                publicTranscript: never[];
                privateTranscriptOutputs: never[];
            };
            gasCost: any;
        };
    };
    impureCircuits: {
        increment: (...args_1: any[]) => {
            result: any[];
            context: any;
            proofData: {
                input: {
                    value: never[];
                    alignment: never[];
                };
                output: undefined;
                publicTranscript: never[];
                privateTranscriptOutputs: never[];
            };
            gasCost: any;
        };
    };
    initialState(...args_0: any[]): {
        currentContractState: __compactRuntime.ContractState;
        currentPrivateState: any;
        currentZswapLocalState: __compactRuntime.EncodedZswapLocalState;
    };
    _increment_0(context: any, partialProofData: any): never[];
}
export const pureCircuits: {};
export namespace contractReferenceLocations {
    let tag: string;
    let indices: {};
}
import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
