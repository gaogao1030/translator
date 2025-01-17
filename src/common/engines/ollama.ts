import { CUSTOM_MODEL_ID } from '../constants'
import { getSettings } from '../utils'
import { AbstractOpenAI } from './abstract-openai'
import { IModel } from './interfaces'

export class Ollama extends AbstractOpenAI {
    supportCustomModel(): boolean {
        return true
    }

    isLocal() {
        return true
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async listModels(apiKey_: string | undefined): Promise<IModel[]> {
        return [
            { id: 'gemma2:9b', name: 'Genma2 9B' },
            { id: 'llama3:latest', name: 'llama3 7B' },
        ]
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getBaseRequestBody(): Promise<Record<string, any>> {
        const settings = await getSettings()
        const body = await super.getBaseRequestBody()
        return {
            ...body,
            // eslint-disable-next-line camelcase
            keep_alive: settings.ollamaModelLifetimeInMemory,
        }
    }

    async getAPIModel(): Promise<string> {
        const settings = await getSettings()
        if (settings.ollamaAPIModel === CUSTOM_MODEL_ID) {
            return settings.ollamaCustomModelName
        }
        return settings.ollamaAPIModel
    }

    async getAPIKey(): Promise<string> {
        return 'donotneed'
    }

    async getAPIURL(): Promise<string> {
        const settings = await getSettings()
        return settings.ollamaAPIURL
    }

    async getAPIURLPath(): Promise<string> {
        return '/v1/chat/completions'
    }
}
