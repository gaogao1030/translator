import { useCallback, useEffect, useState } from 'react'
import * as utils from '@/common/utils'
import useSWR from 'swr'
import { Skeleton } from 'baseui/skeleton'
import { IoMdAdd } from 'react-icons/io'
import { RiDeleteBin5Line } from 'react-icons/ri'
import { Select, Value, Option } from 'baseui/select'
import { defaultTTSProvider, langCode2TTSLang, ttsLangTestTextMap } from '@/common/tts'
import { TTSProvider } from '@/common/tts/types'
import { fetchEdgeVoices } from '@/common/tts/edge-tts'
import { createUseStyles } from 'react-jss'
import { ISettings, IThemedStyleProps } from '@/common/types'
import { Button, ButtonProps } from 'baseui/button'
import { Slider } from 'baseui/slider'
import { SpeakerIcon } from '@/common/components/SpeakerIcon'
import { LangCode, supportedLanguages } from '@/common/lang'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/common/hooks/useTheme'

const useTTSSettingsStyles = createUseStyles({
    label: (props: IThemedStyleProps) => ({
        color: props.theme.colors.contentPrimary,
        fontWeight: 500,
    }),
    voiceSelector: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        width: '100%',
    },
    formControl: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    tickBar: (props: IThemedStyleProps) => ({
        color: props.theme.colors.contentPrimary,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: '16px',
        paddingLeft: '16px',
    }),
})

interface ISpeakerButtonProps extends ButtonProps {
    iconSize?: number
    provider?: TTSProvider
    lang: LangCode
    voice: string
    rate?: number
    volume?: number
    text?: string
}

function SpeakerButton({
    iconSize = 13,
    provider,
    text: text_,
    lang,
    voice,
    rate,
    volume,
    ...buttonProps
}: ISpeakerButtonProps) {
    const text = text_ ?? ttsLangTestTextMap[lang]

    return (
        <Button
            shape='circle'
            size='mini'
            {...buttonProps}
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                const target = e.target as HTMLButtonElement
                target.querySelector('div')?.click()
            }}
        >
            <SpeakerIcon
                size={iconSize}
                provider={provider}
                text={text}
                lang={lang}
                voice={voice}
                rate={rate}
                volume={volume}
            />
        </Button>
    )
}

interface ITTSVoicesSettingsProps {
    value?: ISettings['tts']
    onChange?: (value: ISettings['tts']) => void
    onBlur?: () => void
}

const ttsProviderOptions: {
    label: string
    id: TTSProvider
}[] = [
    { label: 'Edge TTS', id: 'EdgeTTS' },
    { label: 'System Default', id: 'WebSpeech' },
]

export function TTSVoicesSettings({ value, onChange, onBlur }: ITTSVoicesSettingsProps) {
    console.debug('render tts voices settings')

    const { t } = useTranslation()
    const { theme, themeType } = useTheme()

    const styles = useTTSSettingsStyles({ theme, themeType, isDesktopApp: utils.isDesktopApp() })

    const [showLangSelector, setShowLangSelector] = useState(false)

    const [supportedVoices, setSupportedVoices] = useState<SpeechSynthesisVoice[]>([])

    const provider = value?.provider ?? defaultTTSProvider

    const { data: edgeVoices, isLoading: isEdgeVoicesLoading } = useSWR(
        provider === 'EdgeTTS' ? 'edgeVoices' : null,
        fetchEdgeVoices
    )

    const { data: webSpeechVoices, isLoading: isWebSpeechVoicesLoading } = useSWR(
        provider === 'WebSpeech' ? 'webSpeechVoices' : null,
        async () => {
            return speechSynthesis.getVoices()
        }
    )

    const isVoicesLoading = isEdgeVoicesLoading || isWebSpeechVoicesLoading

    useEffect(() => {
        switch (provider) {
            case 'EdgeTTS':
                setSupportedVoices(edgeVoices ?? [])
                break
            case 'WebSpeech':
                setSupportedVoices(webSpeechVoices ?? [])
                break
            default:
                setSupportedVoices(edgeVoices ?? [])
                break
        }
    }, [edgeVoices, provider, webSpeechVoices])

    const getLangOptions = useCallback(
        (lang: string) => {
            return supportedLanguages.reduce((acc, [langCode, label]) => {
                const ttsLang = langCode2TTSLang[langCode]
                if (ttsLang && supportedVoices.find((v) => v.lang === ttsLang)) {
                    if (value?.voices?.find((item) => item.lang === langCode) && langCode !== lang) {
                        return acc
                    }
                    return [
                        ...acc,
                        {
                            id: langCode,
                            label,
                        } as Option,
                    ]
                }
                return acc
            }, [] as Value)
        },
        [value?.voices, supportedVoices]
    )

    const getVoiceOptions = useCallback(
        (lang: LangCode) => {
            const ttsLang = langCode2TTSLang[lang]
            return supportedVoices
                .filter((v) => v.lang.split('-')[0] === lang || v.lang === ttsLang)
                .filter((v, idx, items) => items.findIndex((item) => item.name === v.name) === idx)
                .map((sv) => ({
                    id: sv.voiceURI,
                    label: (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                            }}
                            key={sv.voiceURI}
                        >
                            <SpeakerButton
                                shape='round'
                                kind='secondary'
                                iconSize={12}
                                overrides={{
                                    Root: {
                                        style: {
                                            padding: '4px',
                                        },
                                    },
                                }}
                                provider={value?.provider}
                                lang={lang}
                                voice={sv.voiceURI}
                                volume={value?.volume}
                                rate={value?.rate}
                            />
                            {sv.name}
                        </div>
                    ),
                    lang: sv.lang,
                }))
        },
        [supportedVoices, value?.provider, value?.rate, value?.volume]
    )

    const handleDeleteLang = useCallback(
        (lang: string) => {
            const voices = value?.voices ?? []
            const newVoices = voices.filter((item) => {
                return item.lang !== lang
            })
            onChange?.({ ...value, voices: newVoices })
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [value]
    )

    const handleChangeLang = useCallback(
        (prevLang: LangCode, newLang: LangCode) => {
            const voices = value?.voices ?? []
            const newVoices = voices.map((item) => {
                if (item.lang === prevLang) {
                    return {
                        lang: newLang,
                        voice: '',
                    }
                }
                return item
            })
            onChange?.({ ...value, voices: newVoices })
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [value]
    )

    const handleAddLang = useCallback(
        (lang: LangCode) => {
            const voices = value?.voices ?? []
            onChange?.({
                ...value,
                voices: [
                    ...voices,
                    {
                        lang,
                        voice: '',
                    },
                ],
            })
            setShowLangSelector(false)
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [value]
    )

    const handleChangeVoice = useCallback(
        (lang: string, voice: string) => {
            const voices = value?.voices ?? []
            const newVoices = voices.map((item) => {
                if (item.lang === lang) {
                    return {
                        ...item,
                        voice,
                    }
                }
                return item
            })
            onChange?.({ ...value, voices: newVoices })
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [value]
    )

    const handleChangeProvider = useCallback(
        (provider: TTSProvider) => {
            onChange?.({ ...value, provider })
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [value]
    )

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                marginTop: 20,
            }}
        >
            <div className={styles.formControl}>
                <label className={styles.label}>{t('Provider')}</label>
                <Select
                    size='compact'
                    clearable={false}
                    searchable={false}
                    options={ttsProviderOptions}
                    value={[{ id: value?.provider ?? 'EdgeTTS' }]}
                    onChange={({ option }) => handleChangeProvider(option?.id as TTSProvider)}
                    onBlur={onBlur}
                />
            </div>
            <div className={styles.formControl}>
                <label className={styles.label}>{t('Rate')}</label>
                <Slider
                    min={1}
                    max={20}
                    step={1}
                    value={[value?.rate ?? 10]}
                    onChange={(params) => onChange?.({ ...value, rate: params.value[0] })}
                    overrides={{
                        ThumbValue: () => null,
                        InnerThumb: () => null,
                        TickBar: () => (
                            <div className={styles.tickBar}>
                                <div>{t('Slow')}</div>
                                <div>{t('Fast')}</div>
                            </div>
                        ),
                    }}
                />
            </div>
            <div className={styles.formControl}>
                <label className={styles.label}>{t('Volume')}</label>
                <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[value?.volume ?? 100]}
                    onChange={(params) => onChange?.({ ...value, volume: params.value[0] })}
                    overrides={{
                        ThumbValue: () => null,
                        InnerThumb: () => null,
                        TickBar: () => (
                            <div className={styles.tickBar}>
                                <div>{t('Quiet')}</div>
                                <div>{t('Loud')}</div>
                            </div>
                        ),
                    }}
                />
            </div>
            <div className={styles.formControl}>
                <label className={styles.label}>{t('Voice')}</label>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                    }}
                >
                    {isVoicesLoading && <Skeleton rows={6} height='300px' width='100%' animation />}
                    {!isVoicesLoading &&
                        (value?.voices ?? []).map(({ lang, voice }) => {
                            const langOptions = getLangOptions(lang)
                            const selectedLang = langOptions.find((opt) => opt.id === lang)
                            const voiceOptions = getVoiceOptions(lang)
                            const selectedVoice = voiceOptions.find((opt) => opt.id === voice)
                            return (
                                <div className={styles.voiceSelector} key={lang}>
                                    <Select
                                        key={`lang-${lang}`}
                                        size='mini'
                                        clearable={false}
                                        options={langOptions}
                                        placeholder={t('Please select a language')}
                                        overrides={{
                                            Root: {
                                                style: {
                                                    width: '115px',
                                                    flexShrink: 0,
                                                },
                                            },
                                        }}
                                        onChange={({ option }) => handleChangeLang(lang, option?.id as LangCode)}
                                        value={selectedLang ? [{ id: selectedLang.id }] : undefined}
                                    />
                                    <Select
                                        size='mini'
                                        options={voiceOptions}
                                        placeholder={t('Please select a voice')}
                                        overrides={{
                                            Root: {
                                                style: {
                                                    flexShrink: 1,
                                                    minWidth: '215px',
                                                },
                                            },
                                        }}
                                        value={selectedVoice ? [{ id: selectedVoice.id }] : undefined}
                                        onChange={({ option }) => handleChangeVoice(lang, option?.id as string)}
                                        clearable={false}
                                        onBlur={onBlur}
                                        autoFocus={!selectedVoice}
                                    />
                                    <Button
                                        shape='circle'
                                        size='mini'
                                        overrides={{
                                            Root: {
                                                style: {
                                                    flexShrink: 0,
                                                },
                                            },
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            handleDeleteLang(lang)
                                        }}
                                    >
                                        <RiDeleteBin5Line size={12} />
                                    </Button>
                                </div>
                            )
                        })}
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginTop: 10,
                    }}
                >
                    {showLangSelector && (
                        <Select
                            size='mini'
                            placeholder={t('Please select a language')}
                            clearable={false}
                            options={getLangOptions('')}
                            onChange={({ option }) => handleAddLang(option?.id as LangCode)}
                            autoFocus
                        />
                    )}
                    <Button
                        size='mini'
                        overrides={{
                            Root: {
                                style: {
                                    flexShrink: 0,
                                },
                            },
                        }}
                        startEnhancer={() => <IoMdAdd size={12} />}
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setShowLangSelector(true)
                        }}
                    >
                        {t('Add')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
