export function Toast({ message }: { message: string }) {
  return <div className="status-badge neutral">{message}</div>;
}
