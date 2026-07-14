import type { ReactNode, SelectHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

type CommonProps = {
  label: string
  name: string
  required?: boolean
  className?: string
  children?: ReactNode
}

type InputFieldProps = CommonProps & {
  type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'file'
  textarea?: false
  select?: false
  options?: never
  defaultValue?: InputHTMLAttributes<HTMLInputElement>['defaultValue']
  value?: InputHTMLAttributes<HTMLInputElement>['value']
  onChange?: InputHTMLAttributes<HTMLInputElement>['onChange']
  placeholder?: string
  rows?: never
  accept?: string
}

type TextareaFieldProps = CommonProps & {
  textarea: true
  select?: false
  type?: never
  options?: never
  defaultValue?: TextareaHTMLAttributes<HTMLTextAreaElement>['defaultValue']
  value?: TextareaHTMLAttributes<HTMLTextAreaElement>['value']
  onChange?: TextareaHTMLAttributes<HTMLTextAreaElement>['onChange']
  placeholder?: string
  rows?: number
}

type SelectFieldProps = CommonProps & {
  select: true
  textarea?: false
  type?: never
  options: { value: string; label: string }[]
  defaultValue?: SelectHTMLAttributes<HTMLSelectElement>['defaultValue']
  value?: SelectHTMLAttributes<HTMLSelectElement>['value']
  onChange?: SelectHTMLAttributes<HTMLSelectElement>['onChange']
}

type FormFieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps

const inputClass =
  'min-h-11 w-full bg-white/5 border border-borderDark text-white px-3 py-2 text-[16px] sm:text-[13px] focus:border-white focus:outline-none'

export default function FormField(props: FormFieldProps) {
  const { label, name, required, className = '' } = props

  return (
    <div className={className}>
      <label className="block text-[12px] text-secondary uppercase mb-1">
        {label}
      </label>
      {'select' in props && props.select ? (
        <select
          name={name}
          required={required}
          defaultValue={props.defaultValue}
          value={props.value}
          onChange={props.onChange}
          className={inputClass}
        >
          {props.options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-dark">
              {opt.label}
            </option>
          ))}
        </select>
      ) : 'textarea' in props && props.textarea ? (
        <textarea
          name={name}
          required={required}
          defaultValue={props.defaultValue}
          value={props.value}
          onChange={props.onChange}
          placeholder={props.placeholder}
          rows={props.rows || 3}
          className={inputClass}
        />
      ) : (
        <input
          type={props.type || 'text'}
          name={name}
          required={required}
          defaultValue={props.defaultValue}
          value={props.value}
          onChange={props.onChange}
          placeholder={props.placeholder}
          accept={props.accept}
          className={inputClass}
        />
      )}
      {props.children}
    </div>
  )
}
