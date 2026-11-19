export default function CrisisNotice({ extra }: { extra?: React.ReactNode }) {
  return (
    <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-8">
      <p className="text-sm font-semibold text-destructive mb-1">If you are in immediate danger or crisis</p>
      <p className="text-sm text-foreground">
        Call <a href="tel:911" className="font-bold underline">911</a> or the{" "}
        <a href="tel:988" className="font-bold underline">988 Suicide &amp; Crisis Lifeline</a> (call or text 988).{extra}
      </p>
    </div>
  );
}
