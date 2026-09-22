export function Chat() {
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Operations</p>
          <h3>Team chat</h3>
        </div>
      </div>
      <div className="stack-list">
        {['Alice: Stock count uploaded.', 'John: New supplier rates approved.', 'Peter: Delivery confirmed for branch 2.'].map((message) => (
          <div key={message} className="stack-row">
            <div>
              <strong>Team update</strong>
              <span>{message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
