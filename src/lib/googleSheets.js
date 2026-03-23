import { SignJWT, importPKCS8 } from 'jose';

const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
const CLIENT_EMAIL = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = import.meta.env.VITE_GOOGLE_PRIVATE_KEY;

async function getAccessToken() {
  const iat = Math.floor(Date.now() / 1000);
  const key = await importPKCS8(PRIVATE_KEY.replace(/\\n/g, '\n'), 'RS256');

  const jwt = await new SignJWT({ 'scope': 'https://www.googleapis.com/auth/spreadsheets' })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(CLIENT_EMAIL)
    .setAudience('https://oauth2.googleapis.com/token')
    .setExpirationTime(iat + 3600)
    .setIssuedAt(iat)
    .sign(key);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

export const gSheets = {
  async get(range) {
    const token = await getAccessToken();
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return await response.json();
  },

  async append(range, values) {
    const token = await getAccessToken();
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [values] })
      }
    );
    return await response.json();
  },

  async update(range, values) {
    const token = await getAccessToken();
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [values] })
      }
    );
    return await response.json();
  },

  async clear(range) {
    const token = await getAccessToken();
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:clear`,
      { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }
    );
  }
};