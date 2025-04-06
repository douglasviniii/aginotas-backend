import { Request, Response } from 'express';

const Cnaes = async (req: Request, res: Response) => {
    try {
        const cnaes = await fetch('https://medianeira.oxy.elotech.com.br/iss-api/api/cnaes', {
            method: 'GET',
        });
        const data = await cnaes.json();
        if (!data) {
            res.status(404).send({ message: "Nenhum CNAE encontrado." });
            return;
        }
        res.status(200).send(data);
        return
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar CNAEs", error });
        return;
    }

}

const Servicos = async (req: Request, res: Response) => {
    try {
        const cnaes = await fetch('https://medianeira.oxy.elotech.com.br/iss-api/api/servicos', {
            method: 'GET',
        });
        const data = await cnaes.json();
        if (!data) {
            res.status(404).send({ message: "Nenhum SERVICO encontrado." });
            return;
        }
        res.status(200).send(data);
        return
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar Servicos", error });
        return;
    }

}

const ServicosPorCNAE = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        if (!id) {
            res.status(400).send({ message: "Nenhum ID de CNAE informado." });
            return;
        }

        const cnaes = await fetch(`https://medianeira.oxy.elotech.com.br/iss-api/api/cnaes-servicos/consultar-servico-por-cnae/${id}`, {
            method: 'GET',
        });
        const data = await cnaes.json();
        if (!data) {
            res.status(404).send({ message: "Nenhum SERVICO encontrado." });
            return;
        }
        res.status(200).send(data);
        return
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar Servico", error });
        return;
    }

}

export default {
    Cnaes,
    Servicos,
    ServicosPorCNAE,
}