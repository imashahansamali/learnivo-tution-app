const classColors = [
  "#D5E8E6",
  "#E9DFF7",
  "#FCE8D5",
  "#DDEAFB",
  "#F7DFE7",
] as const;

export function getClassColor(classId?: string): string | undefined {
  if (!classId) return undefined;

  let hash = 0;
  for (const character of classId) {
    hash = (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0;
  }
  return classColors[hash % classColors.length];
}