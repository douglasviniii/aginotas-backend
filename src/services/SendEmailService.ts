import nodemailer from 'nodemailer';

async function SendEmail(email: string, message: string): Promise<string> {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL as string,
        pass: process.env.PASS as string,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL as string,
      to: email,
      subject: "Código de recuperação - AgiNotas",
      text: "Código de recuperação - AgiNotas",
      html: `<h2>Código: ${message}</h2>`,
    };

    await transporter.sendMail(mailOptions);
    return "Entregue";
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return "Não Entregue";
  }
}

async function SendEmailNFSe(email: string, nfs: string): Promise<string> {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL as string,
        pass: process.env.PASS as string,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL as string,
      to: email,
      subject: "NFSe - AgiNotas",
      text: "Segue em anexo o arquivo da NFSe.",
      html: `<h2>${nfs} - AgiNotas</h2>`,

/*       attachments: [
        {
          filename: "NFSe.pdf",
          path: pdf,
          contentType: "application/pdf",
        },
      ], */
    };

    await transporter.sendMail(mailOptions);
    return "Entregue";
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return "Não Entregue";
  }
}

export default {SendEmail,SendEmailNFSe};