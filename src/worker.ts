import cron from "node-cron";
import DataBase from './Database/DataBase.ts';
import Scheduling from './Controllers/SchedulingController.ts'
import FinancialController from './Controllers/FinancialController.ts';

const startWorker = async () => {
  await DataBase();
  cron.schedule("0 0 * * *", async () => {
    console.log("Iniciando a verificação dos agendamentos...");
    await Scheduling.scheduling_controller(); // executando agendamentos
    await Scheduling.scheduling_controller_admin();
    console.log("Finalização da verificação dos agendamentos...");
    await FinancialController.ExpirationCheck();
  }, {
    timezone: "America/Sao_Paulo"
  });

  console.log("Worker iniciado e aguardando agendamento diário às 00:00.");
};

startWorker();
