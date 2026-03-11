export function ThreatBadge({ level }: { level: string }) {
  const getStyle = () => {
    switch (level) {
      case "High":
        return "bg-destructive/20 text-destructive border-destructive/50 glow-destructive";
      case "Medium":
        return "bg-warning/20 text-warning border-warning/50 glow-warning";
      case "Low":
      default:
        return "bg-primary/20 text-primary border-primary/50 glow-primary";
    }
  };

  return (
    <span className={`px-2 py-1 rounded border font-mono text-xs uppercase tracking-wider ${getStyle()}`}>
      {level}
    </span>
  );
}
