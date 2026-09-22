export function Insights() {
  const message = 'Business momentum is positive. Sales are up 12.4% versus last week and inventory movement is healthy.';
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Insights</p>
          <h3>AI summary</h3>
        </div>
      </div>
      <p>{message}</p>
      <div className="summary-grid">
        {[
          ['Revenue', 'KES 1.24M'],
          ['Margin', '31.2%'],
          ['Repeat buyers', '64%'],
        ].map(([label, value]) => (
          <div key={label} className="summary-card">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
