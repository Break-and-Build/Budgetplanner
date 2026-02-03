import { useState } from "react";
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
  const [displayValue, setDisplayValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const formatNumber = (num: number): string => {
    if (!num && num !== 0) return "";
    // Handle decimal values properly
    const numStr = num.toString();
    const parts = numStr.split(".");
    // Format the integer part with commas
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    // Join back with decimal part if it exists
    return parts.join(".");
  };

  const parseNumber = (str: string): number => {
    // Remove commas but keep decimal point
    const cleaned = str.replace(/,/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Allow empty, numbers, commas, and one decimal point
    if (input === "" || /^[\d,]*\.?\d*$/.test(input)) {
      setDisplayValue(input);
      
      // Parse and update the actual value
      const parsed = parseNumber(input);
      onChange(parsed);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Set display value to current formatted value when focusing
    setDisplayValue(value ? formatNumber(value) : "");
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format the display value when losing focus
    if (displayValue) {
      const parsed = parseNumber(displayValue);
      setDisplayValue(formatNumber(parsed));
    }
  };

  // Use displayValue when focused, formatted value when not
  const inputValue = isFocused ? displayValue : (value ? formatNumber(value) : "");

  return (
    <Input
      id={id}
      type="text"
      placeholder={placeholder}
      value={inputValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className}
    />
  );
}