// src/worker.ts
import cron from "node-cron";
import DataBase from './Database/DataBase.ts';
import Scheduling from './Controllers/SchedulingController.ts'

(async () => {
  console.log("⏳ Inicializando worker...");

  await DataBase();

  cron.schedule("0 0 * * *", async () => {
    console.log("🚀 Executando scheduling_controller à meia-noite");
    try {
      await Scheduling.scheduling_controller();
    } catch (error) {
      console.error("❌ Erro ao executar scheduling:", error);
    }
  }, {
    timezone: "America/Sao_Paulo"
  });

  console.log("✅ Worker pronto com cron agendado");
})();
