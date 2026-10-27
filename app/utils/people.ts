/** “Ama Mensah” → “AM” */
export function initials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
