import { Socket as OriginalSocket } from 'socket.io-client';

declare module 'socket.io-client' {
  interface Socket extends OriginalSocket {
    on(event: string, fn: Function): this;
    off(event: string, fn?: Function): this;
    emit(event: string, ...args: any[]): this;
    connect(): this;
    disconnect(): this;
  }
  
  interface Manager {
    reconnection(v: boolean): void;
    reconnectionAttempts(v: number): void;
    reconnectionDelay(v: number): void;
    reconnectionDelayMax(v: number): void;
    timeout(v: number): void;
  }
  
  let io: {
    (uri: string, opts?: any): Socket;
    connect(uri: string, opts?: any): Socket;
    (opts?: any): Socket;
  };
  
  export { Socket, Manager };
  export default io;
}
