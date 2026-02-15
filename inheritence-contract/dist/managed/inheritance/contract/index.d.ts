export function ledger(stateOrChargedState: any): {
    readonly parent: Uint8Array<ArrayBufferLike>;
    readonly child: Uint8Array<ArrayBufferLike>;
    readonly isRegistered: boolean;
    readonly isExecuted: boolean;
};
export class Contract {
    constructor(...args_0: any[]);
    witnesses: any;
    circuits: {
        register: (...args_1: any[]) => {
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
        execute: (...args_1: any[]) => {
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
        register: (...args_1: any[]) => {
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
        execute: (...args_1: any[]) => {
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
    _register_0(context: any, partialProofData: any, parent_addr_0: any, child_addr_0: any): never[];
    _execute_0(context: any, partialProofData: any): never[];
}
export const pureCircuits: {};
export namespace contractReferenceLocations {
    let tag: string;
    let indices: {};
}
import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
