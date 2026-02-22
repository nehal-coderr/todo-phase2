"use client";

interface TextInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
  type?: "text" | "email" | "password";
  id?: string;
}

export function TextInput({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  maxLength,
  required = false,
  disabled = false,
  type = "text",
  id,
}: TextInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
  const nearLimit = maxLength && value.length >= maxLength * 0.9;

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-danger-500">*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
        className={`w-full rounded-md border px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 ${
          error
            ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500"
            : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
        }`}
      />
      <div className="flex justify-between">
        <div>
          {error && <p className="text-xs text-danger-500">{error}</p>}
        </div>
        {maxLength && (
          <p className={`text-xs ${nearLimit ? "text-danger-500" : "text-gray-400"}`}>
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
