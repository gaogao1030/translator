import React, { useCallback, useEffect, useState } from 'react'
import _ from 'underscore'
import { getEngine } from '@/common/engines'
import { OllamaSettings, linkStyle } from './_settings_ollama'
import { AIgptSettings } from './_settings_aigpt'
import { DesktopSettings } from './_settings_desktop'
import { MyCheckbox } from '@/common/components/Settings/_checkbox'
import { LanguageSelector } from '@/common/components/Settings/_selector'
import { Tabs, Tab, StyledTabList, StyledTabPanel } from 'baseui/tabs-motion'
import icon from '@/common/assets/images/icon-large.png'
import beams from '@/common/assets/images/beams.jpg'
import { TTSVoicesSettings } from './tts_voice'
// import wechat from '../assets/images/wechat.png'
// import alipay from '../assets/images/alipay.png'
import toast, { Toaster } from 'react-hot-toast'
import * as utils from '../../utils'
import { Client as Styletron } from 'styletron-engine-monolithic'
import { Provider as StyletronProvider } from 'styletron-react'
import { BaseProvider } from 'baseui'
import { Input } from 'baseui/input'
import { createForm } from '../Form'
import { Button, KIND } from 'baseui/button'
import { Select } from 'baseui/select'
import { Checkbox } from 'baseui/checkbox'
import { useRecordHotkeys } from 'react-hotkeys-hook'
import { createUseStyles } from 'react-jss'
import clsx from 'clsx'
import { ISettings, IThemedStyleProps, ProxyProtocol } from '@/common/types'
import { useTheme } from '../../hooks/useTheme'
import { IoCloseCircle, IoSettingsOutline } from 'react-icons/io5'
import { useTranslation } from 'react-i18next'
import { useSettings } from '@/common/hooks/useSettings'
import { IoIosSave } from 'react-icons/io'
import { useThemeType } from '@/common/hooks/useThemeType'
import { GlobalSuspense } from '@/common/components/GlobalSuspense'
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader } from 'baseui/modal'
import { TbCloudNetwork } from 'react-icons/tb'
import { Cell, Grid } from 'baseui/layout-grid'
import {
    II18nPromotionContent,
    IPromotionResponse,
    fetchPromotions,
    II18nPromotionContentItem,
    choicePromotionItem,
    IPromotionItem,
} from '@/common/services/promotion'
import useSWR from 'swr'
import { Markdown } from '@/common/components/Markdown'
import { open } from '@tauri-apps/plugin-shell'
import { getCurrent } from '@tauri-apps/api/webviewWindow'
// import { usePromotionShowed } from '@/common/hooks/usePromotionShowed'
import { trackEvent } from '@aptabase/tauri'
import { RxSpeakerLoud } from 'react-icons/rx'
import { Notification } from 'baseui/notification'
// import { usePromotionNeverDisplay } from '@/common/hooks/usePromotionNeverDisplay'
import { Textarea } from 'baseui/textarea'
import { ProxyTester } from '@/common/components/ProxyTester'

interface IProxyProtocolProps {
    value?: ProxyProtocol
    onChange?: (value: ProxyProtocol) => void
    onBlur?: () => void
}

function ProxyProtocolSelector({ value, onChange, onBlur }: IProxyProtocolProps) {
    const options = [
        { label: 'HTTP', id: 'HTTP' },
        { label: 'HTTPS', id: 'HTTPS' },
    ]

    return (
        <Select
            size='compact'
            onBlur={onBlur}
            searchable={false}
            clearable={false}
            value={
                value
                    ? [
                          {
                              id: value,
                              label: options.find((option) => option.id === value)?.label || 'HTTP',
                          },
                      ]
                    : undefined
            }
            onChange={(params) => {
                onChange?.(params.value[0].id as ProxyProtocol)
            }}
            options={options}
        />
    )
}

interface Ii18nSelectorProps {
    value?: string
    onChange?: (value: string) => void
    onBlur?: () => void
}

function Ii18nSelector({ value, onChange, onBlur }: Ii18nSelectorProps) {
    const { i18n } = useTranslation()

    const options = [
        { label: 'English', id: 'en' },
        { label: '简体中文', id: 'zh-Hans' },
        { label: '繁體中文', id: 'zh-Hant' },
        { label: '日本語', id: 'ja' },
        { label: 'ไทย', id: 'th' },
        { label: 'Türkçe', id: 'tr' },
    ]

    return (
        <Select
            size='compact'
            onBlur={onBlur}
            searchable={false}
            clearable={false}
            value={
                value
                    ? [
                          {
                              id: value,
                              label: options.find((option) => option.id === value)?.label || 'en',
                          },
                      ]
                    : undefined
            }
            onChange={(params) => {
                onChange?.(params.value[0].id as string)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ;(i18n as any).changeLanguage(params.value[0].id as string)
            }}
            options={options}
        />
    )
}

interface ReadSelectedWordsFromInputElementsProps {
    value?: boolean
    onChange?: (value: boolean) => void
    onBlur?: () => void
}

function ReadSelectedWordsFromInputElementsCheckbox({
    value,
    onChange,
    onBlur,
}: ReadSelectedWordsFromInputElementsProps) {
    return (
        <Checkbox
            checkmarkType='toggle_round'
            checked={value}
            onChange={(e) => {
                onChange?.(e.target.checked)
                onBlur?.()
            }}
        />
    )
}

const useStyles = createUseStyles({
    headerPromotion: (props: IThemedStyleProps) => {
        return {
            '& p': {
                margin: '1px 0',
            },
            '& a': {
                color: props.theme.colors.contentPrimary,
                textDecoration: 'underline',
            },
        }
    },
    promotion: (props: IThemedStyleProps) => {
        return {
            'display': 'flex',
            'flexDirection': 'column',
            'gap': '3px',
            'borderRadius': '0.31rem',
            'padding': '0.15rem 0.4rem',
            'color': props.themeType === 'dark' ? props.theme.colors.black : props.theme.colors.contentPrimary,
            'backgroundColor': props.theme.colors.warning100,
            '& p': {
                margin: '2px 0',
            },
            '& a': {
                color: props.themeType === 'dark' ? props.theme.colors.black : props.theme.colors.contentPrimary,
                textDecoration: 'underline',
            },
        }
    },
    disclaimer: (props: IThemedStyleProps) => {
        return {
            'color': props.theme.colors.contentPrimary,
            'lineHeight': 1.8,
            '& a': {
                color: props.theme.colors.contentPrimary,
                textDecoration: 'underline',
            },
        }
    },
    footer: (props: IThemedStyleProps) =>
        props.isDesktopApp
            ? {
                  zIndex: 999,
                  color: props.theme.colors.contentSecondary,
                  position: 'fixed',
                  width: '100%',
                  height: '42px',
                  cursor: 'pointer',
                  left: '0',
                  bottom: '0',
                  paddingLeft: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  background: props.themeType === 'dark' ? 'rgba(31, 31, 31, 0.5)' : 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
              }
            : {
                  color: props.theme.colors.contentSecondary,
                  position: 'absolute',
                  cursor: 'pointer',
                  bottom: '16px',
                  left: '6px',
                  lineHeight: '1',
              },
})

const useHotkeyRecorderStyles = createUseStyles({
    'hotkeyRecorder': (props: IThemedStyleProps) => ({
        position: 'relative',
        height: '32px',
        lineHeight: '32px',
        padding: '0 14px',
        borderRadius: '4px',
        width: '300px',
        cursor: 'pointer',
        border: '1px dashed transparent',
        backgroundColor: props.theme.colors.backgroundTertiary,
        color: props.theme.colors.primary,
    }),
    'clearHotkey': {
        position: 'absolute',
        top: '10px',
        right: '12px',
    },
    'caption': {
        marginTop: '4px',
        fontSize: '11px',
        color: '#999',
    },
    'recording': {
        animation: '$recording 2s infinite',
    },
    '@keyframes recording': {
        '0%': {
            backgroundColor: 'transparent',
        },
        '50%': {
            backgroundColor: 'rgb(238, 238, 238)',
            borderColor: '#999',
        },
        '100%': {
            backgroundColor: 'transparent',
        },
    },
})

interface IHotkeyRecorderProps {
    value?: string
    onChange?: (value: string) => void
    onBlur?: () => void
    testId?: string
}

function HotkeyRecorder({ value, onChange, onBlur, testId }: IHotkeyRecorderProps) {
    const { theme, themeType } = useTheme()

    const { t } = useTranslation()

    const styles = useHotkeyRecorderStyles({ themeType, theme })
    const [keys, { start, stop, isRecording }] = useRecordHotkeys()

    const [hotKeys, setHotKeys] = useState<string[]>([])
    useEffect(() => {
        if (value) {
            setHotKeys(
                value
                    .replace(/-/g, '+')
                    .split('+')
                    .map((k) => k.trim())
                    .filter(Boolean)
            )
        }
    }, [value])

    useEffect(() => {
        let keys_ = Array.from(keys)
        if (keys_ && keys_.length > 0) {
            keys_ = keys_.map((k) => (k.toLowerCase() === 'meta' ? 'CommandOrControl' : k))
            setHotKeys(keys_)
            onChange?.(keys_.join('+'))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keys])

    useEffect(() => {
        if (!isRecording) {
            onChange?.(hotKeys.join('+'))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hotKeys, isRecording])

    useEffect(() => {
        const stopRecording = () => {
            if (isRecording) {
                stop()
                onBlur?.()
            }
        }
        document.addEventListener('click', stopRecording)
        return () => {
            document.removeEventListener('click', stopRecording)
        }
    }, [isRecording, onBlur, stop])

    function clearHotkey() {
        onChange?.('')
        setHotKeys([])
    }

    return (
        <div>
            <div
                onClick={(e) => {
                    e.stopPropagation()
                    e.currentTarget.focus()
                    if (!isRecording) {
                        start()
                    } else {
                        stop()
                    }
                }}
                data-testid={testId}
                className={clsx(styles.hotkeyRecorder, {
                    [styles.recording]: isRecording,
                })}
            >
                {hotKeys.join(' + ')}
                {!isRecording && hotKeys.length > 0 ? (
                    <IoCloseCircle
                        className={styles.clearHotkey}
                        onClick={(e: React.MouseEvent<SVGElement>) => {
                            e.stopPropagation()
                            clearHotkey()
                        }}
                    />
                ) : null}
            </div>
            <div className={styles.caption}>
                {isRecording ? t('Please press the hotkey you want to set.') : t('Click above to set hotkeys.')}
            </div>
        </div>
    )
}

const { Form, FormItem, useForm } = createForm<ISettings>()

interface IInnerSettingsProps {
    showFooter?: boolean
    onSave?: (oldSettings: ISettings) => void
    headerPromotionID?: string
    openaiAPIKeyPromotionID?: string
}

interface ISettingsProps extends IInnerSettingsProps {
    engine: Styletron
}

export function Settings({ engine, ...props }: ISettingsProps) {
    const { theme } = useTheme()
    return (
        <StyletronProvider value={engine}>
            <BaseProvider theme={theme}>
                <GlobalSuspense>
                    <InnerSettings {...props} />
                </GlobalSuspense>
            </BaseProvider>
        </StyletronProvider>
    )
}

export function InnerSettings({
    onSave,
    showFooter = false,
    openaiAPIKeyPromotionID,
    headerPromotionID,
}: IInnerSettingsProps) {
    const { data: promotions, mutate: refetchPromotions } = useSWR<IPromotionResponse>('promotions', fetchPromotions)

    useEffect(() => {
        const timer = setInterval(
            () => {
                refetchPromotions()
            },
            1000 * 60 * 10
        )
        return () => {
            clearInterval(timer)
        }
    }, [refetchPromotions])

    const isTauri = utils.isTauri()

    useEffect(() => {
        if (!isTauri) {
            return undefined
        }
        let unlisten: (() => void) | undefined = undefined
        const appWindow = getCurrent()
        appWindow
            .listen('tauri://focus', () => {
                refetchPromotions()
            })
            .then((cb) => {
                unlisten = cb
            })
        return () => {
            unlisten?.()
        }
    }, [isTauri, refetchPromotions])

    useEffect(() => {
        if (!isTauri) {
            return
        }
        trackEvent('screen_view', { name: 'Settings' })
    }, [isTauri])

    const { theme, themeType } = useTheme()

    const { refreshThemeType } = useThemeType()

    const { t } = useTranslation()

    const [loading, setLoading] = useState(false)
    const { settings, setSettings } = useSettings()
    const [values, setValues] = useState<ISettings>(settings)
    const [prevValues, setPrevValues] = useState<ISettings>(values)

    const [form] = useForm()

    useEffect(() => {
        form.setFieldsValue(values)
    }, [form, values])

    useEffect(() => {
        if (settings) {
            ;(async () => {
                if (isTauri) {
                    const { isEnabled: autostartIsEnabled } = await import('@tauri-apps/plugin-autostart')
                    settings.runAtStartup = await autostartIsEnabled()
                }
                setPrevValues(settings)
            })()
        }
    }, [isTauri, settings])

    const onChange = useCallback((_changes: Partial<ISettings>, values_: ISettings) => {
        setValues(values_)
    }, [])

    const onSubmit = useCallback(
        async (data: ISettings) => {
            const engine = getEngine(data.provider)
            setLoading(true)
            const oldSettings = await utils.getSettings()
            if (isTauri) {
                try {
                    const {
                        enable: autostartEnable,
                        disable: autostartDisable,
                        isEnabled: autostartIsEnabled,
                    } = await import('@tauri-apps/plugin-autostart')
                    if (data.runAtStartup) {
                        await autostartEnable()
                    } else {
                        await autostartDisable()
                    }
                    data.runAtStartup = await autostartIsEnabled()
                } catch (e) {
                    console.log('err', e)
                }
            }

            if (data.themeType) {
                refreshThemeType()
            }

            if (isTauri) {
                trackEvent('save_settings')
            }

            const res = await engine.getUsage()
            if (res.status === 200) {
                toast(t('Saved'), {
                    icon: '👍',
                    duration: 3000,
                })
                await utils.setSettings(data)
                setSettings(data)
                onSave?.(oldSettings)
            } else {
                toast(res.detail, {
                    duration: 3000,
                })
                setValues((pv) => Object.assign({}, pv, { errMsg: res.detail }))
            }
            setLoading(false)
        },
        [isTauri, onSave, setSettings, setValues, refreshThemeType, t]
    )

    const onBlur = useCallback(async () => {
        if (values.apiKeys && !_.isEqual(values, prevValues)) {
            if (values.apiKeys === 'Ollama') {
                values.provider = 'Ollama'
            }
            await utils.setSettings(values)
            setPrevValues(values)
        }
    }, [prevValues, values])

    const isDesktopApp = utils.isDesktopApp()

    const styles = useStyles({ theme, themeType, isDesktopApp })

    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false)

    useEffect(() => {
        if (!showFooter) {
            return undefined
        }
        const isOnBottom = () => {
            const scrollTop = document.documentElement.scrollTop

            const windowHeight = window.innerHeight

            const documentHeight = document.documentElement.scrollHeight

            return scrollTop + windowHeight >= documentHeight
        }

        setIsScrolledToBottom(isOnBottom())

        const onScroll = () => {
            setIsScrolledToBottom(isOnBottom())
        }

        window.addEventListener('scroll', onScroll)
        window.addEventListener('resize', onScroll)
        const observer = new MutationObserver(onScroll)
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        })
        return () => {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
            observer.disconnect()
        }
    }, [showFooter])

    const [showBuyMeACoffee, setShowBuyMeACoffee] = useState(false)

    const [activeTab, setActiveTab] = useState('general')

    const [isScrolled, setIsScrolled] = useState(window.scrollY > 0)

    useEffect(() => {
        const onScroll = () => {
            setIsScrolled(window.scrollY > 0)
        }
        window.addEventListener('scroll', onScroll)
        return () => {
            window.removeEventListener('scroll', onScroll)
        }
    }, [])

    const tabsOverrides = {
        // Root: {
        //   style: {
        //     '& button:hover': {
        //       background: 'transparent !important',
        //     },
        //   },
        // },
        TabList: {
            style: () => ({}),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            component: function TabsListOverride(props: any) {
                return (
                    <Grid behavior='fluid'>
                        <Cell span={12}>
                            <StyledTabList {...props} />
                        </Cell>
                    </Grid>
                )
            },
        },
    }

    const tabOverrides = {
        TabPanel: {
            style: {
                padding: '0px',
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            component: function TabsListOverride(props: any) {
                return (
                    <Grid>
                        <Cell span={[1, 2, 3]}>
                            <StyledTabPanel {...props} />
                        </Cell>
                    </Grid>
                )
            },
        },
        Tab: {
            style: {
                'color': theme.colors.black,
                'background': 'transparent',
                ':hover': {
                    background: 'rgba(255, 255, 255, 0.35) !important',
                },
                ':active': {
                    background: 'rgba(255, 255, 255, 0.45) !important',
                },
            },
        },
    }

    const getI18nPromotionContent = (contentItem: II18nPromotionContentItem) => {
        let c =
            contentItem.content[
                (values.i18n as keyof II18nPromotionContent | undefined) ?? contentItem.fallback_language
            ]
        if (!c) {
            c = contentItem.content[contentItem.fallback_language]
        }
        return c
    }

    const renderI18nPromotionContent = (contentItem: II18nPromotionContentItem) => {
        if (contentItem.format === 'text') {
            return <span>{getI18nPromotionContent(contentItem)}</span>
        }

        if (contentItem.format === 'html') {
            return (
                <div
                    dangerouslySetInnerHTML={{
                        __html: getI18nPromotionContent(contentItem) ?? '',
                    }}
                />
            )
        }

        if (contentItem.format === 'markdown') {
            return <Markdown linkTarget='_blank'>{getI18nPromotionContent(contentItem) ?? ''}</Markdown>
        }

        return <div />
    }

    const [disclaimerAgreeLink, setDisclaimerAgreeLink] = useState<string>()
    const [disclaimerPromotion, setDisclaimerPromotion] = useState<IPromotionItem>()

    const [openaiAPIKeyPromotion, setOpenaiAPIKeyPromotion] = useState<IPromotionItem>()

    useEffect(() => {
        let unlisten: (() => void) | undefined = undefined
        if (openaiAPIKeyPromotionID) {
            setOpenaiAPIKeyPromotion(promotions?.openai_api_key?.find((item) => item.id === openaiAPIKeyPromotionID))
        } else {
            choicePromotionItem(promotions?.openai_api_key).then(setOpenaiAPIKeyPromotion)
            if (isTauri) {
                const appWindow = getCurrent()
                appWindow
                    .listen('tauri://focus', () => {
                        choicePromotionItem(promotions?.openai_api_key).then(setOpenaiAPIKeyPromotion)
                    })
                    .then((cb) => {
                        unlisten = cb
                    })
            }
        }
        return () => {
            unlisten?.()
        }
    }, [isTauri, openaiAPIKeyPromotionID, promotions?.openai_api_key])

    const [headerPromotion, setHeaderPromotion] = useState<IPromotionItem>()

    useEffect(() => {
        let unlisten: (() => void) | undefined = undefined
        if (headerPromotionID) {
            setHeaderPromotion(promotions?.settings_header?.find((item) => item.id === headerPromotionID))
        } else {
            choicePromotionItem(promotions?.settings_header).then(setHeaderPromotion)
            if (isTauri) {
                const appWindow = getCurrent()
                appWindow
                    .listen('tauri://focus', () => {
                        choicePromotionItem(promotions?.settings_header).then(setHeaderPromotion)
                    })
                    .then((cb) => {
                        unlisten = cb
                    })
            }
        }
        return () => {
            unlisten?.()
        }
    }, [headerPromotionID, isTauri, promotions?.settings_header])

    // const { promotionShowed: openaiAPIKeyPromotionShowed, setPromotionShowed: setOpenaiAPIKeyPromotionShowed } =
    //   usePromotionShowed(openaiAPIKeyPromotion)
    //
    // const { setPromotionShowed: setHeaderPromotionShowed } = usePromotionShowed(headerPromotion)
    //
    // useEffect(() => {
    //   setHeaderPromotionShowed(true)
    // }, [setHeaderPromotionShowed])

    // const {
    //   promotionNeverDisplay: headerPromotionNeverDisplay,
    //   setPromotionNeverDisplay: setHeaderPromotionNeverDisplay,
    // } = usePromotionNeverDisplay(headerPromotion)
    //
    // const isOpenAI = values.provider === 'OpenAI'
    //
    // useEffect(() => {
    //   if (isOpenAI) {
    //     setOpenaiAPIKeyPromotionShowed(true)
    //   }
    // }, [setOpenaiAPIKeyPromotionShowed, isOpenAI])

    // useEffect(() => {
    //   if (isOpenAI && openaiAPIKeyPromotion) {
    //     trackEvent('promotion_view', { id: openaiAPIKeyPromotion.id })
    //   }
    // }, [isOpenAI, openaiAPIKeyPromotion])

    useEffect(() => {
        if (disclaimerPromotion?.id) {
            trackEvent('promotion_disclaimer_view', { id: disclaimerPromotion.id })
        }
    }, [disclaimerPromotion?.id])

    console.debug('render settings')

    return (
        <div
            style={{
                paddingTop: utils.isBrowserExtensionOptions() ? undefined : '136px',
                paddingBottom: utils.isBrowserExtensionOptions() ? undefined : '32px',
                background: isDesktopApp ? 'transparent' : theme.colors.backgroundPrimary,
                minWidth: isDesktopApp ? 450 : 400,
                maxHeight: utils.isUserscript() ? 'calc(100vh - 32px)' : undefined,
                overflow: utils.isUserscript() ? 'auto' : undefined,
            }}
            data-testid='settings-container'
        >
            <nav
                style={{
                    position: utils.isBrowserExtensionOptions() ? 'sticky' : 'fixed',
                    left: 0,
                    top: 0,
                    zIndex: 999,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: `url(${utils.getAssetUrl(beams)}) no-repeat center center`,
                    boxSizing: 'border-box',
                    boxShadow: isScrolled ? theme.lighting.shadow600 : undefined,
                }}
                data-tauri-drag-region
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        color: '#333',
                        gap: 10,
                        padding: '15px 25px 0 25px',
                    }}
                >
                    <img width='22' src={utils.getAssetUrl(icon)} alt='logo' />
                    <h2
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        AI Translator
                        <a href='https://aigpt5.org' target='_blank' rel='noreferrer' style={linkStyle}>
                            AIGPT Studio
                        </a>
                        {/* {AppConfig?.version ? ( */}
                        {/*   <a */}
                        {/*     href='https://github.com/yetone/openai-translator/releases' */}
                        {/*     target='_blank' */}
                        {/*     rel='noreferrer' */}
                        {/*     style={linkStyle} */}
                        {/*   > */}
                        {/*     {AppConfig.version} */}
                        {/*   </a> */}
                        {/* ) : null} */}
                    </h2>
                    <div
                        style={{
                            flexGrow: 1,
                        }}
                    />
                    <div>
                        <Button
                            kind={KIND.secondary}
                            size='mini'
                            onClick={(e) => {
                                e.stopPropagation()
                                chrome.tabs.create({ url: 'http://shumei.io' })
                                // setShowBuyMeACoffee(true)
                                // trackEvent('buy_me_a_coffee_clicked')
                            }}
                        >
                            {/* {'❤️  ' + t('Buy me a coffee')} */}
                            {'☕ ' + t('About')}
                        </Button>
                    </div>
                </div>
                <Tabs
                    overrides={tabsOverrides}
                    activeKey={activeTab}
                    onChange={({ activeKey }) => {
                        setActiveTab(activeKey as string)
                    }}
                    fill='fixed'
                    renderAll
                >
                    <Tab
                        title={t('General')}
                        key='general'
                        artwork={() => {
                            return <IoSettingsOutline size={14} />
                        }}
                        overrides={tabOverrides}
                    />
                    {isTauri && (
                        <Tab
                            title={t('Proxy')}
                            key='proxy'
                            artwork={() => {
                                return <TbCloudNetwork size={14} />
                            }}
                            overrides={tabOverrides}
                        />
                    )}
                    <Tab
                        title={t('TTS')}
                        key='tts'
                        artwork={() => {
                            return <RxSpeakerLoud size={14} />
                        }}
                        overrides={tabOverrides}
                    />
                    {/* <Tab */}
                    {/*   title={t('Writing')} */}
                    {/*   key='writing' */}
                    {/*   artwork={() => { */}
                    {/*     return <PiTextbox size={14} /> */}
                    {/*   }} */}
                    {/*   overrides={tabOverrides} */}
                    {/* /> */}
                    {/* <Tab */}
                    {/*   title={t('Shortcuts')} */}
                    {/*   key='shortcuts' */}
                    {/*   artwork={() => { */}
                    {/*     return <BsKeyboard size={14} /> */}
                    {/*   }} */}
                    {/*   overrides={{ */}
                    {/*     ...tabOverrides, */}
                    {/*     Tab: { */}
                    {/*       ...tabOverrides.Tab, */}
                    {/*       props: { */}
                    {/*         'data-testid': 'shortcuts', */}
                    {/*       }, */}
                    {/*     }, */}
                    {/*   }} */}
                    {/* /> */}
                </Tabs>
            </nav>
            {headerPromotion && !headerPromotionNeverDisplay && (
                <div
                    className={styles.headerPromotion}
                    onClick={(e) => {
                        if ((e.target as HTMLElement).tagName === 'A') {
                            const href = (e.target as HTMLAnchorElement).href
                            if (href && href.startsWith('http')) {
                                e.preventDefault()
                                e.stopPropagation()
                                setDisclaimerPromotion(headerPromotion)
                                setDisclaimerAgreeLink(href)
                            }
                        }
                    }}
                >
                    <Notification
                        overrides={{
                            Body: {
                                style: {
                                    width: 'auto',
                                    fontSize: '12px',
                                    lineHeight: '1.6',
                                    marginTop: '10px',
                                    marginBottom: '0px',
                                    paddingLeft: '14px',
                                    paddingRight: '8px',
                                    paddingTop: '6px',
                                    paddingBottom: '6px',
                                    color: theme.colors.contentPrimary,
                                },
                            },
                        }}
                        closeable={headerPromotion.can_never_display}
                        onClose={() => {
                            setHeaderPromotionNeverDisplay(true)
                        }}
                    >
                        {renderI18nPromotionContent(headerPromotion.promotion)}
                    </Notification>
                </div>
            )}
            {/* {!isDesktopApp && ( */}
            {/*   <div */}
            {/*     style={{ */}
            {/*       padding: '20px 25px 0px 25px', */}
            {/*       color: theme.colors.contentPrimary, */}
            {/*     }} */}
            {/*   > */}
            {/*     {t( */}
            {/*       'It is recommended to download the desktop application of OpenAI Translator to enjoy the wonderful experience of word translation in all software!' */}
            {/*     )}{' '} */}
            {/*     <a */}
            {/*       target='_blank' */}
            {/*       href={ */}
            {/*         values?.i18n?.toLowerCase().includes('zh') */}
            {/*           ? 'https://github.com/openai-translator/openai-translator/blob/main/README-CN.md#%E5%AE%89%E8%A3%85' */}
            {/*           : 'https://github.com/openai-translator/openai-translator#installation' */}
            {/*       } */}
            {/*       rel='noreferrer' */}
            {/*       style={{ */}
            {/*         color: theme.colors.linkText, */}
            {/*       }} */}
            {/*     > */}
            {/*       {t('Download Link')} */}
            {/*     </a> */}
            {/*   </div> */}
            {/* )} */}
            <Form
                autoComplete='off'
                autoCapitalize='off'
                form={form}
                style={{
                    padding: '20px 25px',
                    paddingBottom: utils.isBrowserExtensionOptions() ? 0 : undefined,
                }}
                onFinish={onSubmit}
                initialValues={values}
                onValuesChange={onChange}
            >
                <div>
                    <div
                        style={{
                            display: activeTab === 'general' ? 'block' : 'none',
                        }}
                    >
                        <FormItem name='i18n' label={t('i18n')}>
                            <Ii18nSelector onBlur={onBlur} />
                        </FormItem>
                        <AIgptSettings values={values} onBlur={onBlur} />
                        <OllamaSettings values={values} onBlur={onBlur} />
                        <DesktopSettings onBlur={onBlur} />
                    </div>
                    <div
                        style={{
                            display: isTauri && activeTab === 'proxy' ? 'block' : 'none',
                        }}
                    >
                        <FormItem name={['proxy', 'enabled']} label={t('Enabled')}>
                            <MyCheckbox />
                        </FormItem>
                        <FormItem name={['proxy', 'protocol']} label={t('Protocol')}>
                            <ProxyProtocolSelector />
                        </FormItem>
                        <FormItem name={['proxy', 'server']} label={t('Server')}>
                            <Input size='compact' />
                        </FormItem>
                        <FormItem name={['proxy', 'port']} label={t('Port')}>
                            <Input type='number' size='compact' />
                        </FormItem>
                        <FormItem name={['proxy', 'basicAuth', 'username']} label={t('Username')}>
                            <Input size='compact' />
                        </FormItem>
                        <FormItem name={['proxy', 'basicAuth', 'password']} label={t('Password')}>
                            <Input type='password' size='compact' />
                        </FormItem>
                        <FormItem name={['proxy', 'noProxy']} label={t('No proxy')}>
                            <Textarea size='compact' />
                        </FormItem>
                        <ProxyTester proxy={values.proxy} />
                    </div>
                    <div
                        style={{
                            display: activeTab === 'tts' ? 'block' : 'none',
                        }}
                    >
                        <FormItem
                            name='readSelectedWordsFromInputElementsText'
                            label={t('Read the selected words in input')}
                        >
                            <ReadSelectedWordsFromInputElementsCheckbox onBlur={onBlur} />
                        </FormItem>
                        <FormItem name='tts' label={t('TTS')}>
                            <TTSVoicesSettings onBlur={onBlur} />
                        </FormItem>
                    </div>
                    <div
                        style={{
                            display: activeTab === 'writing' ? 'block' : 'none',
                        }}
                    >
                        <FormItem
                            style={{
                                display: isDesktopApp ? 'block' : 'none',
                            }}
                            name='writingTargetLanguage'
                            label={t('Writing target language')}
                        >
                            <LanguageSelector onBlur={onBlur} />
                        </FormItem>
                        <FormItem
                            style={{
                                display: isDesktopApp ? 'block' : 'none',
                            }}
                            name='writingHotkey'
                            label={t('Writing Hotkey')}
                            caption={t(
                                'Press this shortcut key in the input box of any application, and the text already entered in the input box will be automatically translated into the writing target language.'
                            )}
                        >
                            <HotkeyRecorder onBlur={onBlur} testId='writing-hotkey-recorder' />
                        </FormItem>
                        <FormItem
                            style={{
                                display: isDesktopApp ? 'block' : 'none',
                            }}
                            name='writingNewlineHotkey'
                            label={t('Writing line break shortcut')}
                            caption={t('When writing, which key should be pressed when encountering a line break?')}
                        >
                            <HotkeyRecorder onBlur={onBlur} testId='writing-newline-hotkey-recorder' />
                        </FormItem>
                    </div>
                    <div
                        style={{
                            display: activeTab === 'shortcuts' ? 'block' : 'none',
                        }}
                    >
                        <FormItem name='hotkey' label={t('Hotkey')}>
                            <HotkeyRecorder onBlur={onBlur} testId='hotkey-recorder' />
                        </FormItem>
                        <FormItem name='displayWindowHotkey' label={t('Display window Hotkey')}>
                            <HotkeyRecorder onBlur={onBlur} testId='display-window-hotkey-recorder' />
                        </FormItem>
                        <FormItem
                            style={{
                                display: isDesktopApp ? 'block' : 'none',
                            }}
                            name='ocrHotkey'
                            label={t('OCR Hotkey')}
                        >
                            <HotkeyRecorder onBlur={onBlur} testId='ocr-hotkey-recorder' />
                        </FormItem>
                    </div>
                </div>
                <div
                    style={{
                        position: utils.isBrowserExtensionOptions() ? 'sticky' : 'fixed',
                        bottom: '7px',
                        right: '25px',
                        paddingBottom: utils.isBrowserExtensionOptions() ? '10px' : undefined,
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'row',
                        zIndex: 1000,
                        gap: 10,
                    }}
                >
                    <div
                        style={{
                            marginRight: 'auto',
                        }}
                    />
                    <Button isLoading={loading} size='mini' startEnhancer={<IoIosSave size={12} />}>
                        {t('Save')}
                    </Button>
                </div>
                <Toaster />
            </Form>
            {showFooter && (
                <div
                    className={styles.footer}
                    style={{
                        boxShadow: isScrolledToBottom ? undefined : theme.lighting.shadow700,
                    }}
                />
            )}
            <Modal
                isOpen={showBuyMeACoffee}
                onClose={() => setShowBuyMeACoffee(false)}
                closeable
                size='auto'
                autoFocus
                animate
            >
                <ModalHeader
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    {'❤️  ' + t('Buy me a coffee')}
                </ModalHeader>
                <ModalBody>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 10,
                        }}
                    >
                        <div>{t('If you find this tool helpful, you can buy me a cup of coffee.')}</div>
                        {/* <div> */}
                        {/*   <img width='330' src={wechat} /> */}
                        {/* </div> */}
                        {/* <div> */}
                        {/*   <img width='330' src={alipay} /> */}
                        {/* </div> */}
                    </div>
                </ModalBody>
            </Modal>
            <Modal
                isOpen={!!disclaimerPromotion}
                onClose={() => setDisclaimerPromotion(undefined)}
                closeable
                size='auto'
                autoFocus
                animate
            >
                <ModalHeader>{t('Disclaimer')}</ModalHeader>
                <ModalBody className={styles.disclaimer}>
                    {disclaimerPromotion ? renderI18nPromotionContent(disclaimerPromotion.disclaimer) : ''}
                </ModalBody>
                <ModalFooter>
                    <ModalButton
                        size='compact'
                        kind='tertiary'
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setDisclaimerPromotion(undefined)
                        }}
                    >
                        {t('Disagree')}
                    </ModalButton>
                    <ModalButton
                        size='compact'
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation()
                            e.preventDefault()
                            trackEvent('promotion_clicked', { id: openaiAPIKeyPromotion?.id ?? '' })
                            if (isTauri) {
                                if (disclaimerAgreeLink) {
                                    open(disclaimerAgreeLink)
                                }
                            } else {
                                window.open(disclaimerAgreeLink)
                            }
                        }}
                    >
                        {t('Agree and continue')}
                    </ModalButton>
                </ModalFooter>
            </Modal>
        </div>
    )
}
