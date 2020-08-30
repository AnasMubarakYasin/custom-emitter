export class EventEmitter {
    constructor(type, options) {
        this.cancelAble = false;
        this.prevent = false;
        this.type = type;
        this.receiver = options?.receiver || {};
        this.sender = options?.sender || {};
        this.data = options?.data || {};
        this.timeCreate = new Date().getTime();
    }
    stopPropagation() {
        this.cancelAble = true;
    }
    stopDefaultEvent() {
        this.prevent = true;
    }
}
export class Emitter {
    constructor() {
        this.listenerList = {};
        this.listenerIdGen = (function* () {
            for (let index = 0; true; index++) {
                yield index + 1;
            }
        })();
    }
    listenerRegister(type, handler, options) {
        const DEFAULT_OPTIONS = {
            default: options?.default || false,
            once: options?.once || false,
            passive: options?.passive || false,
        };
        const ID = this.listenerIdGen.next().value;
        if (this.listenerList.hasOwnProperty(type)) {
            this.listenerList[type].push({ id: ID, handler: handler, options: DEFAULT_OPTIONS });
            this.listenerList[type].sort((a, b) => {
                if (a.options.default && !b.options.default) {
                    return 0;
                }
                else if (!a.options.default && b.options.default) {
                    return -1;
                }
                else {
                    return 1;
                }
            });
        }
        else {
            Object.defineProperty(this.listenerList, type, {
                configurable: true,
                enumerable: true,
                writable: true,
                value: [],
            });
            this.listenerList[type].push({ id: ID, handler: handler, options: DEFAULT_OPTIONS });
            this.listenerList[type].sort((a, b) => {
                if (a.options.default) {
                    return 0;
                }
                else {
                    return -1;
                }
            });
        }
        return ID;
    }
    on(type, handler, options) {
        return this.listenerRegister(type, handler, options);
    }
    emit(eventEmitter, ...args) {
        const TYPE = eventEmitter.type;
        let prevent = true;
        let propagation = true;
        if (!this.listenerList[TYPE]) {
            return undefined;
        }
        ;
        for (const listener of this.listenerList[TYPE]) {
            const callback = listener.handler.bind(null, eventEmitter, ...args);
            if (propagation) {
                if (listener.options.default) {
                    if (prevent) {
                        callback();
                    }
                }
                else {
                    callback();
                }
            }
            else {
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
            const { once } = listener.options;
            if (once) {
                return false;
            }
            else {
                return true;
            }
        });
    }
    remove(id) {
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
