import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Data structure for subscription expiration email
export interface ExpirationEmailData {
  date: Date;
  companies: Array<{
    name: string;
    licences: number;
    puces: number;
  }>;
  totalLicences: number;
  totalPuces: number;
}

/**
 * Generate HTML email template for subscription expiration notifications
 * Styled to match the app's editorial/newspaper aesthetic
 */
export function generateExpirationEmail(data: ExpirationEmailData): string {
  const formattedDate = format(data.date, 'dd MMMM yyyy', { locale: fr });
  const totalCompanies = data.companies.length;

  // Generate table rows for companies
  const companyRows = data.companies.map(company => `
    <tr style="border-bottom: 1px solid #E5E1DB;">
      <td style="padding: 16px 12px; font-family: 'Crimson Pro', Georgia, serif; font-size: 16px; color: #1A1816;">
        ${company.name}
      </td>
      <td style="padding: 16px 12px; text-align: center; font-family: 'IBM Plex Mono', monospace; font-size: 15px; color: #E8765E; font-weight: 600;">
        ${company.licences > 0 ? company.licences : '-'}
      </td>
      <td style="padding: 16px 12px; text-align: center; font-family: 'IBM Plex Mono', monospace; font-size: 15px; color: #2D5A4F; font-weight: 600;">
        ${company.puces > 0 ? company.puces : '-'}
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Abonnements expirant aujourd'hui</title>
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #FAF8F5;">

  <!-- Email Container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 680px; margin: 0 auto;">

    <!-- Header with gradient -->
    <tr>
      <td style="background: linear-gradient(135deg, #E8765E 0%, #2D5A4F 100%); padding: 40px 32px; text-align: center;">
        <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
            <path d="M2 17L12 22L22 17"/>
            <path d="M2 12L12 17L22 12"/>
          </svg>
        </div>
        <h1 style="margin: 0; font-family: 'Crimson Pro', Georgia, serif; font-size: 36px; font-weight: 700; color: white; letter-spacing: -0.5px;">
          SubTrack
        </h1>
        <p style="margin: 8px 0 0 0; font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: rgba(255,255,255,0.85); text-transform: uppercase; letter-spacing: 2px;">
          Gestion d'abonnements
        </p>
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="background-color: white; padding: 40px 32px;">

        <!-- Alert Banner -->
        <div style="background: linear-gradient(135deg, #FFF5F2 0%, #F0F9F7 100%); border-left: 4px solid #E8765E; padding: 20px 24px; border-radius: 8px; margin-bottom: 32px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 24px;">⚠️</div>
            <div>
              <h2 style="margin: 0 0 4px 0; font-family: 'Crimson Pro', Georgia, serif; font-size: 22px; font-weight: 700; color: #1A1816;">
                Abonnements expirant aujourd'hui
              </h2>
              <p style="margin: 0; font-size: 14px; color: #7A756F;">
                ${formattedDate} • ${totalCompanies} entreprise${totalCompanies > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <!-- Introduction Text -->
        <p style="font-size: 16px; line-height: 1.6; color: #4A4642; margin: 0 0 24px 0;">
          Les abonnements suivants <strong>expirent aujourd'hui</strong>. Veuillez prendre les mesures nécessaires pour leur renouvellement.
        </p>

        <!-- Companies Table -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: white; border: 1px solid #E5E1DB; border-radius: 12px; overflow: hidden; margin-bottom: 32px;">

          <!-- Table Header -->
          <thead>
            <tr style="background: linear-gradient(to right, #FAF8F5, #F5F3EF);">
              <th style="padding: 16px 12px; text-align: left; font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600; color: #7A756F; text-transform: uppercase; letter-spacing: 1px;">
                Entreprise
              </th>
              <th style="padding: 16px 12px; text-align: center; font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600; color: #7A756F; text-transform: uppercase; letter-spacing: 1px;">
                Licences
              </th>
              <th style="padding: 16px 12px; text-align: center; font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600; color: #7A756F; text-transform: uppercase; letter-spacing: 1px;">
                Puces
              </th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody>
            ${companyRows}
          </tbody>

          <!-- Table Footer with Totals -->
          <tfoot>
            <tr style="background: linear-gradient(135deg, #FFF5F2 0%, #F0F9F7 100%); border-top: 2px solid #E8765E;">
              <td style="padding: 20px 12px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; font-weight: 600; color: #1A1816; text-transform: uppercase; letter-spacing: 1px;">
                TOTAL
              </td>
              <td style="padding: 20px 12px; text-align: center; font-family: 'IBM Plex Mono', monospace; font-size: 20px; color: #E8765E; font-weight: 700;">
                ${data.totalLicences}
              </td>
              <td style="padding: 20px 12px; text-align: center; font-family: 'IBM Plex Mono', monospace; font-size: 20px; color: #2D5A4F; font-weight: 700;">
                ${data.totalPuces}
              </td>
            </tr>
          </tfoot>
        </table>

        <!-- Call to Action -->
        <div style="background: #FAF8F5; border: 1px solid #E5E1DB; border-radius: 12px; padding: 24px; text-align: center;">
          <p style="margin: 0 0 16px 0; font-size: 15px; color: #4A4642;">
            Consultez le système pour plus de détails et gérer les renouvellements
          </p>
          <a href="${process.env.APP_URL || 'http://localhost:3000'}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #E8765E 0%, #2D5A4F 100%); color: white; text-decoration: none; border-radius: 8px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
            Ouvrir SubTrack
          </a>
        </div>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #0F1419; padding: 32px; text-align: center;">
        <p style="margin: 0 0 8px 0; font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 2px;">
          SubTrack • Gestion d'abonnements
        </p>
        <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.4);">
          Notification automatique générée le ${formattedDate}
        </p>
      </td>
    </tr>

  </table>

</body>
</html>
  `;
}

/**
 * Generate a simple text version for clients that don't support HTML
 */
export function generateExpirationTextEmail(data: ExpirationEmailData): string {
  const formattedDate = format(data.date, 'dd MMMM yyyy', { locale: fr });

  let text = `SubTrack - Abonnements expirant aujourd'hui\n`;
  text += `Date: ${formattedDate}\n\n`;
  text += `Les abonnements suivants expirent aujourd'hui:\n\n`;

  data.companies.forEach((company, index) => {
    text += `${index + 1}. ${company.name}\n`;
    text += `   Licences: ${company.licences}\n`;
    text += `   Puces: ${company.puces}\n\n`;
  });

  text += `TOTAUX:\n`;
  text += `Total Licences: ${data.totalLicences}\n`;
  text += `Total Puces: ${data.totalPuces}\n\n`;
  text += `Consultez SubTrack pour plus de détails: ${process.env.APP_URL || 'http://localhost:3000'}\n`;

  return text;
}
