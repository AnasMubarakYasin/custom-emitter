/* eslint-disable max-len */
export interface EventEmitterInstanceSpec {
  receiver?: any
  sender?: any
  data?: any
}

export interface EventEmitterSpec extends EventEmitterInstanceSpec {
  // readonly isOnce: boolean
  // readonly isPassive: boolean
  // readonly isDefault: boolean
  readonly type: string
  // readonly timeCreate: number
  // readonly stackCall: any
  prevent: boolean
  cancelAble: boolean

  stopDefaultEvent(): void
  stopPropagation(): void
}

export class EventEmitter implements EventEmitterSpec {
  public readonly type: string;
  public readonly timeCreate: number;

  public sender: object;
  public receiver: object;
  public data: object;

  cancelAble: boolean = false;
  prevent: boolean = false;

  constructor(type: string, options?: EventEmitterInstanceSpec) {
    this.type = type;
    this.receiver = options?.receiver || {};
    this.sender = options?.sender || {};
    this.data = options?.data || {};
    this.timeCreate = new Date().getTime();
  }

  public stopPropagation() {
    this.cancelAble = true;
  }

  public stopDefaultEvent() {
    this.prevent = true;
  }
}

export interface EmitterSpec {
  on(type: string, handler: ListenerHandler, options: ListenerOptions): ListenerId
  emit(eventEmitter: EventEmitter, ...args: any | undefined): void
  remove(id: ListenerId): boolean
}

export interface ListenerHandler {
  (event: EventEmitter, ...args: any | undefined): void
}

export interface ListenerOptions {
  once?: boolean
  passive?: boolean
  default?: boolean
}

export type ListenerId = number;

export interface ListenerContainer {
  [type: string]: ListenerQueue[]
}

export interface ListenerQueue {
  handler: ListenerHandler
  id: ListenerId
  options: ListenerOptions
}

export class Emitter implements EmitterSpec {
  private listenerList: ListenerContainer = {};
  private listenerIdGen: Generator<ListenerId, any, ListenerId> = (function* () {
    for (let index: number = 0; true; index++) {
      yield index+1;
    }
  })();

  private listenerRegister(type: string, handler: ListenerHandler, options: ListenerOptions): ListenerId {
    const DEFAULT_OPTIONS: ListenerOptions = {
      default: options?.default || false,
      once: options?.once || false,
      passive: options?.passive || false,
    };

    const ID: ListenerId = this.listenerIdGen.next().value as ListenerId;

    if (this.listenerList.hasOwnProperty(type)) {
      this.listenerList[type].push({id: ID, handler: handler, options: DEFAULT_OPTIONS} as ListenerQueue);
      this.listenerList[type].sort((a, b) => {
        if (a.options.default && !b.options.default) {
          return 0;
        } else if (!a.options.default && b.options.default) {
          return -1;
        } else {
          return 1;
        }
      });
    } else {
      Object.defineProperty(this.listenerList, type, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: [],
      });
      this.listenerList[type].push({id: ID, handler: handler, options: DEFAULT_OPTIONS} as ListenerQueue);
      this.listenerList[type].sort((a, b) => {
        if (a.options.default) {
          return 0;
        } else {
          return -1;
        }
      });
    }
    return ID;
  }

  on(type: string, handler: ListenerHandler, options: ListenerOptions): ListenerId {
    return this.listenerRegister(type, handler, options);
  }
  emit(eventEmitter: EventEmitter, ...args: any): void {
    const TYPE = eventEmitter.type;

    let prevent = true;
    let propagation = true;

    if (!this.listenerList[TYPE]) {
      return undefined;
    };

    for (const listener of this.listenerList[TYPE]) {
      const callback = listener.handler.bind(null, eventEmitter, ...args);

      if (propagation) {
        if (listener.options.default) {
          if (prevent) {
            callback();
          }
        } else {
          callback();
        }
      } else {
        if (listener.options.passive) {
          callback();
        }
      }

      if (eventEmitter.prevent) {
        prevent = false;
      }
      if (eventEmitter.cancelAble) {
        propagation = false;
      }
    }

    this.listenerList[TYPE] = this.listenerList[TYPE].filter((listener) => {
      const {once} = listener.options;
      if (once) {
        return false;
      } else {
        return true;
      }
    });
  }
  remove(id: ListenerId): boolean {
    for (const type of Object.values(this.listenerList)) {
      for (const listener of type) {
        let index = 0;
        if (listener.id === id) {
          type.splice(index, 1);
          return true;
        }
        index++;
      }
    }
    return false;
  }
}
