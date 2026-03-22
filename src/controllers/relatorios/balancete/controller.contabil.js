import { db } from "../../../database/postgres.js";
import natureza from "../../../helpers/natureza.js";

async function getContabil(req, res) {
  try {
    const { dataF, consolidado } = req.query;
    const lastDataI = req.query.dataI;
    const dataI = lastDataI || "01" + dataF.substring(2, 4);
    const orgao = req.query["orgao[codOrgao]"];
    const orgaoType = req.query["orgao[type]"];

    const output = {};

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

    const dspO = await natureza.getCampo(
      "dspO",
      "y",
      orgao,
      consolidado,
      dataI,
      dataF
    );

    const aoc = await natureza.getCampo(
      "aoc",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );

    const aocSum = await natureza.filtrarSubPerm(
      aoc,
      "11",
      "tipoAlteracao",
      natureza.aocSumValues
    );

    const aocSub = await natureza.filtrarSubPerm(
      aoc,
      "11",
      "tipoAlteracao",
      natureza.aocSubValues
    );

    const emp = await natureza.getCampo(
      "emp",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );
    const anl = await natureza.getCampo(
      "anl",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );
    const lqd = await natureza.getCampo(
      "lqd",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );
    const alq = await natureza.getCampo(
      "alq",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );
    const ops = await natureza.getCampo(
      "ops",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );
    const aop = await natureza.getCampo(
      "aop",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );

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

    const orgaos = await db("orgao").select("*");

    const tipoOrgao10 = orgaos
      .filter((orgao) => orgao.content.tipoOrgao === "10")
      .map((orgao) => orgao.content.codOrgao);

    //-- L1 - RECEITAS PARA APURAÇÃO DA APLICAÇÃO EM SERVIÇOS PÚBLICOS DE SAÚDE --//

    const rub_anexo12 = (await db("rubricas").select("*"))[0].anexo12;

    const filtroFMS_1 = (rubrica) => {
      const filteredFMS_1RecO = natureza.filtrarPerm(
        recO,
        "rubrica",
        rub_anexo12[rubrica]
      );
      const filteredFMS_1Rec = natureza.filtrarPerm(
        rec,
        "rubrica",
        rub_anexo12[rubrica]
      );
      const filteredFMS_1Are = natureza.filtrarPerm(
        are,
        "rubrica",
        rub_anexo12[rubrica]
      );

      const subFMS_1RecO = natureza.sum([
        {
          campo: filteredFMS_1RecO,
          toSum: "vlPrevisto",
        },
      ]);

      const subFMS_1Rec = natureza.sub([
        {
          campo: filteredFMS_1Rec,
          toSub: "vlArrecadado",
        },
        {
          campo: filteredFMS_1Are,
          toSub: "vlAnulacao",
        },
      ]);

      return [subFMS_1RecO, subFMS_1RecO, subFMS_1Rec];
    };

    output.receitasFMS_1 = [
      {
        name: "RECEITA DE IMPOSTOS (I)",
        values: natureza.sumRS([
          filtroFMS_1("iptu"),
          filtroFMS_1("itbi"),
          filtroFMS_1("issqn"),
          filtroFMS_1("irrf"),
        ]),
      },
      {
        name: "   Impostos Predial e Territorial Urbano - IPTU",
        values: filtroFMS_1("iptu"),
      },
      {
        name: "   Imposto sobre Transmissão de Bens Intervivos - ITBI",
        values: filtroFMS_1("itbi"),
      },
      {
        name: "   Imposto sobre Serviço de Qualquer Natureza - ISS",
        values: filtroFMS_1("issqn"),
      },
      {
        name: "   Imposto de Renda Retido na Fonte - IRRF",
        values: filtroFMS_1("irrf"),
      },
      {
        name: "RECEITA DE TRANSFERÊNCIAS CONSTITUCIONAIS E LEGAIS (II)",
        values: natureza.sumRS([
          natureza.subRS([filtroFMS_1("fpm"), filtroFMS_1("deducaoFpm")]),
          filtroFMS_1("itr"),
          filtroFMS_1("ipva"),
          filtroFMS_1("icms"),
          filtroFMS_1("ipi"),
          filtroFMS_1("compesacoesFinaceiras"),
        ]),
      },
      {
        name: "   Cota-Parte FPM",
        values: natureza.subRS([filtroFMS_1("fpm"), filtroFMS_1("deducaoFpm")]),
      },
      {
        name: "   Cota-Parte ITR",
        values: filtroFMS_1("itr"),
      },
      {
        name: "   Cota-Parte IPVA",
        values: filtroFMS_1("ipva"),
      },
      {
        name: "   Cota-Parte ICMS",
        values: filtroFMS_1("icms"),
      },
      {
        name: "   Cota-Parte IPI-Exportação",
        values: filtroFMS_1("ipi"),
      },
      {
        name: "   Outras Transferências ou Compensações Financeiras Provenientes de Impostos e Transferências Constitucionais",
        values: filtroFMS_1("outrasTransferenciasCompensacoes"),
      },
      {
        name: "TOTAL DAS RECEITAS RESULTANTES DE IMPOSTOS E TRANSFERÊNCIAS E LEGAIS (III) = (I) + (II)",
        values: natureza.sumRS([
          filtroFMS_1("iptu"),
          filtroFMS_1("itbi"),
          filtroFMS_1("issqn"),
          filtroFMS_1("irrf"),
          natureza.subRS([filtroFMS_1("fpm"), filtroFMS_1("deducaoFpm")]),
          filtroFMS_1("itr"),
          filtroFMS_1("ipva"),
          filtroFMS_1("icms"),
          filtroFMS_1("ipi"),
          filtroFMS_1("outrasTransferenciasCompensacoes"),
        ]),
      },
    ];

    output.receitasFMS_1.forEach((val, index) => {
      const values = val.values;
      if (values.length !== 3) return;
      output.receitasFMS_1[index].values[3] = natureza.toRS(
        String(
          (
            (natureza.toInt(values[2], true) /
              natureza.toInt(values[1], true) || 0) * 100
          ).toFixed(2)
        )
      );
    });

    return res.status(200).json({
      output: output,
      data37: String(parseInt(natureza.dataToYear(dataI)) - 1),
    });
  } catch (error) {
    console.error("error at getRreoAnexo12 from controller.anexo.12", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export default { getContabil };
