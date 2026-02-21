import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { US_STATES } from "../../../shared/states";

interface StatePickerProps {
  value?: string;
  onChange: (stateCode: string) => void;
  placeholder?: string;
  className?: string;
}

export default function StatePicker({ value, onChange, placeholder = "Select your state", className }: StatePickerProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {US_STATES.map((state) => (
          <SelectItem key={state.code} value={state.code}>
            {state.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
