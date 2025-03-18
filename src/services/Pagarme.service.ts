interface CustomerData {
  price: Number;
  name: String;
  trial_period_days: Number;
  billing_days: Number;
  statement_descriptor: String;
  Id_Plan: String;
  Id_Item: String;
  quantity: Number;
}

interface CustomerClient {
  name: String;
  email: String;
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
            pricing_scheme: {scheme_type: 'Unit', price: data.price, mininum_price: data.price},
            quantity: 1,
            name: data.name,
            payment_methods: ['credit_card'],
            currency: 'BRL',
            trial_period_days: data.trial_period_days,
            billing_type: 'exact_day',
            billing_days: [data.billing_days],
            statement_descriptor: data.statement_descriptor
          })
      };
      
      const response = await fetch(`${process.env.PAGARME_API_URL_PLAN}`, options);

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error('Erro na requisição: ' + response);
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
      status: 'active',
      name: data.name,
      quantity: data.quantity,
    })
  };

  const response = await fetch(`${process.env.PAGARME_API_URL_PLAN}/${data.Id_Plan}/items/${data.Id_Item}`, options);

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
const CreateClient = async (data: CustomerClient) => {

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
 const CreateSubscription = async (data: CustomerData) => {

  const options = {
    method: 'POST',
    headers: {
        accept: 'application/json', 'content-type': 'application/json',
        authorization: `Basic ${process.env.TOKEN_PAGARME}`
    },

    body: JSON.stringify({
      installments: 1,
      plan_id: 'plan_lVrdaV4pCPSlyJNx',
      payment_method: 'credit_card',
      customer_id: 'cus_PjVRb3mCgCyzWBlp',

      card:{
        holder_name: 'Tony Stark',
        number: '4532464862385322',
        exp_month: 1,
        exp_year: 30,
        cvv: '903'
      }
    })
  }; 

  const response = await fetch(`${process.env.PAGARME_API_URL_SUBSCRIPTION}`, options);
  console.log(response);

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
  CreateSubscription
};