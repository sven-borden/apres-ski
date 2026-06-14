import { initials } from "@/lib/crew";

type AvatarProps = {
  name: string;
  color: string;
  size?: number;
  /** Ring marking the local user ("you"). */
  you?: boolean;
  className?: string;
};

export function Avatar({ name, color, size = 28, you = false, className = "" }: AvatarProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-on-accent ${
        you ? "ring-2 ring-accent ring-offset-2 ring-offset-surface" : ""
      } ${className}`}
      style={{ background: color, width: size, height: size, fontSize: size * 0.4 }}
      title={name}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({
  people,
  max = 4,
  size = 28,
}: {
  people: { name: string; color: string }[];
  max?: number;
  size?: number;
}) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((p, i) => (
        <span
          key={p.name + i}
          className="-ml-1.5 rounded-full ring-2 ring-surface first:ml-0"
          style={{ zIndex: shown.length - i }}
        >
          <Avatar name={p.name} color={p.color} size={size} />
        </span>
      ))}
      {extra > 0 && (
        <span
          className="-ml-1.5 inline-flex items-center justify-center rounded-full bg-surface-2 font-semibold text-ink-muted ring-2 ring-surface"
          style={{ width: size, height: size, fontSize: size * 0.36 }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
