import React, { useEffect, useReducer, useState } from 'react'
import { IoRefreshSharp } from 'react-icons/io5'
import { Provider, getEngine } from '@/common/engines'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/common/hooks/useTheme'
import { IModel } from '@/common/engines/interfaces'
import { CUSTOM_MODEL_ID } from '@/common/constants'
import { Select } from 'baseui/select'
import { Button } from 'baseui/button'

const linkStyle = {
    color: 'inherit',
    opacity: 0.8,
    cursor: 'pointer',
    outline: 'none',
}

export type APIModel =
    | 'gpt-3.5-turbo-1106'
    | 'gpt-3.5-turbo'
    | 'gpt-3.5-turbo-0301'
    | 'gpt-3.5-turbo-0613'
    | 'gpt-3.5-turbo-16k'
    | 'gpt-3.5-turbo-16k-0613'
    | 'gpt-4'
    | 'gpt-4-0314'
    | 'gpt-4-0613'
    | 'gpt-4-32k'
    | 'gpt-4-32k-0314'
    | 'gpt-4-32k-0613'
    | string

interface APIModelSelectorProps {
    currentProvider: Provider
    provider: Provider
    apiKey?: string
    value?: string
    onChange?: (value: string) => void
    onBlur?: () => void
}

interface APIModelOption {
    label: React.ReactNode
    id: string
}

export function APIModelSelector({
    currentProvider,
    provider,
    apiKey,
    value,
    onChange,
    onBlur,
}: APIModelSelectorProps) {
    const { t } = useTranslation()
    const [isLoading, setIsLoading] = useState(false)
    const [options, setOptions] = useState<APIModelOption[]>([])
    const [errMsg, setErrMsg] = useState<string>()
    const [isChatGPTNotLogin, setIsChatGPTNotLogin] = useState(false)
    const [refreshFlag, refresh] = useReducer((x: number) => x + 1, 0)
    const { theme } = useTheme()

    useEffect(() => {
        setIsChatGPTNotLogin(false)
        setErrMsg('')
        setOptions([])
        if (provider !== currentProvider) {
            return
        }
        const engine = getEngine(provider)
        setIsLoading(true)
        ;(async () => {
            try {
                const models = await engine.listModels(apiKey)
                setOptions([
                    ...models.map((model: IModel) => ({
                        label: (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 3,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '14px',
                                        color: theme.colors.contentPrimary,
                                    }}
                                >
                                    {model.name}
                                </div>
                                {model.description && (
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            color: theme.colors.contentTertiary,
                                        }}
                                    >
                                        {model.description}
                                    </div>
                                )}
                            </div>
                        ),
                        id: model.id,
                    })),
                    ...(engine.supportCustomModel()
                        ? [
                              {
                                  id: CUSTOM_MODEL_ID,
                                  label: t('Custom'),
                              },
                          ]
                        : []),
                ])
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (e: any) {
                if (
                    provider === 'ChatGPT' &&
                    e.message &&
                    (e.message.includes('not login') || e.message.includes('Forbidden'))
                ) {
                    setIsChatGPTNotLogin(true)
                }
                setErrMsg(e.message)
            } finally {
                setIsLoading(false)
            }
        })()
    }, [apiKey, currentProvider, provider, refreshFlag, t, theme.colors.contentPrimary, theme.colors.contentTertiary])

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                }}
            >
                <Select
                    isLoading={isLoading}
                    size='compact'
                    onBlur={onBlur}
                    searchable={false}
                    clearable={false}
                    value={
                        value
                            ? [
                                  {
                                      id: value,
                                  },
                              ]
                            : undefined
                    }
                    onChange={(params) => {
                        onChange?.(params.value[0].id as APIModel)
                    }}
                    options={options}
                />
                <Button
                    size='compact'
                    kind='secondary'
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        refresh()
                    }}
                >
                    <IoRefreshSharp size={16} />
                </Button>
            </div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                }}
            >
                {errMsg && (
                    <div
                        style={{
                            color: 'red',
                        }}
                    >
                        {errMsg}
                    </div>
                )}
                {isChatGPTNotLogin && (
                    <div
                        style={{
                            color: theme.colors.contentPrimary,
                        }}
                    >
                        <span>{t('Please login to ChatGPT Web')}: </span>
                        <a href='https://chat.openai.com' target='_blank' rel='noreferrer' style={linkStyle}>
                            Login
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}
