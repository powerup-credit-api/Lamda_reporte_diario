
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const sesClient = new SESClient({ region: "us-east-2" });

exports.handler = async (event) => {
  let count = 0;

  for (const record of event.Records) {
    count++;

    let dto;
    try {
      dto = JSON.parse(record.body);
    } catch (err) {
      console.warn("Mensaje ignorado, no es JSON válido:", record.body);
      continue;
    }

    try {
      const body = `Estimado(a) Administrador,

El sistema de reportes de Crediya ha generado el consolidado diario de desempeño:

Solicitudes aprobadas: ${dto.contador}
Monto total aprobado: $${Number(dto.monto).toLocaleString("es-CO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}

Este reporte refleja el rendimiento más reciente del negocio y le permitirá tomar decisiones estratégicas de manera informada.

Atentamente,
Equipo de Análisis
Crediya
`;

      const params = {
        Source: process.env.SES_FROM_EMAIL,
        Destination: {
          ToAddresses: [process.env.REPORTE_TO_EMAIL],
        },
        Message: {
          Subject: { Data: "Reporte Diario - Rendimiento del Negocio" },
          Body: {
            Text: { Data: body },
          },
        },
      };

      await sesClient.send(new SendEmailCommand(params));
      console.log(`Reporte enviado al administrador`);
    } catch (err) {
      console.error("Error enviando reporte:", err);
    }
  }

  return `Processed ${count} messages`;
};
