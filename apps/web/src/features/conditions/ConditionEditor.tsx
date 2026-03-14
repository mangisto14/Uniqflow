export type Operator =
  | 'equals' | 'not_equals'
  | 'gt' | 'lt' | 'gte' | 'lte'
  | 'contains' | 'not_contains'
  | 'starts_with' | 'ends_with'
  | 'in' | 'not_in'
  | 'is_empty' | 'is_not_empty';

export type LogicOperator = 'AND' | 'OR';

export interface IConditionRule {
  id: string;
  field: string;
  operator: Operator;
  value: string;
}

export interface IConditionGroup {
  id: string;
  logic: LogicOperator;
  rules: (IConditionRule | IConditionGroup)[];
}

const OPERATORS: { value: Operator; label: string; noValue?: boolean }[] = [
  { value: 'equals', label: 'שווה ל' },
  { value: 'not_equals', label: 'לא שווה ל' },
  { value: 'gt', label: 'גדול מ' },
  { value: 'lt', label: 'קטן מ' },
  { value: 'gte', label: 'גדול או שווה' },
  { value: 'lte', label: 'קטן או שווה' },
  { value: 'contains', label: 'מכיל' },
  { value: 'not_contains', label: 'לא מכיל' },
  { value: 'starts_with', label: 'מתחיל ב' },
  { value: 'ends_with', label: 'מסתיים ב' },
  { value: 'in', label: 'אחד מ (מופרד בפסיק)' },
  { value: 'not_in', label: 'לא אחד מ' },
  { value: 'is_empty', label: 'ריק', noValue: true },
  { value: 'is_not_empty', label: 'לא ריק', noValue: true },
];

function isGroup(r: IConditionRule | IConditionGroup): r is IConditionGroup {
  return 'rules' in r;
}

function newRule(): IConditionRule {
  return { id: crypto.randomUUID(), field: '', operator: 'equals', value: '' };
}

function newGroup(): IConditionGroup {
  return { id: crypto.randomUUID(), logic: 'AND', rules: [newRule()] };
}

interface RuleRowProps {
  rule: IConditionRule;
  availableFields: string[];
  onUpdate: (patch: Partial<IConditionRule>) => void;
  onRemove: () => void;
}

function RuleRow({ rule, availableFields, onUpdate, onRemove }: RuleRowProps) {
  const opInfo = OPERATORS.find((o) => o.value === rule.operator);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        className="input text-sm flex-1 min-w-0"
        value={rule.field}
        onChange={(e) => onUpdate({ field: e.target.value })}
      >
        <option value="">בחר שדה...</option>
        {availableFields.map((f) => <option key={f} value={f}>{f}</option>)}
      </select>
      <select
        className="input text-sm w-36"
        value={rule.operator}
        onChange={(e) => onUpdate({ operator: e.target.value as Operator })}
      >
        {OPERATORS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {!opInfo?.noValue && (
        <input
          className="input text-sm w-32"
          placeholder="ערך"
          value={rule.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
        />
      )}
      <button onClick={onRemove} className="text-gray-300 hover:text-red-500 text-sm flex-shrink-0">✕</button>
    </div>
  );
}

interface GroupEditorProps {
  group: IConditionGroup;
  availableFields: string[];
  onChange: (g: IConditionGroup) => void;
  depth?: number;
}

function GroupEditor({ group, availableFields, onChange, depth = 0 }: GroupEditorProps) {
  const updateRule = (idx: number, patch: Partial<IConditionRule>) => {
    const rules = [...group.rules];
    rules[idx] = { ...(rules[idx] as IConditionRule), ...patch };
    onChange({ ...group, rules });
  };

  const updateSubGroup = (idx: number, g: IConditionGroup) => {
    const rules = [...group.rules];
    rules[idx] = g;
    onChange({ ...group, rules });
  };

  const removeRule = (idx: number) => {
    onChange({ ...group, rules: group.rules.filter((_, i) => i !== idx) });
  };

  const addRule = () => onChange({ ...group, rules: [...group.rules, newRule()] });
  const addGroup = () => onChange({ ...group, rules: [...group.rules, newGroup()] });

  return (
    <div className={`space-y-2 ${depth > 0 ? 'border-r-2 border-blue-200 pr-3 mr-1' : ''}`}>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">לוגיקה:</span>
        <button
          onClick={() => onChange({ ...group, logic: 'AND' })}
          className={`text-xs px-2 py-0.5 rounded ${group.logic === 'AND' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          AND (וגם)
        </button>
        <button
          onClick={() => onChange({ ...group, logic: 'OR' })}
          className={`text-xs px-2 py-0.5 rounded ${group.logic === 'OR' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          OR (או)
        </button>
      </div>

      {group.rules.map((rule, idx) => (
        <div key={rule.id}>
          {isGroup(rule) ? (
            <GroupEditor
              group={rule}
              availableFields={availableFields}
              onChange={(g) => updateSubGroup(idx, g)}
              depth={depth + 1}
            />
          ) : (
            <RuleRow
              rule={rule}
              availableFields={availableFields}
              onUpdate={(patch) => updateRule(idx, patch)}
              onRemove={() => removeRule(idx)}
            />
          )}
        </div>
      ))}

      <div className="flex gap-2">
        <button onClick={addRule} className="text-xs text-blue-600 hover:underline">+ הוסף חוק</button>
        {depth < 2 && (
          <button onClick={addGroup} className="text-xs text-purple-600 hover:underline">+ הוסף קבוצה</button>
        )}
      </div>
    </div>
  );
}

interface ConditionEditorProps {
  condition: IConditionGroup;
  availableFields: string[];
  onChange: (c: IConditionGroup) => void;
}

export function ConditionEditor({ condition, availableFields, onChange }: ConditionEditorProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-3" dir="rtl">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">עורך תנאים</h4>
      <GroupEditor group={condition} availableFields={availableFields} onChange={onChange} />
    </div>
  );
}

export function createEmptyCondition(): IConditionGroup {
  return newGroup();
}
