import { IEngine, IMessageRequest, IModel, UsageResult } from './interfaces'

export abstract class AbstractEngine implements IEngine {
    async checkLogin(): Promise<boolean> {
        return true
    }
    isLocal() {
        return false
    }
    supportCustomModel() {
        return false
    }
    abstract getModel(): Promise<string>
    abstract listModels(apiKey: string | undefined): Promise<IModel[]>
    abstract sendMessage(req: IMessageRequest): Promise<void>
    // abstract getUsage(): Promise<void>

    async getUsage(): Promise<UsageResult> {
        return { status: 200 }
    }
}
