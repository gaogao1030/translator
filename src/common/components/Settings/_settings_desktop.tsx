import { ISettings } from '@/common/types'
import { createForm } from '@/common/components/Form'
import { useTranslation } from 'react-i18next'
import * as utils from '../../utils'

import {
    MyCheckbox,
    RestorePreviousPositionCheckbox,
    RunAtStartupCheckbox,
} from '@/common/components/Settings/_checkbox'

interface IDesktopSettingsProps {
    onBlur: () => void
}

const { FormItem } = createForm<ISettings>()

const isDesktopApp = utils.isDesktopApp()
const isMacOS = utils.isMacOS
const isTauri = utils.isTauri()

export function DesktopSettings({ onBlur }: IDesktopSettingsProps) {
    const { t } = useTranslation()
    return (
        <>
            <FormItem
                style={{
                    display: isDesktopApp ? 'block' : 'none',
                }}
                name='restorePreviousPosition'
                label={t('Fixed Position')}
            >
                <RestorePreviousPositionCheckbox onBlur={onBlur} />
            </FormItem>
            {isTauri && (
                <FormItem name='runAtStartup' label={t('Run at startup')}>
                    <RunAtStartupCheckbox onBlur={onBlur} />
                </FormItem>
            )}
            <FormItem
                style={{
                    display: isDesktopApp ? 'block' : 'none',
                }}
                name='hideTheIconInTheDock'
                label={isMacOS ? t('Hide the icon in the Dock bar') : t('Hide the icon in the taskbar')}
            >
                <MyCheckbox onBlur={onBlur} />
            </FormItem>
            <FormItem
                style={{
                    display: isDesktopApp ? 'block' : 'none',
                }}
                name='autoHideWindowWhenOutOfFocus'
                label={t('Auto hide window when out of focus')}
            >
                <MyCheckbox onBlur={onBlur} />
            </FormItem>
            <FormItem
                style={{
                    display: isDesktopApp ? 'block' : 'none',
                }}
                name='automaticCheckForUpdates'
                label={t('Automatic check for updates')}
            >
                <MyCheckbox onBlur={onBlur} />
            </FormItem>
            <FormItem
                style={{
                    display: isDesktopApp ? 'block' : 'none',
                }}
                name='disableCollectingStatistics'
                label={t('disable collecting statistics')}
            >
                <MyCheckbox onBlur={onBlur} />
            </FormItem>
        </>
    )
}
