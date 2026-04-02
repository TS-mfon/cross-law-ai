const JURISDICTIONS = [
  "United States (Common Law)",
  "United Kingdom",
  "European Union (Civil Law)",
  "Nigeria",
  "Singapore",
  "UAE (DIFC)",
  "India",
  "China",
  "Brazil",
  "Switzerland",
  "Cayman Islands",
  "BVI",
];

interface Props {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}

export function JurisdictionSelector({ value, onChange, label }: Props) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium">{label}</label>}
      <select
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select jurisdiction...</option>
        {JURISDICTIONS.map((j) => (
          <option key={j} value={j}>{j}</option>
        ))}
      </select>
    </div>
  );
}
