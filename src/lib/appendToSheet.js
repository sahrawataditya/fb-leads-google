import { google } from "googleapis";

export async function appendToGoogleSheet({
  name,
  email,
  phone,
  adId,
  formId,
  created_time,
}) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: process.env.ACCOUNT_TYPE,
      project_id: process.env.PROJECT_ID,
      private_key_id: process.env.PRIVATE_KEY_ID,
      private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.CLIENT_EMAIL,
      client_id: process.env.CLIENT_ID,
      auth_uri: process.env.AUTH_URI,
      token_url: process.env.TOKEN_URI,
      auth_provider_x509_cert_url: process.env.AUTH_PROVIDER,
      client_x509_cert_url: process.env.CLIENT_X509,
      universe_domain: process.env.UNIVERSE_DOMAIN,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: "Sheet1!A:F",
    valueInputOption: "RAW",
    requestBody: {
      values: [[name, email, phone, adId, formId, created_time]],
    },
  });
}
