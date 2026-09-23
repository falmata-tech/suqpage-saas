// Display values only: scheduling and form submission keep 24-hour machine values.
export function clockTimeLabel(minutesFromMidnight: number): string {
  const hour = Math.floor(minutesFromMidnight / 60);
  const minute = minutesFromMidnight % 60;
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}

export function clockInputParts(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return { hour: String(hours % 12 || 12), minute: String(minutes).padStart(2, '0'), period: hours < 12 ? 'AM' : 'PM' };
}

export function clockInputValue(hour: string, minute: string, period: string): string {
  return `${String(Number(hour) % 12 + (period === 'PM' ? 12 : 0)).padStart(2, '0')}:${minute}`;
}
