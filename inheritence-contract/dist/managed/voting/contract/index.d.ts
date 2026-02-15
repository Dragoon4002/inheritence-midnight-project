export function ledger(stateOrChargedState: any): {
    readonly yes_votes: bigint;
    readonly no_votes: bigint;
    voters: {
        isEmpty(...args_0: any[]): boolean;
        size(...args_0: any[]): bigint;
        member(...args_0: any[]): boolean;
        [Symbol.iterator](...args_0: any[]): any;
    };
    readonly is_open: boolean;
};
export class Contract {
    constructor(...args_0: any[]);
    witnesses: any;
    circuits: {
        open_voting: (...args_1: any[]) => {
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
        close_voting: (...args_1: any[]) => {
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
        vote: (...args_1: any[]) => {
            result: any[];
            context: any;
            proofData: {
                input: {
                    value: Uint8Array<ArrayBufferLike>[];
                    alignment: __compactRuntime.AlignmentSegment[];
                };
                output: undefined;
                publicTranscript: never[];
                privateTranscriptOutputs: never[];
            };
            gasCost: any;
        };
    };
    impureCircuits: {
        open_voting: (...args_1: any[]) => {
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
        close_voting: (...args_1: any[]) => {
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
        vote: (...args_1: any[]) => {
            result: any[];
            context: any;
            proofData: {
                input: {
                    value: Uint8Array<ArrayBufferLike>[];
                    alignment: __compactRuntime.AlignmentSegment[];
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
    _open_voting_0(context: any, partialProofData: any): never[];
    _close_voting_0(context: any, partialProofData: any): never[];
    _vote_0(context: any, partialProofData: any, voter_id_0: any, choice_0: any): never[];
}
export const pureCircuits: {};
export namespace contractReferenceLocations {
    let tag: string;
    let indices: {};
}
import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
