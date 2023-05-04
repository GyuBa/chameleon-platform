export enum HistoryStatus {
    CACHED = 'cached',
    INITIALIZING = 'initializing',
    RUNNING = 'running',
    ERROR = 'error',
    FINISHED = 'finished',
}

export enum WSMessageType {
    READY = 'Ready',
    PATH = 'Path',
    TERMINAL_RESIZE = 'TerminalResize',
    TERMINAL = 'Terminal',
    UPDATE_MODEL = 'UpdateModel',
    UPDATE_MODELS = 'UpdateModels',
    UPDATE_HISTORY = 'UpdateHistory',
    UPDATE_HISTORIES = 'UpdateHistories'
}

export enum SocketMessageType {
    HELLO = 'Hello',
    LAUNCH = 'Launch',
    FILE_WAIT = 'FileWait',
    FILE_RECEIVE_END = 'FileReceiveEnd',
    TERMINAL = 'Terminal',
    TERMINAL_RESIZE = 'TerminalResize',
    PROCESS_END = 'ProcessEnd',
    FILE = 'File',
    REQUEST_FILE = 'RequestFile',
    WAIT_RECEIVE = 'WaitReceive',
    LAUNCH_MODEL = 'LaunchModel'
}

export enum SocketReceiveMode {
    JSON,
    FILE
}