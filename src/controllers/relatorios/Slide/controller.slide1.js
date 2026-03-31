//-- DEMONSTRATIVO DAS RECEITAS E DESPESAS COM MDE-------------//

import { db } from "../../../database/postgres.js";
import natureza from "../../../helpers/natureza.js";

async function getSlide1(req, res) {
  try {
    const { dataF, consolidado } = req.query;
    const dataI = "01" + dataF.substring(2, 4);
    const orgao = req.query["orgao[codOrgao]"];
    const orgaoType = req.query["orgao[type]"];

    const output = {};

    const meses = [
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

    output.dateOptions = {
      ano: new Date().getFullYear(),
      dia: new Date().getDate(),
      mes: meses[new Date().getMonth()],
      mesNumero: String(new Date().getMonth() + 1).padStart(2, "0"),
      dataF: dataF.substring(0, 2),
      dataFMes: meses[parseInt(dataF.substring(0, 2)) - 1],
      dataFAno: natureza.dataToYear(dataF),
      quadrimestre: Math.ceil(parseInt(dataF.substring(0, 2)) / 4),
    };

    const rub_anexo1 = (await db("rubricas").select("*"))[0].anexo1;

    const recO = await natureza.getCampo(
      "recO",
      "y",
      orgao,
      consolidado,
      dataI,
      dataF
    );
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

    const balanco = (rubrica) => {
      const filteredRecO = natureza.filtrarPerm(
        recO,
        "rubrica",
        rub_anexo1[rubrica]
      );
      const filteredRec = natureza.filtrarPerm(
        rec,
        "rubrica",
        rub_anexo1[rubrica]
      );
      const filteredAre = natureza.filtrarPerm(
        are,
        "rubrica",
        rub_anexo1[rubrica]
      );

      const subRecO = natureza.sub([
        {
          campo: filteredRecO,
          toSub: "vlPrevisto",
        },
        {
          campo: filteredAre,
          toSub: "vlAnulacao",
        },
      ]);
      const subRec = natureza.sub([
        {
          campo: filteredRec,
          toSub: "vlArrecadado",
        },
        {
          campo: filteredAre,
          toSub: "vlAnulacao",
        },
      ]);

      const div =
        (
          (parseInt(subRec.replaceAll(",", "").replaceAll(".", "")) /
            parseInt(subRecO.replaceAll(",", "").replaceAll(".", ""))) *
          100
        ).toFixed(2) + "%";

      return [
        subRecO,
        subRec,
        natureza.subRS([subRecO, subRec])[0],
        div.replace(".", ","),
      ];
    };

    output.balanco_orcamentario = [];

    output.balanco_orcamentario.push(
      ...[balanco("impostos"), balanco("taxas")]
    );

    output.balanco_orcamentario_soma = natureza.sumRS(
      output.balanco_orcamentario
    );

    const balancoSize = output.balanco_orcamentario_soma.length - 1;

    output.balanco_orcamentario_soma[balancoSize] = String(
      (
        (parseInt(
          output.balanco_orcamentario_soma[1]
            .replaceAll(",", "")
            .replaceAll(".", "")
        ) /
          parseInt(
            output.balanco_orcamentario_soma[0]
              .replaceAll(",", "")
              .replaceAll(".", "")
          )) *
        100
      ).toFixed(2)
    ).replace(".", ",");

    output.balanco_orcamentario_soma.forEach((e, i) => {
      output.balanco_orcamentario_soma[i] = {
        text: e + (i === balancoSize ? "%" : ""),
        options: { align: "right" },
      };
    });

    output.balanco_orcamentario.forEach((e, i) => {
      output.balanco_orcamentario[i] = e.map((e) => {
        return {
          text: e,
          options: { align: "right" },
        };
      });
    });

    return res.status(200).json({
      output: output,
      data37: String(parseInt(natureza.dataToYear(dataI)) - 1),
    });
  } catch (error) {
    console.error("error at getRreoAnexo from controller.anexo.4", error);
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default { getSlide1 };