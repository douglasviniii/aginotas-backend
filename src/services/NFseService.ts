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


interface Data {
  requerente: {
    cnpj: string;
    inscricaoMunicipal: string;
    senha: string;
    homologa: boolean;
  };
  loteRps: {
    numeroLote: string;
    cnpj: string;
    inscricaoMunicipal: string;
    quantidadeRps: number;
  };
  rps: {
    identificacaoRps: {
      numero: string;
      serie: string;
      tipo: number;
    };
    dataEmissao: string;
    status: number;
    competencia: string;
    servico: {
      valores: {
        valorServicos: string;
        valorDeducoes: string;
        aliquotaPis: string;
        retidoPis: string;
        aliquotaCofins: string;
        retidoCofins: string;
        aliquotaInss: string;
        retidoInss: string;
        aliquotaIr: string;
        retidoIr: string;
        aliquotaCsll: string;
        retidoCsll: string;
        retidoCpp: string;
        retidoOutrasRetencoes: string;
        aliquota: string;
        descontoIncondicionado: string;
        descontoCondicionado: string;
      };
      issRetido: string;
      discriminacao: string;
      codigoMunicipio: string;
      exigibilidadeISS: string;
      municipioIncidencia: string;
      listaItensServico: Array<{
        itemListaServico: string;
        codigoCnae: string;
        descricao: string;
        tributavel: string;
        quantidade: string;
        valorUnitario: string;
        valorDesconto: string;
        valorLiquido: string;
        dadosDeducao?: {
          tipoDeducao: string;
          cpf: string;
          valorTotalNotaFiscal: string;
          valorADeduzir: string;
        };
      }>;
    };
    prestador: {
      cnpj: string;
      inscricaoMunicipal: string;
    };
    tomador: {
      identificacaoTomador: {
        cnpj: string;
      };
      razaoSocial: string;
      endereco: {
        endereco: string;
        numero: string;
        bairro: string;
        codigoMunicipio: string;
        uf: string;
        cep: string;
      };
      contato: {
        telefone: string;
        email: string;
      };
    };
    regimeEspecialTributacao: string;
    incentivoFiscal: string;
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
      CodigoCancelamento: string;
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
          ValorServicos: string;
          AliquotaPis: string;
          RetidoPis: string;
          ValorPis: string;
          AliquotaCofins: string;
          RetidoCofins: string;
          ValorCofins: string;
          AliquotaInss: string;
          RetidoInss: string;
          ValorInss: string;
          AliquotaIr: string;
          RetidoIr: string;
          ValorIr: string;
          AliquotaCsll: string;
          RetidoCsll: string;
          ValorCsll: string;
          AliquotaCpp: string;
          RetidoCpp: string;
          ValorCpp: string;
          OutrasRetencoes: string;
          RetidoOutrasRetencoes: string;
        };
        IssRetido: string;
        Discriminacao: string;
        CodigoNbs: string;
        CodigoMunicipio: string;
        ExigibilidadeISS: string;
        MunicipioIncidencia: string;
        ListaItensServico: {
          ItemServico: {
            ItemListaServico: string;
            CodigoCnae: string;
            Descricao: string;
            Tributavel: string;
            Quantidade: string;
            ValorUnitario: string;
            ValorLiquido: string;
          };
        };
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
      IncentivoFiscal: string;
    };
  };
}

class NfseService {
  private certPath = './src/services/Delvind100759940.pfx' // Caminho para o certificado .pfx
  private certPassword = `${process.env.SENHA_CERTIFICADO}`;
  private wsdlUrl = `${process.env.ELOTECH_API_URL}`;

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




  private gerarXmlNfse(data: Data): string {
    return `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nfse="http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd">
      <soapenv:Header/>
      <soapenv:Body>
        <EnviarLoteRpsSincronoEnvio xmlns="http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd">
          <IdentificacaoRequerente>
            <CpfCnpj>
              <Cnpj>${data.requerente.cnpj}</Cnpj>
            </CpfCnpj>
            <InscricaoMunicipal>${data.requerente.inscricaoMunicipal}</InscricaoMunicipal>
            <Senha>${data.requerente.senha}</Senha>
            <Homologa>${data.requerente.homologa}</Homologa>
          </IdentificacaoRequerente>
          <LoteRps versao="2.03">
            <NumeroLote>${data.loteRps.numeroLote}</NumeroLote>
            <CpfCnpj>
              <Cnpj>${data.loteRps.cnpj}</Cnpj>
            </CpfCnpj>
            <InscricaoMunicipal>${data.loteRps.inscricaoMunicipal}</InscricaoMunicipal>
            <QuantidadeRps>${data.loteRps.quantidadeRps}</QuantidadeRps>
            <ListaRps>
              <Rps>
                <InfDeclaracaoPrestacaoServico>
                  <Rps>
                    <IdentificacaoRps>
                      <Numero>${data.rps.identificacaoRps.numero}</Numero>
                      <Serie>${data.rps.identificacaoRps.serie}</Serie>
                      <Tipo>${data.rps.identificacaoRps.tipo}</Tipo>
                    </IdentificacaoRps>
                    <DataEmissao>${data.rps.dataEmissao}</DataEmissao>
                    <Status>${data.rps.status}</Status>
                  </Rps>
                  <Competencia>${data.rps.competencia}</Competencia>
                  <Servico>
                    <Valores>
                      <ValorServicos>${data.rps.servico.valores.valorServicos}</ValorServicos>
                      <ValorDeducoes>${data.rps.servico.valores.valorDeducoes}</ValorDeducoes>
                      <AliquotaPis>${data.rps.servico.valores.aliquotaPis}</AliquotaPis>
                      <RetidoPis>${data.rps.servico.valores.retidoPis}</RetidoPis>
                      <AliquotaCofins>${data.rps.servico.valores.aliquotaCofins}</AliquotaCofins>
                      <RetidoCofins>${data.rps.servico.valores.retidoCofins}</RetidoCofins>
                      <AliquotaInss>${data.rps.servico.valores.aliquotaInss}</AliquotaInss>
                      <RetidoInss>${data.rps.servico.valores.retidoInss}</RetidoInss>
                      <AliquotaIr>${data.rps.servico.valores.aliquotaIr}</AliquotaIr>
                      <RetidoIr>${data.rps.servico.valores.retidoIr}</RetidoIr>
                      <AliquotaCsll>${data.rps.servico.valores.aliquotaCsll}</AliquotaCsll>
                      <RetidoCsll>${data.rps.servico.valores.retidoCsll}</RetidoCsll>
                      <RetidoCpp>${data.rps.servico.valores.retidoCpp}</RetidoCpp>
                      <RetidoOutrasRetencoes>${data.rps.servico.valores.retidoOutrasRetencoes}</RetidoOutrasRetencoes>
                      <Aliquota>${data.rps.servico.valores.aliquota}</Aliquota>
                      <DescontoIncondicionado>${data.rps.servico.valores.descontoIncondicionado}</DescontoIncondicionado>
                      <DescontoCondicionado>${data.rps.servico.valores.descontoCondicionado}</DescontoCondicionado>
                    </Valores>
                    <IssRetido>${data.rps.servico.issRetido}</IssRetido>
                    <Discriminacao>${data.rps.servico.discriminacao}</Discriminacao>
                    <CodigoMunicipio>${data.rps.servico.codigoMunicipio}</CodigoMunicipio>
                    <ExigibilidadeISS>${data.rps.servico.exigibilidadeISS}</ExigibilidadeISS>
                    <MunicipioIncidencia>${data.rps.servico.municipioIncidencia}</MunicipioIncidencia>
                    <ListaItensServico>
                      ${data.rps.servico.listaItensServico.map(item => `
                      <ItemServico>
                        <ItemListaServico>${item.itemListaServico}</ItemListaServico>
                        <CodigoCnae>${item.codigoCnae}</CodigoCnae>
                        <Descricao>${item.descricao}</Descricao>
                        <Tributavel>${item.tributavel}</Tributavel>
                        <Quantidade>${item.quantidade}</Quantidade>
                        <ValorUnitario>${item.valorUnitario}</ValorUnitario>
                        <ValorDesconto>${item.valorDesconto}</ValorDesconto>
                        <ValorLiquido>${item.valorLiquido}</ValorLiquido>
                        ${item.dadosDeducao ? `
                        <DadosDeducao>
                          <TipoDeducao>${item.dadosDeducao.tipoDeducao}</TipoDeducao>
                          <Cpf>${item.dadosDeducao.cpf}</Cpf>
                          <ValorTotalNotaFiscal>${item.dadosDeducao.valorTotalNotaFiscal}</ValorTotalNotaFiscal>
                          <ValorADeduzir>${item.dadosDeducao.valorADeduzir}</ValorADeduzir>
                        </DadosDeducao>
                        ` : ''}
                      </ItemServico>
                      `).join('')}
                    </ListaItensServico>
                  </Servico>
                  <Prestador>
                    <CpfCnpj>
                      <Cnpj>${data.rps.prestador.cnpj}</Cnpj>
                    </CpfCnpj>
                    <InscricaoMunicipal>${data.rps.prestador.inscricaoMunicipal}</InscricaoMunicipal>
                  </Prestador>
                  <Tomador>
                    <IdentificacaoTomador>
                      <CpfCnpj>
                        <Cnpj>${data.rps.tomador.identificacaoTomador.cnpj}</Cnpj>
                      </CpfCnpj>
                    </IdentificacaoTomador>
                    <RazaoSocial>${data.rps.tomador.razaoSocial}</RazaoSocial>
                    <Endereco>
                      <Endereco>${data.rps.tomador.endereco.endereco}</Endereco>
                      <Numero>${data.rps.tomador.endereco.numero}</Numero>
                      <Bairro>${data.rps.tomador.endereco.bairro}</Bairro>
                      <CodigoMunicipio>${data.rps.tomador.endereco.codigoMunicipio}</CodigoMunicipio>
                      <Uf>${data.rps.tomador.endereco.uf}</Uf>
                      <Cep>${data.rps.tomador.endereco.cep}</Cep>
                    </Endereco>
                    <Contato>
                      <Telefone>${data.rps.tomador.contato.telefone}</Telefone>
                      <Email>${data.rps.tomador.contato.email}</Email>
                    </Contato>
                  </Tomador>
                  <RegimeEspecialTributacao>${data.rps.regimeEspecialTributacao}</RegimeEspecialTributacao>
                  <IncentivoFiscal>${data.rps.incentivoFiscal}</IncentivoFiscal>
                </InfDeclaracaoPrestacaoServico>
              </Rps>
            </ListaRps>
          </LoteRps>
        </EnviarLoteRpsSincronoEnvio>
      </soapenv:Body>
    </soapenv:Envelope>
  `
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

  public async enviarNfse(data: Data): Promise<string> {
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
        const response = await axios.post(
          'https://medianeira.oxy.elotech.com.br/iss-ws/nfseService', xmlAssinado,
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
        'https://medianeira.oxy.elotech.com.br/iss-ws/nfseService', xmlAssinado,
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
    `
  }

  public async cancelarNfse(data: DataCancelarNfseEnvio): Promise<string> {
    try {
      const xmlCancelamento = await this.gerarXmlCancelarNfseEnvio(data);

      const xmlAssinado = await this.assinarXmlCancelar(xmlCancelamento);

      const response = await axios.post(
        'https://medianeira.oxy.elotech.com.br/iss-ws/nfseService', xmlAssinado,
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

  private async gerarXmlSubstituirNfseEnvio(data: DataSubstituirNfse): Promise<string> {
    return`
      <SubstituirNfseEnvio xmlns="http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd">
      <IdentificacaoRequerente>
      <CpfCnpj>
      <Cnpj>02847928000131</Cnpj>
      </CpfCnpj>
      <InscricaoMunicipal>59939</InscricaoMunicipal>
      <Senha>GGARCY9A</Senha>
      <Homologa>false</Homologa>
      </IdentificacaoRequerente>
      <Pedido>
      <InfPedidoCancelamento>
      <IdentificacaoNfse>
      <Numero>1049</Numero>
      <CpfCnpj>
      <Cnpj>02847928000131</Cnpj>
      </CpfCnpj>
      <InscricaoMunicipal>1047</InscricaoMunicipal>
      <CodigoMunicipio>4119905</CodigoMunicipio>
      </IdentificacaoNfse>
      <ChaveAcesso>27a68ba3b8b01ae40648b52f5485ec03</ChaveAcesso>
      <CodigoCancelamento>4</CodigoCancelamento>
      </InfPedidoCancelamento>
      </Pedido>
      <DeclaracaoPrestacaoServico>
      <InfDeclaracaoPrestacaoServico>
      <Rps>
      <IdentificacaoRps>
      <Numero>6</Numero>
      <Serie>RPS</Serie>
      <Tipo>1</Tipo>
      </IdentificacaoRps>
      <DataEmissao>2017-03-23</DataEmissao>
      <Status>1</Status>
      </Rps>
      <Competencia>2017-03-01</Competencia>
      <Servico>
      <Valores>
      <ValorServicos>1000.00</ValorServicos>
      <AliquotaPis>1</AliquotaPis>
      <RetidoPis>2</RetidoPis>
      <ValorPis>10</ValorPis>
      <AliquotaCofins>1.84</AliquotaCofins>
      <RetidoCofins>2</RetidoCofins>
      <ValorCofins>18.40</ValorCofins>
      <AliquotaInss>2.11</AliquotaInss>
      <RetidoInss>2</RetidoInss>
      <ValorInss>21.10</ValorInss>
      <AliquotaIr>2.49</AliquotaIr>
      <RetidoIr>2</RetidoIr>
      <ValorIr>24.90</ValorIr>
      <AliquotaCsll>0.5</AliquotaCsll>
      <RetidoCsll>2</RetidoCsll>
      <ValorCsll>5</ValorCsll>
      <AliquotaCpp>0.7</AliquotaCpp>
      <RetidoCpp>2</RetidoCpp>
      <ValorCpp>7</ValorCpp>
      <OutrasRetencoes>9</OutrasRetencoes>
      <RetidoOutrasRetencoes>2</RetidoOutrasRetencoes>
      </Valores>
      <IssRetido>2</IssRetido>
      <Discriminacao>TESTE</Discriminacao>
      <CodigoNbs>1.0022</CodigoNbs>
      <CodigoMunicipio>4119905</CodigoMunicipio>
      <ExigibilidadeISS>1</ExigibilidadeISS>
      <MunicipioIncidencia>4119905</MunicipioIncidencia>
      <ListaItensServico>
      <ItemServico>
      <ItemListaServico>408</ItemListaServico>
      <CodigoCnae>8630503</CodigoCnae>
      <Descricao>TERAPIA</Descricao>
      <Tributavel>1</Tributavel>
      <Quantidade>1</Quantidade>
      <ValorUnitario>1000.00</ValorUnitario>
      <ValorLiquido>1000.00</ValorLiquido>
      </ItemServico>
      </ListaItensServico>
      </Servico>
      <Prestador>
      <CpfCnpj>
      <Cnpj>02847928000131</Cnpj>
      </CpfCnpj>
      <InscricaoMunicipal>59939</InscricaoMunicipal>
      </Prestador>
      <Tomador>
      <IdentificacaoTomador>
      <CpfCnpj>
      <Cnpj>03584427001659</Cnpj>
      </CpfCnpj>
      <InscricaoMunicipal>47246</InscricaoMunicipal>
      </IdentificacaoTomador>
      <RazaoSocial>SERVICO SOCIAL DO COMERCIO</RazaoSocial>
      <Endereco>
      <Endereco>THEODORO ROSAS</Endereco>
      <Numero>1247</Numero>
      <Bairro>CENTRO</Bairro>
      <CodigoMunicipio>4119905</CodigoMunicipio>
      <Uf>PR</Uf>
      <Cep>84010180</Cep>
      </Endereco>
      <Contato>
      <Telefone>42 32225432</Telefone>
      <Email>teste@elotech.com.br</Email>
      </Contato>
      <InscricaoEstadual>47246</InscricaoEstadual>
      </Tomador>
      <IncentivoFiscal>2</IncentivoFiscal>
      </InfDeclaracaoPrestacaoServico>
      </DeclaracaoPrestacaoServico>
      </SubstituirNfseEnvio>
    `
  }

  public async SubstituirNfse(data: DataSubstituirNfse): Promise<string> {
    try {
      const xmlCancelamento = await this.gerarXmlSubstituirNfseEnvio(data);

      const xmlAssinado = await this.assinarXmlSubstituir(xmlCancelamento);

      const response = await axios.post(
        'https://medianeira.oxy.elotech.com.br/iss-ws/nfseService', xmlAssinado,
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
