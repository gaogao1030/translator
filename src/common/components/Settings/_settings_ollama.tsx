import { createForm } from '@/common/components/Form'
import { ProviderSelector } from './_provider_selector'
import {
    AlwaysShowIconsCheckbox,
    AutoTranslateCheckbox,
    SelectInputElementsCheckbox,
    MyCheckbox,
} from '@/common/components/Settings/_checkbox'
import {
    ThemeTypeSelector,
    LanguageSelector,
    TranslateModeSelector,
    LanguageDetectionEngineSelector,
} from '@/common/components/Settings/_selector'
import { useTranslation } from 'react-i18next'
import { DurationPicker } from '@/common/components/DurationPicker'
import { Input } from 'baseui/input'
import { APIModelSelector } from './_api_model_selector'
import { CUSTOM_MODEL_ID } from '@/common/constants'
import * as utils from '../../utils'
import { ISettings } from '@/common/types'
import NumberInput from '@/common/components/NumberInput'

const { FormItem } = createForm<ISettings>()
const isDesktopApp = utils.isDesktopApp()
export const linkStyle = {
    color: 'inherit',
    opacity: 0.8,
    cursor: 'pointer',
    outline: 'none',
}

interface IOllamaSetingsProps {
    values: ISettings
    onBlur: () => void
}

export function OllamaSettings({ values, onBlur }: IOllamaSetingsProps) {
    const { t } = useTranslation()

    return (
        <div
            style={{
                display: values.provider === 'Ollama' ? 'block' : 'none',
            }}
        >
            <FormItem
                name='provider'
                label={
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 10,
                        }}
                    >
                        {t('Default service provider')}
                    </div>
                }
                required
                caption={
                    values.provider === 'Ollama' ? (
                        <div>
                            {t('Go to the')}{' '}
                            <a
                                target='_blank'
                                href='https://github.com/ollama/ollama#ollama'
                                rel='noreferrer'
                                style={linkStyle}
                            >
                                Ollama Homepage
                            </a>{' '}
                            {t('to learn how to install and setup.')}
                        </div>
                    ) : undefined
                }
            >
                <ProviderSelector value='Ollama' />
            </FormItem>
            <FormItem
                name='ollamaAPIURL'
                label={t('API URL')}
                required={values.provider === 'Ollama'}
                caption={t('Generally, there is no need to modify this item.')}
            >
                <Input size='compact' onBlur={onBlur} />
            </FormItem>
            <FormItem
                name='ollamaModelLifetimeInMemory'
                label={t('The survival time of the Ollama model in memory')}
                required={values.provider === 'Ollama'}
            >
                <DurationPicker size='compact' />
            </FormItem>
            <FormItem
                name='ollamaAPIModel'
                label={t('API Model')}
                required={values.provider === 'Ollama'}
                caption={
                    <div>
                        <div>
                            {t(
                                'Model needs to first use the `ollama pull` command to download locally, please view all models from this page:'
                            )}{' '}
                            <a target='_blank' href='https://ollama.com/library' rel='noreferrer' style={linkStyle}>
                                Models
                            </a>
                        </div>
                    </div>
                }
            >
                <APIModelSelector provider='Ollama' currentProvider={values.provider} onBlur={onBlur} />
            </FormItem>
            <FormItem name='languageDetectionEngine' label={t('Language detection engine')}>
                <LanguageDetectionEngineSelector onBlur={onBlur} />
            </FormItem>
            <div
                style={{
                    display: values.ollamaAPIModel === CUSTOM_MODEL_ID ? 'block' : 'none',
                }}
            >
                <FormItem
                    name='ollamaCustomModelName'
                    label={t('Custom Model Name')}
                    required={values.provider === 'Ollama' && values.ollamaAPIModel === CUSTOM_MODEL_ID}
                >
                    <Input autoComplete='off' size='compact' />
                </FormItem>
                <FormItem name='defaultTranslateMode' label={t('Default Action')}>
                    <TranslateModeSelector onBlur={onBlur} />
                </FormItem>
                <FormItem name='defaultTargetLanguage' label={t('Default target language')}>
                    <LanguageSelector onBlur={onBlur} />
                </FormItem>
                <FormItem name='themeType' label={t('Theme')}>
                    <ThemeTypeSelector onBlur={onBlur} />
                </FormItem>
                <FormItem
                    style={{
                        display: isDesktopApp ? 'block' : 'none',
                    }}
                    name='enableBackgroundBlur'
                    label={t('Window background blur')}
                    caption={t(
                        "If the window background blur effect is enabled, please ensure to set the 'Theme' to 'Follow the System', as it is currently not possible to manually switch between light and dark themes when the window background blur is active."
                    )}
                >
                    <MyCheckbox onBlur={onBlur} />
                </FormItem>
                <FormItem name='fontSize' label={t('Font size')}>
                    <NumberInput />
                </FormItem>
                <FormItem
                    name='alwaysShowIcons'
                    label={t('Show icon when text is selected')}
                    caption={
                        isDesktopApp && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                {t('It is highly recommended to disable this feature and use the Clip Extension')}
                                <a
                                    href='https://github.com/openai-translator/openai-translator/blob/main/CLIP-EXTENSIONS.md'
                                    target='_blank'
                                    rel='noreferrer'
                                    style={linkStyle}
                                >
                                    {t('Clip Extension')}
                                </a>
                            </div>
                        )
                    }
                >
                    <AlwaysShowIconsCheckbox onBlur={onBlur} />
                </FormItem>
                <FormItem name='autoTranslate' label={t('Auto Translate')}>
                    <AutoTranslateCheckbox onBlur={onBlur} />
                </FormItem>
                <FormItem name='selectInputElementsText' label={t('Word selection in input')}>
                    <SelectInputElementsCheckbox onBlur={onBlur} />
                </FormItem>
            </div>
        </div>
    )
}
