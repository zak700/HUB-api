import { db } from "../../../database/postgres.js";

const perm = {
  pessoal: [
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

  intraOrcamentaria: ["319113", "319192", "339197"],

  pessoalIntra: ["319113", "319192"],

  juros: ["329021", "329022"],
  outras: [
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
  outrasIntra: ["339197"],

  investimento: ["449051", "449052", "449061", "449092", "449093"],
  amortizacao: ["469070", "469071"],
  inversoes: ["309030", "309031", "309032"],
  contigencia: ["999999"],
  RPPS: ["999999"],
};

const permReceitas = {
  //-- Receita Corrente-------------------------------------------//

  //-- Impostos -----------------------------------------------//
  impostos: [
    "11125001",
    "11125002",
    "11125003",
    "11125004",
    "11125301",
    "11130311",
    "11130341",
    "11145111",
    "11145112",
    "11145113",
    "11145114",
  ],
  // -- Taxas -------------------------------------------------//
  taxas: [
    "11210101",
    "11210102",
    "11210103",
    "11210104",
    "11210401",
    "11210402",
    "11215001",
    "11215002",
    "11215003",
    "11215004",
    "11220101",
    "11220102",
  ],
  //-- Contribuição de Melhoria--------------------------------//
  contribuicaoMelhoria: [
    "11300101",
    "11300202",
    "11300303",
    "11300404",
    "11309999",
  ],
  //-- Contribuição Social-------------------------------------//
  contribuicaoSocial: ["12150111", "12160311", "12415001"],
  //-- Contribuição Custeio Iluminação Pública-----------------//
  contribuicaoCIP: ["12415001"],
  //-- Exploração do Patrimônio Imobiliário--------------------//
  concessaoPermUsoBensPublico: ["13110201"],
  //-- Receita Patrimonial - Valores Mobiliários---------------//
  remuneracaoBancaria: ["13210101", "13210401"],
  //-- Delegação de Serviços Públicos Mediante Concessão------//
  outrasDelegServPublicos: ["13399901"],
  //-----Receitas de Serviços---------------------------------//
  servSaneamentoAguaBasico: ["16995011"],
  //-----Transferências da União e de suas Entidades----------------------//
  transfUniaoSuasEntidade: [
    "17115111",
    "17115121",
    "17115201",
    "17125101",
    "17125241",
    "17179901",
    "17195801",
    "17145001",
    "17145201",
    "17145301",
    "17155201",
    "17515001",
    "17165001",
    "17135011",
    "17135021",
    "17135031",
    "17135041",
    "17135051",
    "17135111",
    "17199901",
    "17235001",
  ],
  //-----Transferências Estados Distrito Federal e suas Entidades---------//
  transfEstadoSuasEntidade: [
    "17215001",
    "17215101",
    "17215201",
    "17215301",
    "17245101",
  ],
  //-----Transferências de Outras Instituições Públicas-------------------//
  transfOutraInstituicaoPublica: ["17215001", "17215101"],
  //-----Demais Transferências Correntes----------------------------------//
  demaisTransfCorrentes: ["17919901"],
  //-- Multas Administrativas, Contratuais e Judiciais--------------------//
  multaAdmContratuaisJudiciais: [
    "19110101",
    "19110611",
    "19110612",
    "19110621",
  ],
  //-- Indenizações,Restituições e Ressarcimentos-------------------------//
  indenizacaoRestRessarcimento: ["19229901"],
  //-- Demais Receitas Correntes------------------------------------------//
  demaisReceitaCorrente: ["19229901", "19990101", "19990301", "19991221"],
  //-- Operações de Crédito - Mercado Interno-----------------------------//
  operacaoCredMercadoInterno: ["21120101", "21125001", "21125101", "21125201"],
  //-- Outras Transferência da União e suas Entidades---------------------//
  outrasTransfUniaoSuasEntidadade: ["24199901"],
  //-- Receita Intra-Orçamentaria-----------------------------------------//
  receitaIntraOrcamentaria: ["72150211", "72155111"],

  //-- Dedução -----------------------------------------------------------//

  deducaoFUNDEB: ["95100000"],
  deducaoCotaFPM: ["917115111"],
  deducaoCotaITR: ["917115201"],
  deducaoCotaICMS: ["917215001"],
  deducaoCotaIPVA: ["917215101"],
  deducaoCotaIPI: ["917215201"],
};

function toRS(string) {
  const dots = (value) => {
    value = String(value);
    if (value.length <= 3) return value;
    return (
      dots(value.slice(0, value.length - 3)) +
      "." +
      value.slice(value.length - 3)
    );
  };
  let Dash = false;
  if (string.includes("-")) Dash = true;
  if (!string || string.length === 0) return "0,00";
  if (string.includes(".")) {
    return Dash
      ? "-" +
          dots(string.split(".")[0].substring(1)) +
          "," +
          string.split(".")[1].padEnd(2, "0")
      : dots(string.split(".")[0]) + "," + string.split(".")[1].padEnd(2, "0");
  } else {
    return Dash
      ? "-" + dots(string.substring(1)) + ",00"
      : dots(string) + ",00";
  }
}

async function getRreoAnexo(req, res) {
  try {
    const savedDataDSP = {};
    const savedDataREC = {};
    const output = {
      receitas: [],
      despesas: [],
      receitasIntra: [],
      DSPreceitasIntra: [],
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
    ];
    const savedCampoREC = {};
    const { dataI, dataF, orgao, consolidado, type } = req.query;
    let VI = {};

    const getCampo = async (campo, dataType) => {
      const res = filterOrg(await db(campo).select("*"), orgao, consolidado);
      if (dataType === "y") {
        return res.filter((e) => {
          return e.data >= dataToYear(dataI) && e.data <= dataToYear(dataF);
        });
      } else if (dataType === "m") {
        return res.filter((e) => {
          let returns = true;

          if (dataToYear(dataI) < dataToYear(e.data)) {
            returns = false;
          }

          if (dataToYear(dataI) === dataToYear(e.data)) {
            dataI.substring(0, 2) > e.data.substring(0, 2)
              ? (returns = false)
              : null;
          }

          if (dataToYear(dataF) > dataToYear(e.data)) {
            returns = false;
          }

          if (dataToYear(dataF) === dataToYear(e.data)) {
            dataF.substring(0, 2) < e.data.substring(0, 2)
              ? (returns = false)
              : null;
          }
          returns;
        });
      } else if (dataType === "bi") {
        return res.filter((e) => {
          let newData = "";
          if (dataF.substring(0, 2) === "01") {
            newData =
              "12" +
              String(parseInt(dataF.substring(2, 4)) - 1).padStart(2, "0");
            if (
              parseInt(newData.substring(2, 4)) <
                parseInt(dataI.substring(2, 4)) ||
              (parseInt(newData.substring(2, 4)) ==
                parseInt(dataI.substring(2, 4)) &&
                parseInt(newData.substring(0, 2)) <=
                  parseInt(dataI.substring(0, 2)))
            ) {
              newData = dataI;
            }
          } else {
            newData =
              String(parseInt(dataF.substring(0, 2)) - 1).padStart(2, "0") +
              dataF.substring(2, 4);
            if (
              parseInt(newData.substring(2, 4)) <
                parseInt(dataI.substring(2, 4)) ||
              (parseInt(newData.substring(2, 4)) ==
                parseInt(dataI.substring(2, 4)) &&
                parseInt(newData.substring(0, 2)) <=
                  parseInt(dataI.substring(0, 2)))
            ) {
              newData = dataI;
            }
          }
          return (
            String(e.data).substring(0, 2) >= newData.substring(0, 2) &&
            String(e.data).substring(2, 4) >= newData.substring(2, 4) &&
            String(e.data).substring(0, 2) <= dataF.substring(0, 2) &&
            String(e.data).substring(2, 4) <= dataF.substring(2, 4)
          );
        });
      } else {
        return;
      }
    };

    savedDataDSP.pessoal = [
      await dspOInfo(dataI, dataF, orgao, consolidado, "pessoal"),
      await aocInfo(dataI, dataF, orgao, consolidado, "pessoal"),
      await empInfo(dataI, dataF, orgao, consolidado, "pessoal", "bi"),
      await empInfo(dataI, dataF, orgao, consolidado, "pessoal"),
      await calcSaldo(dataI, dataF, orgao, consolidado, "pessoal", 1),
      await lqdInfo(dataI, dataF, orgao, consolidado, "pessoal", "bi"),
      await lqdInfo(dataI, dataF, orgao, consolidado, "pessoal"),
      await calcSaldo(dataI, dataF, orgao, consolidado, "pessoal", 2),
      await opsInfo(dataI, dataF, orgao, consolidado, "pessoal", "bi"),
      await rspInfo(dataI, dataF, orgao, consolidado, "pessoal"),
    ];
    savedDataDSP.juros = [
      await dspOInfo(dataI, dataF, orgao, consolidado, "juros"),
      await aocInfo(dataI, dataF, orgao, consolidado, "juros"),
      await empInfo(dataI, dataF, orgao, consolidado, "juros", "bi"),
      await empInfo(dataI, dataF, orgao, consolidado, "juros"),
      await calcSaldo(dataI, dataF, orgao, consolidado, "juros", 1),
      await lqdInfo(dataI, dataF, orgao, consolidado, "juros", "bi"),
      await lqdInfo(dataI, dataF, orgao, consolidado, "juros"),
      await calcSaldo(dataI, dataF, orgao, consolidado, "juros", 2),
      await opsInfo(dataI, dataF, orgao, consolidado, "juros", "bi"),
      await rspInfo(dataI, dataF, orgao, consolidado, "juros"),
    ];
    savedDataDSP.outras = [
      await dspOInfo(dataI, dataF, orgao, consolidado, "outras"),
      await aocInfo(dataI, dataF, orgao, consolidado, "outras"),
      await empInfo(dataI, dataF, orgao, consolidado, "outras", "bi"),
      await empInfo(dataI, dataF, orgao, consolidado, "outras"),
      await calcSaldo(dataI, dataF, orgao, consolidado, "outras", 1),
      await lqdInfo(dataI, dataF, orgao, consolidado, "outras", "bi"),
      await lqdInfo(dataI, dataF, orgao, consolidado, "outras"),
      await calcSaldo(dataI, dataF, orgao, consolidado, "outras", 2),
      await opsInfo(dataI, dataF, orgao, consolidado, "outras", "bi"),
      await rspInfo(dataI, dataF, orgao, consolidado, "outras"),
    ];
    savedDataDSP.investimento = [
      await dspOInfo(dataI, dataF, orgao, consolidado, "investimento"),
      await aocInfo(dataI, dataF, orgao, consolidado, "investimento"),
      await empInfo(dataI, dataF, orgao, consolidado, "investimento", "bi"),
      await empInfo(dataI, dataF, orgao, consolidado, "investimento"),
      await calcSaldo(dataI, dataF, orgao, consolidado, "investimento", 1),
      await lqdInfo(dataI, dataF, orgao, consolidado, "investimento", "bi"),
      await lqdInfo(dataI, dataF, orgao, consolidado, "investimento"),
      await calcSaldo(dataI, dataF, orgao, consolidado, "investimento", 2),
      await opsInfo(dataI, dataF, orgao, consolidado, "investimento", "bi"),
      await rspInfo(dataI, dataF, orgao, consolidado, "investimento"),
    ];
    savedDataDSP.inversoes = [
      await dspOInfo(dataI, dataF, orgao, consolidado, "inversoes"),
      await aocInfo(dataI, dataF, orgao, consolidado, "inversoes"),
      await empInfo(dataI, dataF, orgao, consolidado, "inversoes", "bi"),
      await empInfo(dataI, dataF, orgao, consolidado, "inversoes"),
      await calcSaldo(dataI, dataF, orgao, consolidado, "inversoes", 1),
      await lqdInfo(dataI, dataF, orgao, consolidado, "inversoes", "bi"),
      await lqdInfo(dataI, dataF, orgao, consolidado, "inversoes"),
      await calcSaldo(dataI, dataF, orgao, consolidado, "inversoes", 2),
      await opsInfo(dataI, dataF, orgao, consolidado, "inversoes", "bi"),
      await rspInfo(dataI, dataF, orgao, consolidado, "inversoes"),
    ];
    savedDataDSP.amortizacao = [
      await dspOInfo(dataI, dataF, orgao, consolidado, "amortizacao"),
      await aocInfo(dataI, dataF, orgao, consolidado, "amortizacao"),
      await empInfo(dataI, dataF, orgao, consolidado, "amortizacao", "bi"),
      await empInfo(dataI, dataF, orgao, consolidado, "amortizacao"),
      await calcSaldo(dataI, dataF, orgao, consolidado, "amortizacao", 1),
      await lqdInfo(dataI, dataF, orgao, consolidado, "amortizacao", "bi"),
      await lqdInfo(dataI, dataF, orgao, consolidado, "amortizacao"),
      await calcSaldo(dataI, dataF, orgao, consolidado, "amortizacao", 2),
      await opsInfo(dataI, dataF, orgao, consolidado, "amortizacao", "bi"),
      await rspInfo(dataI, dataF, orgao, consolidado, "amortizacao"),
    ];
    savedDataDSP.contigencia = [
      await dspOInfo(dataI, dataF, orgao, consolidado, "contigencia"),
      await aocInfo(dataI, dataF, orgao, consolidado, "contigencia"),
      await empInfo(dataI, dataF, orgao, consolidado, "contigencia", "bi"),
      await empInfo(dataI, dataF, orgao, consolidado, "contigencia"),
      await calcSaldo(dataI, dataF, orgao, consolidado, "contigencia", 1),
      await lqdInfo(dataI, dataF, orgao, consolidado, "contigencia", "bi"),
      await lqdInfo(dataI, dataF, orgao, consolidado, "contigencia"),
      await calcSaldo(dataI, dataF, orgao, consolidado, "contigencia", 2),
      await opsInfo(dataI, dataF, orgao, consolidado, "contigencia", "bi"),
      await rspInfo(dataI, dataF, orgao, consolidado, "contigencia"),
    ];
    savedDataDSP.intraOrcamentaria = [
      await dspOInfo(dataI, dataF, orgao, consolidado, "intraOrcamentaria"),
      await aocInfo(dataI, dataF, orgao, consolidado, "intraOrcamentaria"),
      await empInfo(
        dataI,
        dataF,
        orgao,
        consolidado,
        "intraOrcamentaria",
        "bi"
      ),
      await empInfo(dataI, dataF, orgao, consolidado, "intraOrcamentaria"),
      await calcSaldo(dataI, dataF, orgao, consolidado, "intraOrcamentaria", 1),
      await lqdInfo(
        dataI,
        dataF,
        orgao,
        consolidado,
        "intraOrcamentaria",
        "bi"
      ),
      await lqdInfo(dataI, dataF, orgao, consolidado, "intraOrcamentaria"),
      await calcSaldo(dataI, dataF, orgao, consolidado, "intraOrcamentaria", 2),
      await opsInfo(
        dataI,
        dataF,
        orgao,
        consolidado,
        "intraOrcamentaria",
        "bi"
      ),
      await rspInfo(dataI, dataF, orgao, consolidado, "intraOrcamentaria"),
    ];
    savedDataDSP.RPPS = [
      await dspOInfo(dataI, dataF, orgao, consolidado, "RPPS"),
      await aocInfo(dataI, dataF, orgao, consolidado, "RPPS"),
      await empInfo(dataI, dataF, orgao, consolidado, "RPPS", "bi"),
      await empInfo(dataI, dataF, orgao, consolidado, "RPPS"),
      await calcSaldo(dataI, dataF, orgao, consolidado, "RPPS", 1),
      await lqdInfo(dataI, dataF, orgao, consolidado, "RPPS", "bi"),
      await lqdInfo(dataI, dataF, orgao, consolidado, "RPPS"),
      await calcSaldo(dataI, dataF, orgao, consolidado, "RPPS", 2),
      await opsInfo(dataI, dataF, orgao, consolidado, "RPPS", "bi"),
      await rspInfo(dataI, dataF, orgao, consolidado, "RPPS"),
    ];
    savedDataDSP.despesas = sumInfo([
      savedDataDSP.pessoal,
      savedDataDSP.juros,
      savedDataDSP.outras,
      savedDataDSP.investimento,
      savedDataDSP.inversoes,
      savedDataDSP.amortizacao,
      savedDataDSP.contigencia,
    ]);

    // -------------------------------------------------------------
    savedCampoREC.recO = await getCampo("recO", "y");
    savedCampoREC.are = await getCampo("are", "m");
    savedCampoREC.rec = await getCampo("rec", "m");
    savedCampoREC.recBI = await getCampo("rec", "bi");

    savedDataREC.imposTaxasContribSum = sumInfo(
      [
        [
          recOInfo(savedCampoREC.recO, savedCampoREC.are, "impostos", false),
          recOInfo(savedCampoREC.recO, savedCampoREC.are, "impostos", true),
          recInfo(savedCampoREC.rec, savedCampoREC.recBI, "impostos", true),
          divInfo(
            recInfo(savedCampoREC.rec, savedCampoREC.recBI, "impostos", true),
            recOInfo(savedCampoREC.recO, savedCampoREC.are, "impostos", true)
          ),
          recInfo(savedCampoREC.rec, savedCampoREC.recBI, "impostos", false),
          divInfo(
            recInfo(savedCampoREC.rec, savedCampoREC.recBI, "impostos", false),
            recOInfo(savedCampoREC.recO, savedCampoREC.are, "impostos", true)
          ),
          subInfo(
            recOInfo(savedCampoREC.recO, savedCampoREC.are, "impostos", true),
            recInfo(savedCampoREC.rec, savedCampoREC.recBI, "impostos", false)
          ),
        ],
        [
          recOInfo(savedCampoREC.recO, savedCampoREC.are, "taxas", false),
          recOInfo(savedCampoREC.recO, savedCampoREC.are, "taxas", true),
          recInfo(savedCampoREC.rec, savedCampoREC.recBI, "taxas", true),
          divInfo(
            recInfo(savedCampoREC.rec, savedCampoREC.recBI, "taxas", true),
            recOInfo(savedCampoREC.recO, savedCampoREC.are, "taxas", true)
          ),
          recInfo(savedCampoREC.rec, savedCampoREC.recBI, "taxas", false),
          divInfo(
            recInfo(savedCampoREC.rec, savedCampoREC.recBI, "taxas", false),
            recOInfo(savedCampoREC.recO, savedCampoREC.are, "taxas", true)
          ),
          subInfo(
            recOInfo(savedCampoREC.recO, savedCampoREC.are, "taxas", true),
            recInfo(savedCampoREC.rec, savedCampoREC.recBI, "taxas", false)
          ),
        ],
        [
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "contribuicaoMelhoria",
            false
          ),
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "contribuicaoMelhoria",
            true
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "contribuicaoMelhoria",
            true
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "contribuicaoMelhoria",
              true
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "contribuicaoMelhoria",
              true
            )
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "contribuicaoMelhoria",
            false
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "contribuicaoMelhoria",
              false
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "contribuicaoMelhoria",
              true
            )
          ),
          subInfo(
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "contribuicaoMelhoria",
              true
            ),
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "contribuicaoMelhoria",
              false
            )
          ),
        ],
      ],
      7
    );
    savedDataREC.contribuicoesSum = sumInfo(
      [
        [
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "contribuicaoSocial",
            false
          ),
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "contribuicaoSocial",
            true
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "contribuicaoSocial",
            true
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "contribuicaoSocial",
              true
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "contribuicaoSocial",
              true
            )
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "contribuicaoSocial",
            false
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "contribuicaoSocial",
              false
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "contribuicaoSocial",
              true
            )
          ),
          subInfo(
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "contribuicaoSocial",
              true
            ),
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "contribuicaoSocial",
              false
            )
          ),
        ],
        [
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "contribuicaoCIP",
            false
          ),
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "contribuicaoCIP",
            true
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "contribuicaoCIP",
            true
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "contribuicaoCIP",
              true
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "contribuicaoCIP",
              true
            )
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "contribuicaoCIP",
            false
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "contribuicaoCIP",
              false
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "contribuicaoCIP",
              true
            )
          ),
          subInfo(
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "contribuicaoCIP",
              true
            ),
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "contribuicaoCIP",
              false
            )
          ),
        ],
      ],
      7
    );
    savedDataREC.recPatrimonialSum = sumInfo(
      [
        [
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "concessaoPermUsoBensPublico",
            false
          ),
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "concessaoPermUsoBensPublico",
            true
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "concessaoPermUsoBensPublico",
            true
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "concessaoPermUsoBensPublico",
              true
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "concessaoPermUsoBensPublico",
              true
            )
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "concessaoPermUsoBensPublico",
            false
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "concessaoPermUsoBensPublico",
              false
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "concessaoPermUsoBensPublico",
              true
            )
          ),
          subInfo(
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "concessaoPermUsoBensPublico",
              true
            ),
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "concessaoPermUsoBensPublico",
              false
            )
          ),
        ],
        [
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "remuneracaoBancaria",
            false
          ),
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "remuneracaoBancaria",
            true
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "remuneracaoBancaria",
            true
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "remuneracaoBancaria",
              true
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "remuneracaoBancaria",
              true
            )
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "remuneracaoBancaria",
            false
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "remuneracaoBancaria",
              false
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "remuneracaoBancaria",
              true
            )
          ),
          subInfo(
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "remuneracaoBancaria",
              true
            ),
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "remuneracaoBancaria",
              false
            )
          ),
        ],
        [
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "outrasDelegServPublicos",
            false
          ),
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "outrasDelegServPublicos",
            true
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "outrasDelegServPublicos",
            true
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "outrasDelegServPublicos",
              true
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "outrasDelegServPublicos",
              true
            )
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "outrasDelegServPublicos",
            false
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "outrasDelegServPublicos",
              false
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "outrasDelegServPublicos",
              true
            )
          ),
          subInfo(
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "outrasDelegServPublicos",
              true
            ),
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "outrasDelegServPublicos",
              false
            )
          ),
        ],
      ],
      7
    );
    savedDataREC.transfCorrentesSum = sumInfo(
      [
        [
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "transfUniaoSuasEntidade",
            false
          ),
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "transfUniaoSuasEntidade",
            true
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "transfUniaoSuasEntidade",
            true
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "transfUniaoSuasEntidade",
              true
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "transfUniaoSuasEntidade",
              true
            )
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "transfUniaoSuasEntidade",
            false
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "transfUniaoSuasEntidade",
              false
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "transfUniaoSuasEntidade",
              true
            )
          ),
          subInfo(
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "transfUniaoSuasEntidade",
              true
            ),
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "transfUniaoSuasEntidade",
              false
            )
          ),
        ],
        [
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "transfEstadoSuasEntidade",
            false
          ),
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "transfEstadoSuasEntidade",
            true
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "transfEstadoSuasEntidade",
            true
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "transfEstadoSuasEntidade",
              true
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "transfEstadoSuasEntidade",
              true
            )
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "transfEstadoSuasEntidade",
            false
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "transfEstadoSuasEntidade",
              false
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "transfEstadoSuasEntidade",
              true
            )
          ),
          subInfo(
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "transfEstadoSuasEntidade",
              true
            ),
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "transfEstadoSuasEntidade",
              false
            )
          ),
        ],
        [
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "transfOutraInstituicaoPublica",
            false
          ),
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "transfOutraInstituicaoPublica",
            true
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "transfOutraInstituicaoPublica",
            true
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "transfOutraInstituicaoPublica",
              true
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "transfOutraInstituicaoPublica",
              true
            )
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "transfOutraInstituicaoPublica",
            false
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "transfOutraInstituicaoPublica",
              false
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "transfOutraInstituicaoPublica",
              true
            )
          ),
          subInfo(
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "transfOutraInstituicaoPublica",
              true
            ),
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "transfOutraInstituicaoPublica",
              false
            )
          ),
        ],
        [
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "demaisTransfCorrentes",
            false
          ),
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "demaisTransfCorrentes",
            true
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "demaisTransfCorrentes",
            true
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "demaisTransfCorrentes",
              true
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "demaisTransfCorrentes",
              true
            )
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "demaisTransfCorrentes",
            false
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "demaisTransfCorrentes",
              false
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "demaisTransfCorrentes",
              true
            )
          ),
          subInfo(
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "demaisTransfCorrentes",
              true
            ),
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "demaisTransfCorrentes",
              false
            )
          ),
        ],
      ],
      7
    );
    savedDataREC.outrasRecCorrentesSum = sumInfo(
      [
        [
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "multaAdmContratuaisJudiciais",
            false
          ),
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "multaAdmContratuaisJudiciais",
            true
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "multaAdmContratuaisJudiciais",
            true
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "multaAdmContratuaisJudiciais",
              true
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "multaAdmContratuaisJudiciais",
              true
            )
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "multaAdmContratuaisJudiciais",
            false
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "multaAdmContratuaisJudiciais",
              false
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "multaAdmContratuaisJudiciais",
              true
            )
          ),
          subInfo(
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "multaAdmContratuaisJudiciais",
              true
            ),
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "multaAdmContratuaisJudiciais",
              false
            )
          ),
        ],
        [
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "indenizacaoRestRessarcimento",
            false
          ),
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "indenizacaoRestRessarcimento",
            true
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "indenizacaoRestRessarcimento",
            true
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "indenizacaoRestRessarcimento",
              true
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "indenizacaoRestRessarcimento",
              true
            )
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "indenizacaoRestRessarcimento",
            false
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "indenizacaoRestRessarcimento",
              false
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "indenizacaoRestRessarcimento",
              true
            )
          ),
          subInfo(
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "indenizacaoRestRessarcimento",
              true
            ),
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "indenizacaoRestRessarcimento",
              false
            )
          ),
        ],
        [
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "demaisReceitaCorrente",
            false
          ),
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "demaisReceitaCorrente",
            true
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "demaisReceitaCorrente",
            true
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "demaisReceitaCorrente",
              true
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "demaisReceitaCorrente",
              true
            )
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "demaisReceitaCorrente",
            false
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "demaisReceitaCorrente",
              false
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "demaisReceitaCorrente",
              true
            )
          ),
          subInfo(
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "demaisReceitaCorrente",
              true
            ),
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "demaisReceitaCorrente",
              false
            )
          ),
        ],
      ],
      7
    );
    savedDataREC.recCapital = sumInfo(
      [
        [
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "operacaoCredMercadoInterno",
            false
          ),
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "operacaoCredMercadoInterno",
            true
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "operacaoCredMercadoInterno",
            true
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "operacaoCredMercadoInterno",
              true
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "operacaoCredMercadoInterno",
              true
            )
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "operacaoCredMercadoInterno",
            false
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "operacaoCredMercadoInterno",
              false
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "operacaoCredMercadoInterno",
              true
            )
          ),
          subInfo(
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "operacaoCredMercadoInterno",
              true
            ),
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "operacaoCredMercadoInterno",
              false
            )
          ),
        ],
        [
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "outrasTransfUniaoSuasEntidadade",
            false
          ),
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "outrasTransfUniaoSuasEntidadade",
            true
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "outrasTransfUniaoSuasEntidadade",
            true
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "outrasTransfUniaoSuasEntidadade",
              true
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "outrasTransfUniaoSuasEntidadade",
              true
            )
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "outrasTransfUniaoSuasEntidadade",
            false
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "outrasTransfUniaoSuasEntidadade",
              false
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "outrasTransfUniaoSuasEntidadade",
              true
            )
          ),
          subInfo(
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "outrasTransfUniaoSuasEntidadade",
              true
            ),
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "outrasTransfUniaoSuasEntidadade",
              false
            )
          ),
        ],
      ],
      7
    );
    savedDataREC.recCorrentesSum = sumInfo(
      [
        savedDataREC.imposTaxasContribSum,
        savedDataREC.contribuicoesSum,
        savedDataREC.recPatrimonialSum,
        [
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "servSaneamentoAguaBasico",
            false
          ),
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "servSaneamentoAguaBasico",
            true
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "servSaneamentoAguaBasico",
            true
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "servSaneamentoAguaBasico",
              true
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "servSaneamentoAguaBasico",
              true
            )
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "servSaneamentoAguaBasico",
            false
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "servSaneamentoAguaBasico",
              false
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "servSaneamentoAguaBasico",
              true
            )
          ),
          subInfo(
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "servSaneamentoAguaBasico",
              true
            ),
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "servSaneamentoAguaBasico",
              false
            )
          ),
        ],
        savedDataREC.transfCorrentesSum,
        savedDataREC.outrasRecCorrentesSum,
      ],
      7
    );
    savedDataREC.receitas = sumInfo(
      [savedDataREC.recCorrentesSum, savedDataREC.recCapital],
      7
    );
    savedDataREC.subTotal = sumInfo(
      [
        savedDataREC.receitas,
        [
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "receitaIntraOrcamentaria",
            false
          ),
          recOInfo(
            savedCampoREC.recO,
            savedCampoREC.are,
            "receitaIntraOrcamentaria",
            true
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "receitaIntraOrcamentaria",
            true
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "receitaIntraOrcamentaria",
              true
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "receitaIntraOrcamentaria",
              true
            )
          ),
          recInfo(
            savedCampoREC.rec,
            savedCampoREC.recBI,
            "receitaIntraOrcamentaria",
            false
          ),
          divInfo(
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "receitaIntraOrcamentaria",
              false
            ),
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "receitaIntraOrcamentaria",
              true
            )
          ),
          subInfo(
            recOInfo(
              savedCampoREC.recO,
              savedCampoREC.are,
              "receitaIntraOrcamentaria",
              true
            ),
            recInfo(
              savedCampoREC.rec,
              savedCampoREC.recBI,
              "receitaIntraOrcamentaria",
              false
            )
          ),
        ],
      ],
      7
    );

    // -------------- RECEITAS -----------------------------------------------------------------------------------

    output.receitas.push(savedDataREC.receitas);
    output.receitas.push(savedDataREC.recCorrentesSum);

    // ----------------------------------------------------------------------------

    output.receitas.push(savedDataREC.imposTaxasContribSum);
    output.receitas.push([
      recOInfo(savedCampoREC.recO, savedCampoREC.are, "impostos", false),
      recOInfo(savedCampoREC.recO, savedCampoREC.are, "impostos", true),
      recInfo(savedCampoREC.rec, savedCampoREC.recBI, "impostos", true),
      divInfo(
        recInfo(savedCampoREC.rec, savedCampoREC.recBI, "impostos", true),
        recOInfo(savedCampoREC.recO, savedCampoREC.are, "impostos", true)
      ),
      recInfo(savedCampoREC.rec, savedCampoREC.recBI, "impostos", false),
      divInfo(
        recInfo(savedCampoREC.rec, savedCampoREC.recBI, "impostos", false),
        recOInfo(savedCampoREC.recO, savedCampoREC.are, "impostos", true)
      ),
      subInfo(
        recOInfo(savedCampoREC.recO, savedCampoREC.are, "impostos", true),
        recInfo(savedCampoREC.rec, savedCampoREC.recBI, "impostos", false)
      ),
    ]);
    output.receitas.push([
      recOInfo(savedCampoREC.recO, savedCampoREC.are, "taxas", false),
      recOInfo(savedCampoREC.recO, savedCampoREC.are, "taxas", true),
      recInfo(savedCampoREC.rec, savedCampoREC.recBI, "taxas", true),
      divInfo(
        recInfo(savedCampoREC.rec, savedCampoREC.recBI, "taxas", true),
        recOInfo(savedCampoREC.recO, savedCampoREC.are, "taxas", true)
      ),
      recInfo(savedCampoREC.rec, savedCampoREC.recBI, "taxas", false),
      divInfo(
        recInfo(savedCampoREC.rec, savedCampoREC.recBI, "taxas", false),
        recOInfo(savedCampoREC.recO, savedCampoREC.are, "taxas", true)
      ),
      subInfo(
        recOInfo(savedCampoREC.recO, savedCampoREC.are, "taxas", true),
        recInfo(savedCampoREC.rec, savedCampoREC.recBI, "taxas", false)
      ),
    ]);
    output.receitas.push([
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "contribuicaoMelhoria",
        false
      ),
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "contribuicaoMelhoria",
        true
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "contribuicaoMelhoria",
        true
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "contribuicaoMelhoria",
          true
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "contribuicaoMelhoria",
          true
        )
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "contribuicaoMelhoria",
        false
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "contribuicaoMelhoria",
          false
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "contribuicaoMelhoria",
          true
        )
      ),
      subInfo(
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "contribuicaoMelhoria",
          true
        ),
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "contribuicaoMelhoria",
          false
        )
      ),
    ]);
    // ----------------------------------------------------------------
    output.receitas.push(savedDataREC.contribuicoesSum);
    output.receitas.push([
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "contribuicaoSocial",
        false
      ),
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "contribuicaoSocial",
        true
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "contribuicaoSocial",
        true
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "contribuicaoSocial",
          true
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "contribuicaoSocial",
          true
        )
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "contribuicaoSocial",
        false
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "contribuicaoSocial",
          false
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "contribuicaoSocial",
          true
        )
      ),
      subInfo(
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "contribuicaoSocial",
          true
        ),
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "contribuicaoSocial",
          false
        )
      ),
    ]);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push([
      recOInfo(savedCampoREC.recO, savedCampoREC.are, "contribuicaoCIP", false),
      recOInfo(savedCampoREC.recO, savedCampoREC.are, "contribuicaoCIP", true),
      recInfo(savedCampoREC.rec, savedCampoREC.recBI, "contribuicaoCIP", true),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "contribuicaoCIP",
          true
        ),
        recOInfo(savedCampoREC.recO, savedCampoREC.are, "contribuicaoCIP", true)
      ),
      recInfo(savedCampoREC.rec, savedCampoREC.recBI, "contribuicaoCIP", false),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "contribuicaoCIP",
          false
        ),
        recOInfo(savedCampoREC.recO, savedCampoREC.are, "contribuicaoCIP", true)
      ),
      subInfo(
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "contribuicaoCIP",
          true
        ),
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "contribuicaoCIP",
          false
        )
      ),
    ]);
    // ----------------------------------------------------------------

    output.receitas.push(savedDataREC.recPatrimonialSum);
    output.receitas.push([
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "concessaoPermUsoBensPublico",
        false
      ),
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "concessaoPermUsoBensPublico",
        true
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "concessaoPermUsoBensPublico",
        true
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "concessaoPermUsoBensPublico",
          true
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "concessaoPermUsoBensPublico",
          true
        )
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "concessaoPermUsoBensPublico",
        false
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "concessaoPermUsoBensPublico",
          false
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "concessaoPermUsoBensPublico",
          true
        )
      ),
      subInfo(
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "concessaoPermUsoBensPublico",
          true
        ),
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "concessaoPermUsoBensPublico",
          false
        )
      ),
    ]);
    output.receitas.push([
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "remuneracaoBancaria",
        false
      ),
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "remuneracaoBancaria",
        true
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "remuneracaoBancaria",
        true
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "remuneracaoBancaria",
          true
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "remuneracaoBancaria",
          true
        )
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "remuneracaoBancaria",
        false
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "remuneracaoBancaria",
          false
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "remuneracaoBancaria",
          true
        )
      ),
      subInfo(
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "remuneracaoBancaria",
          true
        ),
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "remuneracaoBancaria",
          false
        )
      ),
    ]);
    output.receitas.push([
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "outrasDelegServPublicos",
        false
      ),
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "outrasDelegServPublicos",
        true
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "outrasDelegServPublicos",
        true
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "outrasDelegServPublicos",
          true
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "outrasDelegServPublicos",
          true
        )
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "outrasDelegServPublicos",
        false
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "outrasDelegServPublicos",
          false
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "outrasDelegServPublicos",
          true
        )
      ),
      subInfo(
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "outrasDelegServPublicos",
          true
        ),
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "outrasDelegServPublicos",
          false
        )
      ),
    ]);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    // ----------------------------------------------------------------
    output.receitas.push([
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "servSaneamentoAguaBasico",
        false
      ),
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "servSaneamentoAguaBasico",
        true
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "servSaneamentoAguaBasico",
        true
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "servSaneamentoAguaBasico",
          true
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "servSaneamentoAguaBasico",
          true
        )
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "servSaneamentoAguaBasico",
        false
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "servSaneamentoAguaBasico",
          false
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "servSaneamentoAguaBasico",
          true
        )
      ),
      subInfo(
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "servSaneamentoAguaBasico",
          true
        ),
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "servSaneamentoAguaBasico",
          false
        )
      ),
    ]);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push([
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "servSaneamentoAguaBasico",
        false
      ),
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "servSaneamentoAguaBasico",
        true
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "servSaneamentoAguaBasico",
        true
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "servSaneamentoAguaBasico",
          true
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "servSaneamentoAguaBasico",
          true
        )
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "servSaneamentoAguaBasico",
        false
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "servSaneamentoAguaBasico",
          false
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "servSaneamentoAguaBasico",
          true
        )
      ),
      subInfo(
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "servSaneamentoAguaBasico",
          true
        ),
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "servSaneamentoAguaBasico",
          false
        )
      ),
    ]);
    // ----------------------------------------------------------------
    output.receitas.push(savedDataREC.transfCorrentesSum);
    output.receitas.push([
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "transfUniaoSuasEntidade",
        false
      ),
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "transfUniaoSuasEntidade",
        true
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "transfUniaoSuasEntidade",
        true
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "transfUniaoSuasEntidade",
          true
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "transfUniaoSuasEntidade",
          true
        )
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "transfUniaoSuasEntidade",
        false
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "transfUniaoSuasEntidade",
          false
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "transfUniaoSuasEntidade",
          true
        )
      ),
      subInfo(
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "transfUniaoSuasEntidade",
          true
        ),
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "transfUniaoSuasEntidade",
          false
        )
      ),
    ]);
    output.receitas.push([
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "transfEstadoSuasEntidade",
        false
      ),
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "transfEstadoSuasEntidade",
        true
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "transfEstadoSuasEntidade",
        true
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "transfEstadoSuasEntidade",
          true
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "transfEstadoSuasEntidade",
          true
        )
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "transfEstadoSuasEntidade",
        false
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "transfEstadoSuasEntidade",
          false
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "transfEstadoSuasEntidade",
          true
        )
      ),
      subInfo(
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "transfEstadoSuasEntidade",
          true
        ),
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "transfEstadoSuasEntidade",
          false
        )
      ),
    ]);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push([
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "transfOutraInstituicaoPublica",
        false
      ),
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "transfOutraInstituicaoPublica",
        true
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "transfOutraInstituicaoPublica",
        true
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "transfOutraInstituicaoPublica",
          true
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "transfOutraInstituicaoPublica",
          true
        )
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "transfOutraInstituicaoPublica",
        false
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "transfOutraInstituicaoPublica",
          false
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "transfOutraInstituicaoPublica",
          true
        )
      ),
      subInfo(
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "transfOutraInstituicaoPublica",
          true
        ),
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "transfOutraInstituicaoPublica",
          false
        )
      ),
    ]);
    output.receitas.push(zerado);
    output.receitas.push([
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "demaisTransfCorrentes",
        false
      ),
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "demaisTransfCorrentes",
        true
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "demaisTransfCorrentes",
        true
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "demaisTransfCorrentes",
          true
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "demaisTransfCorrentes",
          true
        )
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "demaisTransfCorrentes",
        false
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "demaisTransfCorrentes",
          false
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "demaisTransfCorrentes",
          true
        )
      ),
      subInfo(
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "demaisTransfCorrentes",
          true
        ),
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "demaisTransfCorrentes",
          false
        )
      ),
    ]);
    // ----------------------------------------------------------------
    output.receitas.push(savedDataREC.outrasRecCorrentesSum);
    output.receitas.push([
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "multaAdmContratuaisJudiciais",
        false
      ),
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "multaAdmContratuaisJudiciais",
        true
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "multaAdmContratuaisJudiciais",
        true
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "multaAdmContratuaisJudiciais",
          true
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "multaAdmContratuaisJudiciais",
          true
        )
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "multaAdmContratuaisJudiciais",
        false
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "multaAdmContratuaisJudiciais",
          false
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "multaAdmContratuaisJudiciais",
          true
        )
      ),
      subInfo(
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "multaAdmContratuaisJudiciais",
          true
        ),
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "multaAdmContratuaisJudiciais",
          false
        )
      ),
    ]);
    output.receitas.push([
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "indenizacaoRestRessarcimento",
        false
      ),
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "indenizacaoRestRessarcimento",
        true
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "indenizacaoRestRessarcimento",
        true
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "indenizacaoRestRessarcimento",
          true
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "indenizacaoRestRessarcimento",
          true
        )
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "indenizacaoRestRessarcimento",
        false
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "indenizacaoRestRessarcimento",
          false
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "indenizacaoRestRessarcimento",
          true
        )
      ),
      subInfo(
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "indenizacaoRestRessarcimento",
          true
        ),
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "indenizacaoRestRessarcimento",
          false
        )
      ),
    ]);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push([
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "demaisReceitaCorrente",
        false
      ),
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "demaisReceitaCorrente",
        true
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "demaisReceitaCorrente",
        true
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "demaisReceitaCorrente",
          true
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "demaisReceitaCorrente",
          true
        )
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "demaisReceitaCorrente",
        false
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "demaisReceitaCorrente",
          false
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "demaisReceitaCorrente",
          true
        )
      ),
      subInfo(
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "demaisReceitaCorrente",
          true
        ),
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "demaisReceitaCorrente",
          false
        )
      ),
    ]);
    // ----------------------------------------------------------------
    output.receitas.push(savedDataREC.recCapital);
    // ----------------------------------------------------------------
    output.receitas.push([
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "operacaoCredMercadoInterno",
        false
      ),
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "operacaoCredMercadoInterno",
        true
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "operacaoCredMercadoInterno",
        true
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "operacaoCredMercadoInterno",
          true
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "operacaoCredMercadoInterno",
          true
        )
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "operacaoCredMercadoInterno",
        false
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "operacaoCredMercadoInterno",
          false
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "operacaoCredMercadoInterno",
          true
        )
      ),
      subInfo(
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "operacaoCredMercadoInterno",
          true
        ),
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "operacaoCredMercadoInterno",
          false
        )
      ),
    ]);
    output.receitas.push([
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "operacaoCredMercadoInterno",
        false
      ),
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "operacaoCredMercadoInterno",
        true
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "operacaoCredMercadoInterno",
        true
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "operacaoCredMercadoInterno",
          true
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "operacaoCredMercadoInterno",
          true
        )
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "operacaoCredMercadoInterno",
        false
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "operacaoCredMercadoInterno",
          false
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "operacaoCredMercadoInterno",
          true
        )
      ),
      subInfo(
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "operacaoCredMercadoInterno",
          true
        ),
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "operacaoCredMercadoInterno",
          false
        )
      ),
    ]);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    // ----------------------------------------------------------------
    output.receitas.push([
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "outrasTransfUniaoSuasEntidadade",
        false
      ),
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "outrasTransfUniaoSuasEntidadade",
        true
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "outrasTransfUniaoSuasEntidadade",
        true
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "outrasTransfUniaoSuasEntidadade",
          true
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "outrasTransfUniaoSuasEntidadade",
          true
        )
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "outrasTransfUniaoSuasEntidadade",
        false
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "outrasTransfUniaoSuasEntidadade",
          false
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "outrasTransfUniaoSuasEntidadade",
          true
        )
      ),
      subInfo(
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "outrasTransfUniaoSuasEntidadade",
          true
        ),
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "outrasTransfUniaoSuasEntidadade",
          false
        )
      ),
    ]);
    output.receitas.push([
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "outrasTransfUniaoSuasEntidadade",
        false
      ),
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "outrasTransfUniaoSuasEntidadade",
        true
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "outrasTransfUniaoSuasEntidadade",
        true
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "outrasTransfUniaoSuasEntidadade",
          true
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "outrasTransfUniaoSuasEntidadade",
          true
        )
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "outrasTransfUniaoSuasEntidadade",
        false
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "outrasTransfUniaoSuasEntidadade",
          false
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "outrasTransfUniaoSuasEntidadade",
          true
        )
      ),
      subInfo(
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "outrasTransfUniaoSuasEntidadade",
          true
        ),
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "outrasTransfUniaoSuasEntidadade",
          false
        )
      ),
    ]);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    // ----------------------------------------------------------------
    output.receitas.push([
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "receitaIntraOrcamentaria",
        false
      ),
      recOInfo(
        savedCampoREC.recO,
        savedCampoREC.are,
        "receitaIntraOrcamentaria",
        true
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "receitaIntraOrcamentaria",
        true
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "receitaIntraOrcamentaria",
          true
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "receitaIntraOrcamentaria",
          true
        )
      ),
      recInfo(
        savedCampoREC.rec,
        savedCampoREC.recBI,
        "receitaIntraOrcamentaria",
        false
      ),
      divInfo(
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "receitaIntraOrcamentaria",
          false
        ),
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "receitaIntraOrcamentaria",
          true
        )
      ),
      subInfo(
        recOInfo(
          savedCampoREC.recO,
          savedCampoREC.are,
          "receitaIntraOrcamentaria",
          true
        ),
        recInfo(
          savedCampoREC.rec,
          savedCampoREC.recBI,
          "receitaIntraOrcamentaria",
          false
        )
      ),
    ]);
    // ----------------------------------------------------------------
    output.receitas.push(savedDataREC.subTotal);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(zerado);
    output.receitas.push(
      sumInfo([savedDataREC.subTotal, savedDataREC.receitas], 7)
    );
    output.receitas.push([
      "",
      "",
      "",
      "",
      checkNegative(
        subInfo(
          savedDataREC.receitas[4],
          savedDataDSP.despesas[dataF.substring(0, 2) === "12" ? 3 : 6]
        )
      ),
    ]);
    VI.receitas = VIInfo(
      savedDataREC.receitas[4],
      savedDataDSP.despesas[dataF.substring(0, 2) === "12" ? 3 : 6]
    );

    output.receitas.push([
      sumInfo([savedDataREC.subTotal, savedDataREC.receitas], 7)[0],
      sumInfo([savedDataREC.subTotal, savedDataREC.receitas], 7)[1],
      sumInfo([savedDataREC.subTotal, savedDataREC.receitas], 7)[2],
      sumInfo([savedDataREC.subTotal, savedDataREC.receitas], 7)[3],
      sumValues(
        sumInfo([savedDataREC.subTotal, savedDataREC.receitas], 7)[4],
        subInfo(
          savedDataREC.receitas[4],
          savedDataDSP.despesas[dataF.substring(0, 2) === "12" ? 3 : 6]
        ),
        VI.receitas
      ),
      sumInfo([savedDataREC.subTotal, savedDataREC.receitas], 7)[5],
      sumInfo([savedDataREC.subTotal, savedDataREC.receitas], 7)[6],
    ]);

    // --------------- DESPESAS -------------------------------------------------

    output.despesas.push(savedDataDSP.despesas);
    output.despesas.push(
      sumInfo([savedDataDSP.pessoal, savedDataDSP.juros, savedDataDSP.outras])
    );
    output.despesas.push(savedDataDSP.pessoal);
    output.despesas.push(savedDataDSP.juros);
    output.despesas.push(savedDataDSP.outras);
    output.despesas.push(zerado);
    output.despesas.push(savedDataDSP.outras);
    output.despesas.push(
      sumInfo([
        savedDataDSP.investimento,
        savedDataDSP.inversoes,
        savedDataDSP.amortizacao,
      ])
    );
    output.despesas.push(savedDataDSP.investimento);
    output.despesas.push(savedDataDSP.inversoes);
    output.despesas.push(savedDataDSP.amortizacao);
    output.despesas.push(savedDataDSP.contigencia);
    output.despesas.push(savedDataDSP.intraOrcamentaria);
    output.despesas.push(
      sumInfo([
        savedDataDSP.pessoal,
        savedDataDSP.juros,
        savedDataDSP.outras,
        savedDataDSP.investimento,
        savedDataDSP.inversoes,
        savedDataDSP.amortizacao,
        savedDataDSP.contigencia,
        savedDataDSP.intraOrcamentaria,
      ])
    );
    output.despesas.push(zerado);
    output.despesas.push(zerado);
    output.despesas.push(zerado);
    output.despesas.push(zerado);
    output.despesas.push(zerado);
    output.despesas.push(zerado);
    output.despesas.push(zerado);
    savedDataDSP.totalDSP = sumInfo([
      savedDataDSP.pessoal,
      savedDataDSP.juros,
      savedDataDSP.outras,
      savedDataDSP.investimento,
      savedDataDSP.inversoes,
      savedDataDSP.amortizacao,
      savedDataDSP.contigencia,
      savedDataDSP.intraOrcamentaria,
    ]);
    output.despesas.push(savedDataDSP.totalDSP);
    output.despesas.push([
      "",
      "",
      "",
      "",
      "",
      "",
      subInfo(savedDataREC.receitas[4], savedDataDSP.despesas[6]),
    ]);
    VI.despesas = VIInfo(savedDataREC.receitas[4], savedDataDSP.despesas[6]);

    output.despesas.push([
      savedDataDSP.totalDSP[0],
      savedDataDSP.totalDSP[1],
      savedDataDSP.totalDSP[2],
      savedDataDSP.totalDSP[3],
      savedDataDSP.totalDSP[4],
      savedDataDSP.totalDSP[5],
      sumValues(
        savedDataDSP.totalDSP[6],
        checkNegative(
          subInfo(savedDataREC.receitas[4], savedDataDSP.despesas[6])
        ),
        true
      ),
      savedDataDSP.totalDSP[7],
      savedDataDSP.totalDSP[8],
      savedDataDSP.totalDSP[9],
    ]);
    output.despesas.push(savedDataDSP.RPPS);

    // ----------------------------------------------------------------------
    const savedCampoRECIntra = {};
    savedCampoRECIntra.recO = await getCampo("recO", "y");
    savedCampoRECIntra.are = await getCampo("are", "m");
    output.receitasIntra.push([]);
    output.receitasIntra.push([]);
    output.receitasIntra.push(zerado);
    output.receitasIntra.push(zerado);
    output.receitasIntra.push(zerado);
    output.receitasIntra.push(zerado);
    output.receitasIntra.push([]);
    output.receitasIntra.push([
      recOInfo(
        savedCampoRECIntra.recO,
        savedCampoRECIntra.are,
        "receitaIntraOrcamentaria"
      ),
    ]);
    output.receitasIntra.push(zerado);

    // -------------------------------------------

    const savedCampoDPSRECIntra = {};

    savedCampoDPSRECIntra.dspO = await getCampo("dspO", "y");
    savedCampoDPSRECIntra.aoc = await getCampo("aoc", "m");
    output.DSPreceitasIntra.push([]);
    output.DSPreceitasIntra.push([]);
    output.DSPreceitasIntra.push([
      await dspOInfo(
        savedCampoDPSRECIntra.dspO,
        savedCampoDPSRECIntra.aoc,
        "pessoalIntra"
      ),
    ]);
    output.DSPreceitasIntra.push(zerado);
    output.DSPreceitasIntra.push([
      await dspOInfo(
        savedCampoDPSRECIntra.dspO,
        savedCampoDPSRECIntra.aoc,
        "outrasIntra"
      ),
    ]);
    output.DSPreceitasIntra.push(zerado);
    output.DSPreceitasIntra.push(zerado);
    output.DSPreceitasIntra.push(zerado);
    output.DSPreceitasIntra.push(zerado);

    res.status(200).json({
      output: output,
      dataI: dataI || "",
      dataF: dataF || "",
      VI: VI,
    });
  } catch (error) {
    console.error(
      "Error from getAllRreo function from /controllers/controller.rreo.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

function checkNegative(val) {
  return val.replaceAll("-", "");
}

function sumValues(val1, val2, sum) {
  val1 = parseInt(val1.replaceAll(".", "").replaceAll(",", ""));
  val2 = parseInt(val2.replaceAll(".", "").replaceAll(",", ""));
  if (sum) {
    return toRS(String((val1 + val2) / 100));
  } else {
    return toRS(String((val1 - val2) / 100));
  }
}

function VIInfo(val1, val2) {
  val1 = parseInt(val1.replaceAll(".", "").replaceAll(",", ""));
  val2 = parseInt(val2.replaceAll(".", "").replaceAll(",", ""));

  return val1 > val2;
}

function recOInfo(campRec, campAre, type, are) {
  const resRec = campRec.filter((e) =>
    permReceitas[type].includes(e.content.rubrica.substring(1))
  );

  const resAre = campAre.filter((e) =>
    permReceitas[type].includes(e.content.rubrica.substring(1))
  );

  let sum = 0;

  resRec.forEach(
    (e) => (sum += parseInt(e.content.vlPrevisto.replaceAll(",", "")))
  );
  if (are) {
    resAre.forEach(
      (e) => (sum -= parseInt(e.content.vlAnulacao.replaceAll(",", "")))
    );
  }

  return toRS(String(sum / 100));
}

function recInfo(campRec, campRecBI, type, isBI) {
  const resRec = campRec.filter((e) =>
    permReceitas[type].includes(e.content.rubrica.substring(1))
  );
  const resRecBI = campRecBI.filter((e) =>
    permReceitas[type].includes(e.content.rubrica.substring(1))
  );

  let sum = 0;
  if (isBI) {
    resRecBI.forEach(
      (e) => (sum += parseInt(e.content.vlArrecadado.replaceAll(",", "")))
    );
  } else {
    resRec.forEach(
      (e) => (sum += parseInt(e.content.vlArrecadado.replaceAll(",", "")))
    );
  }

  return toRS(String(sum / 100));
}

async function empInfo(dataI, dataF, orgao, consolidado, type, dataType) {
  dataType = dataType || "normal";
  try {
    const emp = await db("emp").select("*");
    const anl = await db("anl").select("*");

    const anlRes = anl
      .filter((e) => {
        let allowed = perm[type];
        return allowed.includes(e.content.elementoDespesa);
      })
      .filter((e) => {
        if (dataType === "normal") {
          if (dataI.substring(2, 4) === dataF.substring(2, 4)) {
            const possible =
              String(e.data).substring(2, 4) == dataI.substring(2, 4);

            if (possible) {
              return (
                String(e.data).substring(0, 2) >= dataI.substring(0, 2) &&
                String(e.data).substring(0, 2) <= dataF.substring(0, 2)
              );
            }
          } else {
            const possible =
              String(e.data).substring(2, 4) >= dataI.substring(2, 4) &&
              String(e.data).substring(2, 4) <= dataF.substring(2, 4);

            if (possible) {
              return (
                String(e.data).substring(0, 2) >= dataI.substring(0, 2) &&
                String(e.data).substring(0, 2) <= dataF.substring(0, 2)
              );
            }
          }
        } else if (dataType === "bi") {
          let newData = "";
          if (dataF.substring(0, 2) === "01") {
            newData =
              "12" +
              String(parseInt(dataF.substring(2, 4)) - 1).padStart(2, "0");
            if (
              parseInt(newData.substring(2, 4)) <
                parseInt(dataI.substring(2, 4)) ||
              (parseInt(newData.substring(2, 4)) ==
                parseInt(dataI.substring(2, 4)) &&
                parseInt(newData.substring(0, 2)) <=
                  parseInt(dataI.substring(0, 2)))
            ) {
              newData = dataI;
            }
          } else {
            newData =
              String(parseInt(dataF.substring(0, 2)) - 1).padStart(2, "0") +
              dataF.substring(2, 4);
            if (
              parseInt(newData.substring(2, 4)) <
                parseInt(dataI.substring(2, 4)) ||
              (parseInt(newData.substring(2, 4)) ==
                parseInt(dataI.substring(2, 4)) &&
                parseInt(newData.substring(0, 2)) <=
                  parseInt(dataI.substring(0, 2)))
            ) {
              newData = dataI;
            }
          }
          return (
            String(e.data).substring(0, 2) >= newData.substring(0, 2) &&
            String(e.data).substring(2, 4) >= newData.substring(2, 4) &&
            String(e.data).substring(0, 2) <= dataF.substring(0, 2) &&
            String(e.data).substring(2, 4) <= dataF.substring(2, 4)
          );
        }
      });

    const res = emp
      .filter((e) => {
        let allowed = perm[type];
        return allowed.includes(e.content.elementoDespesa);
      })
      .filter((e) => {
        if (dataType === "normal") {
          if (dataI.substring(2, 4) === dataF.substring(2, 4)) {
            const possible =
              String(e.data).substring(2, 4) == dataI.substring(2, 4);

            if (possible) {
              return (
                String(e.data).substring(0, 2) >= dataI.substring(0, 2) &&
                String(e.data).substring(0, 2) <= dataF.substring(0, 2)
              );
            }
          } else {
            const possible =
              String(e.data).substring(2, 4) >= dataI.substring(2, 4) &&
              String(e.data).substring(2, 4) <= dataF.substring(2, 4);

            if (possible) {
              return (
                String(e.data).substring(0, 2) >= dataI.substring(0, 2) &&
                String(e.data).substring(0, 2) <= dataF.substring(0, 2)
              );
            }
          }
        } else if (dataType === "bi") {
          let newData = "";
          if (dataF.substring(0, 2) === "01") {
            newData =
              "12" +
              String(parseInt(dataF.substring(2, 4)) - 1).padStart(2, "0");
            if (
              parseInt(newData.substring(2, 4)) <
                parseInt(dataI.substring(2, 4)) ||
              (parseInt(newData.substring(2, 4)) ==
                parseInt(dataI.substring(2, 4)) &&
                parseInt(newData.substring(0, 2)) <=
                  parseInt(dataI.substring(0, 2)))
            ) {
              newData = dataI;
            }
          } else {
            newData =
              String(parseInt(dataF.substring(0, 2)) - 1).padStart(2, "0") +
              dataF.substring(2, 4);
            if (
              parseInt(newData.substring(2, 4)) <
                parseInt(dataI.substring(2, 4)) ||
              (parseInt(newData.substring(2, 4)) ==
                parseInt(dataI.substring(2, 4)) &&
                parseInt(newData.substring(0, 2)) <=
                  parseInt(dataI.substring(0, 2)))
            ) {
              newData = dataI;
            }
          }
          return (
            String(e.data).substring(0, 2) >= newData.substring(0, 2) &&
            String(e.data).substring(2, 4) >= newData.substring(2, 4) &&
            String(e.data).substring(0, 2) <= dataF.substring(0, 2) &&
            String(e.data).substring(2, 4) <= dataF.substring(2, 4)
          );
        }
      });

    const orgFiltered = filterOrg(res, orgao, consolidado);
    let sum = 0;

    orgFiltered.forEach(
      (e) =>
        (sum += (parseFloat(e?.content?.vlBruto?.replace(",", ".")) || 0) * 100)
    );

    filterOrg(anlRes, orgao, consolidado).forEach(
      (e) =>
        (sum -=
          (parseFloat(e?.content?.vlAnulacao?.replace(",", ".")) || 0) * 100)
    );

    return toRS(String(sum / 100));
  } catch (error) {
    console.error("Error in empInfo function:", error);
  }
}

async function lqdInfo(dataI, dataF, orgao, consolidado, type, dataType) {
  dataType = dataType || "normal";
  try {
    const lqd = await db("lqd").select("*");
    const alq = await db("alq").select("*");

    const alqRes = alq
      .filter((e) => {
        let allowed = perm[type];
        return allowed.includes(e.content.elementoDespesa);
      })
      .filter((e) => {
        if (dataType === "normal") {
          if (dataI.substring(2, 4) === dataF.substring(2, 4)) {
            const possible =
              String(e.data).substring(2, 4) == dataI.substring(2, 4);

            if (possible) {
              return (
                String(e.data).substring(0, 2) >= dataI.substring(0, 2) &&
                String(e.data).substring(0, 2) <= dataF.substring(0, 2)
              );
            }
          } else {
            const possible =
              String(e.data).substring(2, 4) >= dataI.substring(2, 4) &&
              String(e.data).substring(2, 4) <= dataF.substring(2, 4);

            if (possible) {
              return (
                String(e.data).substring(0, 2) >= dataI.substring(0, 2) &&
                String(e.data).substring(0, 2) <= dataF.substring(0, 2)
              );
            }
          }
        } else if (dataType === "bi") {
          let newData = "";
          if (dataF.substring(0, 2) === "01") {
            newData =
              "12" +
              String(parseInt(dataF.substring(2, 4)) - 1).padStart(2, "0");
            if (
              parseInt(newData.substring(2, 4)) <
                parseInt(dataI.substring(2, 4)) ||
              (parseInt(newData.substring(2, 4)) ==
                parseInt(dataI.substring(2, 4)) &&
                parseInt(newData.substring(0, 2)) <=
                  parseInt(dataI.substring(0, 2)))
            ) {
              newData = dataI;
            }
          } else {
            newData =
              String(parseInt(dataF.substring(0, 2)) - 1).padStart(2, "0") +
              dataF.substring(2, 4);
            if (
              parseInt(newData.substring(2, 4)) <
                parseInt(dataI.substring(2, 4)) ||
              (parseInt(newData.substring(2, 4)) ==
                parseInt(dataI.substring(2, 4)) &&
                parseInt(newData.substring(0, 2)) <=
                  parseInt(dataI.substring(0, 2)))
            ) {
              newData = dataI;
            }
          }
          return (
            String(e.data).substring(0, 2) >= newData.substring(0, 2) &&
            String(e.data).substring(2, 4) >= newData.substring(2, 4) &&
            String(e.data).substring(0, 2) <= dataF.substring(0, 2) &&
            String(e.data).substring(2, 4) <= dataF.substring(2, 4)
          );
        }
      });

    const res = lqd
      .filter((e) => {
        let allowed = perm[type];
        return allowed.includes(e.content.elementoDespesa);
      })
      .filter((e) => {
        if (dataType === "normal") {
          if (dataI.substring(2, 4) === dataF.substring(2, 4)) {
            const possible =
              String(e.data).substring(2, 4) == dataI.substring(2, 4);

            if (possible) {
              return (
                String(e.data).substring(0, 2) >= dataI.substring(0, 2) &&
                String(e.data).substring(0, 2) <= dataF.substring(0, 2)
              );
            }
          } else {
            const possible =
              String(e.data).substring(2, 4) >= dataI.substring(2, 4) &&
              String(e.data).substring(2, 4) <= dataF.substring(2, 4);

            if (possible) {
              return (
                String(e.data).substring(0, 2) >= dataI.substring(0, 2) &&
                String(e.data).substring(0, 2) <= dataF.substring(0, 2)
              );
            }
          }
        } else if (dataType === "bi") {
          let newData = "";
          if (dataF.substring(0, 2) === "01") {
            newData =
              "12" +
              String(parseInt(dataF.substring(2, 4)) - 1).padStart(2, "0");
            if (
              parseInt(newData.substring(2, 4)) <
                parseInt(dataI.substring(2, 4)) ||
              (parseInt(newData.substring(2, 4)) ==
                parseInt(dataI.substring(2, 4)) &&
                parseInt(newData.substring(0, 2)) <=
                  parseInt(dataI.substring(0, 2)))
            ) {
              newData = dataI;
            }
          } else {
            newData =
              String(parseInt(dataF.substring(0, 2)) - 1).padStart(2, "0") +
              dataF.substring(2, 4);
            if (
              parseInt(newData.substring(2, 4)) <
                parseInt(dataI.substring(2, 4)) ||
              (parseInt(newData.substring(2, 4)) ==
                parseInt(dataI.substring(2, 4)) &&
                parseInt(newData.substring(0, 2)) <=
                  parseInt(dataI.substring(0, 2)))
            ) {
              newData = dataI;
            }
          }
          return (
            String(e.data).substring(0, 2) >= newData.substring(0, 2) &&
            String(e.data).substring(2, 4) >= newData.substring(2, 4) &&
            String(e.data).substring(0, 2) <= dataF.substring(0, 2) &&
            String(e.data).substring(2, 4) <= dataF.substring(2, 4)
          );
        }
      });

    const orgFiltered = filterOrg(res, orgao, consolidado);

    let sum = 0;

    orgFiltered.forEach(
      (e) => (sum += parseInt(e?.content?.vlLiquidado?.replace(",", "")) || 0)
    );

    filterOrg(alqRes, orgao, consolidado).forEach(
      (e) => (sum -= parseInt(e?.content?.vlAnulado?.replace(",", "")) || 0)
    );

    return toRS(String(sum / 100));
  } catch (error) {
    console.error("Error in lqdInfo function:", error);
  }
}

async function opsInfo(dataI, dataF, orgao, consolidado, type, dataType) {
  dataType = dataType || "normal";
  try {
    const ops = await db("ops").select("*");
    const aop = await db("aop").select("*");

    const aopRes = aop
      .filter((e) => {
        let allowed = perm[type];
        return allowed.includes(e.content.elementoDespesa);
      })
      .filter((e) => {
        if (dataType === "normal") {
          if (dataI.substring(2, 4) === dataF.substring(2, 4)) {
            const possible =
              String(e.data).substring(2, 4) == dataI.substring(2, 4);

            if (possible) {
              return (
                String(e.data).substring(0, 2) >= dataI.substring(0, 2) &&
                String(e.data).substring(0, 2) <= dataF.substring(0, 2)
              );
            }
          } else {
            const possible =
              String(e.data).substring(2, 4) >= dataI.substring(2, 4) &&
              String(e.data).substring(2, 4) <= dataF.substring(2, 4);

            if (possible) {
              return (
                String(e.data).substring(0, 2) >= dataI.substring(0, 2) &&
                String(e.data).substring(0, 2) <= dataF.substring(0, 2)
              );
            }
          }
        } else if (dataType === "bi") {
          let newData = "";
          if (dataF.substring(0, 2) === "01") {
            newData =
              "12" +
              String(parseInt(dataF.substring(2, 4)) - 1).padStart(2, "0");
            if (
              parseInt(newData.substring(2, 4)) <
                parseInt(dataI.substring(2, 4)) ||
              (parseInt(newData.substring(2, 4)) ==
                parseInt(dataI.substring(2, 4)) &&
                parseInt(newData.substring(0, 2)) <=
                  parseInt(dataI.substring(0, 2)))
            ) {
              newData = dataI;
            }
          } else {
            newData =
              String(parseInt(dataF.substring(0, 2)) - 1).padStart(2, "0") +
              dataF.substring(2, 4);
            if (
              parseInt(newData.substring(2, 4)) <
                parseInt(dataI.substring(2, 4)) ||
              (parseInt(newData.substring(2, 4)) ==
                parseInt(dataI.substring(2, 4)) &&
                parseInt(newData.substring(0, 2)) <=
                  parseInt(dataI.substring(0, 2)))
            ) {
              newData = dataI;
            }
          }
          return (
            String(e.data).substring(0, 2) >= newData.substring(0, 2) &&
            String(e.data).substring(2, 4) >= newData.substring(2, 4) &&
            String(e.data).substring(0, 2) <= dataF.substring(0, 2) &&
            String(e.data).substring(2, 4) <= dataF.substring(2, 4)
          );
        }
      });

    const res = ops
      .filter((e) => {
        let allowed = perm[type];
        return allowed.includes(e.content.elementoDespesa);
      })
      .filter((e) => {
        if (dataType === "normal") {
          if (dataI.substring(2, 4) === dataF.substring(2, 4)) {
            const possible =
              String(e.data).substring(2, 4) == dataI.substring(2, 4);

            if (possible) {
              return (
                String(e.data).substring(0, 2) >= dataI.substring(0, 2) &&
                String(e.data).substring(0, 2) <= dataF.substring(0, 2)
              );
            }
          } else {
            const possible =
              String(e.data).substring(2, 4) >= dataI.substring(2, 4) &&
              String(e.data).substring(2, 4) <= dataF.substring(2, 4);

            if (possible) {
              return (
                String(e.data).substring(0, 2) >= dataI.substring(0, 2) &&
                String(e.data).substring(0, 2) <= dataF.substring(0, 2)
              );
            }
          }
        } else if (dataType === "bi") {
          let newData = "";
          if (dataF.substring(0, 2) === "01") {
            newData =
              "12" +
              String(parseInt(dataF.substring(2, 4)) - 1).padStart(2, "0");
            if (
              parseInt(newData.substring(2, 4)) <
                parseInt(dataI.substring(2, 4)) ||
              (parseInt(newData.substring(2, 4)) ==
                parseInt(dataI.substring(2, 4)) &&
                parseInt(newData.substring(0, 2)) <=
                  parseInt(dataI.substring(0, 2)))
            ) {
              newData = dataI;
            }
          } else {
            newData =
              String(parseInt(dataF.substring(0, 2)) - 1).padStart(2, "0") +
              dataF.substring(2, 4);
            if (
              parseInt(newData.substring(2, 4)) <
                parseInt(dataI.substring(2, 4)) ||
              (parseInt(newData.substring(2, 4)) ==
                parseInt(dataI.substring(2, 4)) &&
                parseInt(newData.substring(0, 2)) <=
                  parseInt(dataI.substring(0, 2)))
            ) {
              newData = dataI;
            }
          }
          return (
            String(e.data).substring(0, 2) >= newData.substring(0, 2) &&
            String(e.data).substring(2, 4) >= newData.substring(2, 4) &&
            String(e.data).substring(0, 2) <= dataF.substring(0, 2) &&
            String(e.data).substring(2, 4) <= dataF.substring(2, 4)
          );
        }
      });
    const orgFiltered = filterOrg(res, orgao, consolidado);

    let sum = 0;

    orgFiltered.forEach(
      (e) => (sum += parseInt(e?.content?.vlOP?.replace(",", "")) || 0)
    );

    filterOrg(aopRes, orgao, consolidado).forEach(
      (e) => (sum -= parseInt(e?.content?.vlAnuladoOP?.replace(",", "")) || 0)
    );

    return toRS(String(sum / 100));
  } catch (error) {
    console.error("Error in opsInfo function:", error);
  }
}

async function rspInfo(dataI, dataF, orgao, consolidado, type) {
  const rsp = await filterOrg(
    (
      await db("rsp").select("*")
    ).filter((e) => {
      let returns = true;

      if (dataToYear(dataI) < dataToYear(e.data)) {
        returns = false;
      }

      if (dataToYear(dataI) === dataToYear(e.data)) {
        dataI.substring(0, 2) > e.data.substring(0, 2)
          ? (returns = false)
          : null;
      }

      if (dataToYear(dataF) > dataToYear(e.data)) {
        returns = false;
      }

      if (dataToYear(dataF) === dataToYear(e.data)) {
        dataF.substring(0, 2) < e.data.substring(0, 2)
          ? (returns = false)
          : null;
      }
      returns;
    }),
    orgao,
    consolidado
  );

  const res = rsp.filter((e) => {
    const value = e.content.DotOrigP2002?.substring(15, 21);

    return perm[type].includes(value);
  });

  let sum = 0;

  res.forEach(
    (e) =>
      (sum +=
        (parseFloat(e?.content?.vlBaixaPgto?.replace(",", ".")) || 0) * 100)
  );

  return toRS(String(sum / 100));
}

async function aocInfo(dataI, dataF, orgao, consolidado, type) {
  const aoc = await filterOrg(await db("aoc").select("*"), orgao, consolidado);
  const correctType = [];
  aoc
    .filter((e) => {
      let returns = true;

      if (dataToYear(dataI) < dataToYear(e.data)) {
        returns = false;
      }

      if (dataToYear(dataI) === dataToYear(e.data)) {
        dataI.substring(0, 2) > e.data.substring(0, 2)
          ? (returns = false)
          : null;
      }

      if (dataToYear(dataF) > dataToYear(e.data)) {
        returns = false;
      }

      if (dataToYear(dataF) === dataToYear(e.data)) {
        dataF.substring(0, 2) < e.data.substring(0, 2)
          ? (returns = false)
          : null;
      }
      returns;
    })
    .forEach((e) => {
      e.content.content
        .filter((e) => {
          return e.tipoRegistro == "11";
        })
        .forEach((e) => {
          correctType.push(e);
        });
    });

  const res = correctType.filter((e) =>
    perm[type].includes(e.codNaturezaDaDespesa)
  );

  let sum = 0;

  res.forEach((e) => {
    if (type !== "contigencia" && type !== "RPPS")
      parseInt(e.vlSaldoAntDotacao.replace(",", "")) >
      parseInt(e.vlSaldoAtual.replace(",", ""))
        ? (sum -= parseInt(e.vlAlteracao.replace(",", "")))
        : (sum += parseInt(e.vlAlteracao.replace(",", "")));
    else {
      sum -= parseInt(e.vlAlteracao.replace(",", ""));
    }
  });

  const dspoValue = parseInt(
    (await dspOInfo(dataI, dataF, orgao, consolidado, type))
      .replaceAll(",", "")
      .replaceAll(".", "")
  );
  return toRS(String((sum + dspoValue) / 100));
}

async function dspOInfo(dataI, dataF, orgao, consolidado, type) {
  dataI = dataToYear(dataI);
  dataF = dataToYear(dataF);

  const res = (await db("dspO").select("*")).filter((e) => {
    return (
      parseInt(e.data) >= parseInt(dataI) &&
      parseInt(e.data) <= parseInt(dataF) &&
      perm[type].includes(e.content.codNaturezaDaDespesa)
    );
  });

  let orgFiltered = filterOrg(res, orgao, consolidado);

  let sum = 0;

  if (type == "contigencia") {
    orgFiltered = orgFiltered.filter((e) => {
      return parseInt(e.content.codFuncao) === 4;
    });
  } else if (type == "RPPS") {
    orgFiltered = orgFiltered.filter((e) => {
      return parseInt(e.content.codFuncao) === 9;
    });
  }

  orgFiltered.forEach(
    (e) =>
      (sum += (parseFloat(e?.content?.recurso?.replace(",", ".")) || 0) * 100)
  );

  return toRS(String(sum / 100));
}

function filterOrg(toFilter, orgao, consolidado) {
  if (consolidado !== "false") {
    return toFilter;
  } else {
    const filtered = toFilter.filter(
      (e) => parseInt(e.content.codOrgao) === parseInt(orgao)
    );
    return filtered;
  }
}

function dataToYear(data) {
  data = String(data).substring(2, 4);
  const date = new Date().getFullYear();
  const dateEnd = String(date).substring(2, 4);
  const dateStart = String(date).substring(0, 2);
  if (parseInt(data) > parseInt(dateEnd)) {
    return String(parseInt(dateStart) - 1) + data;
  } else {
    return dateStart + data;
  }
}

async function calcSaldo(dataI, dataF, orgao, consolidado, type, witch) {
  if (witch === 1) {
    const aocValue = parseInt(
      (await aocInfo(dataI, dataF, orgao, consolidado, type))
        .replaceAll(",", "")
        .replaceAll(".", "")
    );
    const empValue = parseInt(
      (await empInfo(dataI, dataF, orgao, consolidado, type))
        .replaceAll(",", "")
        .replaceAll(".", "")
    );

    return toRS(String((aocValue - empValue) / 100));
  } else {
    const aocValue = parseInt(
      (await aocInfo(dataI, dataF, orgao, consolidado, type))
        .replaceAll(",", "")
        .replaceAll(".", "")
    );

    const lqdValue = parseInt(
      (await lqdInfo(dataI, dataF, orgao, consolidado, type))
        .replaceAll(",", "")
        .replaceAll(".", "")
    );

    return toRS(String((aocValue - lqdValue) / 100));
  }
}

function sumInfo(info, quant, type) {
  type = type || "sum";
  quant = quant || 10;
  const output = [];

  for (let size = 0; size < quant; size++) {
    output.push(0);
  }
  if (type === "sum") {
    for (let value = 0; value < quant; value++) {
      for (let i in info) {
        let num = parseInt(
          info[i][value].replaceAll(",", "").replaceAll(".", "")
        );
        output[value] += num;
      }
    }
  } else if (type === "sub") {
    info[0].forEach((e, index) => {
      const num = parseInt(e.replaceAll(",", "").replaceAll(".", ""));
      output[index] = num * 2;
    });
    for (let value = 0; value < quant; value++) {
      for (let i in info) {
        let num = parseInt(
          info[i][value].replaceAll(",", "").replaceAll(".", "")
        );
        output[value] -= num;
      }
    }
  }

  for (let i in output) {
    output[i] = toRS(String(output[i] / 100));
  }

  return output;
}

function divInfo(val1, val2) {
  return toPercent(
    String(
      (parseInt(val1.replaceAll(",", "").replaceAll(".", "")) /
        parseInt(val2.replaceAll(",", "").replaceAll(".", ""))) *
        100
    )
  );
}

function subInfo(val1, val2) {
  return toRS(
    String(
      (parseInt(val1.replaceAll(",", "").replaceAll(".", "")) -
        parseInt(val2.replaceAll(",", "").replaceAll(".", ""))) /
        100
    )
  );
}

function toPercent(value) {
  if (value == "NaN" || !value) {
    return "0,00";
  }
  return String(parseFloat(value)?.toFixed(2)).replace(".", ",") || "0,00";
}

export default {
  getRreoAnexo,
  toRS,
  dataToYear,
  sumInfo,
  sumValues,
  filterOrg,
};
