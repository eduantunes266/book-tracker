import type { InputHTMLAttributes } from 'react'
import { inputClass, labelClass } from './formStyles'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
}

// Label + input with the app's form styles.
// Any normal <input> prop (type, value, onChange, required...) can be passed.
export default function FormField({ id, label, ...inputProps }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input id={id} {...inputProps} className={inputClass} />
    </div>
  )
}
