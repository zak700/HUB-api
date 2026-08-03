import { db } from "../../../database/postgres.js";
import natureza from "../../../helpers/natureza.js";

async function getSlide2(req, res) {
  try {
    const { dataF, consolidado } = req.query;
    const lastDataI = req.query.dataI;
    const dataI = lastDataI || "01" + dataF.substring(2, 4);
    const orgao = req.query["orgao[codOrgao]"].padStart(2, "0");
    const orgaoType = req.query["orgao[type]"];
    const uoc = req.query["uoc[codUnidade]"];

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

    //    const rub_anexo1 = (await db("rubricas").select("*"))[0].anexo1;

    const rub_anexo1 = (await db("rubricas").select("*").first()).anexo1;

    const findDiv = (arr) => {
      let div = String(
        ((natureza.toInt(arr[1]) / natureza.toInt(arr[0])) * 100).toFixed(2),
      ).replace(".", ",");

      if (div === "Infinity" || div === "NaN") div = "0,00";

      return [...arr, div + "%"];
    };

    const leftAlign = (string) => {
      return { text: string, options: { align: "left" } };
    };

    //-- RECEITAS ORÇAMENTÁRIAS ------------------//

    const recO = await natureza.getCampo(
      "recO",
      "y",
      orgao,
      consolidado,
      dataI,
      dataF,
    );
    const rec = await natureza.getCampo(
      "rec",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF,
    );
    console.log("rec.length", rec.length, orgao, consolidado, dataI, dataF);
    const are = await natureza.getCampo(
      "are",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF,
    );

    const balanco = (rubrica) => {
      const filteredRecO = natureza.filtrarPerm(
        recO,
        "rubrica",
        rub_anexo1[rubrica],
      );
      const filteredRec = natureza.filtrarPerm(
        rec,
        "rubrica",
        rub_anexo1[rubrica],
      );
      const filteredAre = natureza.filtrarPerm(
        are,
        "rubrica",
        rub_anexo1[rubrica],
      );

      const subRecO = natureza.sum([
        {
          campo: filteredRecO,
          toSum: "vlPrevisto",
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

      return [subRecO, subRec, natureza.subRS([subRecO, subRec])[0]].map((e) =>
        e.replaceAll("-", ""),
      );
    };

    output.receitas = [
      {
        onGraf: false,
        styled: true,
        name: "RECEITAS CORRENTES",
        values: findDiv(
          natureza.sumRS([
            balanco("contribuicaoSocial"),
            balanco("remuneracaoBancaria"),
            balanco("outrosRessarcimentos"),
          ]),
        ),
      },
      {
        onGraf: true,
        name: leftAlign("  Contribuição p/Fundos Assistência Médica"),
        values: findDiv(natureza.sumRS([balanco("contribuicaoSocial")])),
      },
      {
        onGraf: true,
        name: leftAlign("  Remuneração de Depósitos Bancários"),
        values: findDiv(natureza.sumRS([balanco("remuneracaoBancaria")])),
      },
      {
        onGraf: true,
        name: leftAlign("  Outras Restituições - Principal"),
        values: findDiv(natureza.sumRS([balanco("outrasRestituicoes")])),
      },
    ];

    //-- DESPESAS - EMPENHOS / LIQUIDAÇÃO / PAGAS-------------------------//

    const dspO = await natureza.getCampo(
      "dspO",
      "y",
      orgao,
      consolidado,
      dataI,
      dataF,
    );
    const aoc = await natureza.getCampo(
      "aoc",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF,
    );

    const aocSum = await natureza.filtrarSubPerm(
      aoc,
      "11",
      "tipoAlteracao",
      natureza.aocSumValues,
    );

    const aocSub = await natureza.filtrarSubPerm(
      aoc,
      "11",
      "tipoAlteracao",
      natureza.aocSubValues,
    );

    const emp = await natureza.getCampo(
      "emp",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF,
    );
    const anl = await natureza.getCampo(
      "anl",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF,
    );
    const lqd = await natureza.getCampo(
      "lqd",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF,
    );
    const alq = await natureza.getCampo(
      "alq",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF,
    );
    const ops = await natureza.getCampo(
      "ops",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF,
    );
    const aop = await natureza.getCampo(
      "aop",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF,
    );

    const balancoDsp = (despesa) => {
      const filteredDspO = natureza.filtrarPerm(
        dspO,
        "codNaturezaDaDespesa",
        rub_anexo1[despesa],
      );

      const filteredAocSum = natureza.filtrarPerm(
        aocSum,
        "codNaturezaDaDespesa",
        rub_anexo1[despesa],
      );

      const filteredAocSub = natureza.filtrarPerm(
        aocSub,
        "codNaturezaDaDespesa",
        rub_anexo1[despesa],
      );

      const filteredEmp = natureza.filtrarPerm(
        emp,
        "elementoDespesa",
        rub_anexo1[despesa],
      );
      const filteredAnl = natureza.filtrarPerm(
        anl,
        "elementoDespesa",
        rub_anexo1[despesa],
      );
      const filteredLqd = natureza.filtrarPerm(
        lqd,
        "elementoDespesa",
        rub_anexo1[despesa],
      );
      const filteredAlq = natureza.filtrarPerm(
        alq,
        "elementoDespesa",
        rub_anexo1[despesa],
      );
      const filteredOps = natureza.filtrarPerm(
        natureza.filtrarPerm(ops, "elementoDespesa", rub_anexo1[despesa]),
        "tipoOP",
        ["2"],
      );
      const filteredAop = natureza.filtrarPerm(
        aop,
        "elementoDespesa",
        rub_anexo1[despesa],
      );
      const subDspO = natureza.subRS([
        natureza.sum([
          {
            campo: filteredDspO,
            toSum: "recurso",
          },
          {
            campo: filteredAocSum,
            toSum: "vlAlteracao",
          },
        ]),
        natureza.sum([
          {
            campo: filteredAocSub,
            toSum: "vlAlteracao",
          },
        ]),
      ])[0];

      const subEmp = natureza.sub([
        {
          campo: filteredEmp,
          toSub: "vlBruto",
        },
        {
          campo: filteredAnl,
          toSub: "vlAnulacao",
        },
      ]);
      const subLqd = natureza.sub([
        {
          campo: filteredLqd,
          toSub: "vlLiquidado",
        },
        {
          campo: filteredAlq,
          toSub: "vlAnulado",
        },
      ]);
      const subOps = natureza.sub([
        {
          campo: filteredOps,
          toSub: "vlOP",
        },
        {
          campo: filteredAop,
          toSub: "vlAnuladoOP",
        },
      ]);

      return [subDspO, subEmp, subLqd, subOps].map((e) =>
        e.replaceAll("-", ""),
      );
      //      return [subDspO, subEmp, subLqd, subOps];
    };

    //-- Detalhamento no Console Empenho--------------//
    const checkEmp = (string) => {
      const filteredEmp = natureza.filtrarPerm(
        emp,
        "elementoDespesa",
        rub_anexo1[string],
      );

      return {
        name: string,
        somaVlBruto: natureza.sum([
          {
            campo: filteredEmp,
            toSum: "vlBruto",
          },
        ]),
        empFiltered: filteredEmp.map((e) => {
          return {
            vlBruto: e.content.vlBruto,
            elementoDespesa: e.content.elementoDespesa,
            nroEmpenho: e.content.nroEmpenho,
            data: e.data,
          };
        }),
      };
    };

    //-- Detalhamento no Console Anulação do Empenho--------------//
    const checkAnl = (string) => {
      const filteredAnl = natureza.filtrarPerm(
        anl,
        "elementoDespesa",
        rub_anexo1[string],
      );

      return {
        name: string,
        somavlAnulacao: natureza.sum([
          {
            campo: filteredAnl,
            toSum: "vlAnulacao",
          },
        ]),
        anlFiltered: filteredAnl.map((e) => {
          return {
            vlAnulacao: e.content.vlAnulacao,
            elementoDespesa: e.content.elementoDespesa,
            nroEmpenho: e.content.nroEmpenho,
            dtAnulacao: e.content.dtAnulacao,
          };
        }),
      };
    };

    //-- Detalhamento no Console Liquidação----------//
    const checkLqd = (string) => {
      const filteredLqd = natureza.filtrarPerm(
        lqd,
        "elementoDespesa",
        rub_anexo1[string],
      );

      return {
        name: string,
        somaVlLiquidado: natureza.sum([
          {
            campo: filteredLqd,
            toSum: "vlLiquidado",
          },
        ]),
        lqdFiltered: filteredLqd.map((e) => {
          return {
            vlLiquidado: e.content.vlLiquidado,
            elementoDespesa: e.content.elementoDespesa,
            nroEmpenho: e.content.nroEmpenho,
            nrLiquidacao: e.content.nrLiquidacao,
            data: e.data,
          };
        }),
      };
    };

    //-- Detalhamento no Console Anulação da Liquidação----------//
    const checkAlq = (string) => {
      const filteredAlq = natureza.filtrarPerm(
        alq,
        "elementoDespesa",
        rub_anexo1[string],
      );

      return {
        name: string,
        somaVlAnulado: natureza.sum([
          {
            campo: filteredAlq,
            toSum: "vlAnulado",
          },
        ]),
        alqFiltered: filteredAlq.map((e) => {
          return {
            vlAnulado: e.content.vlAnulado,
            elementoDespesa: e.content.elementoDespesa,
            nrLiquidacao: e.content.nrLiquidacao,
            nrLiquidacaoANL: e.content.nrLiquidacaoANL,
            dtAnulacaoLiq: e.content.dtAnulacaoLiq,
          };
        }),
      };
    };

    output.despesas = [
      {
        onGraf: false,
        name: leftAlign("DESPESAS CORRENTES"),
        values: findDiv(
          natureza.sumRS([
            balancoDsp("pessoalEncargos"),
            balancoDsp("jurosEncargos"),
            balancoDsp("outrasDespesas"),
          ]),
        ),
      },
      {
        onGraf: true,
        name: leftAlign("  Pessoal e Encargos Sociais"),
        values: findDiv(balancoDsp("pessoalEncargos")),
      },
      {
        onGraf: true,
        name: leftAlign("  Juros e Encargos da Dívida"),
        values: findDiv(balancoDsp("jurosEncargos")),
      },
      {
        onGraf: true,
        name: leftAlign("  Outras Despesas Correntes"),
        values: findDiv(balancoDsp("outrasDespesas")),
      },
      {
        onGraf: false,
        name: leftAlign("DESPESAS DE CAPITAL"),
        values: findDiv(
          natureza.sumRS([
            balancoDsp("investimento"),
            balancoDsp("inversoesFinanceira"),
            balancoDsp("amortizacao"),
          ]),
        ),
      },
      {
        onGraf: true,
        name: leftAlign("  investimentos"),
        values: findDiv(balancoDsp("investimento")),
      },
      {
        onGraf: true,
        name: leftAlign("  Inversões Financeiras"),
        values: findDiv(balancoDsp("inversoesFinanceira")),
      },
      {
        onGraf: true,
        name: leftAlign("  Amortizações da Dívida"),
        values: findDiv(balancoDsp("amortizacao")),
      },
      {
        onGraf: true,
        name: leftAlign("RESERVA DE CONTIGENCIA"),
        values: findDiv(balancoDsp("reservaContigencia")),
      },
      {
        onGraf: false,
        name: leftAlign("TOTAL DAS DESPESAS"),
        values: findDiv(
          natureza.sumRS([
            natureza.sumRS([
              balancoDsp("pessoalEncargos"),
              balancoDsp("jurosEncargos"),
              balancoDsp("outrasDespesas"),
            ]),
            natureza.sumRS([
              balancoDsp("investimento"),
              balancoDsp("inversoesFinanceira"),
              balancoDsp("amortizacao"),
            ]),
          ]),
        ),
      },
      {
        onGraf: true,
        name: leftAlign("DESPESA INTRA-ORÇAMENTÁRIA"),
        values: findDiv(balancoDsp("despesaIntraOrcamentaria")),
      },
      {
        onGraf: false,
        name: leftAlign("TOTAL GERAL DAS DESPESAS"),
        values: findDiv(
          natureza.sumRS([
              balancoDsp("pessoalEncargos"),
              balancoDsp("jurosEncargos"),
              balancoDsp("outrasDespesas"),
              balancoDsp("investimento"),
              balancoDsp("inversoesFinanceira"),
              balancoDsp("amortizacao"),
              balancoDsp("despesaIntraOrcamentaria"),
          ]),
        ),
      },
    ];

    return res.status(200).json({
      output: output,
      data37: String(parseInt(natureza.dataToYear(dataI)) - 1),
    });
  } catch (error) {
    console.error("error at getRreoAnexo from controller.slide2", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export default { getSlide2 };
