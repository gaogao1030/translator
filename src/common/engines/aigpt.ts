import { getSettings } from '../utils'
import { AbstractOpenAI } from './abstract-openai'
import { IModel } from './interfaces'

export class AIGPT extends AbstractOpenAI {
    async getHeaders(): Promise<Record<string, string>> {
        const code = await this.getAPIKey()
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer nk-${code}`,
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async listModels(apiKey_: string | undefined): Promise<IModel[]> {
        return [
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5-Turbo' },
            { id: 'gpt-4o', name: 'GPT-4O' },
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
        return settings.aigptAPIModel
    }

    async getAPIKey(): Promise<string> {
        const settings = await getSettings()
        const apiKeys = (settings.apiKeys ?? '').split(',').map((s) => s.trim())
        const apikey = apiKeys[Math.floor(Math.random() * apiKeys.length)] ?? ''
        return apikey
    }

    async getAPIURL(): Promise<string> {
        const settings = await getSettings()
        return settings.aigptAPIURL
    }

    async getAPIURLPath(): Promise<string> {
        return '/v1/chat/completions'
    }
}
