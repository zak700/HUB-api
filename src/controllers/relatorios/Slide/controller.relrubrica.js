import { db } from "../../../database/postgres.js";
import natureza from "../../../helpers/natureza.js";

async function getRelRubrica(req, res) {
  try {
    const { dataF, consolidado, orgao } = req.query;
    const lastDataI = req.query.dataI;
    const dataI = lastDataI || "01" + dataF.substring(2, 4);

    const { recType } = req.params;

    const output = [];

    const rub_anexo8 = (await db("rubricas").select("*"))[0].anexo8;

    const rec = await natureza.filtrarPerm(
      await natureza.getCampo("rec", "m", orgao, consolidado, dataI, dataF),
      "rubrica",
      [String(recType)]
    );

    const balanco = (rubrica) => {
      const filteredRec = natureza.filtrarPerm(
        rec,
        "rubrica",
        rub_anexo8[rubrica]
      );
      return [];
    };

    balanco.forEach((e) => {
      const balanco = e.content;
      output.push([
        balanco.rubrica,
        balanco.especificacao,
        natureza.toRS(parseFloat(balanco.vlPrevistoAtualizado)),
        natureza.toRS(parseFloat(balanco.vlArrecadado)),
        natureza.toRS(parseFloat(balanco.vlAcumulado)),
        balanco.codOrgao,
        balanco.codUnidade,
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
    console.error("error at getRelRubrica from controller.RelRubrica", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export default { getRelRubrica };
