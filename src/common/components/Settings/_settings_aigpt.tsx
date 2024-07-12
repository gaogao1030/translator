import { ISettings } from '@/common/types'
import { useTranslation } from 'react-i18next'
import { createForm } from '@/common/components/Form'
import { Input } from 'baseui/input'
import { checkAIgptCode } from '../Form/validators'

interface IAigptSetingsProps {
    values: ISettings
    onBlur: () => void
}

const { FormItem } = createForm<ISettings>()

const linkStyle = {
    color: 'inherit',
    opacity: 0.8,
    cursor: 'pointer',
    outline: 'none',
}

export function AIgptSettings({ values, onBlur }: IAigptSetingsProps) {
    // useEffect(() => {
    //   console.log('Values changed:', values);
    // }, [values]);
    const { t } = useTranslation()

    return (
        <div
            style={{
                display: values.provider === 'AIGPT' ? 'block' : 'none',
            }}
        >
            <FormItem
                required={values.provider === 'AIGPT'}
                name='apiKeys'
                label='AIGPT Code'
                validators={[checkAIgptCode(values.errMsg, values.apiKeys)]}
                caption={
                    <div>
                        {t('Enter your AIGPT access code to use this plugin')}, {t('Go to the')}{' '}
                        <a
                            target='_blank'
                            href='https://pxgwmbpm3ok.feishu.cn/docx/EXNAdOHN7obRMlx99e1cNB9cnse'
                            rel='noreferrer'
                            style={linkStyle}
                        >
                            {t('AIGPT Service Page')}
                        </a>{' '}
                        {t('to get your AccessCode.')}
                    </div>
                }
            >
                <Input autoFocus type='password' size='compact' onBlur={onBlur} />
            </FormItem>
        </div>
    )
}
