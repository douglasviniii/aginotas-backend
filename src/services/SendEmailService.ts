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

async function BoasVindas(email:string) {
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
      subject: "Bem-vindo ao AgiNotas!",
/*       text: "Segue em anexo o arquivo da NFSe.", */
      html: `
      <p>&nbsp;</p>
      <table style="background-color: #f5f5f5; padding: 20px;" width="100%" cellspacing="0" cellpadding="0">
      <tbody>
      <tr>
      <td align="center">
      <table style="background-color: #ffffff; border-radius: 10px; overflow: hidden;" width="600" cellspacing="0" cellpadding="0"><!-- Cabeçalho -->
      <tbody>
      <tr>
      <td style="padding: 20px; text-align: center; background-color: #161e2c; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px;">Bem-vindo ao AgiNotas!</h1>
      <p style="margin: 5px 0 0;">Sua jornada rumo &agrave; automa&ccedil;&atilde;o de NFS-E come&ccedil;ou.</p>
      </td>
      </tr>
      <!-- Corpo principal -->
      <tr>
      <td style="padding: 20px;">
      <h2 style="color: #161e2c; font-size: 18px;">Ol&aacute;, tudo bem?</h2>
      <p style="font-size: 14px; color: #555555;">&Eacute; um prazer ter voc&ecirc; conosco! Agora que seu cadastro foi conclu&iacute;do com sucesso, voc&ecirc; j&aacute; pode come&ccedil;ar a explorar todos os recursos do AgiNotas e simplificar a emiss&atilde;o de suas Notas Fiscais de Servi&ccedil;o.</p>
      <p style="font-size: 14px; color: #555555;">Com o AgiNotas, voc&ecirc; conta com:</p>
      <ul style="font-size: 14px; color: #555555; padding-left: 20px;">
      <li>Emiss&atilde;o autom&aacute;tica e simplificada de NFS-E</li>
      <li>Faturamento recorrente com agendamento</li>
      <li>Hist&oacute;rico completo e organizado</li>
      <li>Portal exclusivo para seus clientes</li>
      </ul>
      <!-- Botão Acessar Conta -->
      <div style="margin-top: 20px; text-align: center;"><a style="display: inline-block; padding: 12px 25px; background-color: #161e2c; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;" href="https://www.aginotas.com.br/login">Acessar minha conta</a></div>
      <p style="font-size: 14px; color: #555555; margin-top: 20px;">Se tiver qualquer d&uacute;vida ou precisar de ajuda, conte com a nossa equipe de suporte.</p>
      <p style="font-size: 14px; color: #555555;">Seja bem-vindo &agrave; experi&ecirc;ncia <strong>AgiNotas</strong> 🚀</p>
      </td>
      </tr>
      <!-- Rodapé -->
      <tr>
      <td style="padding: 20px; background-color: #eaeaea; text-align: center; font-size: 12px; color: #555;">
      <p style="margin: 0;">AgiNotas by <strong>Delvind Tecnologia da Informa&ccedil;&atilde;o LTDA</strong><br />contato@aginotas.com.br | (45) 8800-0647<br /><a style="color: #161e2c;" href="https://aginotas.com.br/politica-de-privacidade">Pol&iacute;tica de Privacidade</a> &bull; <a style="color: #161e2c;" href="https://aginotas.com.br/termos-de-uso">Termos de Uso</a></p>
      <p style="margin-top: 10px;">Siga-nos no Instagram: <strong style="color: #161e2c;">@aginotas</strong></p>
      </td>
      </tr>
      </tbody>
      </table>
      </td>
      </tr>
      </tbody>
      </table>
      `,
    };

    await transporter.sendMail(mailOptions);
    return "Entregue";
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return "Não Entregue";
  }  
}

async function NfseEmitida(email:string) {
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
      subject: "Bem-vindo ao AgiNotas!",
/*       text: "Segue em anexo o arquivo da NFSe.", */
      html: `
      <p>&nbsp;</p>
      <table style="background-color: #f5f5f5; padding: 20px;" width="100%" cellspacing="0" cellpadding="0">
      <tbody>
      <tr>
      <td align="center">
      <table style="background-color: #ffffff; border-radius: 10px; overflow: hidden;" width="600" cellspacing="0" cellpadding="0"><!-- Cabeçalho -->
      <tbody>
      <tr>
      <td style="padding: 20px; text-align: center; background-color: #161e2c; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px;">AgiNotas</h1>
      <p style="margin: 5px 0 0;">Automatize sua emiss&atilde;o de NFS-E com agilidade!</p>
      </td>
      </tr>
      <!-- Corpo principal -->
      <tr>
      <td style="padding: 20px;">
      <h2 style="color: #161e2c; font-size: 18px;">Ol&aacute;!</h2>
      <p style="font-size: 14px; color: #555555;">O jeito f&aacute;cil e autom&aacute;tico de emitir NFS-E para sua empresa! Com o AgiNotas, voc&ecirc; elimina burocracias e otimiza o seu fluxo de trabalho de forma &aacute;gil e eficiente.</p>
      <!-- Botão Saiba Mais com link --> <a style="display: inline-block; margin: 10px 0; padding: 10px 20px; background-color: #161e2c; color: #ffffff; text-decoration: none; border-radius: 5px;" href="https://www.aginotas.com.br">Saiba mais</a><hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" /><!-- Notas Fiscais -->
      <h3 style="color: #161e2c;">Notas fiscais emitidas:</h3>
      <p style="font-size: 14px; color: #555555;">Todas as notas ficam dispon&iacute;veis no <strong>No Link abaixo por 5 anos</strong>&nbsp;para acompanhamento em tempo real.</p>
      <!-- Botão Ver Notas Emitidas -->
      <div style="margin-top: 10px; text-align: left;"><a style="display: inline-block; margin-top: 5px; padding: 10px 20px; background-color: #161e2c; color: #ffffff; text-decoration: none; border-radius: 5px;" href="https://www.aginotas.com.br/login">Ver notas emitidas</a></div>
      <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" /><!-- Recursos -->
      <table style="font-size: 14px; color: #555555;" width="100%">
      <tbody>
      <tr>
      <td valign="top" width="50%"><strong>Recursos da plataforma:</strong><br />&bull; Emiss&atilde;o de NFS-e Autom&aacute;tico<br />&bull; Acompanhamento Inteligente<br />&bull; Dashbord e gerenciamento&nbsp;</td>
      <td valign="top" width="50%"><strong>Nossa miss&atilde;o:</strong><br />Tornar a emiss&atilde;o de NFS-E algo simples e eficiente.</td>
      </tr>
      </tbody>
      </table>
      </td>
      </tr>
      <!-- Rodapé -->
      <tr>
      <td style="padding: 20px; background-color: #eaeaea; text-align: center; font-size: 12px; color: #555;">
      <p style="margin: 0;">AgiNotas by <strong>Delvind Tecnologia da Informa&ccedil;&atilde;o LTDA</strong><br />contato@aginotas.com.br | (45) 8800-0647<br /><a style="color: #161e2c;" href="https://aginotas.com.br/politica-de-privacidade">Pol&iacute;tica de Privacidade</a> &bull; <a style="color: #161e2c;" href="https://aginotas.com.br/termos-de-uso">Termos de Uso</a></p>
      <p style="margin-top: 10px;">Siga-nos no Instagram: <strong style="color: #161e2c;">@aginotas</strong></p>
      </td>
      </tr>
      </tbody>
      </table>
      </td>
      </tr>
      </tbody>
      </table>
      `,
    };

    await transporter.sendMail(mailOptions);
    return "Entregue";
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return "Não Entregue";
  }  
}

export default {SendEmail,SendEmailNFSe,BoasVindas,NfseEmitida};