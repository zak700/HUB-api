import { db } from "../../../database/postgres.js";
import dataHelper from "./controller.anexo1.js";

import natureza from "../../../helpers/natureza.js";

const permReceitas = {
  //-- RECEITAS CORRENTES (I)

  //-- Contribuição Segurados----------------------------------//
  contribuicaoSeguradoAtivo: [
    "12150110",
    "12150111",
    "12150112",
    "12150113",
    "12150114",
    "12150115",
    "12150116",
    "12150117",
    "12150118",
    "12150140",
    "12150300",
    "12150301",
    "72150110",
    "72150140",
    "72150300",
  ],
  contribuicaoSeguradoInativo: [
    "12150120",
    "12150121",
    "12150122",
    "12150123",
    "12150125",
    "12150126",
    "12150127",
    "12150128",
    "12150150",
    "72150120",
    "72150150",
  ],
  contribuicaoSeguradoPensionista: [
    "12150130",
    "12150160",
    "12150131",
    "12150132",
    "12150133",
    "12150134",
    "12150135",
    "12150136",
    "12150137",
    "12150138",
    "72150210",
    "72150220",
    "72155110",
  ],

  //--Contribuição Patronais-----------------------------------//
  contribuicaoPatronalAtivo: [
    "12150210",
    "12150220",
    "12155110",
    "12150211",
    "12150212",
    "12150213",
    "12150214",
    "12150215",
    "12150201",
    "12150216",
    "12150217",
    "12150218",
    "12150220",
    "12155110",
    "72150210",
    "72150211",
    "72155111",
    "72150220",
    "75155110",
    "72150212",
  ],
  contribuicaoPatronalInativo: [
    "12155010",
    "12155011",
    "12155012",
    "12155013",
    "12155014",
    "12155015",
    "12155016",
    "12155017",
    "12155018",
    "12155010",
    "12155030",
    "12155120",
    "72155010",
    "72155030",
    "72155120",
  ],
  contribuicaoPatronalPensionista: [
    "12155020",
    "12155021",
    "12155022",
    "12155023",
    "12155024",
    "12155025",
    "12155026",
    "12155027",
    "12155028",
    "15155020",
    "12155040",
    "12155130",
    "72155020",
    "72155040",
    "72155130",
  ],

  //--Receita Patrimonial-------------------------------------------//
  receitaImobiliarias: ["13100000", "73100000"],
  valoresMobiliarios: ["13200000", "73200000"],
  receitasPatrimoniais: [
    "13000000",
    "13100000",
    "13100000",
    "13200000",
    "13210401", //--receita RPPS
    "73000000",
    "73100000",
    "73200000",
  ],

  //--Receita de Serviços------------------------------------------------//
  compensacaoEntreRegimes: ["19990300", "19990301", "79990300"],
  aporteDeficitAtuarial: ["19990100", "19990101", "79990100", "79990300"],
  demaisReceitasCorrentes: [
    "19000000",
    "19990300",
    "19990100",
    "19239901", //--Outros Ressarcimentos
    "79000000",
    "79990100",
    "79990300",
  ],

  //-- RECEITAS DE CAPITAL (II)

  //--Alienação de Bens, Direitos e Ativos----------------------------------------//
  alienacaoDeBens: ["22000000", "82000000"],

  //--Amortização de Empréstimos------------------------------------------------//
  amortizacaoEmprestimos: ["23000000", "83000000"],

  //-- DESPESAS PREVIDENCIÁRIAS - RPPS (FUNDO EM CAPITALIZAÇÃO)----------//

  //--Aposentadorias---------------------------------------------//
  aposentadorias: ["319001", "319091", "319092", "319094"],
  //--Pensões Morte----------------------------------------------------//
  pensoesMorte: ["319003", "319091", "319092", "319094"],
  //--Compensação Entre Regimes----------------------------------------//
  compensacaoEntreRegimes: ["339086"],
  //--Demais Despesas Previdenciárias---------------------------------//
  demaisDespesasPrevidenciarias: [
    "319001",
    "319003",
    "319091",
    "319092",
    "319094",
    "312200",
    "312200",
  ],

  //--TOTAL DAS DESPESAS DO FUNDO EM CAPITALIZAÇÃO (V)

  //--Recursos RPPS Arrecadados em Exercícios --------------------------//
  recursosArrecadadosExerciciosAnt: ["52110000"],
  //--Reserva Orçamentária do RPPS -----------------------------------//
  reservaOrcamentariaRPPS: ["52211000"],

  //-- Aportes de Recursos para o Fundo em Capitalização do RPPS----//
  amortizacaoPatronalSuplementar: [451320205],
  amortizacaoAportePeriodico: [451320202],
  outrosAportesRPPS: ["451320299", "451329900"],
  recursosCoberturaDeficit: ["451320201"],

  //--DESPESAS DA ADMINISTRAÇÃO - RPPS

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

  despesaDeCapital: [
    "445042",
    "445043",
    "449051",
    "449052",
    "449061",
    "449092",
    "449093",
    "469071",
  ],
};

async function getRreoAnexo(req, res) {
  try {
    const { dataF, orgao, consolidado, type } = req.query;

    const dataI = "01" + dataF.substring(2, 4);

    const output = {
      months: [],
      response: [],
    };

    const rec = await natureza.getCampo(
      "rec",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );
    const rsp = await natureza.getCampo(
      "rsp",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );
    const recBI = await natureza.getCampo(
      "rec",
      "bi",
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
    const recO = await natureza.getCampo(
      "recO",
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
    const dspO = await natureza.getCampo(
      "dspO",
      "y",
      orgao,
      consolidado,
      dataI,
      dataF
    );
    const emp = await natureza.getCampo(
      "emp",
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
    const allOPS = await natureza.getCampo(
      "ops",
      "m",
      orgao,
      "true",
      dataI,
      dataF
    );
    const allAOP = await natureza.getCampo(
      "aop",
      "m",
      orgao,
      "true",
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
    const anl = await natureza.getCampo(
      "anl",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );
    const ctb = await natureza.getCampo(
      "ctb",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );

    // ---------------------------------

    const getCampo1 = (
      permInicial = false,
      permFinal = false,
      fromFinal = false,
      exceto = false,
      fromExceto = 0
    ) => {
      const output = [];

      output.push(
        natureza.sub([
          {
            campo: natureza.filtrarPerm(
              recO,
              "rubrica",
              permInicial,
              0,
              permFinal,
              fromFinal,
              exceto,
              fromExceto
            ),
            toSub: "vlPrevisto",
          },
          {
            campo: natureza.filtrarPerm(
              are,
              "rubrica",
              permInicial,
              0,
              permFinal,
              fromFinal,
              exceto,
              fromExceto
            ),
            toSub: "vlAnulacao",
          },
        ]),
        natureza.sum([
          {
            campo: natureza.filtrarPerm(
              recBI,
              "rubrica",
              permInicial,
              0,
              permFinal,
              fromFinal,
              exceto,
              fromExceto
            ),
            toSum: "vlArrecadado",
          },
        ])
      );

      return output;
    };

    const getCampo2 = (
      permInicial = false,
      permFinal = false,
      fromFinal = false,
      exceto = false,
      fromExceto = 0
    ) => {
      const output = [];
      output.push(
        natureza.sum([
          {
            campo: natureza.filtrarSubPerm(
              aoc,
              "11",
              "codNaturezaDaDespesa",
              permInicial,
              0,
              permFinal,
              fromFinal,
              exceto,
              fromExceto
            ),
            toSum: "vlSaldoAtual",
          },
        ]),
        natureza.sub([
          {
            campo: natureza.filtrarPerm(
              emp,
              "elementoDespesa",
              permInicial,
              0,
              permFinal,
              fromFinal,
              exceto,
              fromExceto
            ),
            toSub: "vlBruto",
          },
          {
            campo: natureza.filtrarPerm(
              anl,
              "elementoDespesa",
              permInicial,
              0,
              permFinal,
              fromFinal,
              exceto,
              fromExceto
            ),
            toSub: "vlAnulacao",
          },
        ]),
        natureza.sub([
          {
            campo: natureza.filtrarPerm(
              lqd,
              "elementoDespesa",
              permInicial,
              0,
              permFinal,
              fromFinal,
              exceto,
              fromExceto
            ),
            toSub: "vlLiquidado",
          },
          {
            campo: natureza.filtrarPerm(
              alq,
              "elementoDespesa",
              permInicial,
              0,
              permFinal,
              fromFinal,
              exceto,
              fromExceto
            ),
            toSub: "vlAnulado",
          },
        ]),
        natureza.sub([
          {
            campo: natureza.filtrarPerm(
              ops,
              "vlOP",
              permInicial,
              0,
              permFinal,
              fromFinal,
              exceto,
              fromExceto
            ),
            toSub: "vlLiquidado",
          },
          {
            campo: natureza.filtrarPerm(
              aop,
              "elementoDespesa",
              permInicial,
              0,
              permFinal,
              fromFinal,
              exceto,
              fromExceto
            ),
            toSub: "vlAnuladoOP",
          },
        ]),
        ...natureza.subRS([
          natureza.sub([
            {
              campo: natureza.filtrarPerm(
                emp,
                "elementoDespesa",
                permInicial,
                0,
                permFinal,
                fromFinal,
                exceto,
                fromExceto
              ),
              toSub: "vlBruto",
            },
            {
              campo: natureza.filtrarPerm(
                anl,
                "elementoDespesa",
                permInicial,
                0,
                permFinal,
                fromFinal,
                exceto,
                fromExceto
              ),
              toSub: "vlAnulacao",
            },
          ]),
          natureza.sub([
            {
              campo: natureza.filtrarPerm(
                ops,
                "vlOP",
                permInicial,
                0,
                permFinal,
                fromFinal,
                exceto,
                fromExceto
              ),
              toSub: "vlLiquidado",
            },
            {
              campo: natureza.filtrarPerm(
                aop,
                "elementoDespesa",
                permInicial,
                0,
                permFinal,
                fromFinal,
                exceto,
                fromExceto
              ),
              toSub: "vlAnuladoOP",
            },
          ]),
        ])
      );
      return output;
    };

    const getCampo6 = (type) => {
      const output = [];

      output.push(
        natureza.sum([
          {
            campo: natureza.filtrarPerm(ctb, "tipoConta", type),
            toSum: "saldoFinal",
          },
        ])
      );

      return output;
    };

    const getCampo12 = (permInicial = false) => {
      const output = [];

      output.push(
        // aoc // 12 // codNaturezaDaDespesa // vlSaldoAtualfonte // fonte 177000
        natureza.sum([
          {
            campo: natureza.filtrarPerm(
              natureza.filtrarSubPerm(
                aoc,
                "12",
                "codNaturezaDaDespesa",
                permInicial
              ),
              "codFontRecursos",
              ["177"]
            ),
            toSum: "vlSaldoAtualFonte",
          },
        ]),
        // emp // 11 // elementoDespesa // vlRecurso // codFonteRecuso 177000 _ // anl // 11 // elementoDespesa // vlAnulacaoFonte // codFonteRecuso 177000
        natureza.sub([
          {
            campo: natureza.filtrarPerm(
              natureza.filtrarSubPerm(
                emp,
                "11",
                "elementoDespesa",
                permInicial
              ),
              "codFontRecursos",
              ["177000"]
            ),
            toSub: "vlRecurso",
          },
          {
            campo: natureza.filtrarPerm(
              natureza.filtrarSubPerm(
                anl,
                "11",
                "elementoDespesa",
                permInicial
              ),
              "codFontRecursos",
              ["177000"]
            ),
            toSub: "vlAnulacaoFonte",
          },
        ]),
        // lqd // 11 // elementoDespesa // vlDespesaFR // codFonteRecuso 177000 _ // alq // 11 // elementoDespesa // vlAnuladoFR // codFonteRecuso 177000
        natureza.sub([
          {
            campo: natureza.filtrarPerm(
              natureza.filtrarSubPerm(
                lqd,
                "11",
                "elementoDespesa",
                permInicial
              ),
              "codFonteRecurso",
              ["177000"]
            ),
            toSub: "dvlDespesaFR",
          },
          {
            campo: natureza.filtrarPerm(
              natureza.filtrarSubPerm(
                alq,
                "11",
                "elementoDespesa",
                permInicial
              ),
              "codFonteRecurso",
              ["177000"]
            ),
            toSub: "vlAnulacaoFonte",
          },
        ]),
        // ops // 13 // vlFR // elementoDespesa // codFonteRecuso 177000 _ // aop // 13 // elementoDespesa // vlAnulacaoFR // codFonteRecuso 177000
        natureza.sub([
          {
            campo: natureza.filtrarPerm(
              natureza.filtrarSubPerm(
                ops,
                "13",
                "elementoDespesa",
                permInicial
              ),
              "codFonteRecurso",
              ["177000"]
            ),
            toSub: "vlFR",
          },
          {
            campo: natureza.filtrarPerm(
              natureza.filtrarSubPerm(
                aop,
                "13",
                "elementoDespesa",
                permInicial
              ),
              "codFonteRecurso",
              ["177000"]
            ),
            toSub: "vlAnulacaoFR",
          },
        ]),
        // rsp // 10 // vlOriginal // dotOrig2002
        natureza.sum([
          {
            campo: natureza.filtrarPerm(rsp, "DotOrigP2002", permInicial, 13),
            toSum: "vlOriginal",
          },
        ])
      );

      return output;
    };

    output.response.push(
      ...[
        natureza.sumRS([
          // Outras Receitas Correntes
          natureza.sumRS([
            getCampo1(
              [
                "01215011",
                "01215014",
                "0121503",
                "07215011",
                "07215014",
                "0721503",
              ],
              false,
              false
            ), // Ativo
            getCampo1(["01215", "07215"], ["012", "015"], 5), // inativo
            getCampo1(["01215", "07215"], ["013", "016"], 5), // Pensionista
          ]), // Receita de Contribuições dos Segurados
          natureza.sumRS([
            getCampo1(["01215", "07215"], ["021", "022", "511"], 5), // Ativo
            getCampo1(["01215", "07215"], ["501", "503", "512"], 5), // Inativo
            getCampo1(["01215", "07215"], ["502", "504", "513"], 5), // Pensionista
          ]), // Receita de Contribuições Patronais
          natureza.sumRS([
            getCampo1(["0131", "0731"]), // Receitas Imobiliárias
            getCampo1(["0132", "0732"]), // Receitas de Valores Mobiliários
            getCampo1(
              ["013", "073"],
              false,
              false,
              ["0131", "0132", "0731", "0732"],
              0
            ), // Outras Receitas Patrimoniais
          ]), // Receita Patrimonial
          getCampo1(["016", "076"]), // Receita de Serviços
          natureza.sumRS([
            getCampo1(["0199903", "0799903"]), // Compensação Financeira entre os regimes
            getCampo1(["0199901", "0799901"]), // Aportes Periódicos para Amortização de Déficit Atuarial do RPPS (II)1
            getCampo1(["019", "079"], false, false, [
              "0199903",
              "0199901",
              "0799903",
              "0799901",
            ]), // Demais Receitas Correntes
          ]), // Outras Receitas Correntes
        ]), // RECEITAS CORRENTES (I)

        natureza.sumRS([
          getCampo1(
            [
              "01215011",
              "01215014",
              "0121503",
              "07215011",
              "07215014",
              "0721503",
            ],
            false,
            false
          ), // Ativo
          getCampo1(["01215", "07215"], ["012", "015"], 5), // inativo
          getCampo1(["01215", "07215"], ["013", "016"], 5), // Pensionista
        ]), // Receita de Contribuições dos Segurados
        getCampo1([
          "01215011",
          "01215014",
          "0121503",
          "07215011",
          "07215014",
          "0721503",
        ]), // Ativo
        getCampo1(["01215", "07215"], ["012", "015"], 5), // inativo
        getCampo1(["01215", "07215"], ["013", "016"], 5), // Pensionista
        natureza.sumRS([
          getCampo1(["01215", "07215"], ["021", "022", "511"], 5), // Ativo
          getCampo1(["01215", "07215"], ["501", "503", "512"], 5), // Inativo
          getCampo1(["01215", "07215"], ["502", "504", "513"], 5), // Pensionista
        ]), // Receita de Contribuições Patronais
        getCampo1(["01215", "07215"], ["021", "022", "511"], 5), // Ativo
        getCampo1(["01215", "07215"], ["501", "503", "512"], 5), // Inativo
        getCampo1(["01215", "07215"], ["502", "504", "513"], 5), // Pensionista
        natureza.sumRS([
          getCampo1(["0131", "0731"]), // Receitas Imobiliárias
          getCampo1(["0132", "0732"]), // Receitas de Valores Mobiliários
          getCampo1(
            ["013", "073"],
            false,
            false,
            ["0131", "0132", "0731", "0732"],
            0
          ), // Outras Receitas Patrimoniais
        ]), // Receita Patrimonial
        getCampo1(["0131", "0731"]), // Receitas Imobiliárias
        getCampo1(["0132", "0732"]), // Receitas de Valores Mobiliários
        getCampo1(
          ["013", "073"],
          false,
          false,
          ["0131", "0132", "0731", "0732"],
          0
        ), // Outras Receitas Patrimoniais
        getCampo1(["016", "076"]), // Receita de Serviços
        natureza.sumRS([
          getCampo1(["0199903", "0799903"]), // Compensação Financeira entre os regimes
          getCampo1(["0199901", "0799901"]), // Aportes Periódicos para Amortização de Déficit Atuarial do RPPS (II)1
          getCampo1(["019", "079"], false, false, [
            "0199903",
            "0199901",
            "0799903",
            "0799901",
          ]), // Demais Receitas Correntes
        ]), // Outras Receitas Correntes
        getCampo1(["0199903", "0799903"]), // Compensação Financeira entre os regimes
        getCampo1(["0199901", "0799901"]), // Aportes Periódicos para Amortização de Déficit Atuarial do RPPS (II)1
        getCampo1(["019", "079"], false, false, [
          "0199903",
          "0199901",
          "0799903",
          "0799901",
        ]), // Demais Receitas Correntes
        natureza.sumRS([
          getCampo1(["022", "082"]), // Alienação de Bens, Direitos e Ativos
          getCampo1(["023", "083"]), // Amortização de Empréstimos
          getCampo1(["02", "08"], false, false, ["022", "023", "082", "083"]), // Outras Receitas de Capital
        ]), // RECEITAS DE CAPITAL (III)
        getCampo1(["022", "082"]), // Alienação de Bens, Direitos e Ativos
        getCampo1(["023", "083"]), // Amortização de Empréstimos
        getCampo1(["02", "08"], false, false, ["022", "023", "082", "083"]), // Outras Receitas de Capital
        natureza.subRS([
          natureza.sumRS([
            natureza.sumRS([
              // Outras Receitas Correntes
              natureza.sumRS([
                getCampo1(
                  [
                    "01215011",
                    "01215014",
                    "0121503",
                    "07215011",
                    "07215014",
                    "0721503",
                  ],
                  false,
                  false
                ), // Ativo
                getCampo1(["01215", "07215"], ["012", "015"], 5), // inativo
                getCampo1(["01215", "07215"], ["013", "016"], 5), // Pensionista
              ]), // Receita de Contribuições dos Segurados
              natureza.sumRS([
                getCampo1(["01215", "07215"], ["021", "022", "511"], 5), // Ativo
                getCampo1(["01215", "07215"], ["501", "503", "512"], 5), // Inativo
                getCampo1(["01215", "07215"], ["502", "504", "513"], 5), // Pensionista
              ]), // Receita de Contribuições Patronais
              natureza.sumRS([
                getCampo1(["0131", "0731"]), // Receitas Imobiliárias
                getCampo1(["0132", "0732"]), // Receitas de Valores Mobiliários
                getCampo1(
                  ["013", "073"],
                  false,
                  false,
                  ["0131", "0132", "0731", "0732"],
                  0
                ), // Outras Receitas Patrimoniais
              ]), // Receita Patrimonial
              getCampo1(["016", "076"]), // Receita de Serviços
              natureza.sumRS([
                getCampo1(["0199903", "0799903"]), // Compensação Financeira entre os regimes
                getCampo1(["0199901", "0799901"]), // Aportes Periódicos para Amortização de Déficit Atuarial do RPPS (II)1
                getCampo1(["019", "079"], false, false, [
                  "0199903",
                  "0199901",
                  "0799903",
                  "0799901",
                ]), // Demais Receitas Correntes
              ]), // Outras Receitas Correntes
            ]), // RECEITAS CORRENTES (I)
            natureza.sumRS([
              getCampo1(["022", "082"]), // Alienação de Bens, Direitos e Ativos
              getCampo1(["023", "083"]), // Amortização de Empréstimos
              getCampo1(["02", "08"], false, false, [
                "022",
                "023",
                "082",
                "083",
              ]), // Outras Receitas de Capital
            ]), // RECEITAS DE CAPITAL (III)
          ]),
          getCampo1(["0199901", "0799901"]), // Aportes Periódicos para Amortização de Déficit Atuarial do RPPS (II)1
        ]),
      ]
    ); // RECEITAS PREVIDENCIÁRIAS - RPPS (FUNDO EM CAPITALIZAÇÃO)

    output.response.push(
      ...[
        natureza.sumRS([
          getCampo2(
            ["3190"],
            [
              "0101",
              "0106",
              "0118",
              "0151",
              "0199",
              "9109",
              "9115",
              "9123",
              "9128",
              "9201",
              "9403",
            ],
            4
          ), // aposentadorias

          getCampo2(
            ["3190"],
            [
              "0301",
              "0303",
              "0305",
              "0351",
              "0399",
              "9110",
              "9116",
              "9130",
              "9136",
              "9203",
              "9413",
            ],
            4
          ), // Pensões por Morte
        ]), // Benefícios

        getCampo2(
          ["3190"],
          [
            "0101",
            "0106",
            "0118",
            "0151",
            "0199",
            "9109",
            "9115",
            "9123",
            "9128",
            "9201",
            "9403",
          ],
          4
        ), // aposentadorias

        getCampo2(
          ["3190"],
          [
            "0301",
            "0303",
            "0305",
            "0351",
            "0399",
            "9110",
            "9116",
            "9130",
            "9136",
            "9203",
            "9413",
          ],
          4
        ), // Pensões por Morte

        natureza.sumRS([
          getCampo2(["339086", "339186"]), // Compensação Financeira entre os regimes
          getCampo2(["3190"], false, 0, ["01", "03", "91", "92", "94"], 4), // Demais Despesas Previdenciárias
        ]), // Outras Despesas Previdenciárias

        getCampo2(["339086", "339186"]), // Compensação Financeira entre os regimes
        getCampo2(["3190"], false, 0, ["01", "03", "91", "92", "94"], 4), // Demais Despesas Previdenciárias

        natureza.sumRS([
          natureza.sumRS([
            getCampo2(["339086", "339186"]), // Compensação Financeira entre os regimes
            getCampo2(["3190"], false, 0, ["01", "03", "91", "92", "94"], 4), // Demais Despesas Previdenciárias
          ]), // Outras Despesas Previdenciárias
          natureza.sumRS([
            getCampo2(
              ["3190"],
              [
                "0101",
                "0106",
                "0118",
                "0151",
                "0199",
                "9109",
                "9115",
                "9123",
                "9128",
                "9201",
                "9403",
              ],
              4
            ), // aposentadorias

            getCampo2(
              ["3190"],
              [
                "0301",
                "0303",
                "0305",
                "0351",
                "0399",
                "9110",
                "9116",
                "9130",
                "9136",
                "9203",
                "9413",
              ],
              4
            ), // Pensões por Morte
          ]), // Benefícios
        ]), // TOTAL DAS DESPESAS DO FUNDO EM CAPITALIZAÇÃO (V)
      ]
    ); // campo 2

    output.response.push(
      natureza.zerado(1),
      [
        natureza.sum([
          {
            campo: natureza.filtrarPerm(dspO, "codNaturezaDaDespesa", [
              "999999",
            ]),
            toSum: "recurso",
          },
        ]),
      ],
      natureza.zerado(1),
      [
        natureza.sub([
          {
            campo: natureza.filtrarPerm(allOPS, "elementoDespesa", ["339197"]),
            toSub: "vlOP",
          },
          {
            campo: natureza.filtrarPerm(allAOP, "elementoDespesa", ["339197"]),
            toSub: "vlAnuladoOP",
          },
        ]),
      ],
      natureza.zerado(1),
      natureza.zerado(1)
    );

    output.response.push(
      getCampo6(["01"]),
      getCampo6(["02"]),
      getCampo6(["04", "05"])
    ); // campo 6

    output.response.push(
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(5),
      natureza.zerado(5),
      natureza.zerado(5),
      natureza.zerado(5),
      natureza.zerado(5),
      natureza.zerado(5),
      natureza.zerado(5),
      natureza.zerado(1),
      natureza.zerado(1),
      natureza.zerado(1),
      natureza.zerado(1),
      natureza.zerado(1),
      natureza.zerado(1),
      natureza.zerado(1)
    );

    output.response.push(
      [
        natureza.sub([
          {
            campo: natureza.filtrarPerm(recO, "rubrica", [
              "012150111",
              "012150121",
              "013210401",
            ]),
            toSub: "vlPrevisto",
          },
          {
            campo: natureza.filtrarPerm(are, "rubrica", [
              "012150111",
              "012150121",
              "013210401",
            ]),
            toSub: "vlAnulacao",
          },
        ]),
        natureza.sum([
          {
            campo: natureza.filtrarSubPerm(
              natureza.filtrarPerm(rec, "rubrica", [
                "012150111",
                "012150121",
                "013210401",
              ]),
              "12",
              "codFonteRecurso",
              ["103000"],
              0
            ),
            toSum: "vlFonteRecurso",
          },
        ]),
      ],
      [
        natureza.sub([
          {
            campo: natureza.filtrarPerm(recO, "rubrica", [
              "012150111",
              "012150121",
              "013210401",
            ]),
            toSub: "vlPrevisto",
          },
          {
            campo: natureza.filtrarPerm(are, "rubrica", [
              "012150111",
              "012150121",
              "013210401",
            ]),
            toSub: "vlAnulacao",
          },
        ]),
        natureza.sum([
          {
            campo: natureza.filtrarSubPerm(
              natureza.filtrarPerm(rec, "rubrica", [
                "012150111",
                "012150121",
                "013210401",
              ]),
              "12",
              "codFonteRecurso",
              ["103000"],
              0
            ),
            toSum: "vlFonteRecurso",
          },
        ]),
      ]
    );

    output.response.push(
      natureza.sumRS([
        getCampo12(["319011", "319013"]),
        getCampo12([
          "319094",
          "329021",
          "329022",
          "339014",
          "339030",
          "339034",
          "339035",
          "339036",
          "339039",
          "339040",
        ]),
        getCampo12(["449051", "449052"]),
      ]),
      getCampo12(["319011", "319013"]),
      getCampo12([
        "319094",
        "329021",
        "329022",
        "339014",
        "339030",
        "339034",
        "339035",
        "339036",
        "339039",
        "339040",
      ]),
      getCampo12(["449051", "449052"]),
      natureza.sumRS([
        natureza.sumRS([
          getCampo12(["319011", "319013"]),
          getCampo12([
            "319094",
            "329021",
            "329022",
            "339014",
            "339030",
            "339034",
            "339035",
            "339036",
            "339039",
            "339040",
          ]),
          getCampo12(["449051", "449052"]),
        ]),
        getCampo12(["449051", "449052"]),
      ]),
      natureza.subRS([
        [
          natureza.sum([
            {
              campo: natureza.filtrarSubPerm(
                natureza.filtrarPerm(rec, "rubrica", [
                  "012150111",
                  "012150121",
                  "013210401",
                ]),
                "12",
                "codFonteRecurso",
                ["103000"],
                0
              ),
              toSum: "vlFonteRecurso",
            },
          ]),
          natureza.sum([
            {
              campo: natureza.filtrarSubPerm(
                natureza.filtrarPerm(rec, "rubrica", [
                  "012150111",
                  "012150121",
                  "013210401",
                ]),
                "12",
                "codFonteRecurso",
                ["103000"],
                0
              ),
              toSum: "vlFonteRecurso",
            },
          ]),
          natureza.sum([
            {
              campo: natureza.filtrarSubPerm(
                natureza.filtrarPerm(rec, "rubrica", [
                  "012150111",
                  "012150121",
                  "013210401",
                ]),
                "12",
                "codFonteRecurso",
                ["103000"],
                0
              ),
              toSum: "vlFonteRecurso",
            },
          ]),
          natureza.sum([
            {
              campo: natureza.filtrarSubPerm(
                natureza.filtrarPerm(rec, "rubrica", [
                  "012150111",
                  "012150121",
                  "013210401",
                ]),
                "12",
                "codFonteRecurso",
                ["103000"],
                0
              ),
              toSum: "vlFonteRecurso",
            },
          ]),
          natureza.sum([
            {
              campo: natureza.filtrarSubPerm(
                natureza.filtrarPerm(rec, "rubrica", [
                  "012150111",
                  "012150121",
                  "013210401",
                ]),
                "12",
                "codFonteRecurso",
                ["103000"],
                0
              ),
              toSum: "vlFonteRecurso",
            },
          ]),
        ],
        natureza.sumRS([
          natureza.sumRS([
            getCampo12(["319011", "319013"]),
            getCampo12([
              "319094",
              "329021",
              "329022",
              "339014",
              "339030",
              "339034",
              "339035",
              "339036",
              "339039",
              "339040",
            ]),
            getCampo12(["449051", "449052"]),
          ]),
          getCampo12(["449051", "449052"]),
        ]),
      ])
    );

    output.response.push(
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(2),
      natureza.zerado(5),
      natureza.zerado(5),
      natureza.zerado(5),
      natureza.zerado(5),
      natureza.zerado(5),
      natureza.zerado(5),
      natureza.zerado(5),
    );

    return res.status(200).json({ output: output });
  } catch (error) {
    console.error("error at getRreoAnexo from controller.anexo.4", error);
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default { getRreoAnexo };
