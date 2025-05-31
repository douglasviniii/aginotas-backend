interface CustomerData {
  price: Number;
  name: String;
  description: String;
  status: String;
  trial_period_days: Number;
  billing_days: Number;
  statement_descriptor: String;
  Id_Plan: String;
  Id_Item: String;
  item_id: String;
  quantity: Number;
  card_id: String;
  card_descripton: String;
  subscription_id: String;
  card:{
    number: String;
    holder_name: String;
    exp_month: Number;
    exp_year: Number;
    cvv: String;
  },
  installments: Number;
  plan_id: String;
  payment_method: String;
  customer_id: String;
}

interface CustomerDataSubscription {
  card:{
    number: String;
    holder_name: String;
    exp_month: Number;
    exp_year: Number;
    cvv: String;
  },
  installments: Number;
  plan_id: String;
  payment_method: String;
  customer_id: String;
  address: {
    line_1: string;
    line_2: string;
    zip_code: string;
    city: string;
    state: string;
    country: string;
  },
  name: String;
  cnpj: String;
  municipalRegistration: String;
  email: String;
  telefone:{
    country_code:string;
    area_code:String;
    number:string;
  },
  selectedState: String;
  selectedCity: String;
}

interface CustomerClient {
  name: String;
  email: String;
  cnpj: string;
  code:string;
  document:string;
  type:string;
  document_type:string;
  selectedCity: string;
  selectedState: string;
  gender:string;
  address: {
    line_1: string;
    line_2: string;
    zip_code: string;
    city: string;
    state: string;
    country: string;
  },
    birthdate: string;
    phones: {
      home_phone: {country_code: string, area_code: string, number:string},
      mobile_phone: {country_code: string, area_code: string, number: string}
    },
    telefone:{
    country_code: string, 
    area_code: string, 
    number:string
    }
    metadata: {company: string}
}

//PLANOS
const CreatePlan = async (data: CustomerData) => {

    const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: `Basic ${process.env.TOKEN_PAGARME}`
        },
             body: JSON.stringify({
              interval: 'month',
              interval_count: 1,
              pricing_scheme: {scheme_type: 'Unit', price: 14990, mininum_price: 14990},
              quantity: null,
              name: 'NFSe recorrentes',
              currency: 'BRL',
              billing_type: 'prepaid',
              payment_methods: ['credit_card', 'boleto', 'debit_card'],
              items: [
                {name: 'NFSe recorrentes', quantity: 1, pricing_scheme: {price: 14990}},
              ],
              metadata: {id: 'NFSe recorrentes'},
              description: 'Emissao Automatizada NFSe',
              trial_period_days: 7,
              statement_descriptor: 'Aginotas'
            }) 
      };
      
      const response = await fetch(`${process.env.PAGARME_API_URL_PLAN}`, options);

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        const errorBody = await response.text(); 
        console.error('Erro na requisição:', errorBody);
        throw new Error('Erro na requisição: ' + errorBody);
      }
}

/* const EditPlan = async (data: object) => {

    const options = {
        method: 'PUT',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: `Basic ${process.env.TOKEN_PAGARME}`
        },
        body: JSON.stringify({
          interval: 'month',
          interval_count: 1,
          name: 'nome do plano',
          status: 'active',
          currency: 'BRL',
          billing_type: 'exact_day',
          billing_days: [16],
          payment_methods: ['credit_card'],
          trial_period_days: 15
        })
      };
      
      const response = await fetch(`${process.env.PAGARME_API_URL_PLAN}/Id_aqui`, options);

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error('Erro na requisição: ' + response);
      }
} */


const EditItemPlan = async (data: CustomerData) =>{
  const options = {
    method: 'PUT',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Basic ${process.env.TOKEN_PAGARME}`
    },

    body: JSON.stringify({
      pricing_scheme: {scheme_type: 'Unit', price: data.price},
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      status: data.status,
    })
  };

  const response = await fetch(`${process.env.PAGARME_API_URL_PLAN}/${data.plan_id}/items/${data.item_id}`, options);

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error('Erro na requisição: ' + response);
  }

}

const EditPlan = async (data:any)=>{
  const options = {
    method: 'PUT',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Basic ${process.env.TOKEN_PAGARME}`
    },
    body: JSON.stringify({
      interval: data.interval,
      interval_count: data.interval_count,
      name: data.name,
      description: data.description,
      currency: data.currency,
      billing_type: data.billing_type,
      statement_descriptor: data.statement_descriptor,
      minimum_price: data.minimum_price,
      status: data.status,
      payment_methods: ['credit_card', 'boleto', 'debit_card'],
      trial_period_days: data.trial_period_days
    })
  };

  const response = await fetch(`${process.env.PAGARME_API_URL_PLAN}/${data.plan_id}`, options);
  console.log(response);
  
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error('Erro na requisição: ' + response);
  }  
}

const DeletePlan = async (id: string) => {

    const options = {
        method: 'DELETE',
        headers: {
          accept: 'application/json',
          authorization: `Basic ${process.env.TOKEN_PAGARME}`
        }
      };
      
      const response = await fetch(`${process.env.PAGARME_API_URL_PLAN}/${id}`, options);

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error('Erro na requisição: ' + response);
      }
}

const ListPlans = async () => {

    const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          authorization: `Basic ${process.env.TOKEN_PAGARME}`
        }
      };
      
      const response = await fetch(`${process.env.PAGARME_API_URL_PLAN}`, options);

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error('Erro na requisição: ' + response);
      }
}


//CLIENTE
/* const CreateClient = async (data: CustomerClient) => {

    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json', 'content-type': 'application/json',
            authorization: `Basic ${process.env.TOKEN_PAGARME}`
        },

        body: JSON.stringify({name: data.name, email: data.email})
      };
      
      const response = await fetch(`${process.env.PAGARME_API_URL_CUSTOMER}`, options);

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error('Erro na requisição: ' + response);
      }
} */

const CreateClient = async (data: CustomerClient) => {

    function getCurrentDateString(): string {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    //console.log("Objeto: ", data);

    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json', 'content-type': 'application/json',
            authorization: `Basic ${process.env.TOKEN_PAGARME}`
        },

        body: JSON.stringify({
          name: data.name,
          email: data.email,
          code: 'Cliente Aginotas',
          document: data.cnpj.replace(/[^\d]/g, ''),
          type: 'company',
          document_type: 'CNPJ',
          gender: 'male',
          address: {
            line_1: data.address.line_1,
            line_2: data.address.line_2,
            zip_code: data.address.zip_code,
            city: data.selectedCity,
            state: data.selectedState,
            country: 'BR'
          },
          birthdate: getCurrentDateString(),
          phones: {
            home_phone: {
              country_code: data.telefone.country_code,
              area_code: data.telefone.area_code,
              number: data.telefone.number
            },
            mobile_phone: {
              country_code: data.telefone.country_code,
              area_code: data.telefone.area_code,
              number: data.telefone.number
            }
          },
          metadata: { company: 'aginotas' }
        })
      };
      
      const response = await fetch(`${process.env.PAGARME_API_URL_CUSTOMER}`, options);

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error('Erro na requisição: ' + response);
      }
}

const ListClients = async () => {

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Basic ${process.env.TOKEN_PAGARME}`
    }
  };
    
    const response = await fetch(`${process.env.PAGARME_API_URL_CUSTOMER}`, options);

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Erro na requisição: ' + response);
    }
}

//ASSINATURA
/*  const CreateSubscription = async (data: CustomerDataSubscription) => {

  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Basic ${process.env.TOKEN_PAGARME}`
    },
    body: JSON.stringify({
      card: {
        number: data.card.number,
        holder_name: data.card.holder_name,
        exp_month: data.card.exp_month,
        exp_year: data.card.exp_year,
        cvv: data.card.cvv,
      },
      installments: data.installments,
      plan_id: data.plan_id,
      payment_method: data.payment_method,
      customer_id: data.customer_id
    })
  };
 

  const response = await fetch(`${process.env.PAGARME_API_URL_SUBSCRIPTION}`, options);

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error('Erro na requisição: ' + response);
  }  
}  */

const CreateSubscription = async (data: CustomerDataSubscription) => {

  function generateId(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  console.log("data: ",data);

  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Basic ${process.env.TOKEN_PAGARME}`
    },
    body: JSON.stringify({
      customer: {
        address: {
          country: 'BR',
          state: data.selectedState,
          city: data.selectedCity,
          zip_code: data.address.zip_code,
          line_1: data.address.line_1,
          line_2: data.address.line_2
        },
        phones: {mobile_phone: {country_code: data.telefone.country_code, area_code: data.telefone.area_code, number: data.telefone.number}},
        name: data.name,
        email: data.email,
        type: 'company',
        document: data.cnpj,
        document_type: 'CNPJ'
      },      
      //customer_id: data.customer_id,
      card: {
        billing_address: {
          line_1: data.address.line_1,
          line_2: data.address.line_2,
          zip_code: data.address.zip_code,
          city: data.selectedCity,
          state: data.selectedState,
          country: 'BR'
        },
        holder_name: data.card.holder_name,
        number: data.card.number,
        exp_month: data.card.exp_month,
        exp_year: data.card.exp_year,
        cvv: data.card.cvv
      },
      installments: 1,
      plan_id: data.plan_id,
      payment_method: 'credit_card',
      metadata: {id: generateId()},
    })
  };
 
  const response = await fetch(`${process.env.PAGARME_API_URL_SUBSCRIPTION}`, options);

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    const errorText = await response.text();
    throw new Error('Erro na requisição: ' + errorText);
  }  
}  
  
const GetSubscription = async (id: string) => {

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Basic ${process.env.TOKEN_PAGARME}`
    }
  };
    
    const response = await fetch(`${process.env.PAGARME_API_URL_SUBSCRIPTION}/${id}`, options);

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Erro na requisição: ' + response);
    }
}

const GetAllSubscriptions = async () => {

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Basic ${process.env.TOKEN_PAGARME}`
    }
  };
    
    const response = await fetch(`${process.env.PAGARME_API_URL_SUBSCRIPTION}`, options);

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Erro na requisição: ' + response);
    }
}

const CancelSubscription = async (subscription_id: string) => {

  const options = {
    method: 'DELETE',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Basic ${process.env.TOKEN_PAGARME}`
    },
    body: JSON.stringify({cancel_pending_invoices: true})
  };

    const response = await fetch(`${process.env.PAGARME_API_URL_SUBSCRIPTION}/${subscription_id}`, options);

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Erro na requisição: ' + response);
    }
}

const UpdateCardSubscription = async (data: CustomerData) => {

  const options = {
    method: 'PATCH',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Basic ${process.env.TOKEN_PAGARME}`
    },
    body: JSON.stringify({card_id: data.card_id, card: data.card_descripton})
  };

    const response = await fetch(`${process.env.PAGARME_API_URL_SUBSCRIPTION}/${data.subscription_id}/card`, options);

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Erro na requisição: ' + response);
    }
}


export default {
  CreatePlan,
  EditItemPlan,
  DeletePlan,
  ListPlans,
  CreateClient,
  ListClients,
  CreateSubscription,
  GetSubscription,
  GetAllSubscriptions,
  UpdateCardSubscription,
  CancelSubscription,
  EditPlan
};
