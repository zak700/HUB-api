import { db } from "../../../database/postgres.js";
import natureza from "../../../helpers/natureza.js";

async function getRelAnlEmp(req, res) {
  try {
    const { dataF, consolidado, orgao } = req.query;
    const lastDataI = req.query.dataI;
    const dataI = lastDataI || "01" + dataF.substring(2, 4);

    const output = [];

    const anl = await natureza.getCampo(
      "anl",
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

    anl.sort(sortByDate);

    anl.forEach((e) => {
      const anl = e.content;
      output.push([
        anl.dtAnulacao.substring(0, 2) +
          "/" +
          anl.dtAnulacao.substring(2, 4) +
          "/" +
          anl.dtAnulacao.substring(4, 8),
        anl.dtEmpenho.substring(0, 2) +
          "/" +
          anl.dtEmpenho.substring(2, 4) +
          "/" +
          anl.dtEmpenho.substring(4, 8),
        anl.nroEmpenho,
        natureza.toRS(parseFloat(anl.vlAnulacao)),
        anl.elementoDespesa,
        anl.subElemento,
        anl.codOrgao,
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
    console.error("error at getRelAnlEmp from controller.RelAnlEmp", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export default { getRelAnlEmp };
