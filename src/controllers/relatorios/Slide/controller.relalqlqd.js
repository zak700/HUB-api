import { db } from "../../../database/postgres.js";
import natureza from "../../../helpers/natureza.js";

async function getRelAlqLqd(req, res) {
  try {
    const { dataF, consolidado, orgao } = req.query;
    const lastDataI = req.query.dataI;
    const dataI = lastDataI || "01" + dataF.substring(2, 4);

    const output = [];

    const alq = await natureza.getCampo(
      "alq",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );

    const sortByDate = (a, b) => {
      const dateA = new Date(
        parseInt(a.content.dtAnulacaoLiq.substring(4, 8)),
        parseInt(a.content.dtAnulacaoLiq.substring(2, 4)) - 1,
        parseInt(a.content.dtAnulacaoLiq.substring(0, 2))
      );
      const dateB = new Date(
        parseInt(b.content.dtAnulacaoLiq.substring(4, 8)),
        parseInt(b.content.dtAnulacaoLiq.substring(2, 4)) - 1,
        parseInt(b.content.dtAnulacaoLiq.substring(0, 2))
      );

      return dateA - dateB;
    };

    alq.sort(sortByDate);

    alq.forEach((e) => {
      const alq = e.content;
      output.push([
        alq.dtAnulacaoLiq.substring(0, 2) +
          "/" +
          alq.dtAnulacaoLiq.substring(2, 4) +
          "/" +
          alq.dtAnulacaoLiq.substring(4, 8),
        alq.dtLiquidacao.substring(0, 2) +
          "/" +
          alq.dtLiquidacao.substring(2, 4) +
          "/" +
          alq.dtLiquidacao.substring(4, 8),
        alq.nrLiquidacao,
        natureza.toRS(parseFloat(alq.vlAnulado)),
        alq.elementoDespesa,
        alq.subElemento,
        alq.codOrgao,
      ]);
    });

    const corrected = [];

    const size = 30;

    for (let i = 0; i < output.length; i += size) {
      corrected.push({
        values: output.slice(i, i + size),
        sum: natureza.sumRS(output.slice(0, i + size).map((e) => e[3])),
        index: i + size < output.length ? i + size : output.length,
      });
    }

    res.status(200).json({ corrected });
  } catch (error) {
    console.error("error at getRelAlqLqd from controller.RelAlqLqd", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export default { getRelAlqLqd };
