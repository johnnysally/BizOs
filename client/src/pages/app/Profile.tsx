import { useState } from 'react';

type ProfileTab = 'personal' | 'security' | 'preferences' | 'access';

const tabs: Array<{ id: ProfileTab; label: string; description: string }> = [
  { id: 'personal', label: 'Personal details', description: 'Identity and contact information' },
  { id: 'security', label: 'Security', description: 'Password and sign-in protection' },
  { id: 'preferences', label: 'Preferences', description: 'Notifications and workspace habits' },
  { id: 'access', label: 'Access & activity', description: 'Branches, sessions, and history' },
];

export function Profile() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [fullName, setFullName] = useState('John Mwangi');
  const [email, setEmail] = useState('john@bizos.co.ke');
  const [phone, setPhone] = useState('+254 712 000 111');
  const [timezone, setTimezone] = useState('Africa/Nairobi');
  const [language, setLanguage] = useState('English');
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [preferences, setPreferences] = useState({ email: true, push: true, weekly: true, sounds: true, compact: false });
  const [branches, setBranches] = useState({ main: true, industrial: true });

  const saveProfile = () => { setSaved(true); window.setTimeout(() => setSaved(false), 2400); };
  const togglePreference = (key: keyof typeof preferences) => setPreferences((current) => ({ ...current, [key]: !current[key] }));

  return (
    <div className="profile-workspace">
      <div className="profile-hero panel">
        <div className="profile-identity"><div className="profile-avatar">JM<button type="button" aria-label="Change profile photo">+</button></div><div><p className="eyebrow">Account</p><h3>{fullName}</h3><p>Owner · Mwangi Electrical Supplies</p><div className="chip-row"><span className="status-badge success">Verified account</span><span className="status-badge neutral">Active today</span></div></div></div>
        <div className="profile-hero-actions">{saved && <span className="save-confirmation">Changes saved</span>}<button className="primary-button small" type="button" onClick={saveProfile}>Save changes</button></div>
      </div>
      <div className="profile-stats"><div className="stat-card compact"><div className="stat-header"><span>Business role</span></div><div className="stat-value">Owner</div><div className="stat-footer">Full administration</div></div><div className="stat-card compact"><div className="stat-header"><span>Branch access</span></div><div className="stat-value">2</div><div className="stat-footer">Active locations</div></div><div className="stat-card compact"><div className="stat-header"><span>Member since</span></div><div className="stat-value">2024</div><div className="stat-footer">Trusted account</div></div><div className="stat-card compact"><div className="stat-header"><span>Last sign-in</span></div><div className="stat-value">Today</div><div className="stat-footer">09:14 · Nairobi</div></div></div>

      <div className="profile-layout"><aside className="profile-navigation panel"><p className="settings-nav-label">Account settings</p>{tabs.map((tab) => <button key={tab.id} className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`} type="button" onClick={() => setActiveTab(tab.id)}><strong>{tab.label}</strong><small>{tab.description}</small></button>)}</aside><section className="profile-content panel">
        {activeTab === 'personal' && <><div className="settings-section-header"><div><p className="eyebrow">Personal details</p><h3>Your identity</h3><p>Keep your contact details current for receipts, alerts, and account recovery.</p></div></div><div className="settings-form-grid"><label className="field"><span>Full name</span><input value={fullName} onChange={(event) => setFullName(event.target.value)} /></label><label className="field"><span>Email address</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label className="field"><span>Phone number</span><input value={phone} onChange={(event) => setPhone(event.target.value)} /></label><label className="field"><span>Role</span><input value="Owner" readOnly /></label><label className="field"><span>Timezone</span><select value={timezone} onChange={(event) => setTimezone(event.target.value)}><option>Africa/Nairobi</option><option>Africa/Accra</option><option>Europe/London</option></select></label><label className="field"><span>Language</span><select value={language} onChange={(event) => setLanguage(event.target.value)}><option>English</option><option>Swahili</option></select></label></div><div className="profile-note"><strong>Verification status</strong><span>Your email and phone number are verified and can be used for account recovery.</span></div></>}

        {activeTab === 'security' && <><div className="settings-section-header"><div><p className="eyebrow">Security</p><h3>Protect your account</h3><p>Manage your password, authentication methods, and recent sign-ins.</p></div><span className="status-badge success">Security healthy</span></div><div className="settings-form-grid"><label className="field"><span>Current password</span><input type={showPassword ? 'text' : 'password'} defaultValue="password" /></label><label className="field"><span>New password</span><input type={showPassword ? 'text' : 'password'} placeholder="Create a new password" /></label></div><label className="check-setting"><input type="checkbox" checked={showPassword} onChange={() => setShowPassword((current) => !current)} /><span>Show password fields</span></label><div className="profile-action-list"><div><strong>Two-factor authentication</strong><span>Not enabled · add an extra sign-in verification step</span></div><button className="secondary-button small" type="button">Enable 2FA</button></div><div className="profile-action-list"><div><strong>Recovery codes</strong><span>Generate new codes if you lose access to your authenticator.</span></div><button className="ghost-button small" type="button">Generate codes</button></div></>}

        {activeTab === 'preferences' && <><div className="settings-section-header"><div><p className="eyebrow">Preferences</p><h3>Your workspace habits</h3><p>Choose how BizOs communicates with you and how the interface behaves.</p></div></div><div className="settings-toggle-list"><ProfileToggle label="Email notifications" description="Receive critical business alerts by email." checked={preferences.email} onChange={() => togglePreference('email')} /><ProfileToggle label="In-app notifications" description="Show operational updates in the Alerts center." checked={preferences.push} onChange={() => togglePreference('push')} /><ProfileToggle label="Weekly performance digest" description="Receive a summary of revenue, profit, and stock health." checked={preferences.weekly} onChange={() => togglePreference('weekly')} /><ProfileToggle label="POS sounds" description="Play feedback sounds when working at the register." checked={preferences.sounds} onChange={() => togglePreference('sounds')} /><ProfileToggle label="Compact tables" description="Fit more records into dense operational tables." checked={preferences.compact} onChange={() => togglePreference('compact')} /></div></>}

        {activeTab === 'access' && <><div className="settings-section-header"><div><p className="eyebrow">Access & activity</p><h3>Where you work</h3><p>Review branch access and sign-in activity associated with your account.</p></div></div><div className="branch-access-list"><ProfileToggle label="Main Branch" description="Nairobi · Full owner access" checked={branches.main} onChange={() => setBranches((current) => ({ ...current, main: !current.main }))} /><ProfileToggle label="Industrial Area" description="Nairobi · Full owner access" checked={branches.industrial} onChange={() => setBranches((current) => ({ ...current, industrial: !current.industrial }))} /></div><div className="activity-list"><div><span className="activity-dot success" /><div><strong>Current session</strong><span>Windows · Chrome · Nairobi, Kenya</span></div><b>Now</b></div><div><span className="activity-dot" /><div><strong>Mobile session</strong><span>Android · Nairobi, Kenya</span></div><b>Yesterday</b></div><div><span className="activity-dot" /><div><strong>Password changed</strong><span>Account security settings</span></div><b>12 days ago</b></div></div><button className="danger-button small" type="button">Sign out other sessions</button></>}
      </section></div>
    </div>
  );
}

function ProfileToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return <label className="setting-toggle"><span><strong>{label}</strong><small>{description}</small></span><input type="checkbox" checked={checked} onChange={onChange} /><i /></label>;
}
