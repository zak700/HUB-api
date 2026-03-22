import { db } from "../../../database/postgres.js";
import natureza from "../../../helpers/natureza.js";

async function getRelAopOps(req, res) {
  try {
    const { dataF, consolidado, orgao } = req.query;
    const lastDataI = req.query.dataI;
    const dataI = lastDataI || "01" + dataF.substring(2, 4);

    const output = [];

    const aop = await natureza.getCampo(
      "aop",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );

    const sortByDate = (a, b) => {
      const dateA = new Date(
        parseInt(a.content.dtAnulacao.substring(4, 8)),
        parseInt(a.content.dtAnulacao.substring(2, 4)) - 1,
        parseInt(a.content.dtAnulacao.substring(0, 2))
      );
      const dateB = new Date(
        parseInt(b.content.dtAnulacao.substring(4, 8)),
        parseInt(b.content.dtAnulacao.substring(2, 4)) - 1,
        parseInt(b.content.dtAnulacao.substring(0, 2))
      );

      return dateA - dateB;
    };

    aop.sort(sortByDate);

    aop.forEach((e) => {
      const aop = e.content;
      output.push([
        aop.dtAnulacao.substring(0, 2) +
          "/" +
          aop.dtAnulacao.substring(2, 4) +
          "/" +
          aop.dtAnulacao.substring(4, 8),
        aop.dtEmissao.substring(0, 2) +
          "/" +
          aop.dtEmissao.substring(2, 4) +
          "/" +
          aop.dtEmissao.substring(4, 8),
        aop.nroOP,
        natureza.toRS(parseFloat(aop.vlAnuladoOP)),
        aop.elementoDespesa,
        aop.subElemento,
        aop.codOrgao,
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

export default { getRelAopOps };
