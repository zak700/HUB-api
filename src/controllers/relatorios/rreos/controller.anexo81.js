//-- DEMONSTRATIVO DAS RECEITAS E DESPESAS COM MDE-------------//

import { db } from "../../../database/postgres.js";
import natureza from "../../../helpers/natureza.js";
import dataHelper from "./controller.anexo101.js";

const permReceitas = {
  //-- Codificação das Receitas Resultantes de Impostos--------//

  //-- Impostos -----------------------------------------------//
  iptu: ["011125001", "011125002", "011125003", "011125004"],

  //-- ITBI----------------------------------------------------//
  itbi: ["011125301"],

  // -- ISSQN -------------------------------------------------//
  issqn: ["011145111", "011145112", "011145113", "011145114"],

  // -- IRRF---------------------------------------------------//
  irrf: ["011130311", "011130341"],

  // -- Cota-Parte do FPM - Conta Mensal----------------------//
  fpmPrincipal: ["017115111"],

  // -- Cota-Parte do FPM - ExtraOrdinárias-------------------//
  fpmExtraOrdinarias: ["017115121"],

  // -- Cota-Parte do ICMS - Principal------------------------//
  icms: ["017215001"],

  // -- Cota-Parte do IPI - Municípios-----------------------//
  ipi: ["017215201"],

  // -- Cota-Parte do ITR - Principal-----------------------//
  itr: ["017115201"],

  // -- Cota-Parte do IPVA - Principal-----------------------//
  ipva: ["017215101"],

  // -- Cota-Parte IOF-OURO - Principal-iofOuro-----------------//
  iofOuro: ["0171155"],

  // -- Outras Transferências-CFEM/FEP/COMPLEMENTO/MULTAS---//
  outrasTransferencias: ["17125101", "17125241", "17195801", "19110101"],

  //--RECEITAS DO FUNDEB RECEBIDAS NO EXERCICIO--------------//

  //---6.1.1-Principal / IPTU/ITBI/ISSQN/IRRF---------------//
  impostosTransferencia: ["017515001"],

  //---6.1.2-Rendimentos de Aplicaçao Financeira-------------//
  rendimentosAplicacao: ["013210101"],
  //---6.4---FUNDEB - Complementação da União - VAAR--------//
  complementoUniao: ["017155201"],

  outrosDespesas: [
    "339008",
    "339030",
    "339032",
    "339039",
    "339040",
    "339046",
    "339049",
    "339197",
    "449051",
    "449052",
  ],
};

async function getRreoAnexo(req, res) {
  try {
    const { dataI, dataF, orgao, consolidado } = req.query;

    const output = [];

    const orgaoCampo = await db("orgao").select("*");

    const tipoOrgao3 = orgaoCampo
      .filter((orgao) => orgao.content.tipoOrgao === "03")
      .map((orgao) => orgao.content.codOrgao);

    const tipoOrgao14 = orgaoCampo
      .filter((orgao) => orgao.content.tipoOrgao === "14")
      .map((orgao) => orgao.content.codOrgao);

    const tipoOrgao1 = orgaoCampo
      .filter((orgao) => orgao.content.tipoOrgao === "01")
      .map((orgao) => orgao.content.codOrgao);

    const recO = await natureza.getCampo(
      "recO",
      "y",
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
    const rsp = await natureza.getCampo(
      "rsp",
      "m",
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
    const ctb = await natureza.getCampo(
      "ctb",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );

    const getCampo1 = (inicial, campo1 = false) => {
      const recOFiltered = natureza.filtrarPerm(recO, "codOrgao", tipoOrgao3);
      const areFiltered = natureza.filtrarPerm(are, "codOrgao", tipoOrgao3);
      const recFiltered = natureza.filtrarPerm(rec, "codOrgao", tipoOrgao3);
      return [
        natureza.sub([
          {
            campo: natureza.filtrarPerm(
              campo1 ? recOFiltered : recO,
              "rubrica",
              inicial
            ),
            toSub: "vlPrevisto",
          },
          {
            campo: natureza.filtrarPerm(
              campo1 ? areFiltered : are,
              "rubrica",
              inicial
            ),
            toSub: "vlAnulacao",
          },
        ]),
        natureza.sub([
          {
            campo: natureza.filtrarPerm(
              campo1 ? recFiltered : rec,
              "rubrica",
              inicial
            ),
            toSub: "vlArrecadado",
          },
          {
            campo: natureza.filtrarPerm(
              campo1 ? areFiltered : are,
              "rubrica",
              inicial
            ),
            toSub: "vlAnulacao",
          },
        ]),
      ];
    };

    const getCampo4 = (
      codSubFuncao = [],
      elementoDespesa = [],
      is9 = false
    ) => {
      const dspOFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(
          natureza.filtrarPerm(dspO, "codOrgao", tipoOrgao3),
          "codNaturezaDaDespesa",
          elementoDespesa
        ),
        "codOrgao",
        is9 ? tipoOrgao14 : [""]
      );
      const aocFiltered = natureza.filtrarPerm(
        natureza.filtrarSubPerm(
          natureza.filtrarPerm(aoc, "codOrgao", tipoOrgao3),
          "11",
          "codNaturezaDaDespesa",
          elementoDespesa
        ),
        "codOrgao",
        is9 ? tipoOrgao14 : [""]
      );
      const empFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(
          natureza.filtrarPerm(emp, "codOrgao", tipoOrgao3),
          "elementoDespesa",
          elementoDespesa
        ),
        "codOrgao",
        is9 ? tipoOrgao14 : [""]
      );
      const anlFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(
          natureza.filtrarPerm(anl, "codOrgao", tipoOrgao3),
          "elementoDespesa",
          elementoDespesa
        ),
        "codOrgao",
        is9 ? tipoOrgao14 : [""]
      );
      const lqdFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(
          natureza.filtrarPerm(lqd, "codOrgao", tipoOrgao3),
          "elementoDespesa",
          elementoDespesa
        ),
        "codOrgao",
        is9 ? tipoOrgao14 : [""]
      );
      const alqFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(
          natureza.filtrarPerm(alq, "codOrgao", tipoOrgao3),
          "elementoDespesa",
          elementoDespesa
        ),
        "codOrgao",
        is9 ? tipoOrgao14 : [""]
      );
      const opsFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(
          natureza.filtrarPerm(ops, "codOrgao", tipoOrgao3),
          "elementoDespesa",
          elementoDespesa
        ),
        "codOrgao",
        is9 ? tipoOrgao14 : [""]
      );
      const aopFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(
          natureza.filtrarPerm(aop, "codOrgao", tipoOrgao3),
          "elementoDespesa",
          elementoDespesa
        ),
        "codOrgao",
        is9 ? tipoOrgao14 : [""]
      );
      return [
        natureza.sub([
          {
            campo: natureza.filtrarPerm(
              dspOFiltered,
              "codSubFuncao",
              codSubFuncao
            ),
            toSub: "recurso",
          },
          {
            campo: natureza.filtrarPerm(
              aocFiltered,
              "codSubFuncao",
              codSubFuncao
            ),
            toSub: "vlAlteracao",
          },
        ]),
        natureza.sub([
          {
            campo: natureza.filtrarPerm(
              empFiltered,
              "codSubFuncao",
              codSubFuncao
            ),
            toSub: "vlBruto",
          },
          {
            campo: natureza.filtrarPerm(
              anlFiltered,
              "codSubFuncao",
              codSubFuncao
            ),
            toSub: "vlAnulacao",
          },
        ]),
        natureza.sub([
          {
            campo: natureza.filtrarPerm(
              lqdFiltered,
              "codSubFuncao",
              codSubFuncao
            ),
            toSub: "vlLiquidado",
          },
          {
            campo: natureza.filtrarPerm(
              alqFiltered,
              "codSubFuncao",
              codSubFuncao
            ),
            toSub: "vlAnulado",
          },
        ]),
        natureza.sub([
          {
            campo: natureza.filtrarPerm(
              opsFiltered,
              "codSubFuncao",
              codSubFuncao
            ),
            toSub: "vlOP",
          },
          {
            campo: natureza.filtrarPerm(
              aopFiltered,
              "codSubFuncao",
              codSubFuncao
            ),
            toSub: "vlAnuladoOP",
          },
        ]),
        ...natureza.subRS([
          natureza.sub([
            {
              campo: natureza.filtrarPerm(
                empFiltered,
                "codSubFuncao",
                codSubFuncao
              ),
              toSub: "vlBruto",
            },
            {
              campo: natureza.filtrarPerm(
                anlFiltered,
                "codSubFuncao",
                codSubFuncao
              ),
              toSub: "vlAnulacao",
            },
          ]),
          natureza.sub([
            {
              campo: natureza.filtrarPerm(
                opsFiltered,
                "codSubFuncao",
                codSubFuncao
              ),
              toSub: "vlOP",
            },
            {
              campo: natureza.filtrarPerm(
                aopFiltered,
                "codSubFuncao",
                codSubFuncao
              ),
              toSub: "vlAnuladoOP",
            },
          ]),
        ]),
      ];
    };

    const getCampo5 = (codSubFuncao = [], elementoDespesa = []) => {
      const opsFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(ops, "codOrgao", tipoOrgao3),
        "elementoDespesa",
        elementoDespesa
      );
      const aopFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(aop, "codOrgao", tipoOrgao3),
        "elementoDespesa",
        elementoDespesa
      );
      const empFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(emp, "codOrgao", tipoOrgao3),
        "elementoDespesa",
        elementoDespesa
      );
      const anlFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(anl, "codOrgao", tipoOrgao3),
        "elementoDespesa",
        elementoDespesa
      );
      const lqdFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(lqd, "codOrgao", tipoOrgao3),
        "elementoDespesa",
        elementoDespesa
      );
      const alqFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(alq, "codOrgao", tipoOrgao3),
        "elementoDespesa",
        elementoDespesa
      );
      const campoEMP = natureza.sub([
        {
          campo: natureza.filtrarPerm(
            empFiltered,
            "codSubFuncao",
            codSubFuncao
          ),
          toSub: "vlBruto",
        },
        {
          campo: natureza.filtrarPerm(
            anlFiltered,
            "codSubFuncao",
            codSubFuncao
          ),
          toSub: "vlAnulacao",
        },
      ]);
      const campoLQD = natureza.sub([
        {
          campo: natureza.filtrarPerm(
            lqdFiltered,
            "codSubFuncao",
            codSubFuncao
          ),
          toSub: "vlLiquidado",
        },
        {
          campo: natureza.filtrarPerm(
            alqFiltered,
            "codSubFuncao",
            codSubFuncao
          ),
          toSub: "vlAnulado",
        },
      ]);
      const campoOP = natureza.sub([
        {
          campo: natureza.filtrarPerm(
            opsFiltered,
            "codSubFuncao",
            codSubFuncao
          ),
          toSub: "vlOP",
        },
        {
          campo: natureza.filtrarPerm(
            aopFiltered,
            "codSubFuncao",
            codSubFuncao
          ),
          toSub: "vlAnuladoOP",
        },
      ]);

      return [
        campoEMP,
        campoLQD,
        campoOP,
        natureza.subRS([campoEMP, campoOP])[0],
        "0,00",
        "0,00",
      ];
    };

    // console.log(dataF.substring(0, 2) === "12" ? 0 : 1);

    const getCampo6 = () => {
      const valueEMP =
        parseInt(
          getCampo5(["365", "361", "366", "367"], ["319011", "319013"])
            [dataF.substring(0, 2) === "12" ? 0 : 1].replaceAll(",", "")
            .replaceAll(".", "")
        ) / 100;
      const valueDED =
        parseInt(
          natureza
            .sumRS([
              natureza.sumRS([
                getCampo1(permReceitas.impostosTransferencia, true),
                getCampo1(permReceitas.rendimentosAplicacao, true),
              ]), // 6.1
              getCampo1(permReceitas.complementoUniao, true), // 6.4
            ])[1]
            .replaceAll(",", "")
            .replaceAll(".", "")
        ) / 100;
      return [
        natureza.toRS(String((valueDED * 0.7).toFixed(2))),
        natureza.toRS(String(valueEMP)),
        natureza.toRS(String(valueEMP)),
        natureza.toRS(String(((valueEMP / valueDED) * 100).toFixed(2))),
      ];
    };

    const getCampo7 = () => {
      const valueDED =
        parseInt(
          natureza
            .sumRS([
              natureza.sumRS([
                getCampo1(permReceitas.impostosTransferencia, true),
                getCampo1(permReceitas.rendimentosAplicacao, true),
              ]), // 6.1
              getCampo1(permReceitas.complementoUniao, true), // 6.4
            ])[1]
            .replaceAll(",", "")
            .replaceAll(".", "")
        ) / 100;
      const valueEMP =
        parseInt(
          getCampo5(["365", "361", "366", "367"], ["319011", "319013"])[0]
            .replaceAll(",", "")
            .replaceAll(".", "")
        ) / 100;

      return [
        natureza.toRS(String((valueDED / 10).toFixed(2))),
        natureza.toRS(String((valueDED - valueEMP).toFixed(2))),
        natureza.toRS(String((valueDED - valueEMP).toFixed(2))),
        "0,00",
        natureza.toRS(
          String((((valueDED - valueEMP) / valueDED) * 100).toFixed(2))
        ),
      ];
    };

    const getCampo8 = () => {
      const opsFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(ops, "tipoOP", ["3"]),
        "codOrgao",
        tipoOrgao3
      );
      const aopFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(aop, "tipoOP", ["3"]),
        "codOrgao",
        tipoOrgao3
      );

      return [
        natureza.sub([
          {
            campo: opsFiltered,
            toSub: "vlOP",
          },
          {
            campo: aopFiltered,
            toSub: "vlAnuladoOP",
          },
        ]),
        "0,00",
        "0,00",
        "0,00",
        "0,00",
        "0,00",
      ];
    };

    const getCampo9 = (codSubFuncao = [], tipoOrgao = tipoOrgao14) => {
      const dspOFiltered = natureza.filtrarPerm(dspO, "codOrgao", tipoOrgao);
      const aocFiltered = natureza.filtrarPerm(aoc, "codOrgao", tipoOrgao);
      const empFiltered = natureza.filtrarPerm(emp, "codOrgao", tipoOrgao);
      const anlFiltered = natureza.filtrarPerm(anl, "codOrgao", tipoOrgao);
      const lqdFiltered = natureza.filtrarPerm(lqd, "codOrgao", tipoOrgao);
      const alqFiltered = natureza.filtrarPerm(alq, "codOrgao", tipoOrgao);
      const opsFiltered = natureza.filtrarPerm(ops, "codOrgao", tipoOrgao);
      const aopFiltered = natureza.filtrarPerm(aop, "codOrgao", tipoOrgao);
      return [
        natureza.sub([
          {
            campo: natureza.filtrarPerm(
              dspOFiltered,
              "codSubFuncao",
              codSubFuncao
            ),
            toSub: "recurso",
          },
          {
            campo: natureza.filtrarSubPerm(
              aocFiltered,
              "11",
              "codSubFuncao",
              codSubFuncao
            ),
            toSub: "vlAlteracao",
          },
        ]),
        natureza.sub([
          {
            campo: natureza.filtrarPerm(
              empFiltered,
              "codSubFuncao",
              codSubFuncao
            ),
            toSub: "vlBruto",
          },
          {
            campo: natureza.filtrarPerm(
              anlFiltered,
              "codSubFuncao",
              codSubFuncao
            ),
            toSub: "vlAnulacao",
          },
        ]),
        natureza.sub([
          {
            campo: natureza.filtrarPerm(
              lqdFiltered,
              "codSubFuncao",
              codSubFuncao
            ),
            toSub: "vlLiquidado",
          },
          {
            campo: natureza.filtrarPerm(
              alqFiltered,
              "codSubFuncao",
              codSubFuncao
            ),
            toSub: "vlAnulado",
          },
        ]),
        natureza.sub([
          {
            campo: natureza.filtrarPerm(
              opsFiltered,
              "codSubFuncao",
              codSubFuncao
            ),
            toSub: "vlOP",
          },
          {
            campo: natureza.filtrarPerm(
              aopFiltered,
              "codSubFuncao",
              codSubFuncao
            ),
            toSub: "vlAnuladoOP",
          },
        ]),
        ...natureza.subRS([
          natureza.sub([
            {
              campo: natureza.filtrarPerm(
                empFiltered,
                "codSubFuncao",
                codSubFuncao
              ),
              toSub: "vlBruto",
            },
            {
              campo: natureza.filtrarPerm(
                anlFiltered,
                "codSubFuncao",
                codSubFuncao
              ),
              toSub: "vlAnulacao",
            },
          ]),
          natureza.sub([
            {
              campo: natureza.filtrarPerm(
                opsFiltered,
                "codSubFuncao",
                codSubFuncao
              ),
              toSub: "vlOP",
            },
            {
              campo: natureza.filtrarPerm(
                aopFiltered,
                "codSubFuncao",
                codSubFuncao
              ),
              toSub: "vlAnuladoOP",
            },
          ]),
        ]),
      ];
    };

    const getCampo13 = () => {
      // concertar

      // lqd - alq, // tipo 2

      const lqdFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(lqd, "codOrgao", [...tipoOrgao14, ...tipoOrgao3]),
        "tpLiquidacao",
        ["2"]
      );

      const elementoDespesa = lqdFiltered.map((e) => e.content.elementoDespesa);

      const alqFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(
          natureza.filtrarPerm(alq, "codOrgao", [
            ...tipoOrgao14,
            ...tipoOrgao3,
          ]),
          "tpLiquidacao",
          ["2"]
        ),
        "elementoDespesa",
        elementoDespesa
      );
      const rspFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(rsp, "codOrgao", [...tipoOrgao14, ...tipoOrgao3]),
        "DotOrigP2002",
        elementoDespesa,
        15
      );
      const opsFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(
          natureza.filtrarPerm(ops, "tipoOP", ["3"]),
          "elementoDespesa",
          elementoDespesa
        ),
        "codOrgao",
        [...tipoOrgao14, ...tipoOrgao3]
      );
      const aopFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(
          natureza.filtrarPerm(aop, "tipoOP", ["3"]),
          "elementoDespesa",
          elementoDespesa
        ),
        "codOrgao",
        [...tipoOrgao14, ...tipoOrgao3]
      );

      return [
        natureza.sum([
          {
            campo: rspFiltered,
            toSum: "vlOriginal",
          },
        ]), // c
        natureza.sub([
          {
            campo: lqdFiltered,
            toSub: "vlLiquidado",
          },
          {
            campo: alqFiltered,
            toSub: "vlAnulado",
          },
        ]), // d
        natureza.sub([
          {
            campo: opsFiltered,
            toSub: "vlOP",
          },
          {
            campo: aopFiltered,
            toSub: "vlAnuladoOP",
          },
        ]), // e
        natureza.sum([
          {
            campo: alqFiltered,
            toSum: "vlAnulado",
          },
        ]), // f
        natureza.subRS([
          natureza.sum([
            {
              campo: rspFiltered,
              toSum: "vlOriginal",
            },
          ]), // c
          natureza.sub([
            {
              campo: opsFiltered,
              toSub: "vlOP",
            },
            {
              campo: aopFiltered,
              toSub: "vlAnuladoOP",
            },
          ]), // e
          natureza.sum([
            {
              campo: alqFiltered,
              toSum: "vlAnulado",
            },
          ]), // f
        ])[0],
      ];
    };

    const getCampo14 = (cod = []) => {
      const recOFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(recO, "codOrgao", [...tipoOrgao14, ...tipoOrgao1]),
        cod
      );
      const recFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(rec, "codOrgao", [...tipoOrgao14, ...tipoOrgao1]),
        cod
      );
      const areFiltered = natureza.filtrarPerm(
        natureza.filtrarPerm(are, "codOrgao", [...tipoOrgao14, ...tipoOrgao1]),
        cod
      );

      return [
        natureza.sub([
          {
            campo: recOFiltered,
            toSub: "vlPrevisto",
          },
          {
            campo: areFiltered,
            toSub: "vlAnulacao",
          },
        ]),
        natureza.sub([
          {
            campo: recFiltered,
            toSub: "vlArrecadado",
          },
        ]),
      ];
    };

    const campo1Type4 = [
      getCampo1(permReceitas.fpmPrincipal),
      getCampo1(permReceitas.icms),
      getCampo1(permReceitas.ipi),
      getCampo1(permReceitas.itr),
      getCampo1(permReceitas.ipva),
      getCampo1(permReceitas.outrasTransferencias),
    ];
    const campo1Type5 = [
      getCampo1(permReceitas.iptu),
      getCampo1(permReceitas.itbi),
      getCampo1(permReceitas.issqn),
      getCampo1(permReceitas.irrf),
      getCampo1(permReceitas.fpmExtraOrdinarias),
      getCampo1(permReceitas.iofOuro),
    ];

    for (let i = 0; i < 6; i++) {
      campo1Type5[i].forEach((e, iIndex) => {
        campo1Type5[i][iIndex] = natureza.toRS(
          String(
            (
              parseInt(e.replaceAll(",", "").replaceAll(".", "") * 0.25) / 100 +
              parseInt(
                campo1Type4[i][iIndex].replaceAll(",", "").replaceAll(".", "") *
                  0.05
              ) /
                100
            ).toFixed(2)
          )
        );
      });
    }

    const campo8 = natureza.sum([
      {
        campo: natureza.filtrarPerm(ctb, "codOrgao", tipoOrgao3),
        toSum: "saldoFinal",
      },
    ]);

    campo1Type4.forEach((e, i) => {
      e.forEach((e, iIndex) => {
        campo1Type4[i][iIndex] = natureza.toRS(
          String(
            (
              parseInt(e.replaceAll(",", "").replaceAll(".", "") / 5) / 100
            ).toFixed(2)
          )
        );
      });
    });

    const l3Sum = natureza.sumRS([
      natureza.sumRS([
        getCampo1(permReceitas.iptu),
        getCampo1(permReceitas.itbi),
        getCampo1(permReceitas.issqn),
        getCampo1(permReceitas.irrf),
      ]),
      natureza.sumRS([
        getCampo1(permReceitas.fpmPrincipal),
        getCampo1(permReceitas.fpmExtraOrdinarias),
        getCampo1(permReceitas.icms),
        getCampo1(permReceitas.ipi),
        getCampo1(permReceitas.itr),
        getCampo1(permReceitas.ipva),
        getCampo1(permReceitas.iofOuro),
        getCampo1(permReceitas.outrasTransferencias),
      ]),
    ]);

    output.push(
      ...[
        natureza.sumRS([
          getCampo1(permReceitas.iptu),
          getCampo1(permReceitas.itbi),
          getCampo1(permReceitas.issqn),
          getCampo1(permReceitas.irrf),
        ]),
        getCampo1(permReceitas.iptu),
        getCampo1(permReceitas.itbi),
        getCampo1(permReceitas.issqn),
        getCampo1(permReceitas.irrf),
        natureza.sumRS([
          getCampo1(permReceitas.fpmPrincipal),
          getCampo1(permReceitas.fpmExtraOrdinarias),
          getCampo1(permReceitas.icms),
          getCampo1(permReceitas.ipi),
          getCampo1(permReceitas.itr),
          getCampo1(permReceitas.ipva),
          getCampo1(permReceitas.iofOuro),
          getCampo1(permReceitas.outrasTransferencias),
        ]),
        natureza.sumRS([
          getCampo1(permReceitas.fpmPrincipal),
          getCampo1(permReceitas.fpmExtraOrdinarias),
        ]),
        getCampo1(permReceitas.fpmPrincipal),
        getCampo1(permReceitas.fpmExtraOrdinarias),
        getCampo1(permReceitas.icms),
        getCampo1(permReceitas.ipi),
        getCampo1(permReceitas.itr),
        getCampo1(permReceitas.ipva),
        getCampo1(permReceitas.iofOuro),
        getCampo1(permReceitas.outrasTransferencias),
        l3Sum,
        natureza.sumRS(campo1Type4),
        natureza.sumRS(campo1Type5),
      ]
    ); // campo 1

    output.push(
      ...[
        natureza.sumRS([
          natureza.sumRS([
            getCampo1(permReceitas.impostosTransferencia, true),
            getCampo1(permReceitas.rendimentosAplicacao, true),
          ]), // 6.1
          getCampo1(permReceitas.complementoUniao, true), // 6.4
        ]),
        natureza.sumRS([
          getCampo1(permReceitas.impostosTransferencia, true),
          getCampo1(permReceitas.rendimentosAplicacao, true),
        ]), // 6.1 - FUNDEB - Impostos e Transferência de Impostos
        getCampo1(permReceitas.impostosTransferencia, true), // 6.1.1 - Principal
        getCampo1(permReceitas.rendimentosAplicacao, true), // 6.1.2 - Rendimentos de Aplicação Financeira
        natureza.zerado(10),
        natureza.zerado(10),
        natureza.zerado(10),
        natureza.zerado(10),
        natureza.zerado(10),
        natureza.zerado(10),
        natureza.zerado(10),
        natureza.zerado(10),
        natureza.zerado(10),
        getCampo1(permReceitas.complementoUniao, true), // 6.4 - FUNDEB - Complemento da União - VAAR
        getCampo1(permReceitas.complementoUniao, true), // 6.4.1 - Principal
        natureza.zerado(10),
        natureza.zerado(10),
        natureza.subRS([
          getCampo1(permReceitas.impostosTransferencia, true),
          natureza.sumRS(campo1Type4),
        ]),
        [campo8],
        [campo8],
        natureza.zerado(10),
        natureza.sumRS([
          [campo8],
          natureza.sumRS([
            natureza.sumRS([
              getCampo1(permReceitas.impostosTransferencia, true),
              getCampo1(permReceitas.rendimentosAplicacao, true),
            ]), // 6.1
            getCampo1(permReceitas.complementoUniao, true), // 6.4
          ]),
        ]),
      ]
    );

    output.push(
      ...[
        natureza.zerado(10),
        natureza.sumRS([
          getCampo4(["365"], ["319011", "319013"]), // educação infantil
          getCampo4(["361"], ["319011", "319013"]),
          getCampo4(["366"], ["319011", "319013"]),
          getCampo4(["367"], ["319011", "319013"]),
        ]), // 10.1 - PROFISSIONAIS DA EDUCAÇÃO BÁSICA
        getCampo4(["365"], ["319011", "319013"]), // educação infantil
        getCampo4(["361"], ["319011", "319013"]),
        getCampo4(["366"], ["319011", "319013"]),
        getCampo4(["367"], ["319011", "319013"]),
        natureza.zerado(10),
        natureza.sumRS([
          getCampo4(["365"], permReceitas.outrosDespesas), // educação infantil
          getCampo4(["361"], permReceitas.outrosDespesas),
          getCampo4(["366"], permReceitas.outrosDespesas),
          getCampo4(["367"], permReceitas.outrosDespesas),
        ]), // 10.2 - OUTRAS DESPESAS
        getCampo4(["365"], permReceitas.outrosDespesas), // educação infantil
        getCampo4(["361"], permReceitas.outrosDespesas),
        getCampo4(["366"], permReceitas.outrosDespesas),
        getCampo4(["367"], permReceitas.outrosDespesas),
        natureza.zerado(10),
        natureza.zerado(10),
        natureza.zerado(10),
      ]
    ); // campo 4

    output.push(
      ...[
        getCampo5(["365", "361", "366", "367"], ["319011", "319013"]), // educação infantil
        getCampo5(["365", "361", "366", "367"], ["319011", "319013"]), // educação infantil
        natureza.zerado(10),
        natureza.zerado(10),
        natureza.zerado(10),
        getCampo5(["365", "361", "366", "367"], ["319011", "319013"]), // educação infantil
        natureza.zerado(10),
        natureza.zerado(10),
      ]
    ); // campo 5

    output.push(
      ...[getCampo6(), natureza.zerado(10), natureza.zerado(10), getCampo7()]
    ); // campo 6 / 7

    output.push(...[getCampo8(), getCampo8(), natureza.zerado(6)]); // campo 8

    const somaCampo9 = natureza.sumRS([
      getCampo9(["365"]),
      getCampo9(["361"]),
      getCampo9(["366"]),
      getCampo9(["367"]),
      getCampo9(["364", "368", "362", "363"]),
    ]);

    output.push(
      ...[
        somaCampo9,
        getCampo9(["365"]),
        getCampo9(["361"]),
        getCampo9(["366"]),
        getCampo9(["367"]),
        natureza.zerado(10),
        natureza.zerado(10),
        getCampo9(["364", "368", "362", "363"]),
      ]
    ); // campo 9 // DESPESAS COM AÇÕES TÍPICAS DE MDE - RECEITAS DE IMPOSTOS - EXCETO FUNDEB

    output.push(
      ...[
        natureza.sumRS([
          getCampo9(["365"], [...tipoOrgao14, ...tipoOrgao3]),
          getCampo9(["361"], [...tipoOrgao14, ...tipoOrgao3]),
        ]),
        getCampo9(["365"], [...tipoOrgao14, ...tipoOrgao3]),
        natureza.zerado(10), // concertarZ
        natureza.zerado(10), // concertarZ
        getCampo9(["361"], [...tipoOrgao14, ...tipoOrgao3]),
      ]
    ); // campo 10

    const campo11l28Sum = natureza.subRS([
      natureza.sumRS([somaCampo9[2], natureza.sumRS(campo1Type4)[1]]),
      getCampo7()[3], //   SÓ UM SEGUNDO
    ]); // para somar
    const l27Sum = ["0,00"];

    output.push(
      ...[
        [somaCampo9[2]],
        [natureza.sumRS(campo1Type4)[1]],
        [getCampo7()[3]],
        ["0,00"],
        ["0,00"],
        ["0,00"], // para somar
        campo11l28Sum,
      ]
    ); // campo 11 // APURAÇÃO DAS DESPESAS PARA FINS DE LIMITE MÍNIMO CONSTITUCIONAL

    output.push([
      natureza.sumRS([
        ...campo1Type4,
        ...campo1Type5,
        natureza.onlyPositive(getCampo7()),
      ])[1],
      campo11l28Sum[0],
      natureza.toRS(
        String(
          (
            (parseInt(
              campo11l28Sum[0].replaceAll(",", "").replaceAll(".", "")
            ) /
              parseInt(l3Sum[1].replaceAll(".", "").replaceAll(",", ""))) *
            100
          ).toFixed(2)
        )
      ),
    ]); // CAMPO 12

    output.push(
      ...[
        getCampo13(),
        natureza.zerado(10),
        natureza.zerado(10),
        natureza.zerado(10),
      ]
    ); // campo 13

    output.push(
      ...[
        natureza.sumRS([
          getCampo14(["017145001", "013210101", "019220601"]),
          getCampo14(["017145101", "013210101", "019220601"]),
          getCampo14(["017145201", "013210101", "019220601"]),
          getCampo14(["017145301", "013210101", "019220601"]),
          getCampo14(["017145401", "013210101", "019220601"]), // 31.1.5
          getCampo14([
            "017175101",
            "017245101",
            "017325101",
            "017615101",
            "024145101",
            "024229901",
          ]), // 31.2
          getCampo14([
            "017125211",
            "017125221",
            "017125231",
            "013210201",
            "013210301",
            "019220601",
          ]), // 31.3
          getCampo14(["021125001", "021225001"]),
          getCampo14(["017195601", "019220601", "024615101", "01922990"]),
        ]), // somatória
        natureza.sumRS([
          getCampo14(["017145001", "013210101", "019220601"]),
          getCampo14(["017145101", "013210101", "019220601"]),
          getCampo14(["017145201", "013210101", "019220601"]),
          getCampo14(["017145301", "013210101", "019220601"]),
          getCampo14(["017145401", "013210101", "019220601"]),
        ]),
        getCampo14(["017145001", "013210101", "019220601"]),
        getCampo14(["017145101", "013210101", "019220601"]),
        getCampo14(["017145201", "013210101", "019220601"]),
        getCampo14(["017145301", "013210101", "019220601"]),
        getCampo14(["017145401", "013210101", "019220601"]), // 31.1.5
        getCampo14([
          "017175101",
          "017245101",
          "017325101",
          "017615101",
          "024145101",
          "024229901",
        ]), // 31.2
        getCampo14([
          "017125211",
          "017125221",
          "017125231",
          "013210201",
          "013210301",
          "019220601",
        ]), // 31.3
        getCampo14(["021125001", "021225001"]),
        getCampo14(["017195601", "019220601", "024615101", "01922990"]),
        natureza.zerado(10),
      ]
    );

    output.forEach((e, i) => {
      output[i] = natureza.onlyPositive(e);
    });

    return res.status(200).json({ output: output });
  } catch (error) {
    console.error("error at getRreoAnexo from controller.anexo.4", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export default { getRreoAnexo };
