import { db } from "../../../database/postgres.js";
import natureza from "../../../helpers/natureza.js";

async function getRelLqd(req, res) {
  try {
    const { dataF, consolidado, orgao } = req.query;
    const lastDataI = req.query.dataI;
    const dataI = lastDataI || "01" + dataF.substring(2, 4);

    const { lqdType } = req.params;

    const output = [];

    const lqd = await natureza.filtrarPerm(
      await natureza.getCampo("lqd", "m", orgao, consolidado, dataI, dataF),
      "tpLiquidacao",
      [String(lqdType).padStart(1, "0")]
    );

    const sortByDate = (a, b) => {
      const dateA = new Date(
        parseInt(a.content.dtLiquidacao.substring(4, 8)),
        parseInt(a.content.dtLiquidacao.substring(2, 4)) - 1,
        parseInt(a.content.dtLiquidacao.substring(0, 2))
      );
      const dateB = new Date(
        parseInt(b.content.dtLiquidacao.substring(4, 8)),
        parseInt(b.content.dtLiquidacao.substring(2, 4)) - 1,
        parseInt(b.content.dtLiquidacao.substring(0, 2))
      );

      return dateA - dateB;
    };

    lqd.sort(sortByDate);

    lqd.forEach((e) => {
      const lqd = e.content;
      output.push([
        lqd.dtLiquidacao.substring(0, 2) +
          "/" +
          lqd.dtLiquidacao.substring(2, 4) +
          "/" +
          lqd.dtLiquidacao.substring(4, 8),
        lqd.nrLiquidacao,
        lqd.nroEmpenho,
        natureza.toRS(parseFloat(lqd.vlLiquidado)),
        lqd.elementoDespesa,
        lqd.subElemento,
        lqd.codOrgao,
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
    console.error("error at getRelLqd from controller.RelLqd", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export default { getRelLqd };
