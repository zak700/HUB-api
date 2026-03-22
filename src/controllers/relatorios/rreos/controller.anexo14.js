import { db } from "../../../database/postgres.js";
import dataHelper from "./controller.anexo1.js";

const permReceitas = {
  //-- Codificação das Receitas Corrente-----------------------//

  //-- Impostos -----------------------------------------------//
  iptu: ["11125001", "11125002", "11125003", "11125004"],

  // -- ISS ---------------------------------------------------//
  iss: ["11145111", "11145112", "11145113", "11145114"],

  //-- ITBI----------------------------------------------------//
  itbi: ["11125301"],

  // -- IRRF---------------------------------------------------//
  irrf: ["11130341"],

  // -- Outros Impostos, Taxas e Contribuições de Melhoria-----//
  outrosImposto: [
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
  ],

  //-- Contribuição Social-------------------------------------//
  contribuicaoSocial: ["12150111", "12160311"],

  //-- Receita Patrimonial - Valores Mobiliários---------------//
  remuneracaoBancaria: ["13210101", "13210401"],
  //-- Outras Receitas Patrimoniais----------------------------//
  outroReceitaPatrimonial: ["13110201", "13399901"],
  //-- Receita de Serviços-------------------------------------//
  receitaServicos: ["16995011"],
  //-- Cota Parte FPM------------------------------------------//
  cotaParteFPM: ["17115111"],
  //-- Cota Parte ICMS-----------------------------------------//
  cotaParteICMS: ["17215001"],
  //-- Cota Parte IPVA-----------------------------------------//
  cotaParteIPVA: ["17215101"],
  //-- Cota Parte ITR------------------------------------------//
  cotaParteITR: ["17115201"],
  //-- Transferência da LC 61/1989-----------------------------//
  transferenciaCIDE: ["17215301"],
  //-- Transferências do FUNDEB--------------------------------//
  transferenciaFUNDEB: ["17515001"],

  //-- Outras transferências Correntes-------------------------//
  outraTransfCorrente: [
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
    "17215201",
    "17235001",
    "17245101",
    "17919901",
  ],
  //-- Outras Receitas Correntes-------------------------------//
  outraReceitaCorrente: ["19110101", "19990301", "19991221"],

//--Emenda Parlamentar Individual---------------------------------------//
  emendaIndividual: [2419990100], //repasse emenda deputada silvye

//-- Dedução -----------------------------------------------------------//

  //deducaoCotaFPM: ["917115111"],
  deducaoCotaFPM: ["9510000001"],
  //deducaoCotaITR: ["917115201"],
  deducaoCotaITR: ["9510000002"],
  //deducaoCotaICMS: ["917215001"],
  deducaoCotaICMS: [9510000004],
  //deducaoCotaIPVA: ["917215101"],
  deducaoCotaIPVA: ["9510000005"],
  //deducaoCotaIPI: ["917215201"],
  deducaoCotaIPI: ["9510000006"],
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
    console.error("error at getRreoAnexo from controller.anexo.2", error);
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
  
  return value;
}

export default { getRreoAnexo };
