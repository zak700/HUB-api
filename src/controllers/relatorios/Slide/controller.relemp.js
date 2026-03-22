import { db } from "../../../database/postgres.js";
import natureza from "../../../helpers/natureza.js";

async function getRelEmp(req, res) {
  try {
    const { dataF, consolidado, orgao } = req.query;
    const lastDataI = req.query.dataI;
    const dataI = lastDataI || "01" + dataF.substring(2, 4);

    const { empType } = req.params;

    const output = [];

    const emp = await natureza.filtrarPerm(
      await natureza.getCampo("emp", "m", orgao, consolidado, dataI, dataF),
      "tpEmpenho",
      [String(empType).padStart(2, "0")]
    );

    const sortByDate = (a, b) => {
      const dateA = new Date(
        parseInt(a.content.dtEmpenho.substring(4, 8)),
        parseInt(a.content.dtEmpenho.substring(2, 4)) - 1,
        parseInt(a.content.dtEmpenho.substring(0, 2))
      );
      const dateB = new Date(
        parseInt(b.content.dtEmpenho.substring(4, 8)),
        parseInt(b.content.dtEmpenho.substring(2, 4)) - 1,
        parseInt(b.content.dtEmpenho.substring(0, 2))
      );

      return dateA - dateB;
    };

    emp.sort(sortByDate);

    emp.forEach((e) => {
      const emp = e.content;
      output.push([
        emp.dtEmpenho.substring(0, 2) +
          "/" +
          emp.dtEmpenho.substring(2, 4) +
          "/" +
          emp.dtEmpenho.substring(4, 8),
        emp.nroEmpenho,
        emp.tpEmpenho,
        natureza.toRS(parseFloat(emp.vlBruto)),
        emp.elementoDespesa,
        emp.subElemento,
        emp.codSTN,
        emp.codOrgao,
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
    console.error("error at getRelEmp from controller.RelEmp", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export default { getRelEmp };
