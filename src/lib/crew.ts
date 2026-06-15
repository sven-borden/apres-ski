/** Participant shape + avatar initials. Live data comes from PocketBase. */

export type Participant = {
  id: string;
  name: string;
  color: string;
};

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase();
}
