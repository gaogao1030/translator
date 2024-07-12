import { Checkbox } from 'baseui/checkbox'

interface RunAtStartupCheckboxProps {
    value?: boolean
    onChange?: (value: boolean) => void
    onBlur?: () => void
}

interface MyCheckboxProps {
    value?: boolean
    onChange?: (value: boolean) => void
    onBlur?: () => void
}

interface AlwaysShowIconsCheckboxProps {
    value?: boolean
    onChange?: (value: boolean) => void
    onBlur?: () => void
}

interface AutoTranslateCheckboxProps {
    value?: boolean
    onChange?: (value: boolean) => void
    onBlur?: () => void
}

interface SelectInputElementsProps {
    value?: boolean
    onChange?: (value: boolean) => void
    onBlur?: () => void
}

interface RestorePreviousPositionCheckboxProps {
    value?: boolean
    onChange?: (value: boolean) => void
    onBlur?: () => void
}

export function AlwaysShowIconsCheckbox({ value, onChange, onBlur }: AlwaysShowIconsCheckboxProps) {
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

export function AutoTranslateCheckbox({ value, onChange, onBlur }: AutoTranslateCheckboxProps) {
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

export function SelectInputElementsCheckbox({ value, onChange, onBlur }: SelectInputElementsProps) {
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

export function MyCheckbox({ value, onChange, onBlur }: MyCheckboxProps) {
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

export function RestorePreviousPositionCheckbox({ value, onChange, onBlur }: RestorePreviousPositionCheckboxProps) {
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

export function RunAtStartupCheckbox({ value, onChange, onBlur }: RunAtStartupCheckboxProps) {
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
