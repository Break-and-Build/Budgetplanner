import { Input } from "./ui/input";

interface CurrencyInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}

export function CurrencyInput({
  id,
  value,
  onChange,
  placeholder = "0",
  className,
}: CurrencyInputProps) {
  const formatNumber = (num: number): string => {
    if (!num) return "";
    return num.toLocaleString();
  };

  const parseNumber = (str: string): number => {
    const cleaned = str.replace(/,/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseNumber(e.target.value);
    onChange(parsed);
  };

  return (
    <Input
      id={id}
      type="text"
      placeholder={placeholder}
      value={formatNumber(value)}
      onChange={handleChange}
      className={className}
    />
  );
}
