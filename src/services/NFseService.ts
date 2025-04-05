import fs from 'fs';
import path from 'path';
import soap from 'soap';
import { Builder } from 'xml2js';
import { SignedXml } from 'xml-crypto';
import forge from 'node-forge';
import libxmljs from 'libxmljs';
import https from 'https';
import { parseStringPromise } from "xml2js";
import { create } from 'xmlbuilder2';
import axios from 'axios';
import { object } from 'zod';


interface GerarNfseEnvio {
  Requerente: {
    Cnpj: string;
    InscricaoMunicipal: string;
    Senha: string;
    Homologa: boolean;
  };
  LoteRps: {
    NumeroLote: string;
    Cnpj: string;
    InscricaoMunicipal: string;
    QuantidadeRps: number;
  };
  Rps: {
    IdentificacaoRps: {
      Numero: string;
      Serie: string;
      Tipo: number;
    };
    DataEmissao: string;
    Status: number;
    Competencia: string;
    Servico: {
      Valores: {
        ValorServicos: number;
        ValorDeducoes: number;
        AliquotaPis: number;
        RetidoPis: number;
        AliquotaCofins: number;
        RetidoCofins: number;
        AliquotaInss: number;
        RetidoInss: number;
        AliquotaIr: number;
        RetidoIr: number;
        AliquotaCsll: number;
        RetidoCsll: number;
        RetidoCpp: number;
        RetidoOutrasRetencoes: number;
        Aliquota: number;
        DescontoIncondicionado: number;
        DescontoCondicionado: number;
      };
      IssRetido: number;
      Discriminacao: string;
      CodigoMunicipio: string;
      ExigibilidadeISS: number;
      MunicipioIncidencia: string;
      ListaItensServico: Array<{
        ItemListaServico: string;
        CodigoCnae: string;
        Descricao: string;
        Tributavel: number;
        Quantidade: number;
        ValorUnitario: number;
        ValorLiquido: number;
      }>;
    };
    Prestador: {
      Cnpj: string;
      InscricaoMunicipal: string;
    };
    Tomador: {
      IdentificacaoTomador: {
        InscricaoMunicipal: string;
        InscricaoEstadual: string;
        CpfCnpj: string;
      };
      RazaoSocial: string;
      Endereco: {
        Endereco: string;
        Numero: string;
        Bairro: string;
        CodigoMunicipio: string;
        Uf: string;
        Cep: string;
      };
      Contato: {
        Telefone: string;
        Email: string;
      };
    };
    RegimeEspecialTributacao: number;
    IncentivoFiscal: number;
  };
}

interface GerarNfseEnvioPessoaFisica {
  Requerente: {
    Cnpj: string;
    InscricaoMunicipal: string;
    Senha: string;
    Homologa: boolean;
  };
  LoteRps: {
    NumeroLote: string;
    Cnpj: string;
    InscricaoMunicipal: string;
    QuantidadeRps: number;
  };
  Rps: {
    IdentificacaoRps: {
      Numero: string;
      Serie: string;
      Tipo: number;
    };
    DataEmissao: string;
    Status: number;
    Competencia: string;
    Servico: {
      Valores: {
        ValorServicos: number;
        ValorDeducoes: number;
        AliquotaPis: number;
        RetidoPis: number;
        AliquotaCofins: number;
        RetidoCofins: number;
        AliquotaInss: number;
        RetidoInss: number;
        AliquotaIr: number;
        RetidoIr: number;
        AliquotaCsll: number;
        RetidoCsll: number;
        RetidoCpp: number;
        RetidoOutrasRetencoes: number;
        Aliquota: number;
        DescontoIncondicionado: number;
        DescontoCondicionado: number;
      };
      IssRetido: number;
      Discriminacao: string;
      CodigoMunicipio: string;
      ExigibilidadeISS: number;
      MunicipioIncidencia: string;
      ListaItensServico: Array<{
        ItemListaServico: string;
        CodigoCnae: string;
        Descricao: string;
        Tributavel: number;
        Quantidade: number;
        ValorUnitario: number;
        ValorLiquido: number;
      }>;
    };
    Prestador: {
      Cnpj: string;
      InscricaoMunicipal: string;
    };
    Tomador: {
      IdentificacaoTomador: {
        CpfCnpj: string;
      };
      RazaoSocial: string;
      Endereco: {
        Endereco: string;
        Numero: string;
        Bairro: string;
        CodigoMunicipio: string;
        Uf: string;
        Cep: string;
      };
      Contato: {
        Telefone: string;
        Email: string;
      };
    };
    RegimeEspecialTributacao: number;
    IncentivoFiscal: number;
  };
}

interface DataConsultaNFSE{
  NumeroRps: string;
  SerieRps: string;
  TipoRps: number;
  CnpjCpf: string;
  InscricaoMunicipal: string;
  Senha: string;
  Homologa: boolean;
}

interface DataCancelarNfseEnvio{
  CpfCnpj: string;
  InscricaoMunicipal: string;
  Senha: string;
  Homologa: boolean;
  NumeroNfse: string;
  CpfCnpjNfse: string;
  InscricaoMunicipalNfse: string;
  CodigoMunicipioNfse: string;
  ChaveAcesso: string;
  CodigoCancelamento: number;
}

interface DataSubstituirNfse {
  IdentificacaoRequerente: {
    CpfCnpj: {
      Cnpj: string;
    };
    InscricaoMunicipal: string;
    Senha: string;
    Homologa: boolean;
  };
  Pedido: {
    InfPedidoCancelamento: {
      IdentificacaoNfse: {
        Numero: string;
        CpfCnpj: {
          Cnpj: string;
        };
        InscricaoMunicipal: string;
        CodigoMunicipio: string;
      };
      ChaveAcesso: string;
      CodigoCancelamento: number;
    };
  };
  DeclaracaoPrestacaoServico: {
    InfDeclaracaoPrestacaoServico: {
      Rps: {
        IdentificacaoRps: {
          Numero: string;
          Serie: string;
          Tipo: number;
        };
        DataEmissao: string;
        Status: number;
      };
      Competencia: string;
      Servico: {
        Valores: {
          ValorServicos: number;
          AliquotaPis: number;
          RetidoPis: number;
          ValorPis: number;
          AliquotaCofins: number;
          RetidoCofins: number;
          ValorCofins: number;
          AliquotaInss: number;
          RetidoInss: number;
          ValorInss: number;
          AliquotaIr: number;
          RetidoIr: number;
          ValorIr: number;
          AliquotaCsll: number;
          RetidoCsll: number;
          ValorCsll: number;
          AliquotaCpp: number;
          RetidoCpp: number;
          ValorCpp: number;
          OutrasRetencoes: number;
          RetidoOutrasRetencoes: number;
        };
        IssRetido: number;
        Discriminacao: string;
        CodigoNbs: string;
        CodigoMunicipio: string;
        ExigibilidadeISS: number;
        MunicipioIncidencia: string;
        ListaItensServico: [
          ItemServico: {
            ItemListaServico: string;
            CodigoCnae: string;
            Descricao: string;
            Tributavel: number;
            Quantidade: number;
            ValorUnitario: number;
            ValorLiquido: number;
          }
        ];
      };
      Prestador: {
        CpfCnpj: {
          Cnpj: string;
        };
        InscricaoMunicipal: string;
      };
      Tomador: {
        IdentificacaoTomador: {
          CpfCnpj: {
            Cnpj: string;
          };
          InscricaoMunicipal: string;
        };
        RazaoSocial: string;
        Endereco: {
          Endereco: string;
          Numero: string;
          Bairro: string;
          CodigoMunicipio: string;
          Uf: string;
          Cep: string;
        };
        Contato: {
          Telefone: string;
          Email: string;
        };
        InscricaoEstadual: string;
      };
      IncentivoFiscal: number;
    };
  };
}

class NfseService {
  private certPath = './src/services/Delvind100759940.pfx'
  private certPassword = `${process.env.SENHA_CERTIFICADO}`;
  private ElotechUrl = `${process.env.ELOTECH_API_URL}`;

  // Carrega o certificado e extrai a chave privada
  private async carregarCertificado(): Promise<string> {
    try {
      const pfx = await fs.promises.readFile(this.certPath);
      const asn1 = forge.asn1.fromDer(pfx.toString('binary'));

      const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, this.certPassword);
      const bags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

      const privateKeyBag = bags[forge.pki.oids.pkcs8ShroudedKeyBag];
      if (!privateKeyBag || privateKeyBag.length === 0) {
        throw new Error('Chave privada não encontrada no certificado.');
      }

      const keyBag = privateKeyBag[0];

      if (!keyBag.key) {
        throw new Error('Chave privada não encontrada ou inválida no certificado.');
      }

      return forge.pki.privateKeyToPem(keyBag.key);
    } catch (error) {
      console.error('Erro ao carregar o certificado:', error);
      throw new Error('Falha ao extrair a chave privada do certificado.');
    }
  }



  private async assinarXml(xml: string): Promise<string> {
    try {
      const sig = new SignedXml({ canonicalizationAlgorithm: "http://www.w3.org/2001/10/xml-exc-c14n#" });
      sig.privateKey = await this.carregarCertificado();
      sig.signatureAlgorithm = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';

      sig.addReference({
        xpath: "//*[local-name(.)='InfDeclaracaoPrestacaoServico']",
        transforms: ["http://www.w3.org/2000/09/xmldsig#enveloped-signature"],
        digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256"
      });

      sig.computeSignature(xml);
      return sig.getSignedXml();
    } catch (error) {
      console.error('Erro ao assinar o xml:', error);
      throw new Error('Falha ao assinar o xml.');
    }
  }
  private gerarXmlNfse(data: GerarNfseEnvio): string {
    return `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nfse="http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd">
      <soapenv:Header/>
      <soapenv:Body>
      <EnviarLoteRpsSincronoEnvio xmlns="http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd">
        <IdentificacaoRequerente>
        <CpfCnpj>
          <Cnpj>${data.Requerente.Cnpj}</Cnpj>
        </CpfCnpj>
        <InscricaoMunicipal>${data.Requerente.InscricaoMunicipal}</InscricaoMunicipal>
        <Senha>${data.Requerente.Senha}</Senha>
        <Homologa>${data.Requerente.Homologa}</Homologa>
        </IdentificacaoRequerente>
        <LoteRps versao="2.03">
        <NumeroLote>${data.LoteRps.NumeroLote}</NumeroLote>
        <CpfCnpj>
          <Cnpj>${data.LoteRps.Cnpj}</Cnpj>
        </CpfCnpj>
        <InscricaoMunicipal>${data.LoteRps.InscricaoMunicipal}</InscricaoMunicipal>
        <QuantidadeRps>${data.LoteRps.QuantidadeRps}</QuantidadeRps>
        <ListaRps>
          <Rps>
          <InfDeclaracaoPrestacaoServico Id="_0">
            <Rps>
            <IdentificacaoRps>
              <Numero>${data.Rps.IdentificacaoRps.Numero}</Numero>
              <Serie>${data.Rps.IdentificacaoRps.Serie}</Serie>
              <Tipo>${data.Rps.IdentificacaoRps.Tipo}</Tipo>
            </IdentificacaoRps>
            <DataEmissao>${data.Rps.DataEmissao}</DataEmissao>
            <Status>${data.Rps.Status}</Status>
            </Rps>
            <Competencia>${data.Rps.Competencia}</Competencia>
            <Servico>
            <Valores>
              <ValorServicos>${data.Rps.Servico.Valores.ValorServicos}</ValorServicos>
              <ValorDeducoes>${data.Rps.Servico.Valores.ValorDeducoes}</ValorDeducoes>
              <AliquotaPis>${data.Rps.Servico.Valores.AliquotaPis}</AliquotaPis>
              <RetidoPis>${data.Rps.Servico.Valores.RetidoPis}</RetidoPis>
              <AliquotaCofins>${data.Rps.Servico.Valores.AliquotaCofins}</AliquotaCofins>
              <RetidoCofins>${data.Rps.Servico.Valores.RetidoCofins}</RetidoCofins>
              <AliquotaInss>${data.Rps.Servico.Valores.AliquotaInss}</AliquotaInss>
              <RetidoInss>${data.Rps.Servico.Valores.RetidoInss}</RetidoInss>
              <AliquotaIr>${data.Rps.Servico.Valores.AliquotaIr}</AliquotaIr>
              <RetidoIr>${data.Rps.Servico.Valores.RetidoIr}</RetidoIr>
              <AliquotaCsll>${data.Rps.Servico.Valores.AliquotaCsll}</AliquotaCsll>
              <RetidoCsll>${data.Rps.Servico.Valores.RetidoCsll}</RetidoCsll>
              <RetidoCpp>${data.Rps.Servico.Valores.RetidoCpp}</RetidoCpp>
              <RetidoOutrasRetencoes>${data.Rps.Servico.Valores.RetidoOutrasRetencoes}</RetidoOutrasRetencoes>
              <Aliquota>${data.Rps.Servico.Valores.Aliquota}</Aliquota>
              <DescontoIncondicionado>${data.Rps.Servico.Valores.DescontoIncondicionado}</DescontoIncondicionado>
              <DescontoCondicionado>${data.Rps.Servico.Valores.DescontoCondicionado}</DescontoCondicionado>
            </Valores>
            <IssRetido>${data.Rps.Servico.IssRetido}</IssRetido>
            <Discriminacao>${data.Rps.Servico.Discriminacao}</Discriminacao>
            <CodigoMunicipio>${data.Rps.Servico.CodigoMunicipio}</CodigoMunicipio>
            <ExigibilidadeISS>${data.Rps.Servico.ExigibilidadeISS}</ExigibilidadeISS>
            <MunicipioIncidencia>${data.Rps.Servico.MunicipioIncidencia}</MunicipioIncidencia>
            <ListaItensServico>
              ${data.Rps.Servico.ListaItensServico.map(item => `
              <ItemServico>
              <ItemListaServico>${item.ItemListaServico}</ItemListaServico>
              <CodigoCnae>${item.CodigoCnae}</CodigoCnae>
              <Descricao>${item.Descricao}</Descricao>
              <Tributavel>${item.Tributavel}</Tributavel>
              <Quantidade>${item.Quantidade}</Quantidade>
              <ValorUnitario>${item.ValorUnitario}</ValorUnitario>
              <ValorLiquido>${item.ValorLiquido}</ValorLiquido>
              </ItemServico>
              `).join('')}
            </ListaItensServico>
            </Servico>
            <Prestador>
            <CpfCnpj>
              <Cnpj>${data.Rps.Prestador.Cnpj}</Cnpj>
            </CpfCnpj>
            <InscricaoMunicipal>${data.Rps.Prestador.InscricaoMunicipal}</InscricaoMunicipal>
            </Prestador>
            <Tomador>
            <IdentificacaoTomador>
              <CpfCnpj>
              <Cnpj>${data.Rps.Tomador.IdentificacaoTomador.CpfCnpj}</Cnpj>
              </CpfCnpj>
              <InscricaoMunicipal>${data.Rps.Tomador.IdentificacaoTomador.InscricaoMunicipal}</InscricaoMunicipal>
            </IdentificacaoTomador>
            <RazaoSocial>${data.Rps.Tomador.RazaoSocial}</RazaoSocial>
            <Endereco>
              <Endereco>${data.Rps.Tomador.Endereco.Endereco}</Endereco>
              <Numero>${data.Rps.Tomador.Endereco.Numero}</Numero>
              <Bairro>${data.Rps.Tomador.Endereco.Bairro}</Bairro>
              <CodigoMunicipio>${data.Rps.Tomador.Endereco.CodigoMunicipio}</CodigoMunicipio>
              <Uf>${data.Rps.Tomador.Endereco.Uf}</Uf>
              <Cep>${data.Rps.Tomador.Endereco.Cep}</Cep>
            </Endereco>
            <Contato>
              <Telefone>${data.Rps.Tomador.Contato.Telefone}</Telefone>
              <Email>${data.Rps.Tomador.Contato.Email}</Email>
            </Contato>
            </Tomador>
            <RegimeEspecialTributacao>${data.Rps.RegimeEspecialTributacao}</RegimeEspecialTributacao>
            <IncentivoFiscal>${data.Rps.IncentivoFiscal}</IncentivoFiscal>
          </InfDeclaracaoPrestacaoServico>
          </Rps>
        </ListaRps>
        </LoteRps>
      </EnviarLoteRpsSincronoEnvio>
      </soapenv:Body>
    </soapenv:Envelope>
    `;
  }

  public async enviarNfse(data: GerarNfseEnvio): Promise<string> {
    try {

      const xml = this.gerarXmlNfse(data);
      const xsd = fs.readFileSync('./src/services/xmldsig-core-schema20020212.xsd', 'utf8');

      const xmlDoc = libxmljs.parseXml(xml);
      const xsdDoc = libxmljs.parseXml(xsd);

      const validationErrors = xmlDoc.validate(xsdDoc);

      if (validationErrors) {
        console.error('Erros de validação:', validationErrors);

      } else {
        const xmlAssinado = await this.assinarXml(xml);
        console.log('XML GERAR UMA NFSE: ',xmlAssinado);


         const response = await axios.post(
          `${this.ElotechUrl}`, xmlAssinado,
          {
            headers: {
              'Content-Type': 'text/xml',
              'Accept': 'text/xml',
            },
          }
        );
        return response.data; 
      }
      return 'Erro de validação no XML';
    } catch (error) {
      console.error('Erro ao enviar Nfse:', error);
      throw new Error('Falha ao enviar Nfse.');
    }
  }



  private gerarXmlNfsePessoaFisica(data: GerarNfseEnvioPessoaFisica): string {
    return `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nfse="http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd">
      <soapenv:Header/>
      <soapenv:Body>
      <EnviarLoteRpsSincronoEnvio xmlns="http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd">
        <IdentificacaoRequerente>
        <CpfCnpj>
          <Cnpj>${data.Requerente.Cnpj}</Cnpj>
        </CpfCnpj>
        <InscricaoMunicipal>${data.Requerente.InscricaoMunicipal}</InscricaoMunicipal>
        <Senha>${data.Requerente.Senha}</Senha>
        <Homologa>${data.Requerente.Homologa}</Homologa>
        </IdentificacaoRequerente>
        <LoteRps versao="2.03">
        <NumeroLote>${data.LoteRps.NumeroLote}</NumeroLote>
        <CpfCnpj>
          <Cnpj>${data.LoteRps.Cnpj}</Cnpj>
        </CpfCnpj>
        <InscricaoMunicipal>${data.LoteRps.InscricaoMunicipal}</InscricaoMunicipal>
        <QuantidadeRps>${data.LoteRps.QuantidadeRps}</QuantidadeRps>
        <ListaRps>
          <Rps>
          <InfDeclaracaoPrestacaoServico Id="_0">
            <Rps>
            <IdentificacaoRps>
              <Numero>${data.Rps.IdentificacaoRps.Numero}</Numero>
              <Serie>${data.Rps.IdentificacaoRps.Serie}</Serie>
              <Tipo>${data.Rps.IdentificacaoRps.Tipo}</Tipo>
            </IdentificacaoRps>
            <DataEmissao>${data.Rps.DataEmissao}</DataEmissao>
            <Status>${data.Rps.Status}</Status>
            </Rps>
            <Competencia>${data.Rps.Competencia}</Competencia>
            <Servico>
            <Valores>
              <ValorServicos>${data.Rps.Servico.Valores.ValorServicos}</ValorServicos>
              <ValorDeducoes>${data.Rps.Servico.Valores.ValorDeducoes}</ValorDeducoes>
              <AliquotaPis>${data.Rps.Servico.Valores.AliquotaPis}</AliquotaPis>
              <RetidoPis>${data.Rps.Servico.Valores.RetidoPis}</RetidoPis>
              <AliquotaCofins>${data.Rps.Servico.Valores.AliquotaCofins}</AliquotaCofins>
              <RetidoCofins>${data.Rps.Servico.Valores.RetidoCofins}</RetidoCofins>
              <AliquotaInss>${data.Rps.Servico.Valores.AliquotaInss}</AliquotaInss>
              <RetidoInss>${data.Rps.Servico.Valores.RetidoInss}</RetidoInss>
              <AliquotaIr>${data.Rps.Servico.Valores.AliquotaIr}</AliquotaIr>
              <RetidoIr>${data.Rps.Servico.Valores.RetidoIr}</RetidoIr>
              <AliquotaCsll>${data.Rps.Servico.Valores.AliquotaCsll}</AliquotaCsll>
              <RetidoCsll>${data.Rps.Servico.Valores.RetidoCsll}</RetidoCsll>
              <RetidoCpp>${data.Rps.Servico.Valores.RetidoCpp}</RetidoCpp>
              <RetidoOutrasRetencoes>${data.Rps.Servico.Valores.RetidoOutrasRetencoes}</RetidoOutrasRetencoes>
              <Aliquota>${data.Rps.Servico.Valores.Aliquota}</Aliquota>
              <DescontoIncondicionado>${data.Rps.Servico.Valores.DescontoIncondicionado}</DescontoIncondicionado>
              <DescontoCondicionado>${data.Rps.Servico.Valores.DescontoCondicionado}</DescontoCondicionado>
            </Valores>
            <IssRetido>${data.Rps.Servico.IssRetido}</IssRetido>
            <Discriminacao>${data.Rps.Servico.Discriminacao}</Discriminacao>
            <CodigoMunicipio>${data.Rps.Servico.CodigoMunicipio}</CodigoMunicipio>
            <ExigibilidadeISS>${data.Rps.Servico.ExigibilidadeISS}</ExigibilidadeISS>
            <MunicipioIncidencia>${data.Rps.Servico.MunicipioIncidencia}</MunicipioIncidencia>
            <ListaItensServico>
              ${data.Rps.Servico.ListaItensServico.map(item => `
              <ItemServico>
              <ItemListaServico>${item.ItemListaServico}</ItemListaServico>
              <CodigoCnae>${item.CodigoCnae}</CodigoCnae>
              <Descricao>${item.Descricao}</Descricao>
              <Tributavel>${item.Tributavel}</Tributavel>
              <Quantidade>${item.Quantidade}</Quantidade>
              <ValorUnitario>${item.ValorUnitario}</ValorUnitario>
              <ValorLiquido>${item.ValorLiquido}</ValorLiquido>
              </ItemServico>
              `).join('')}
            </ListaItensServico>
            </Servico>
            <Prestador>
            <CpfCnpj>
              <Cnpj>${data.Rps.Prestador.Cnpj}</Cnpj>
            </CpfCnpj>
            <InscricaoMunicipal>${data.Rps.Prestador.InscricaoMunicipal}</InscricaoMunicipal>
            </Prestador>
            <Tomador>
            <IdentificacaoTomador>
              <CpfCnpj>
              <Cpf>${data.Rps.Tomador.IdentificacaoTomador.CpfCnpj}</Cpf>
              </CpfCnpj>
            </IdentificacaoTomador>
            <RazaoSocial>${data.Rps.Tomador.RazaoSocial}</RazaoSocial>
            <Endereco>
              <Endereco>${data.Rps.Tomador.Endereco.Endereco}</Endereco>
              <Numero>${data.Rps.Tomador.Endereco.Numero}</Numero>
              <Bairro>${data.Rps.Tomador.Endereco.Bairro}</Bairro>
              <CodigoMunicipio>${data.Rps.Tomador.Endereco.CodigoMunicipio}</CodigoMunicipio>
              <Uf>${data.Rps.Tomador.Endereco.Uf}</Uf>
              <Cep>${data.Rps.Tomador.Endereco.Cep}</Cep>
            </Endereco>
            <Contato>
              <Telefone>${data.Rps.Tomador.Contato.Telefone}</Telefone>
              <Email>${data.Rps.Tomador.Contato.Email}</Email>
            </Contato>
            </Tomador>
            <RegimeEspecialTributacao>${data.Rps.RegimeEspecialTributacao}</RegimeEspecialTributacao>
            <IncentivoFiscal>${data.Rps.IncentivoFiscal}</IncentivoFiscal>
          </InfDeclaracaoPrestacaoServico>
          </Rps>
        </ListaRps>
        </LoteRps>
      </EnviarLoteRpsSincronoEnvio>
      </soapenv:Body>
    </soapenv:Envelope>
    `;
  }

  public async enviarNfsePessoaFisica(data: GerarNfseEnvioPessoaFisica): Promise<string> {
    try {
      
      const xml = this.gerarXmlNfsePessoaFisica(data);
      const xsd = fs.readFileSync('./src/services/xmldsig-core-schema20020212.xsd', 'utf8');

      const xmlDoc = libxmljs.parseXml(xml);
      const xsdDoc = libxmljs.parseXml(xsd);

      const validationErrors = xmlDoc.validate(xsdDoc);

      if (validationErrors) {
        console.error('Erros de validação:', validationErrors);

      } else {
        const xmlAssinado = await this.assinarXml(xml);
        console.log('XML GERAR UMA NFSE: ',xmlAssinado);


         const response = await axios.post(
          `${this.ElotechUrl}`, xmlAssinado,
          {
            headers: {
              'Content-Type': 'text/xml',
              'Accept': 'text/xml',
            },
          }
        );
        return response.data; 
      }
      return 'Erro de validação no XML';
    } catch (error) {
      console.error('Erro ao enviar Nfse:', error);
      throw new Error('Falha ao enviar Nfse.');
    }
  }




  private async assinarXmlConsulta(xml: string): Promise<string> {
    try {
      const sig = new SignedXml({ canonicalizationAlgorithm: "http://www.w3.org/2001/10/xml-exc-c14n#" });
      sig.privateKey = await this.carregarCertificado();
      sig.signatureAlgorithm = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';

      sig.addReference({
        xpath: "//*[local-name(.)='ConsultarNfseRpsEnvio' and namespace-uri(.)='http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd']",
        transforms: ["http://www.w3.org/2000/09/xmldsig#enveloped-signature"],
        digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256"
      });

      sig.computeSignature(xml);
      return sig.getSignedXml();
    } catch (error) {
      console.error('Erro ao assinar o xml:', error);
      throw new Error('Falha ao assinar o xml.');
    }
  }

  private gerarXmlConsultarNfseRpsEnvio(data: DataConsultaNFSE): string {
    return   `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nfse="http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd">
    <soapenv:Header/>
    <soapenv:Body>
    <ConsultarNfseRpsEnvio xmlns="http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd">
    <IdentificacaoRps>
    <Numero>${data.NumeroRps}</Numero>
    <Serie>${data.SerieRps}</Serie>
    <Tipo>${data.TipoRps}</Tipo>
    </IdentificacaoRps>
    <IdentificacaoRequerente>
    <CpfCnpj>
    <Cnpj>${data.CnpjCpf}</Cnpj>
    </CpfCnpj>
    <InscricaoMunicipal>${data.InscricaoMunicipal}</InscricaoMunicipal>
    <Senha>${data.Senha}</Senha>
    <Homologa>${data.Homologa}</Homologa>
    </IdentificacaoRequerente>
    </ConsultarNfseRpsEnvio>
    </soapenv:Body>
    </soapenv:Envelope>
  `;
  }

  public async consultarNfse(data: DataConsultaNFSE): Promise<string> {
    try {
      const xmlConsulta = this.gerarXmlConsultarNfseRpsEnvio(data);
      const xmlAssinado = await this.assinarXmlConsulta(xmlConsulta);

       const response = await axios.post(
        `${this.ElotechUrl}`, xmlAssinado,
        {
          headers: {
            'Content-Type': 'text/xml',
            'Accept': 'text/xml',
          },
        }
      );
      
      return response.data; 

    } catch (error) {
      console.error('Erro na consulta da NFS-e:', error);
      throw new Error('Falha ao consultar NFS-e.');
    }
  }





  private async assinarXmlCancelar(xml: string): Promise<string> {
    try {
      const sig = new SignedXml({ canonicalizationAlgorithm: "http://www.w3.org/2001/10/xml-exc-c14n#" });
      sig.privateKey = await this.carregarCertificado();
      sig.signatureAlgorithm = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';

      sig.addReference({
        xpath: "//*[local-name(.)='CancelarNfseEnvio' and namespace-uri(.)='http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd']",
        transforms: ["http://www.w3.org/2000/09/xmldsig#enveloped-signature"],
        digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256"
      });

      sig.computeSignature(xml);
      return sig.getSignedXml();
    } catch (error) {
      console.error('Erro ao assinar o xml:', error);
      throw new Error('Falha ao assinar o xml.');
    }
  }

  private async gerarXmlCancelarNfseEnvio(data: DataCancelarNfseEnvio): Promise<string> {
    return`
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nfse="http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd">
      <soapenv:Header/>
      <soapenv:Body>
      <CancelarNfseEnvio xmlns="http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd">
        <IdentificacaoRequerente>
            <CpfCnpj>
                <Cnpj>${data.CpfCnpj}</Cnpj>
            </CpfCnpj>
            <InscricaoMunicipal>${data.InscricaoMunicipal}</InscricaoMunicipal>
            <Senha>${data.Senha}</Senha>
            <Homologa>${data.Homologa}</Homologa>
        </IdentificacaoRequerente>
        <Pedido>
            <InfPedidoCancelamento>
                <IdentificacaoNfse>
                    <Numero>${data.NumeroNfse}</Numero>
                    <CpfCnpj>
                        <Cnpj>${data.CpfCnpjNfse}</Cnpj>
                    </CpfCnpj>
                    <InscricaoMunicipal>${data.InscricaoMunicipalNfse}</InscricaoMunicipal>
                    <CodigoMunicipio>${data.CodigoMunicipioNfse}</CodigoMunicipio>
                </IdentificacaoNfse>
                <ChaveAcesso>${data.ChaveAcesso}</ChaveAcesso>
                <CodigoCancelamento>${data.CodigoCancelamento}</CodigoCancelamento>
            </InfPedidoCancelamento>
        </Pedido>
    </CancelarNfseEnvio>
    </soapenv:Body>
    </soapenv:Envelope>
    `
  }

  public async cancelarNfse(data: DataCancelarNfseEnvio): Promise<string> {
    try {
      const xmlCancelamento = await this.gerarXmlCancelarNfseEnvio(data);

      const xmlAssinado = await this.assinarXmlCancelar(xmlCancelamento);
      console.log('XML CANCELAR NFSE: ',xmlAssinado);

        const response = await axios.post(
        `${this.ElotechUrl}`, xmlAssinado,
        {
          headers: {
            'Content-Type': 'text/xml',
            'Accept': 'text/xml',
          },
        }
      );

      return response.data;

    } catch (error) {
      console.error('Erro no cancelamento da NFS-e:', error);
      throw new Error('Falha ao cancelar NFS-e.');
    }
  }





  private async assinarXmlSubstituir(xml: string): Promise<string> {
    try {
      const sig = new SignedXml({ canonicalizationAlgorithm: "http://www.w3.org/2001/10/xml-exc-c14n#" });
      sig.privateKey = await this.carregarCertificado();
      sig.signatureAlgorithm = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';

      sig.addReference({
        xpath: "//*[local-name()='InfDeclaracaoPrestacaoServico' and namespace-uri()='http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd']",
        transforms: [
          "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
          "http://www.w3.org/2001/10/xml-exc-c14n#"
        ],
        digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256"
      });

      sig.computeSignature(xml);
      return sig.getSignedXml();
    } catch (error) {
      console.error('Erro ao assinar o XML:', error);
      throw new Error('Falha ao assinar o XML.');
    }
  }

  private async gerarXmlSubstituirNfseEnvio(data: DataSubstituirNfse): Promise<string> {
    //console.log(JSON.stringify(data, null, 2));
    return `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nfse="http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd">
      <soapenv:Header/>
      <soapenv:Body>
      <SubstituirNfseEnvio xmlns="http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd">
      <IdentificacaoRequerente>
      <CpfCnpj>
      <Cnpj>${data.IdentificacaoRequerente.CpfCnpj.Cnpj}</Cnpj>
      </CpfCnpj>
      <InscricaoMunicipal>${data.IdentificacaoRequerente.InscricaoMunicipal}</InscricaoMunicipal>
      <Senha>${data.IdentificacaoRequerente.Senha}</Senha>
      <Homologa>${data.IdentificacaoRequerente.Homologa}</Homologa>
      </IdentificacaoRequerente>
      <Pedido>
      <InfPedidoCancelamento>
      <IdentificacaoNfse>
      <Numero>${data.Pedido.InfPedidoCancelamento.IdentificacaoNfse.Numero}</Numero>
      <CpfCnpj>
      <Cnpj>${data.Pedido.InfPedidoCancelamento.IdentificacaoNfse.CpfCnpj.Cnpj}</Cnpj>
      </CpfCnpj>
      <InscricaoMunicipal>${data.Pedido.InfPedidoCancelamento.IdentificacaoNfse.InscricaoMunicipal}</InscricaoMunicipal>
      <CodigoMunicipio>${data.Pedido.InfPedidoCancelamento.IdentificacaoNfse.CodigoMunicipio}</CodigoMunicipio>
      </IdentificacaoNfse>
      <ChaveAcesso>${data.Pedido.InfPedidoCancelamento.ChaveAcesso}</ChaveAcesso>
      <CodigoCancelamento>${data.Pedido.InfPedidoCancelamento.CodigoCancelamento}</CodigoCancelamento>
      </InfPedidoCancelamento>
      </Pedido>
      <DeclaracaoPrestacaoServico>
      <InfDeclaracaoPrestacaoServico>
      <Rps>
      <IdentificacaoRps>
      <Numero>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Rps.IdentificacaoRps.Numero}</Numero>
      <Serie>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Rps.IdentificacaoRps.Serie}</Serie>
      <Tipo>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Rps.IdentificacaoRps.Tipo}</Tipo>
      </IdentificacaoRps>
      <DataEmissao>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Rps.DataEmissao}</DataEmissao>
      <Status>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Rps.Status}</Status>
      </Rps>
      <Competencia>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Competencia}</Competencia>
      <Servico>
      <Valores>
      <ValorServicos>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Valores.ValorServicos}</ValorServicos>
      <AliquotaPis>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Valores.AliquotaPis}</AliquotaPis>
      <RetidoPis>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Valores.RetidoPis}</RetidoPis>
      <ValorPis>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Valores.ValorPis}</ValorPis>
      <AliquotaCofins>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Valores.AliquotaCofins}</AliquotaCofins>
      <RetidoCofins>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Valores.RetidoCofins}</RetidoCofins>
      <ValorCofins>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Valores.ValorCofins}</ValorCofins>
      <AliquotaInss>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Valores.AliquotaInss}</AliquotaInss>
      <RetidoInss>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Valores.RetidoInss}</RetidoInss>
      <ValorInss>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Valores.ValorInss}</ValorInss>
      <AliquotaIr>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Valores.AliquotaIr}</AliquotaIr>
      <RetidoIr>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Valores.RetidoIr}</RetidoIr>
      <ValorIr>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Valores.ValorIr}</ValorIr>
      <AliquotaCsll>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Valores.AliquotaCsll}</AliquotaCsll>
      <RetidoCsll>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Valores.RetidoCsll}</RetidoCsll>
      <ValorCsll>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Valores.ValorCsll}</ValorCsll>
      <AliquotaCpp>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Valores.AliquotaCpp}</AliquotaCpp>
      <RetidoCpp>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Valores.RetidoCpp}</RetidoCpp>
      <ValorCpp>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Valores.ValorCpp}</ValorCpp>
      <OutrasRetencoes>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Valores.OutrasRetencoes}</OutrasRetencoes>
      <RetidoOutrasRetencoes>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Valores.RetidoOutrasRetencoes}</RetidoOutrasRetencoes>
      </Valores>
      <IssRetido>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.IssRetido}</IssRetido>
      <Discriminacao>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.Discriminacao}</Discriminacao>
      <CodigoNbs>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.CodigoNbs}</CodigoNbs>
      <CodigoMunicipio>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.CodigoMunicipio}</CodigoMunicipio>
      <ExigibilidadeISS>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.ExigibilidadeISS}</ExigibilidadeISS>
      <MunicipioIncidencia>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.MunicipioIncidencia}</MunicipioIncidencia>
      <ListaItensServico>
      ${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Servico.ListaItensServico.map(item => `
      <ItemServico>
      <ItemListaServico>${item.ItemListaServico}</ItemListaServico>
      <CodigoCnae>${item.CodigoCnae}</CodigoCnae>
      <Descricao>${item.Descricao}</Descricao>
      <Tributavel>${item.Tributavel}</Tributavel>
      <Quantidade>${item.Quantidade}</Quantidade>
      <ValorUnitario>${item.ValorUnitario}</ValorUnitario>
      <ValorLiquido>${item.ValorLiquido}</ValorLiquido>
      </ItemServico>
      `).join('')}
      </ListaItensServico>
      </Servico>
      <Prestador>
      <CpfCnpj>
      <Cnpj>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Prestador.CpfCnpj.Cnpj}</Cnpj>
      </CpfCnpj>
      <InscricaoMunicipal>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Prestador.InscricaoMunicipal}</InscricaoMunicipal>
      </Prestador>
      <Tomador>
      <IdentificacaoTomador>
      <CpfCnpj>
      <Cnpj>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Tomador.IdentificacaoTomador.CpfCnpj.Cnpj}</Cnpj>
      </CpfCnpj>
      <InscricaoMunicipal>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Tomador.IdentificacaoTomador.InscricaoMunicipal}</InscricaoMunicipal>
      </IdentificacaoTomador>
      <RazaoSocial>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Tomador.RazaoSocial}</RazaoSocial>
      <Endereco>
      <Endereco>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Tomador.Endereco.Endereco}</Endereco>
      <Numero>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Tomador.Endereco.Numero}</Numero>
      <Bairro>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Tomador.Endereco.Bairro}</Bairro>
      <CodigoMunicipio>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Tomador.Endereco.CodigoMunicipio}</CodigoMunicipio>
      <Uf>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Tomador.Endereco.Uf}</Uf>
      <Cep>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Tomador.Endereco.Cep}</Cep>
      </Endereco>
      <Contato>
      <Telefone>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Tomador.Contato.Telefone}</Telefone>
      <Email>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Tomador.Contato.Email}</Email>
      </Contato>
      </Tomador>
      <IncentivoFiscal>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.IncentivoFiscal}</IncentivoFiscal>
      </InfDeclaracaoPrestacaoServico>
      </DeclaracaoPrestacaoServico>
      </SubstituirNfseEnvio>
      </soapenv:Body>
    </soapenv:Envelope>
    `;
  }

  public async SubstituirNfse(data: DataSubstituirNfse): Promise<string> {
    try {
      const xmlCancelamento = await this.gerarXmlSubstituirNfseEnvio(data);

       const xmlAssinado = await this.assinarXmlSubstituir(xmlCancelamento);
       console.log('XML SUBSTITUIÇÃO DE NFSE: ',xmlAssinado);
       
         const response = await axios.post(
        `${this.ElotechUrl}`, xmlAssinado,
        {
          headers: {
            'Content-Type': 'text/xml',
            'Accept': 'text/xml',
          },
        }
      );

      return response.data; 
    } catch (error) {
      console.error('Erro ao substituir da NFS-e:', error);
      throw new Error('Falha ao substituir NFS-e.');
    }
  }

}

export default new NfseService();

/* <InscricaoEstadual>${data.Rps.Tomador.IdentificacaoTomador.InscricaoEstadual}</InscricaoEstadual> */

/* <InscricaoEstadual>${data.DeclaracaoPrestacaoServico.InfDeclaracaoPrestacaoServico.Tomador.InscricaoEstadual}</InscricaoEstadual> */
