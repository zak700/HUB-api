import { db } from "../../../database/postgres.js";
import natureza from "../../../helpers/natureza.js";

async function getSlide1(req, res) {
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
            balanco("impostos"),
            balanco("taxas"),
            balanco("contribuicaoMelhoria"),
            balanco("contribuicaoSocial"),
            balanco("contribuicaoCIP"),
            balanco("remuneracaoBancaria"),
            balanco("concessaoPermBensPublico"),
            balanco("outrasDelegacaoServicoPublico"),
            balanco("servicoSaneamentoPublico"),
            balanco("transferenciaUniaoSuasEntidades"),
            balanco("transferenciaEstadosSuasEntidades"),
            balanco("transferenciaOutrasInstituicoes"),
            balanco("demaistransferenciaCorrentes"),
            balanco("multasAdmContratuaisJudiciais"),
            balanco("indenizacoesRestRessarcimento"),
            balanco("demaisReceitaCorrente"),
          ]),
        ),
      },
      {
        onGraf: true,
        name: leftAlign("  Impostos, Taxas e Contribuição Melhoria"),
        values: findDiv(
          natureza.sumRS([
            balanco("impostos"),
            balanco("taxas"),
            balanco("contribuicaoMelhoria"),
          ]),
        ),
      },
      {
        onGraf: true,
        name: leftAlign("  Contribuições Social"),
        values: findDiv(
          natureza.sumRS([
            balanco("contribuicaoSocial"),
            balanco("contribuicaoCIP"),
          ]),
        ),
      },
      {
        onGraf: true,
        name: leftAlign("  Patrimonial"),
        values: findDiv(
          natureza.sumRS([
            balanco("remuneracaoBancaria"),
            balanco("concessaoPermBensPublico"),
            balanco("outrasDelegacaoServicoPublico"),
          ]),
        ),
      },
      {
        onGraf: true,
        name: leftAlign("  Serviços"),
        values: findDiv(balanco("servicoSaneamentoPublico")),
      },
      {
        onGraf: true,
        name: leftAlign("  Transferências Correntes"),
        values: findDiv(
          natureza.sumRS([
            balanco("transferenciaUniaoSuasEntidades"),
            balanco("transferenciaEstadosSuasEntidades"),
            balanco("transferenciaOutrasInstituicoes"),
            balanco("demaistransferenciaCorrentes"),
          ]),
        ),
      },
      {
        onGraf: true,
        name: leftAlign("  Outras Receitas Correntes"),
        values: findDiv(
          natureza.sumRS([
            balanco("multasAdmContratuaisJudiciais"),
            balanco("indenizacoesRestRessarcimento"),
            balanco("demaisReceitaCorrente"),
          ]),
        ),
      },
      {
        onGraf: false,
        styled: true,
        name: "RECEITAS DE CAPITAL",
        values: findDiv(
          natureza.sumRS([
            balanco("operacaoCredMercadoInterno"),
            balanco("alienacaoBens"),
            balanco("amortizacaoEmprestimos"),
            balanco("outrasTransUniaoEntidade"),
          ]),
        ),
      },
      {
        onGraf: true,
        name: leftAlign("  Operações de Crédito"),
        values: findDiv(balanco("operacaoCredMercadoInterno")),
      },
      {
        onGraf: true,
        name: leftAlign("  Alienação de Bens"),
        values: findDiv(balanco("alienacaoBens")),
      },
      {
        onGraf: true,
        name: leftAlign("  Amortização de Empréstimos"),
        values: findDiv(balanco("amortizacaoEmprestimos")),
      },
      {
        onGraf: true,
        name: leftAlign("  Transferências de Capital"),
        values: findDiv(balanco("outrasTransUniaoEntidade")),
      },
      {
        onGraf: false,
        name: leftAlign("TOTAL DAS RECEITAS"),
        values: findDiv(
          natureza.sumRS([
            natureza.sumRS([
              balanco("operacaoCredMercadoInterno"),
              balanco("alienacaoBens"),
              balanco("amortizacaoEmprestimos"),
              balanco("outrasTransUniaoEntidade"),
            ]),
            natureza.sumRS([
              balanco("impostos"),
              balanco("taxas"),
              balanco("contribuicaoMelhoria"),
              balanco("contribuicaoSocial"),
              balanco("contribuicaoCIP"),
              balanco("remuneracaoBancaria"),
              balanco("concessaoPermBensPublico"),
              balanco("outrasDelegacaoServicoPublico"),
              balanco("servicoSaneamentoPublico"),
              balanco("transferenciaUniaoSuasEntidades"),
              balanco("transferenciaEstadosSuasEntidades"),
              balanco("transferenciaOutrasInstituicoes"),
              balanco("demaistransferenciaCorrentes"),
              balanco("multasAdmContratuaisJudiciais"),
              balanco("indenizacoesRestRessarcimento"),
              balanco("demaisReceitaCorrente"),
            ]),
          ]),
        ),
      },
      {
        onGraf: true,
        name: leftAlign("RECEITA INTRA-ORÇAMENTÁRIA"),
        values: findDiv(balanco("receitaIntraOrcamentaria")),
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

    const balancoDesp = (despesa) => {
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
      //  return [subDspO, subEmp, subLqd, subOps];
    };

    output.despesas = [
      {
        onGraf: false,
        styled: true,
        name: leftAlign("DESPESAS CORRENTES"),
        values: findDiv(
          natureza.sumRS([
            balancoDesp("pessoalEncargos"),
            balancoDesp("jurosEncargos"),
            balancoDesp("outrasDespesas"),
          ]),
        ),
      },
      {
        onGraf: true,
        name: leftAlign("  Pessoal e Encargos Sociais"),
        values: findDiv(balancoDesp("pessoalEncargos")),
      },
      {
        onGraf: true,
        name: leftAlign("  Juros e Encargos da Dívida"),
        values: findDiv(balancoDesp("jurosEncargos")),
      },
      {
        onGraf: true,
        name: leftAlign("  Outras Despesas Correntes"),
        values: findDiv(balancoDesp("outrasDespesas")),
      },
      {
        onGraf: false,
        name: leftAlign("DESPESAS DE CAPITAL"),
        values: findDiv(
          natureza.sumRS([
            balancoDesp("investimento"),
            balancoDesp("inversoesFinanceira"),
            balancoDesp("amortizacao"),
          ]),
        ),
      },
      {
        onGraf: true,
        name: leftAlign("  investimentos"),
        values: findDiv(balancoDesp("investimento")),
      },
      {
        onGraf: true,
        name: leftAlign("  Inversões Financeiras"),
        values: findDiv(balancoDesp("inversoesFinanceira")),
      },
      {
        onGraf: true,
        name: leftAlign("  Amortizações da Dívida"),
        values: findDiv(balancoDesp("amortizacao")),
      },
      {
        onGraf: true,
        name: leftAlign("RESERVA DE CONTIGENCIA"),
        values: findDiv(balancoDesp("reservaContigencia")),
      },
      {
        onGraf: false,
        name: leftAlign("TOTAL DAS DESPESAS"),
        values: findDiv(
          natureza.sumRS([
            natureza.sumRS([
              balancoDesp("pessoalEncargos"),
              balancoDesp("jurosEncargos"),
              balancoDesp("outrasDespesas"),
            ]),
            natureza.sumRS([
              balancoDesp("investimento"),
              balancoDesp("inversoesFinanceira"),
              balancoDesp("amortizacao"),
            ]),
          ]),
        ),
      },
      {
        onGraf: true,
        name: leftAlign("DESPESA INTRA-ORÇAMENTÁRIA"),
        values: findDiv(balancoDesp("despesaIntraOrcamentaria")),
      },
    ];
    /*
    output.comparativo_grafico = [
      {
        name: "RECEITAS CORRENTES",
        value: natureza.toInt(
          output.receitas[output.receitas.length - 1].values[1]
        ),
      },
      {
        name: "DESPESAS CORRENTES",
        value: natureza.toInt(
          output.despesas[output.despesas.length - 1].values[1]
        ),
      },
    ];
*/

    //-- < 12 > Slide por FUNÇÃO - ANEXO 2 --------------------//

    const rub_anexo2 = (await db("rubricas").select("*").first()).anexo2;

    //    const rub_anexo2 = (await db("rubricas").select("*"))[0].anexo2;

    const balancoFuncao = (despesa) => {
      const codFuncao = rub_anexo2[despesa].map((e) => e.codFuncao || "");
      const codSubFuncao = rub_anexo2[despesa].map((e) => e.codSubFuncao || "");
      console.log("balancoFuncao", codFuncao, codSubFuncao, despesa);

      const helperFilter = (campo, ops = false) => {
        return campo.filter((e) => {
          return ops
            ? codFuncao.includes(e.content.codFuncao) &&
                codSubFuncao.includes(e.content.codSubFuncao)
            : codFuncao.includes(e.content.codFuncao) &&
                codSubFuncao.includes(e.content.codSubFuncao) &&
                e.content.nroOP === "2";
        });
      };

      const filteredFuncaoDspO = helperFilter(dspO);
      const filteredFuncaoAocSum = helperFilter(aocSum);
      const filteredFuncaoAocSub = helperFilter(aocSub);
      const filteredFuncaoEmp = helperFilter(emp);
      const filteredFuncaoAnl = helperFilter(anl);
      const filteredFuncaoLqd = helperFilter(lqd);
      const filteredFuncaoAlq = helperFilter(alq);
      const filteredFuncaoOps = helperFilter(ops, true);
      const filteredFuncaoAop = helperFilter(aop);
      console.log(
        filteredFuncaoDspO.length,
        filteredFuncaoAocSum.length,
        filteredFuncaoAocSub.length,
        filteredFuncaoEmp.length,
        filteredFuncaoAnl.length,
        filteredFuncaoLqd.length,
        filteredFuncaoAlq.length,
        filteredFuncaoOps.length,
        filteredFuncaoAop.length,
      );
      /*
      const sumFuncaoDspO = natureza.sum([
        {
          campo: filteredFuncaoDspO,
          toSum: "recurso",
        },
      ]);
*/
      // Comenta aqui
      const subFuncaoDspO = natureza.subRS([
        natureza.sum([
          {
            campo: filteredFuncaoDspO,
            toSum: "recurso",
          },
          {
            campo: filteredFuncaoAocSum,
            toSum: "vlAlteracao",
          },
        ]),
        natureza.sum([
          {
            campo: filteredFuncaoAocSub,
            toSum: "vlAlteracao",
          },
        ]),
      ])[0];

      // Tira o Comentário aqui
      const subFuncaoEmp = natureza.sub([
        {
          campo: filteredFuncaoEmp,
          toSub: "vlBruto",
        },
        {
          campo: filteredFuncaoAnl,
          toSub: "vlAnulacao",
        },
      ]);
      const subFuncaoLqd = natureza.sub([
        {
          campo: filteredFuncaoLqd,
          toSub: "vlLiquidado",
        },
        {
          campo: filteredFuncaoAlq,
          toSub: "vlAnulado",
        },
      ]);
      const subFuncaoOps = natureza.sub([
        {
          campo: filteredFuncaoOps,
          toSub: "vlOP",
        },
        {
          campo: filteredFuncaoAop,
          toSub: "vlAnuladoOP",
        },
      ]);

      return [subFuncaoDspO, subFuncaoEmp, subFuncaoLqd, subFuncaoOps].map(
        (e) => e.replaceAll("-", ""),
      );

      //   return [sumFuncaoDspO, subFuncaoEmp, subFuncaoLqd, subFuncaoOps];
    };

    output.funcao = [
      {
        onGraf: true,
        styled: true,
        name: leftAlign("Legislativa"),
        values: findDiv(balancoFuncao("legislativa")),
      },
      {
        onGraf: true,
        name: leftAlign("Administração"),
        values: findDiv(balancoFuncao("administracao")),
      },
      {
        onGraf: true,
        name: leftAlign("Segurança Pública"),
        values: findDiv(balancoFuncao("segurancaPublica")),
      },
      {
        onGraf: true,
        name: leftAlign("Previdência Social"),
        values: findDiv(balancoFuncao("previdenciaSocial")),
      },
      {
        onGraf: true,
        name: leftAlign("Saúde"),
        values: findDiv(balancoFuncao("saude")),
      },
      {
        onGraf: true,
        name: leftAlign("Educação"),
        values: findDiv(balancoFuncao("educacao")),
      },
      {
        onGraf: true,
        name: leftAlign("Cultura"),
        values: findDiv(balancoFuncao("cultura")),
      },
      {
        onGraf: true,
        name: leftAlign("Direitos da Cidadania"),
        values: findDiv(balancoFuncao("direitosDaCidadania")),
      },
      {
        onGraf: true,
        name: leftAlign("Urbanismo"),
        values: findDiv(balancoFuncao("urbanismo")),
      },
      {
        onGraf: true,
        name: leftAlign("Habitação"),
        values: findDiv(balancoFuncao("habitacao")),
      },
      {
        onGraf: true,
        name: leftAlign("Saneamento"),
        values: findDiv(balancoFuncao("saneamento")),
      },
      {
        onGraf: true,
        name: leftAlign("Gestão Ambiental"),
        values: findDiv(balancoFuncao("gestaoAmbiental")),
      },
      {
        onGraf: true,
        name: leftAlign("Comércio e Serviço"),
        values: findDiv(balancoFuncao("comercioEServico")),
      },
      {
        onGraf: true,
        name: leftAlign("Encargos Especiais"),
        values: findDiv(balancoFuncao("encargosEspeciais")),
      },
      {
        onGraf: false,
        name: leftAlign("TOTAL POR FUNÇÃO"),
        values: findDiv(
          natureza.sumRS([
            balancoFuncao("legislativa"),
            balancoFuncao("administracao"),
            balancoFuncao("segurancaPublica"),
            balancoFuncao("previdenciaSocial"),
            balancoFuncao("saude"),
            balancoFuncao("educacao"),
            balancoFuncao("cultura"),
            balancoFuncao("direitosDaCidadania"),
            balancoFuncao("urbanismo"),
            balancoFuncao("habitacao"),
            balancoFuncao("saneamento"),
            balancoFuncao("gestaoAmbiental"),
            balancoFuncao("comercioEServico"),
            balancoFuncao("encargosEspeciais"),
          ]),
        ),
      },
    ];

    return res.status(200).json({
      output: output,
      data37: String(parseInt(natureza.dataToYear(dataI)) - 1),
    });
  } catch (error) {
    console.error("error at getRreoAnexo from controller.slide1", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export default { getSlide1 };
