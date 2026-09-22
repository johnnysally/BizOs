export function Register() {
  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <h2>Create business</h2>
        <div className="auth-form">
          <label className="field"><span>Business name</span><input defaultValue="Mwangi Electrical Supplies" /></label>
          <label className="field"><span>Email</span><input defaultValue="hello@bizos.co.ke" /></label>
        </div>
        <button className="primary-button large" type="button">Create account</button>
      </div>
    </div>
  );
}
