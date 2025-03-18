interface CustomerClient {
    name: String;
    email: String;
}

const CreatePlan = async (data: object) => {

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
            pricing_scheme: {scheme_type: 'Unit', price: 49, mininum_price: 49},
            quantity: 1,
            name: 'Plano Basic',
            payment_methods: ['credit_card'],
            currency: 'BRL',
            trial_period_days: 15,
            billing_type: 'exact_day',
            billing_days: [5],
            statement_descriptor: 'Aginotas'
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

const EditPlan = async (data: object) => {

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
      
      const response = await fetch(`${process.env.PAGARME_API_URL_EDITPLAN}/Id_aqui`, options);

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
      
      const response = await fetch(`${process.env.PAGARME_API_URL_DELETEPLAN}${id}`, options);

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error('Erro na requisição: ' + response);
      }
}

const ListPlans = async (id: string) => {

    const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          authorization: `Basic ${process.env.TOKEN_PAGARME}`
        }
      };
      
      const response = await fetch(`${process.env.PAGARME_API_URL_LISTPLAN}`, options);

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error('Erro na requisição: ' + response);
      }
}

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

export default {CreatePlan,EditPlan,DeletePlan,ListPlans,CreateClient};