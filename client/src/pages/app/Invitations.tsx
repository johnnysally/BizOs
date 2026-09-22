export function Invitations() {
  const invites = [
    { name: 'Mary Muthoni', role: 'Cashier', status: 'Pending' },
    { name: 'Daniel Kibet', role: 'Ops Lead', status: 'Accepted' },
  ];

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Access</p>
          <h3>Invitations</h3>
        </div>
      </div>
      <div className="table-shell">
        <table>
          <thead><tr><th>Name</th><th>Role</th><th>Status</th></tr></thead>
          <tbody>
            {invites.map((invite) => (
              <tr key={invite.name}>
                <td>{invite.name}</td>
                <td>{invite.role}</td>
                <td><span className={`status-badge ${invite.status === 'Accepted' ? 'success' : 'warning'}`}>{invite.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
