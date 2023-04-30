export enum HistoryStatus {
    CACHED = 'cached',
    INITIALIZING = 'initializing',
    RUNNING = 'running',
    ERROR = 'error',
    OFF = 'off',
}

export enum WSMessageType {
    Ready = 'Ready',
    Path = 'Path',
    TerminalResize = 'TerminalResize',
    Terminal = 'Terminal',
    UpdateModel = 'UpdateModel',
    UpdateModels = 'UpdateModels',
    UpdateHistory = 'UpdateHistory',
    UpdateHistories = 'UpdateHistories'
}