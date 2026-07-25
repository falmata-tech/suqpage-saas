export function isStrongPassword(value: string) {
  return value.length >= 12 && value.length <= 128 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value);
}
