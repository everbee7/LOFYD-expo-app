export function formatVerificationCount(count: number): string {
  if (count < 1000) {
    return count.toString();
  }
  if (count < 10000) {
    return (Math.floor(count / 100) / 10).toFixed(1) + 'k';
  }
  return Math.floor(count / 1000) + 'k';
}
