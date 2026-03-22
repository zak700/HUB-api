import { db } from "../../../database/postgres.js";
import natureza from "../../../helpers/natureza.js";

async function getRelOps(req, res) {
  try {
    const { dataF, consolidado, orgao } = req.query;
    const lastDataI = req.query.dataI;
    const dataI = lastDataI || "01" + dataF.substring(2, 4);

    const { opsType } = req.params;

    const output = [];

    const ops = await natureza.filtrarPerm(
      await natureza.getCampo("ops", "m", orgao, consolidado, dataI, dataF),
      "tipoOP",
      [String(opsType)]
    );

    const sortByDate = (a, b) => {
      const dateA = new Date(
        parseInt(a.content.dtEmissao.substring(4, 8)),
        parseInt(a.content.dtEmissao.substring(2, 4)) - 1,
        parseInt(a.content.dtEmissao.substring(0, 2))
      );
      const dateB = new Date(
        parseInt(b.content.dtEmissao.substring(4, 8)),
        parseInt(b.content.dtEmissao.substring(2, 4)) - 1,
        parseInt(b.content.dtEmissao.substring(0, 2))
      );

      return dateA - dateB;
    };

    ops.sort(sortByDate);

    ops.forEach((e) => {
      const ops = e.content;
      output.push([
        ops.dtEmissao.substring(0, 2) +
          "/" +
          ops.dtEmissao.substring(2, 4) +
          "/" +
          ops.dtEmissao.substring(4, 8),
        ops.nroOP,
        ops.nroEmpenho,
        natureza.toRS(parseFloat(ops.vlOP)),
        ops.elementoDespesa,
        ops.subElemento,
        ops.codUnidade,
        ops.codOrgao,
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
    console.error("error at getRelOps from controller.RelOps", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export default { getRelOps };
