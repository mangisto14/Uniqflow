import type { PointField } from '../../types'

interface FieldRendererProps {
  field: PointField
  value: unknown
  hint?: string
  onChange: (name: string, value: unknown) => void
}

export function FieldRenderer({ field, value, hint, onChange }: FieldRendererProps) {
  const baseInput = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {field.field_type === 'text' && (
        <input
          type="text"
          className={baseInput}
          value={(value as string) ?? ''}
          placeholder={field.placeholder ?? ''}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      )}

      {field.field_type === 'number' && (
        <input
          type="number"
          className={baseInput}
          value={(value as number) ?? ''}
          placeholder={field.placeholder ?? ''}
          onChange={(e) => onChange(field.name, e.target.valueAsNumber)}
        />
      )}

      {field.field_type === 'date' && (
        <input
          type="date"
          className={baseInput}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      )}

      {field.field_type === 'textarea' && (
        <textarea
          className={`${baseInput} resize-none`}
          rows={3}
          value={(value as string) ?? ''}
          placeholder={field.placeholder ?? ''}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      )}

      {field.field_type === 'select' && field.options && (
        <select
          className={baseInput}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(field.name, e.target.value)}
        >
          <option value="">— select —</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {field.field_type === 'checkbox' && (
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={Boolean(value)}
            onChange={(e) => onChange(field.name, e.target.checked)}
          />
          <span className="text-sm text-gray-700">{field.label}</span>
        </label>
      )}

      {hint && <p className="text-xs text-blue-600">💡 {hint}</p>}
    </div>
  )
}
