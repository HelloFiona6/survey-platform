import React, {useState} from 'react';

export default function ConsentPage({onConsent}) {
  const [checked, setChecked] = useState(false);

  // You can fetch consent text from backend if needed
  const consentText = `
    Welcome to the study! This is a presentation of our website.
    
    No data will be recorded for this. You may withdraw at any time.
    
    By checking the box below, you agree to participate.
  `;

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div className="App"
           style={{minWidth: 220, boxShadow: '0 2px 12px #0001', padding: 32, borderRadius: 12, background: '#fff'}}>
        <h2>Consent Form</h2>
        <p style={{textAlign: 'left', whiteSpace: 'pre-line'}}>{consentText}</p>
        <label>
          <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)}/>
          I agree
        </label>
        <button disabled={!checked} onClick={onConsent} style={{marginLeft: 16}}>Continue</button>
      </div>
    </div>
  );
}
