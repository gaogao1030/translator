import React from 'react'
import { FieldProps } from 'rc-field-form/lib/Field'
import { Field } from 'rc-field-form'
import styles from './index.module.css'

import { v4 as uuidv4 } from 'uuid'

export interface IFormItemProps extends FieldProps {
    label?: React.ReactNode
    required?: boolean
    style?: React.CSSProperties
}

export const FormItem = ({ label: label_, required, style, children, ...restProps }: IFormItemProps) => {
    let label = label_
    if (required) {
        label = <span>{label} *</span>
    }
    const id = uuidv4().replace(/-/g, '').slice(0, 4)
    return (
        <div className={styles.formItem} style={style} {...restProps}>
            <Field key={id} {...restProps}>
                {(control, meta, form) => (
                    <React.Fragment>
                        {typeof children === 'function'
                            ? children(control, meta, form)
                            : React.cloneElement(children as React.ReactElement, {
                                  label,
                                  errorMessage: meta.errors.join(';'),
                                  ...control,
                              })}
                    </React.Fragment>
                )}
            </Field>
        </div>
    )
}
