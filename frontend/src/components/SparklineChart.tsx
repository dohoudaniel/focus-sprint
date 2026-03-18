interface Props {
  data: { day: string; minutes: number }[];
}

export default function SparklineChart({ data }: Props) {
  const max = Math.max(...data.map((d) => d.minutes), 1);
  const barHeight = 80;

  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d) => (
        <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-sm bg-primary/80 transition-all duration-300 min-h-[2px]"
            style={{ height: `${(d.minutes / max) * barHeight}px` }}
          />
          <span className="text-[10px] text-muted-foreground">{d.day}</span>
        </div>
      ))}
    </div>
  );
}
