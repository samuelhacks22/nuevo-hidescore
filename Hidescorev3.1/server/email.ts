import nodemailer from "nodemailer";

// Create reusable transporter object using SMTP transport
function createTransporter() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // If SMTP is not configured, return null (will fall back to console logging)
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
        console.warn("SMTP not configured. Password reset emails will be logged to console.");
        return null;
    }

    return nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: parseInt(smtpPort) === 465, // true for 465, false for other ports
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
    });
}

export async function sendPasswordResetEmail(
    to: string,
    resetLink: string
): Promise<void> {
    const transporter = createTransporter();
    const fromEmail = process.env.SMTP_FROM || "noreply@hidescore.com";

    // If transporter is not configured, log to console
    if (!transporter) {
        console.log("----------------------------------------");
        console.log("PASSWORD RESET LINK:");
        console.log(`To: ${to}`);
        console.log(`Link: ${resetLink}`);
        console.log("----------------------------------------");
        return;
    }

    const mailOptions = {
        from: fromEmail,
        to: to,
        subject: "Restablecer tu contraseña - Hidescore",
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 8px;
              padding: 30px;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #007bff;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Restablecer tu contraseña</h2>
            <p>Hola,</p>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Hidescore.</p>
            <p>Haz clic en el siguiente botón para restablecer tu contraseña:</p>
            <a href="${resetLink}" class="button">Restablecer Contraseña</a>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #007bff;">${resetLink}</p>
            <p><strong>Este enlace expirará en 1 hora.</strong></p>
            <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura.</p>
            <div class="footer">
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              <p>&copy; ${new Date().getFullYear()} Hidescore. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `,
        text: `
Restablecer tu contraseña

Hola,

Recibimos una solicitud para restablecer la contraseña de tu cuenta en Hidescore.

Haz clic en el siguiente enlace para restablecer tu contraseña:
${resetLink}

Este enlace expirará en 1 hora.

Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura.

---
Este es un correo automático, por favor no respondas a este mensaje.
© ${new Date().getFullYear()} Hidescore. Todos los derechos reservados.
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to: ${to}`);
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw new Error("Failed to send password reset email");
    }
}
