import React from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/common/hooks/useTheme'
import { Select, SelectProps, Options } from 'baseui/select'
import { LightTheme } from 'baseui'
import { Provider, engineIcons } from '@/common/engines'

interface IProviderSelectorProps {
    value?: Provider
    onChange?: (value: Provider) => void
    hasPromotion?: boolean
}

interface IAddProviderIconsProps {
    options: Options
    currentProvider?: Provider
    hasPromotion?: boolean
    theme: typeof LightTheme
}

const addProviderIcons = ({ options, currentProvider, hasPromotion, theme }: IAddProviderIconsProps) => {
    if (!Array.isArray(options)) {
        return options
    }
    return options.map((item) => {
        if (typeof item.label !== 'string') {
            return item
        }
        const icon = engineIcons[item.id as Provider]
        if (!icon) {
            return item
        }
        let label = (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                }}
            >
                {React.createElement(icon, { size: 10 }, [])}
                {item.label}
            </div>
        )
        if (item.id === 'OpenAI') {
            label = (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                    }}
                >
                    {label}
                    {hasPromotion && currentProvider !== 'OpenAI' && (
                        <div
                            style={{
                                width: '0.45rem',
                                height: '0.45rem',
                                borderRadius: '50%',
                                backgroundColor: theme.colors.warning300,
                            }}
                        />
                    )}
                </div>
            )
        }
        return {
            ...item,
            label,
        }
    })
}

export function ProviderSelector({ value, onChange, hasPromotion }: IProviderSelectorProps) {
    const { theme } = useTheme()
    const { t } = useTranslation()
    value = 'Ollama'

    let overrides: SelectProps['overrides'] = undefined
    overrides = {
        ControlContainer: {
            style: {
                borderColor: theme.colors.warning300,
            },
        },
    }

    const options = [
        { label: `Ollama (${t('Local Model')})`, id: 'Ollama' },
        { label: `AIGPT`, id: 'AIGPT' },
        // { label: 'OpenAI', id: 'OpenAI' },
        // { label: `Kimi (${t('Free')})`, id: 'Kimi' },
        // { label: `${t('ChatGLM')} (${t('Free')})`, id: 'ChatGLM' },
        // { label: 'Cohere', id: 'Cohere' },
        // { label: 'Gemini', id: 'Gemini' },
        // { label: 'ChatGPT (Web)', id: 'ChatGPT' },
        // { label: 'Azure', id: 'Azure' },
        // { label: 'MiniMax', id: 'MiniMax' },
        // { label: 'Moonshot', id: 'Moonshot' },
        // { label: 'Groq', id: 'Groq' },
        // { label: 'Claude', id: 'Claude' },
        // { label: 'DeepSeek', id: 'DeepSeek' },
    ] as {
        label: string
        id: Provider
    }[]

    return (
        <Select
            overrides={overrides}
            size='compact'
            searchable={false}
            clearable={false}
            value={
                value && [
                    {
                        id: value,
                    },
                ]
            }
            onChange={(params) => {
                onChange?.(params.value[0].id as Provider | 'AIGPT')
            }}
            options={addProviderIcons({
                options,
                currentProvider: value,
                hasPromotion,
                theme,
            })}
        />
    )
}
