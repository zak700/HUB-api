//-- DEMONSTRATIVO DOS RESULTADOS PRIMÁRIOS E NOMINAL---------//

import { db } from "../../../database/postgres.js";
import dataHelper from "./controller.anexo1.js";

const permReceitas = {
  //-- Codificação das Receitas Corrente-----------------------//

  //-- Impostos -----------------------------------------------//
  iptu: [
    "11125000",
    "11125001",
    "11125002",
    "11125003",
    "11125004",
    "71125000",
  ],

  // -- ISS ---------------------------------------------------//
  iss: [
    "11145110",
    "11145111",
    "11145112",
    "11145113",
    "11145114",
    "11145120",
    "71145110",
    "71145120",
  ],

  //-- ITBI----------------------------------------------------//
  itbi: ["11125300", "11125301", "71125300"],

  // -- IRRF---------------------------------------------------//
  irrf: ["11130300", "11130341", "71130300"],

  // -- Outros Impostos, Taxas e Contribuições de Melhoria-----//
  outrosImpostosTaxas: [
    "11125000",
    "11145110",
    "11145120",
    "11125300",
    "11130300",
    "11210101",
    "11210102",
    "11210103",
    "11210104",
    "11210401",
    "11215001",
    "11215002",
    "11215003",
    "11215004",
    "11220101",
    "11220102",
    "12415001",
    "71125000",
    "71145110",
    "71145120",
    "71125300",
    "71130300",
  ],

  //-- Contribuições--------------------------------------------//
  contribuicoes: ["12150111", "12160311"],

  //-- Aplicações Financeira (II)-------------------------------//
  aplicacaoFinanceira: [
    "13210100",
    "13210101",
    "13210200",
    "13210300",
    "13210400",
    "13210500",
    "13299900",
    "73210100",
    "73210200",
    "73210300",
    "73210400",
    "73210500",
    "73299900",
  ],

  //-- Outras Receitas Patrimoniais--------------------------//
  cessaoUsoImovPublico: ["13110201"],
  delegacoesPrincipal: ["13399901"],

  //-- Transferências Correntes--------------------------------//

  //-- Cota Parte FPM------------------------------------------//
  cotaParteFPM: ["17115110", "17115111", "17115120", "77115110", "77115120"],
  //-- Cota Parte ICMS-----------------------------------------//
  cotaParteICMS: ["17215000", "17215001", "77215000"],
  //-- Cota Parte IPVA-----------------------------------------//
  cotaParteIPVA: ["17215100", "17215101", "77215100"],
  //-- Cota Parte ITR------------------------------------------//
  cotaParteITR: ["17115200", "17115201", "77115200"],
  //-- Transferência da LC 61/1989-----------------------------//
  transferenciaCIDE: ["17215200", "17215301", "77215200"],
  //-- Transferências do FUNDEB--------------------------------//
  transferenciaFUNDEB: ["17515000", "17515001", "77150000"],
  //-- Outras transferências Correntes-------------------------//
  outraTransfCorrente: [
    "17115120",
    "17115201",
    "17125241",
    "17135011",
    "17135021",
    "17135031",
    "17135041",
    "17135111",
    "17145001",
    "17145201",
    "17145301",
    "17165001",
    "17195801",
    "17199901",
    "17215000",
    "17215201",
    "17235001",
    "17245101",
    "17919901",
    "77115110",
    "77115120",
    "77215100",
    "77115200",
  ],
  //-- Outras Receitas Financeiras (III)--------------------------------//
  outrasReceitasFinanceiras: [
    "16410100",
    "16410300",
    "19110101",
    "19990301",
    "19991221",
    "76410100",
    "76410300",
    "79220120",
    "79220640",
    "79991100",
    "79999930",
  ],
  //-- Receitas Correntes Restantes--------------------------------//
  receitasCorrentesRestantes: [
    "19220120",
    "19220640",
    "19991100",
    "19999930",
    "79220120",
    "79220640",
  ],

  //-- Receitas Primárias Correntes (V)-----------------------//
  primariasFontesRPPS: [
    "12150111",
    "12150121",
    "72150211",
    "72150212",
    "72155111",
  ],

  //-- Receitas Não Primárias Correntes (VI)-------------------//
  aplicacaoFinanceiraRPPS: ["13210401"],

  //-- Operações de Crédito - (VIII)---------------------------//
  operacoesCredito: ["21120101", "21125001", "21125101", "21125201"],

  //-- Amortização de Emprestimos - (IX)-----------------------//
  amortizacaoEmprestimos: [""],

  //-- Outras Transferências de Capital -----------------------//
  amortizacaoEmprestimos: ["24199901"],

  //-- DESPESAS Pessoal e Encargos Sociais---------------------//

  pessoaleEncargosSocial: [
    "319001",
    "319003",
    "319004",
    "319011",
    "319012",
    "319013",
    "319016",
    "319091",
    "319092",
    "319094",
    "319096",
  ],

  demaisDespesasCorrente: [
    "329022",
    "329021",
    "335041",
    "335043",
    "339008",
    "339014",
    "339030",
    "339032",
    "339033",
    "339034",
    "339035",
    "339036",
    "339037",
    "339039",
    "339040",
    "339041",
    "339042",
    "339043",
    "339045",
    "339046",
    "339047",
    "339048",
    "339049",
    "339091",
    "339092",
    "339093",
    "339096",
  ],

  //-- Receita de Serviços-------------------------------------//
  receitaServicos: ["16995011"],

  //-- Dedução ------------------------------------------------//

  deducaoFUNDEB: ["95100000"],
  deducaoCotaFPM: ["917115111"],
  deducaoCotaITR: ["917115201"],
  deducaoCotaICMS: ["917215001"],
  deducaoCotaIPVA: ["917215101"],
  deducaoCotaIPI: ["917215201"],
};

async function getRreoAnexo(req, res) {
  try {
    const { dataF, orgao, consolidado, type } = req.query;
    const output = {
      months: [],
      response: [],
    };
    const rec = dataHelper.filterOrg(await db("rec").select("*"), orgao, consolidado);
    const year = dataHelper.dataToYear(dataF);
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
      // console.log(fixedMonth);
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
    // console.log(dataUsing);
    // console.log(output);

    const getInfo = (perm) => {
      const filtered = rec.filter((e) => {
        const yearData = dataHelper.dataToYear(e.data);
        const monthData = parseInt(e.data.substring(0, 2));
        return permReceitas[perm].includes(e.content.rubrica.substring(1));
      });

      let vlPrevisto = 0;

      const sum = [
        "0,00",
        "0,00",
        "0,00",
        "0,00",
        "0,00",
        "0,00",
        "0,00",
        "0,00",
        "0,00",
        "0,00",
        "0,00",
        "0,00",
      ];

      for (let i in dataUsing) {
        const usable = filtered.filter((e) => e.data === dataUsing[i]);
        if (usable.length !== 0) {
          usable.forEach((e) => {
            sum[i] = dataHelper.toRS(
              String(
                (parseInt(sum[i].replaceAll(",", "").replaceAll(".", "")) +
                  parseInt(e.content.vlArrecadado.replaceAll(",", ""))) /
                  100
              )
            );
            vlPrevisto += parseInt(
              e.content.vlPrevistoAtualizado.replaceAll(",", "")
            );
          });
        }
      }

      let total = 0;

      sum.forEach((e) => {
        total += parseInt(e.replaceAll(".", "").replaceAll(",", ""));
      });
      sum.push(
        dataHelper.toRS(String(total / 100)),
        dataHelper.toRS(String(vlPrevisto / 100))
      );
      return sum;
    };

    const zerado = [
      "0,00",
      "0,00",
      "0,00",
      "0,00",
      "0,00",
      "0,00",
      "0,00",
      "0,00",
      "0,00",
      "0,00",
      "0,00",
      "0,00",
      {
        content: "0,00",
        styles: {
          fillColor: [235, 255, 235],
        },
      },
      "0,00",
    ];

    output.response.push(
      style(
        dataHelper.sumInfo(
          [
            dataHelper.sumInfo(
              [
                getInfo("iptu"),
                getInfo("iss"),
                getInfo("itbi"),
                getInfo("irrf"),
                getInfo("outrosImposto"),
              ],
              14
            ),
            dataHelper.sumInfo(
              [
                getInfo("remuneracaoBancaria"),
                getInfo("outroReceitaPatrimonial"),
              ],
              14
            ),
            dataHelper.sumInfo(
              [
                getInfo("cotaParteFPM"),
                getInfo("cotaParteICMS"),
                getInfo("cotaParteIPVA"),
                getInfo("cotaParteITR"),
                getInfo("transferenciaCIDE"),
                getInfo("transferenciaFUNDEB"),
                getInfo("outraTransfCorrente"),
              ],
              14
            ),
            getInfo("contribuicaoSocial"),
            getInfo("outraReceitaCorrente"),
          ],
          14
        )
      ),
      style(
        dataHelper.sumInfo(
          [
            getInfo("iptu"),
            getInfo("iss"),
            getInfo("itbi"),
            getInfo("irrf"),
            getInfo("outrosImposto"),
          ],
          14
        )
      ),
      style(getInfo("iptu")),
      style(getInfo("iss")),
      style(getInfo("itbi")),
      style(getInfo("irrf")),
      style(getInfo("outrosImposto")),
      style(getInfo("contribuicaoSocial")),
      style(
        dataHelper.sumInfo(
          [getInfo("remuneracaoBancaria"), getInfo("outroReceitaPatrimonial")],
          14
        )
      ),
      style(getInfo("remuneracaoBancaria")),
      style(getInfo("outroReceitaPatrimonial")),
      zerado,
      zerado,
      style(getInfo("receitaServicos")),
      style(
        dataHelper.sumInfo(
          [
            getInfo("cotaParteFPM"),
            getInfo("cotaParteICMS"),
            getInfo("cotaParteIPVA"),
            getInfo("cotaParteITR"),
            getInfo("transferenciaCIDE"),
            getInfo("transferenciaFUNDEB"),
            getInfo("outraTransfCorrente"),
          ],
          14
        )
      ),
      style(getInfo("cotaParteFPM")),
      style(getInfo("cotaParteICMS")),
      style(getInfo("cotaParteIPVA")),
      style(getInfo("cotaParteITR")),
      style(getInfo("transferenciaCIDE")),
      style(getInfo("transferenciaFUNDEB")),
      style(getInfo("outraTransfCorrente")),
      style(getInfo("outraReceitaCorrente"))
    );

    return res.status(200).json({ output: output });
  } catch (error) {
    console.error("error at getRreoAnexo from controller.anexo.4", error);
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

function style(value = Array) {
  value[12] = {
    content: value[12],
    styles: {
      fillColor: [235, 255, 235],
    },
  };
  // console.log(value);
  return value;
}

export default { getRreoAnexo };
