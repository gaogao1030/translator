export interface IModel {
    id: string
    name: string
    description?: string
}

export interface IMessage {
    role: string
    content: string
}

export interface IMessageRequest {
    rolePrompt: string
    commandPrompt: string
    assistantPrompts?: string[]
    onMessage: (message: { content: string; role: string; isFullText?: boolean }) => Promise<void>
    onError: (error: string) => void
    onFinished: (reason: string) => void
    onStatusCode?: (statusCode: number) => void
    signal: AbortSignal
}

export interface UsageResult {
    status: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
}

export interface IEngine {
    checkLogin: () => Promise<boolean>
    isLocal(): boolean
    supportCustomModel(): boolean
    getModel(): Promise<string>
    listModels(apiKey: string | undefined): Promise<IModel[]>
    sendMessage(req: IMessageRequest): Promise<void>
    getUsage(): Promise<UsageResult>
}
