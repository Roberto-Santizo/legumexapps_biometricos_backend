import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';

export interface UpdateEmployeeEmailChange {
  field: string;
  previous?: string | null;
  current?: string | null;
}

export interface UpdateEmployeeEmailData {
  pin: string;
  name: string;
  last_name: string;
  department: string;
  department_code?: string;
  changes?: UpdateEmployeeEmailChange[];
  updated_at?: Date;
  updater_name?: string;
  updater_username?: string;
  detail_url?: string;
}

export const UPDATE_EMPLOYEE_SUBJECT = 'Notificación de actualización de empleado';

const TIME_ZONE = 'America/Guatemala';
const MONO = `'Courier New',Courier,monospace`;

const escapeHtml = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const formatDate = (date: Date, pattern: string): string =>
  format(new TZDate(date, TIME_ZONE), pattern);

const row = (label: string, valueHtml: string, last: boolean): string => {
  const border = `border-top:1px solid #e6e6e1;${last ? 'border-bottom:1px solid #e6e6e1;' : ''}`;
  return `
          <tr>
            <td class="lbl mut ln" width="200" style="width:200px;padding:10px 0;${border}color:#5e5f5b;">${label}</td>
            <td class="tx ln" style="padding:10px 0;${border}color:#1d1e1c;">${valueHtml}</td>
          </tr>`;
};

const changeValue = (change: UpdateEmployeeEmailChange): string => {
  const previous = change.previous
    ? escapeHtml(change.previous)
    : '&mdash;';
  const current = change.current
    ? escapeHtml(change.current)
    : '&mdash;';
  return `<span class="mut" style="color:#6b6c68;text-decoration:line-through;">${previous}</span> &nbsp;&rarr;&nbsp; <strong class="tx" style="color:#1d1e1c;">${current}</strong>`;
};

export const updateEmployeeEmail = (
  employee: UpdateEmployeeEmailData,
): string => {
  const fullName = escapeHtml(`${employee.name} ${employee.last_name ?? ''}`.trim());
  const pin = escapeHtml(employee.pin);
  const department = escapeHtml(employee.department);
  const updatedAt = formatDate(employee.updated_at ?? new Date(), 'dd/MM/yyyy HH:mm');
  const changes = employee.changes ?? [];

  const departmentCode = employee.department_code
    ? ` <span style="font-family:${MONO};">(${escapeHtml(employee.department_code)})</span>`
    : '';

  const updater = employee.updater_name
    ? `${escapeHtml(employee.updater_name)}${employee.updater_username
      ? ` <span class="mut" style="color:#6b6c68;font-family:${MONO};font-size:13px;">(${escapeHtml(employee.updater_username)})</span>`
      : ''}`
    : null;

  const changeRows = changes.length
    ? changes
      .map((change, index) => row(escapeHtml(change.field), changeValue(change), index === changes.length - 1))
      .join('')
    : row('Detalle', '<span class="mut" style="color:#6b6c68;">Sin detalle de cambios</span>', true);

  const rows = [
    row('Fecha de actualización', updatedAt, !updater),
    updater ? row('Realizado por', updater, true) : '',
  ].join('');

  const changesSummary = !changes.length
    ? 'Información actualizada'
    : changes.length === 1
      ? '1 campo modificado'
      : `${changes.length} campos modificados`;

  const button = employee.detail_url
    ? `
      <!-- Botón -->
      <tr><td class="px" style="padding:28px 36px 32px 36px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td class="btn" bgcolor="#155dfc" style="background:#155dfc;border-radius:4px;">
            <a href="${escapeHtml(employee.detail_url)}" target="_blank" style="display:block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#f9fbff;text-decoration:none;border-radius:4px;">Ver detalle del empleado &rarr;</a>
          </td>
        </tr></table>
      </td></tr>`
    : `
      <tr><td style="padding:0 0 32px 0;font-size:0;line-height:0;">&nbsp;</td></tr>`;

  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Actualización de empleado – [${pin}] ${fullName} – ${department} – ${updatedAt}</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style>
  @media only screen and (max-width:620px){
    .wrap{width:100% !important}
    .px{padding-left:20px !important;padding-right:20px !important}
    .lbl{width:42% !important}
  }
  @media (prefers-color-scheme:dark){
    .bg{background:#1c1d1f !important}
    .card{background:#26282b !important}
    .tx{color:#e9e9e6 !important}
    .mut{color:#a7a8a4 !important}
    .ln{border-color:#3a3c40 !important}
    .soft{background:#2e3034 !important}
    .btn{background:#155dfc !important}
    .btn a{color:#f9fbff !important}
    .lnk{color:#c9cac6 !important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f2f2ef;" class="bg">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:#f2f2ef;">Se actualizó la información de ${fullName} (${department}) el ${updatedAt}. ${changesSummary}.&#8199;&#847;&#8199;&#847;&#8199;&#847;</span>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f2f2ef;" class="bg">
<tr><td align="center" style="padding:32px 12px;">

<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

  <!-- Encabezado -->
  <tr><td class="px" style="padding:0 4px 14px 4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;color:#6b6c68;letter-spacing:0.4px;">
    <span class="mut">NOTIFICACIÓN AUTOMÁTICA · SISTEMA BIOMÉTRICO</span>
  </td></tr>

  <tr><td class="card" style="background:#fbfbf9;border:1px solid #e1e1dc;border-radius:6px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

      <!-- Franja de estado -->
      <tr><td height="4" style="height:4px;line-height:4px;font-size:0;background:#155dfc;border-radius:6px 6px 0 0;">&nbsp;</td></tr>

      <!-- Título + identificación -->
      <tr><td class="px" style="padding:28px 36px 8px 36px;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="background:#eaf1ff;border-radius:3px;padding:4px 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;font-weight:bold;color:#155dfc;letter-spacing:0.6px;">ACTUALIZACIÓN DE EMPLEADO</td>
        </tr></table>
        <p class="tx" style="margin:16px 0 4px 0;font-size:24px;line-height:30px;mso-line-height-rule:exactly;font-weight:bold;color:#1d1e1c;">${fullName}</p>
        <p class="mut" style="margin:0;font-size:14px;line-height:20px;mso-line-height-rule:exactly;color:#5e5f5b;">PIN <strong class="tx" style="color:#1d1e1c;font-family:${MONO};">${pin}</strong> &nbsp;·&nbsp; ${department}${departmentCode}</p>
      </td></tr>

      <!-- Resumen destacado -->
      <tr><td class="px" style="padding:20px 36px 4px 36px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="soft" style="background:#f2f2ee;border-radius:4px;">
          <tr>
            <td style="padding:14px 18px;font-family:Arial,Helvetica,sans-serif;">
              <p class="mut" style="margin:0;font-size:12px;line-height:16px;mso-line-height-rule:exactly;color:#5e5f5b;">Cambios registrados</p>
              <p style="margin:2px 0 0 0;font-size:20px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#155dfc;">${changesSummary}</p>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- Cambios -->
      <tr><td class="px" style="padding:24px 36px 0 36px;font-family:Arial,Helvetica,sans-serif;">
        <p class="mut" style="margin:0 0 6px 0;font-size:11px;line-height:14px;mso-line-height-rule:exactly;font-weight:bold;color:#6b6c68;letter-spacing:0.8px;">CAMBIOS REALIZADOS</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;">${changeRows}
        </table>
      </td></tr>

      <!-- Datos -->
      <tr><td class="px" style="padding:24px 36px 0 36px;font-family:Arial,Helvetica,sans-serif;">
        <p class="mut" style="margin:0 0 6px 0;font-size:11px;line-height:14px;mso-line-height-rule:exactly;font-weight:bold;color:#6b6c68;letter-spacing:0.8px;">DATOS DE LA ACTUALIZACIÓN</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;">${rows}
        </table>
      </td></tr>
${button}

    </table>
  </td></tr>

  <!-- Pie -->
  <tr><td class="px" style="padding:20px 8px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#6b6c68;">
    <p class="mut" style="margin:0;color:#6b6c68;">Este es un correo automático, por favor no responder.</p>
  </td></tr>

</table>
<!--[if mso]></td></tr></table><![endif]-->

</td></tr>
</table>
</body>
</html>`;
};
