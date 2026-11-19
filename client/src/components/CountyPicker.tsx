import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SERVICE_REGION_NAME, SOCAL_COUNTIES } from "@shared/region";

const ALL = "all";

interface CountyPickerProps {
  value?: string;
  onChange: (countySlug: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

export default function CountyPicker({ value, onChange, placeholder = `All of ${SERVICE_REGION_NAME}`, className }: CountyPickerProps) {
  return (
    <Select value={value ?? ALL} onValueChange={(v) => onChange(v === ALL ? undefined : v)}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{placeholder}</SelectItem>
        {SOCAL_COUNTIES.map((county) => (
          <SelectItem key={county.slug} value={county.slug}>
            {county.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
