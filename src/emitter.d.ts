export interface EventEmitterInstanceSpec {
    receiver?: any;
    sender?: any;
    data?: any;
}
export interface EventEmitterSpec extends EventEmitterInstanceSpec {
    readonly type: string;
    readonly timeCreate: number;
    prevent: boolean;
    cancelAble: boolean;
    stopDefaultEvent(): void;
    stopPropagation(): void;
}
export declare class EventEmitter implements EventEmitterSpec {
    readonly type: string;
    readonly timeCreate: number;
    sender: object;
    receiver: object;
    data: object;
    cancelAble: boolean;
    prevent: boolean;
    constructor(type: string, options?: EventEmitterInstanceSpec);
    stopPropagation(): void;
    stopDefaultEvent(): void;
}
export interface EmitterSpec {
    on(type: string, handler: ListenerHandler, options: ListenerOptions): ListenerId;
    emit(eventEmitter: EventEmitter, ...args: any | undefined): void;
    remove(id: ListenerId): boolean;
}
export interface ListenerHandler {
    (event: EventEmitter, ...args: any | undefined): void;
}
export interface ListenerOptions {
    once?: boolean;
    passive?: boolean;
    default?: boolean;
}
export declare type ListenerId = number;
export interface ListenerContainer {
    [type: string]: ListenerQueue[];
}
export interface ListenerQueue {
    handler: ListenerHandler;
    id: ListenerId;
    options: ListenerOptions;
}
export declare class Emitter implements EmitterSpec {
    private listenerList;
    private listenerIdGen;
    private listenerRegister;
    on(type: string, handler: ListenerHandler, options?: ListenerOptions): ListenerId;
    emit(eventEmitter: EventEmitter, ...args: any): void;
    remove(id: ListenerId): boolean;
}
