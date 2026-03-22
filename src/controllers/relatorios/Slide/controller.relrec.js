import { db } from "../../../database/postgres.js";
import natureza from "../../../helpers/natureza.js";

async function getRelReceita(req, res) {
  try {
    const { dataF, consolidado, orgao } = req.query;
    const lastDataI = req.query.dataI;
    const dataI = lastDataI || "01" + dataF.substring(2, 4);

    const output = [];

    const rec = await natureza.getCampo(
      "rec",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );
/*
    const sortByDate = (a, b) => {
      const dateA = new Date(
        parseInt(a.data.substring(4, 8)),
        parseInt(a.data.substring(2, 4)) - 1,
        parseInt(a.data.substring(0, 2))
      );
      const dateB = new Date(
        parseInt(b.data.substring(4, 8)),
        parseInt(b.data.substring(2, 4)) - 1,
        parseInt(b.data.substring(0, 2))
      );

      return dateA - dateB;
    };

    rec.sort(sortByDate);
*/
    rec.forEach((e) => {
      const rec = e.content;
      output.push([
        rec.rubrica,
        rec.especificacao,
        natureza.toRS(parseFloat(rec.vlPrevistoAtualizado)),
        natureza.toRS(parseFloat(rec.vlArrecadado)),
        natureza.toRS(parseFloat(rec.vlAcumulado)),
        rec.codOrgao,
        rec.codUnidade,
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
    console.error("error at getRelReceita from controller.RelReceita", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export default { getRelReceita };
