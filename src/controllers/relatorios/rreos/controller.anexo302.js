import { db } from "../../../database/postgres.js";
import natureza from "../../../helpers/natureza.js";

async function getRreoAnexo(req, res) {
  try {
    const { dataF, orgao, consolidado, type } = req.query;
    const output = {
      months: [],
      response: [],
    };
    const dataI = dataF.substring(0, 2) + (dataF.substring(2, 4) - 1);
    // console.log(dataI)
    const year = natureza.dataToYear(dataF);
    const month = dataF.substring(0, 2);
    const months = [
      "janeiro",
      "fevereiro",
      "março",
      "abril",
      "maio",
      "junho",
      "julho",
      "agosto",
      "setembro",
      "outubro",
      "novembro",
      "dezembro",
    ];
    const dataUsing = [];
    for (let i = 11; i >= 0; i--) {
      const fixedMonth = month - 1 - i < 0 ? month - 1 - i + 12 : month - 1 - i;
      output.months.push(
        `${String(months[fixedMonth]).substring(0, 3).toUpperCase()}/${
          month - 1 - i < 0 ? year - 1 : year
        }`
      );
      dataUsing.push(
        String(fixedMonth + 1).padStart(2, "0") +
          (month - 1 - i < 0
            ? String(year - 1).substring(2, 4)
            : year.substring(2, 4))
      );
    }

    const rec = await natureza.getCampo(
      "rec",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );

    const are = await natureza.getCampo(
      "are",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );

    const findDiv = (arr) => {
      let div = String(
        ((natureza.toInt(arr[1]) / natureza.toInt(arr[0])) * 100).toFixed(2)
      ).replace(".", ",");

      if (div === "Infinity" || div === "NaN") div = "0,00";

      return [...arr, div + "%"];
    };

    const leftAlign = (string) => {
      return { text: string, options: { align: "left" } };
    };

    //-- RECEITAS CORRENTE LIQUIDA - ANEXO 3 ----------------------------//

    const rub_anexo3 = (await db("rubricas").select("*"))[0].anexo3;

    const filtroRCL_3 = (rubrica) => {
      const filteredRCL_3Rec = natureza.filtrarPerm(
        rec,
        "rubrica",
        rub_anexo3[rubrica]
      );
      const filteredRCL_3Are = natureza.filtrarPerm(
        are,
        "rubrica",
        rub_anexo3[rubrica]
      );

      const subRCL_3Rec = natureza.sub([
        {
          campo: filteredRCL_3Rec,
          toSub: "vlArrecadado",
        },
        {
          campo: filteredRCL_3Are,
          toSub: "vlAnulacao",
        },
      ]);

      return [subRCL_3Rec];
    };

    output.receitasRCL_3 = [
      {
        name: "IPTU",
        values: filtroRCL_3("iptu"),
      },
    ];

    return res.status(200).json({
      output: output,
      data37: String(parseInt(natureza.dataToYear(dataI)) - 1),
    });
  } catch (error) {
    console.error("error at getRreoAnexo3 from controller.anexo.3", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export default { getRreoAnexo };
