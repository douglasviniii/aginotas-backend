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
    return `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nfse="http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd">
      <soapenv:Header/>
      <soapenv:Body>
        <EnviarLoteRpsSincronoEnvio xmlns="http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd">
          
          <IdentificacaoRequerente>
            <CpfCnpj>
              <Cnpj>57278676000169</Cnpj>
            </CpfCnpj>
            <InscricaoMunicipal>00898131</InscricaoMunicipal>
            <Senha>4EY3AH6Z</Senha>
            <Homologa>true</Homologa>
          </IdentificacaoRequerente>

          <LoteRps versao="2.03">
            <NumeroLote>123</NumeroLote>
            <CpfCnpj>
              <Cnpj>57278676000169</Cnpj>
            </CpfCnpj>
            <InscricaoMunicipal>00898131</InscricaoMunicipal>
            <QuantidadeRps>1</QuantidadeRps>
            <ListaRps>
              <Rps>
                <InfDeclaracaoPrestacaoServico Id="Rps123">
                  <Rps>
                    <IdentificacaoRps>
                      <Numero>456</Numero>
                      <Serie>001</Serie>
                      <Tipo>1</Tipo>
                    </IdentificacaoRps>
                    <DataEmissao>2025-03-19T19:35:00</DataEmissao>
                    <Status>1</Status>
                  </Rps>
                  <Servico>
                    <Valores>
                      <ValorServicos>100.00</ValorServicos>
                      <Aliquota>2.00</Aliquota>
                      <ValorIss>2.00</ValorIss>
                    </Valores>
                    <ItemListaServico>01.01</ItemListaServico>
                    <Discriminacao>Serviço de exemplo</Discriminacao>
                    <CodigoMunicipio>00898131</CodigoMunicipio>
                    <CodigoCnae>6201502</CodigoCnae>
                  </Servico>
                  <Prestador>
                    <CpfCnpj>
                      <Cnpj>57278676000169</Cnpj>
                    </CpfCnpj>
                    <InscricaoMunicipal>00898131</InscricaoMunicipal>
                  </Prestador>
                  <Tomador>
                    <IdentificacaoTomador>
                      <CpfCnpj>
                        <Cnpj>11769293000192</Cnpj>
                      </CpfCnpj>
                    </IdentificacaoTomador>
                    <RazaoSocial>Cliente Exemplo Ltda</RazaoSocial>
                    <Endereco>
                      <Endereco>Rua Exemplo, 123</Endereco>
                      <Numero>123</Numero>
                      <Bairro>Centro</Bairro>
                      <CodigoMunicipio>4106902</CodigoMunicipio>
                      <Uf>PR</Uf>
                      <Cep>85720068</Cep>
                    </Endereco>
                    <Contato>
                      <Telefone>45999030044</Telefone>
                      <Email>faturamento@evoluaco.com.br</Email>
                    </Contato>
                  </Tomador>
                </InfDeclaracaoPrestacaoServico>
              </Rps>
            </ListaRps>
          </LoteRps>
        </EnviarLoteRpsSincronoEnvio>
      </soapenv:Body>
    </soapenv:Envelope>
    `
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
        console.log(xmlAssinado);
        
        const response = await axios.post(
          'https://medianeira.oxy.elotech.com.br/iss-ws/nfseService', xmlAssinado,
          {
              headers: {
                  'Content-Type': 'text/xml',
                  'Accept': 'text/xml', 
                  // 'Authorization': `Basic ${Buffer.from('usuario:senha').toString('base64')}`
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


/* const client = await soap.createClientAsync("https://medianeira.iss.elotech.com.br/iss-ws/nfseService");
        
const args = {
    xml: xmlAssinado};

const [result] = await client.EnviarLoteRpsAsync(args);

const jsonResponse = await parseStringPromise(result);

const objxml = JSON.stringify(jsonResponse, null, 2); */

`
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nfse="http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd">
  <soapenv:Header/>
  <soapenv:Body>
    <EnviarLoteRpsSincronoEnvio xmlns="http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd">
      <IdentificacaoRequerente>
        <CpfCnpj>
          <Cnpj>57278676000169</Cnpj>
        </CpfCnpj>
        <InscricaoMunicipal>00898131</InscricaoMunicipal>
        <Senha>4EY3AH6Z</Senha>
        <Homologa>true</Homologa>
      </IdentificacaoRequerente>
      <LoteRps versao="2.03">
        <NumeroLote>123</NumeroLote>
        <CpfCnpj>
          <Cnpj>57278676000169</Cnpj>
        </CpfCnpj>
        <InscricaoMunicipal>00898131</InscricaoMunicipal>
        <QuantidadeRps>1</QuantidadeRps>
        <ListaRps>
          <Rps>
            <InfDeclaracaoPrestacaoServico Id="Rps123">
              <Rps>
                <IdentificacaoRps>
                  <Numero>456</Numero>
                  <Serie>001</Serie>
                  <Tipo>1</Tipo>
                </IdentificacaoRps>
                <DataEmissao>2025-03-19T19:35:00</DataEmissao>
                <Status>1</Status>
              </Rps>
              <Servico>
                <Valores>
                  <ValorServicos>100.00</ValorServicos>
                  <Aliquota>2.00</Aliquota>
                  <ValorIss>2.00</ValorIss>
                </Valores>
                <ItemListaServico>01.01</ItemListaServico>
                <Discriminacao>Serviço de exemplo</Discriminacao>
                <CodigoMunicipio>00898131</CodigoMunicipio>
                <CodigoCnae>6201502</CodigoCnae>
              </Servico>
              <Prestador>
                <CpfCnpj>
                  <Cnpj>57278676000169</Cnpj>
                </CpfCnpj>
                <InscricaoMunicipal>00898131</InscricaoMunicipal>
              </Prestador>
              <Tomador>
                <IdentificacaoTomador>
                  <CpfCnpj>
                    <Cnpj>11769293000192</Cnpj>
                  </CpfCnpj>
                </IdentificacaoTomador>
                <RazaoSocial>Cliente Exemplo Ltda</RazaoSocial>
                <Endereco>
                  <Endereco>Rua Exemplo, 123</Endereco>
                  <Numero>123</Numero>
                  <Bairro>Centro</Bairro>
                  <CodigoMunicipio>4106902</CodigoMunicipio>
                  <Uf>PR</Uf>
                  <Cep>85720068</Cep>
                </Endereco>
                <Contato>
                  <Telefone>45999030044</Telefone>
                  <Email>faturamento@evoluaco.com.br</Email>
                </Contato>
              </Tomador>
            </InfDeclaracaoPrestacaoServico>
          </Rps>
        </ListaRps>
      </LoteRps>
    </EnviarLoteRpsSincronoEnvio>
  </soapenv:Body>
</soapenv:Envelope>

`


/*     const obj = {
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
                            CodigoMunicipio: dados.codigoMunicipio,
                            CodigoCnae: '4520004'
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
                            },
                        },
                        Senha: '2685CSDK',
                        Homologacao: false
                    }
                }
            }
        }
    }
    };
    const builder = new Builder({ headless: true });
    return builder.buildObject(obj); */