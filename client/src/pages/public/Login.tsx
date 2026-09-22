export function Login() {
  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <h2>Welcome back</h2>
        <div className="auth-form">
          <label className="field"><span>Email</span><input defaultValue="john@bizos.co.ke" /></label>
          <label className="field"><span>Password</span><input type="password" defaultValue="password" /></label>
        </div>
        <button className="primary-button large" type="button">Sign in</button>
      </div>
    </div>
  );
}
