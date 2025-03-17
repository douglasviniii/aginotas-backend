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


interface NfseData {
  numeroLote: string;
  cnpjPrestador: string;
  inscricaoMunicipal: string;
  numeroRps: string;
  dataEmissao: string;
  valor: number;
  aliquota: number;
  valorIss: number;
  itemListaServico: string;
  descricaoServico: string;
  codigoMunicipio: string;
  cnpjTomador: string;
  razaoTomador: string;
  endereco: string;
  numero: string;
  bairro: string;
  uf: string;
  cep: string;
  telefone: string;
  email: string;
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

  // Gera o XML da NFS-e
  private gerarXmlNfse(dados: NfseData): string {
    const obj = {
      EnviarLoteRpsEnvio: {
        $: { xmlns: 'http://www.abrasf.org.br/nfse.xsd' },
        LoteRps: {
          $: { Id: 'Lote123', versao: '2.03' },
          NumeroLote: dados.numeroLote,
          CpfCnpj: { Cnpj: dados.cnpjPrestador },
          InscricaoMunicipal: dados.inscricaoMunicipal,
          QuantidadeRps: 1,
          ListaRps: {
            Rps: {
              InfDeclaracaoPrestacaoServico: {
                $: { Id: 'Rps123' },
                Rps: {
                  IdentificacaoRps: {
                    Numero: dados.numeroRps,
                    Serie: '001',
                    Tipo: '1'
                  },
                  DataEmissao: dados.dataEmissao,
                  Status: '1'
                },
                Servico: {
                  Valores: {
                    ValorServicos: dados.valor,
                    Aliquota: dados.aliquota,
                    ValorIss: dados.valorIss
                  },
                  ItemListaServico: dados.itemListaServico,
                  Discriminacao: dados.descricaoServico,
                  CodigoMunicipio: dados.codigoMunicipio
                },
                Prestador: {
                  CpfCnpj: { Cnpj: dados.cnpjPrestador },
                  InscricaoMunicipal: dados.inscricaoMunicipal
                },
                Tomador: {
                  IdentificacaoTomador: {
                    CpfCnpj: { Cnpj: dados.cnpjTomador }
                  },
                  RazaoSocial: dados.razaoTomador,
                  Endereco: {
                    Endereco: dados.endereco,
                    Numero: dados.numero,
                    Bairro: dados.bairro,
                    CodigoMunicipio: dados.codigoMunicipio,
                    Uf: dados.uf,
                    Cep: dados.cep
                  },
                  Contato: {
                    Telefone: dados.telefone,
                    Email: dados.email
                  }
                }
              }
            }
          }
        }
      }
    };

    const builder = new Builder({ headless: true });
    return builder.buildObject(obj);
  }

  // Gera o XML de consulta
  private gerarXmlConsulta(numeroNfse: string, cnpjPrestador: string): string {
    return `
      <ConsultarNfseEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
        <Prestador>
          <Cnpj>${cnpjPrestador}</Cnpj>
        </Prestador>
        <NumeroNfse>${numeroNfse}</NumeroNfse>
      </ConsultarNfseEnvio>
    `;
  }

  // Gera o XML de cancelamento
  private gerarXmlCancelamento(numeroNfse: string, cnpjPrestador: string, justificativa: string): string {
    return `
      <CancelarNfseEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
        <Pedido>
          <InfPedidoCancelamento>
            <IdentificacaoNfse>
              <Numero>${numeroNfse}</Numero>
            </IdentificacaoNfse>
            <Prestador>
              <Cnpj>${cnpjPrestador}</Cnpj>
            </Prestador>
            <Justificativa>${justificativa}</Justificativa>
          </InfPedidoCancelamento>
        </Pedido>
      </CancelarNfseEnvio>
    `;
  }

  // Assina o XML com a chave privada
  private async assinarXml(xml: string): Promise<string> {
    try {
      const sig = new SignedXml({canonicalizationAlgorithm: "http://www.w3.org/2001/10/xml-exc-c14n#"});
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

  // Envia a NFS-e
  public async enviarNfse(dados: NfseData): Promise<string> {
    try {

      const xml = this.gerarXmlNfse(dados);
      const xsd = fs.readFileSync('./src/services/xmldsig-core-schema20020212.xsd', 'utf8');

      const xmlDoc = libxmljs.parseXml(xml);
      const xsdDoc = libxmljs.parseXml(xsd);
      
      const validationErrors = xmlDoc.validate(xsdDoc);

      if (validationErrors) {
        console.error('Erros de validação:', validationErrors);

      } else {
        console.log('XML válido!');

        const xmlAssinado = await this.assinarXml(xml);

/*         const client = await soap.createClientAsync("https://medianeira.oxy.elotech.com.br/iss-ws/nfseService");
        
        const args = {
            xml: xmlAssinado,
            username: '',
            password: '',
        };

        const [result] = await client.EnviarLoteRpsAsync(args);

        const jsonResponse = await parseStringPromise(result);

        const objxml = JSON.stringify(jsonResponse, null, 2);

        return objxml; // Retorna a resposta da API */
      
        const headers = {
          "Content-Type": "text/xml; charset=utf-8",
          "SOAPAction": "", // Algumas APIs SOAP exigem esse cabeçalho
        };
    
        const response = await axios.post(`${process.env.ELOTECH_API_URL}`, xmlAssinado, { headers });
        console.log(response);

        return 'ok';

      }
      return 'Erro de validação no XML'; 

    } catch (error) {
      console.error('Erro ao enviar Nfse:', error);
      throw new Error('Falha ao enviar Nfse.');
    }
  }

//const arquivo = path.join('./src/services/nota_fiscal_gerada.xml');
//fs.writeFileSync(arquivo, result, 'utf8');

  // Consulta a NFS-e
  public async consultarNfse(numeroNfse: string, cnpjPrestador: string): Promise<string> {
    try {
      const xmlConsulta = this.gerarXmlConsulta(numeroNfse, cnpjPrestador);
      const xmlAssinado = await this.assinarXml(xmlConsulta);

      const client = await soap.createClientAsync(this.wsdlUrl);
      const result = await client.ConsultarNfseAsync({ xml: xmlAssinado });

      return result;
    } catch (error) {
      console.error('Erro na consulta da NFS-e:', error);
      throw new Error('Falha ao consultar NFS-e.');
    }
  }

  // Cancela a NFS-e
  public async cancelarNfse(numeroNfse: string, cnpjPrestador: string, justificativa: string): Promise<string> {
    try {
      const xmlCancelamento = this.gerarXmlCancelamento(numeroNfse, cnpjPrestador, justificativa);
      const xmlAssinado = await this.assinarXml(xmlCancelamento); 

      const client = await soap.createClientAsync(this.wsdlUrl);
      const result = await client.CancelarNfseAsync({ xml: xmlAssinado });

      return result;
    } catch (error) {
      console.error('Erro no cancelamento da NFS-e:', error);
      throw new Error('Falha ao cancelar NFS-e.');
    }
  }
}

export default new NfseService();