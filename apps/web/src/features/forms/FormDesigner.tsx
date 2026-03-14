import { useState } from 'react';

type FieldType = 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea' | 'checkbox';

interface Field {
  id: string;
  name: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string;
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'טקסט' },
  { value: 'number', label: 'מספר' },
  { value: 'email', label: 'אימייל' },
  { value: 'date', label: 'תאריך' },
  { value: 'select', label: 'בחירה' },
  { value: 'textarea', label: 'טקסט ארוך' },
  { value: 'checkbox', label: 'תיבת סימון' },
];

interface FormDesignerProps {
  fields: Field[];
  onChange: (fields: Field[]) => void;
}

export function FormDesigner({ fields, onChange }: FormDesignerProps) {
  const [editing, setEditing] = useState<string | null>(null);

  const addField = () => {
    const newField: Field = {
      id: crypto.randomUUID(),
      name: `field_${fields.length + 1}`,
      label: `שדה ${fields.length + 1}`,
      fieldType: 'text',
      required: false,
    };
    onChange([...fields, newField]);
    setEditing(newField.id);
  };

  const updateField = (id: string, patch: Partial<Field>) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const removeField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
    if (editing === id) setEditing(null);
  };

  const moveField = (index: number, dir: -1 | 1) => {
    const newFields = [...fields];
    const target = index + dir;
    if (target < 0 || target >= newFields.length) return;
    [newFields[index], newFields[target]] = [newFields[target], newFields[index]];
    onChange(newFields);
  };

  return (
    <div className="space-y-3" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700 text-sm">שדות הטופס</h3>
        <button onClick={addField} className="btn-primary text-sm">+ הוסף שדה</button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
          אין שדות. לחץ "הוסף שדה" להתחיל.
        </div>
      )}

      {fields.map((field, i) => (
        <div key={field.id} className="border border-gray-200 rounded-lg">
          <div
            className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50"
            onClick={() => setEditing(editing === field.id ? null : field.id)}
          >
            <div className="flex flex-col gap-0.5">
              <button onClick={(e) => { e.stopPropagation(); moveField(i, -1); }} className="text-gray-300 hover:text-gray-500 text-xs leading-none">▲</button>
              <button onClick={(e) => { e.stopPropagation(); moveField(i, 1); }} className="text-gray-300 hover:text-gray-500 text-xs leading-none">▼</button>
            </div>
            <div className="flex-1">
              <span className="font-medium text-sm text-gray-800">{field.label}</span>
              <span className="text-xs text-gray-400 mr-2">{FIELD_TYPES.find((t) => t.value === field.fieldType)?.label}</span>
              {field.required && <span className="text-xs text-red-500">*חובה</span>}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
              className="text-gray-300 hover:text-red-500 text-sm"
            >
              ✕
            </button>
          </div>

          {editing === field.id && (
            <div className="px-3 pb-3 space-y-2 border-t border-gray-100 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">תווית</label>
                  <input
                    className="input text-sm"
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">שם שדה (name)</label>
                  <input
                    className="input text-sm"
                    value={field.name}
                    onChange={(e) => updateField(field.id, { name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">סוג שדה</label>
                  <select
                    className="input text-sm"
                    value={field.fieldType}
                    onChange={(e) => updateField(field.id, { fieldType: e.target.value as FieldType })}
                  >
                    {FIELD_TYPES.map((ft) => (
                      <option key={ft.value} value={ft.value}>{ft.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Placeholder</label>
                  <input
                    className="input text-sm"
                    value={field.placeholder ?? ''}
                    onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                  />
                </div>
              </div>
              {field.fieldType === 'select' && (
                <div>
                  <label className="text-xs text-gray-500">אפשרויות (מופרדות בפסיק)</label>
                  <input
                    className="input text-sm"
                    placeholder="אפשרות א, אפשרות ב, אפשרות ג"
                    value={field.options ?? ''}
                    onChange={(e) => updateField(field.id, { options: e.target.value })}
                  />
                </div>
              )}
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(field.id, { required: e.target.checked })}
                />
                שדה חובה
              </label>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
