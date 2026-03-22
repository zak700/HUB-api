import { db } from "../../../database/postgres.js";
import natureza from "../../../helpers/natureza.js";

async function getRreoAnexo(req, res) {
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

    //-- L1 A L5 - RECEITAS COM MANUTENÇÃO E DESENVOLVIMENTO DO ENSINO - MDE--//

    const rub_anexo1 = (await db("rubricas").select("*"))[0].anexo1;

    const filtroBO_1 = (rubrica) => {
      const filteredBO_1RecO = natureza.filtrarPerm(
        recO,
        "rubrica",
        rub_anexo1[rubrica]
      );
      const filteredBO_1Rec = natureza.filtrarPerm(
        rec,
        "rubrica",
        rub_anexo1[rubrica]
      );
      const filteredBO_1Are = natureza.filtrarPerm(
        are,
        "rubrica",
        rub_anexo1[rubrica]
      );

      const filteredBO_1RecSum = natureza.filtrarPerm(
        rec,
        "rubrica",
        rub_anexo1[rubrica]
      );

      const subBO_1RecO = natureza.sum([
        {
          campo: filteredBO_1RecO,
          toSum: "vlPrevisto",
        },
      ]);

      const subBO_1Rec = natureza.sumRS([
        natureza.sub([
          {
            campo: filteredBO_1Rec,
            toSub: "vlArrecadado",
          },
          {
            campo: filteredBO_1Are,
            toSub: "vlAnulacao",
          },
        ]),
      ]);
/*
      const sumBO_1RecSum = natureza.sumRS([
        natureza.sub([
          {
            campo: filteredBO_1RecSum,
            toSub: "vlAcumulado",
          },
          {
            campo: filteredBO_1Are,
            toSub: "vlAnulacao",
          },
        ]),
      ])[0];
*/

/*        
        natureza.sum([
          {
            campo: filteredBO_1Rec,
            toSum: "vlAcumulado",
          },
        ]),
*/

//    const b_aDIV = natureza.divRS([subBO_1Rec], [subBO_1RecO], true)[0] + "%";

//    const c_aDIV = natureza.divRS([subBO_1Rec], [subBO_1Rec], true)[0] + "%";
/*
      return [
        subBO_1RecO.replace("-", ""),
        subBO_1RecO.replace("-", ""),
        subBO_1Rec.replace("-", ""),
        "",
//      b_aDIV,
        subBO_1Rec.replace("-", ""),
//      c_aDIV,
        "",
        natureza.subRS([subBO_1RecO, subBO_1Rec])[0].replace("-", ""),
      ];
    };
*/

      return [
        subBO_1RecO,
        subBO_1RecO,
        subBO_1Rec,
        "",
        subBO_1Rec,
        "",
        natureza.subRS([subBO_1RecO, subBO_1Rec])[0],
      ];
    };


    output.receitasBO_1 = [
      {
        name: "IMPOSTOS, TAXAS E CONTRIBUIÇÕES DE MELHORIA",
        values: natureza.sumRS([
          filtroBO_1("impostos"),
          filtroBO_1("taxas"),
          filtroBO_1("contribuicaoMelhoria"),
        ]),
      },
      {
        name: "    Impostos",
        values: filtroBO_1("impostos"),
      },
      {
        name: "    Taxas",
        values: filtroBO_1("taxas"),
      },
      {
        name: "    Contribuição de Melhoria",
        values: filtroBO_1("contribuicaoMelhoria"),
      },
      {
        name: "CONTRIBUIÇÕES",
        values: natureza.sumRS([
          filtroBO_1("contribuicaoSocial"),
          filtroBO_1("contribuicaoCIP"),
        ]),
      },
      {
        name: "    Contribuições Sociais",
        values: filtroBO_1("contribuicaoSocial"),
      },
      {
        name: "    Contribuições Econômicas",
        values: filtroBO_1("contribuicaoMelhoria"),
      },
      {
        name: "    Contribuições para Entidades Privadas de Serviço Social e de Formação Profissional",
        values: filtroBO_1("ontribuicaoMelhoria"),
      },
      {
        name: "    Contribuição para o Custeio do Serviço de Iluminação Pública",
        values: filtroBO_1("contribuicaoCIP"),
      },
      {
        name: "RECEITA PATRIMONIAL",
        values: natureza.sumRS([
          filtroBO_1("concessaoPermBensPublico"),
          natureza.subRS([
            filtroBO_1("remuneracaoBancaria"),
            filtroBO_1("deducaoRemuneracaoBancaria"),
          ]),
          filtroBO_1("outrasDelegacaoServicoPublico"),
          filtroBO_1("outrasDelegacaoServicoPublico1"),
          filtroBO_1("outrasDelegacaoServicoPublico1"),
          filtroBO_1("outrasDelegacaoServicoPublico1"),
          filtroBO_1("outrasDelegacaoServicoPublico1"),
        ]),
      },
      {
        name: "    Exploração do Patrimônio Imobiliário do Estado",
        values: filtroBO_1("concessaoPermBensPublico"),
      },
      {
        name: "    Valores Mobiliários",
        values: natureza.subRS([
          filtroBO_1("remuneracaoBancaria"),
          filtroBO_1("deducaoRemuneracaoBancaria"),
        ]),
      },
      {
        name: "    Delegação de Serviços Públicos Mediante Concessão, Permissão, Autorização ou Licença",
        values: filtroBO_1("outrasDelegacaoServicoPublico"),
      },
      {
        name: "    Exploração de Recursos Naturais",
        values: filtroBO_1("outrasDelegacaoServicoPublico1"),
      },
      {
        name: "    Exploração do Patrimônio Intangível",
        values: filtroBO_1("outrasDelegacaoServicoPublico1"),
      },
      {
        name: "    Cessão de Direitos",
        values: filtroBO_1("outrasDelegacaoServicoPublico1"),
      },
      {
        name: "    Demais Rceitas Patrimoniais",
        values: filtroBO_1("outrasDelegacaoServicoPublico1"),
      },
      {
        name: "RECEITA AGROPECUÁRIA",
        values: filtroBO_1("outrasDelegacaoServicoPublico1"),
      },
      {
        name: "RECEITA DE SERVIÇOS",
        values: natureza.sumRS([
          filtroBO_1("outrasDelegacaoServicoPublico1"),
          filtroBO_1("outrasDelegacaoServicoPublico1"),
          filtroBO_1("outrasDelegacaoServicoPublico1"),
          filtroBO_1("outrasDelegacaoServicoPublico1"),
          filtroBO_1("servicoSaneamentoPublico"),
        ]),
      },
      {
        name: "    Serviços Administrativos e Comerciais Gerais",
        values: filtroBO_1("outrasDelegacaoServicoPublico1"),
      },
      {
        name: "    Serviços e Atividades Referentes à Navegação e ao Transporte",
        values: filtroBO_1("outrasDelegacaoServicoPublico1"),
      },
      {
        name: "    Serviços e Atividades referentes à Saúde",
        values: filtroBO_1("outrasDelegacaoServicoPublico1"),
      },
      {
        name: "    Serviços e Atividades Financeiras",
        values: filtroBO_1("outrasDelegacaoServicoPublico1"),
      },
      {
        name: "    Outros Serviços",
        values: filtroBO_1("servicoSaneamentoPublico"),
      },
      {
        name: "TRANSFERÊNCIAS CORRENTES",
        values: natureza.sumRS([
          natureza.subRS([
            filtroBO_1("transferenciaUniaoSuasEntidades"),
            filtroBO_1("deducaoTransferenciaUniaoSuasEntidades"),
          ]),
          natureza.subRS([
            filtroBO_1("transferenciaEstadosSuasEntidades"),
            filtroBO_1("deducaoTransferenciaEstadosSuasEntidades"),
          ]),
          filtroBO_1("transferenciaOutrasInstituicoes"),
          filtroBO_1("demaistransferenciaCorrentes"),
        ]),
      },
      {
        name: "   Transferências da União e de suas Entidades",
        values: natureza.subRS([
          filtroBO_1("transferenciaUniaoSuasEntidades"),
          filtroBO_1("deducaoTransferenciaUniaoSuasEntidades"),
        ]),
      },
      {
        name: "   Transferências dos Estados e do Distrito Federal e de suas Entidades",
        values: natureza.subRS([
          filtroBO_1("transferenciaEstadosSuasEntidades"),
          filtroBO_1("deducaoTransferenciaEstadosSuasEntidades"),
        ]),
      },
      {
        name: "   Transferências dos Municípios e de suas Entidades",
        values: filtroBO_1("transferenciaEstadosSuasEntidades1"),
      },
      {
        name: "   Transferências de Instituições Privadas",
        values: filtroBO_1("transferenciaEstadosSuasEntidades1"),
      },
      {
        name: "   Transferências de Outras Instituições Públicas",
        values: filtroBO_1("transferenciaOutrasInstituicoes"),
      },
      {
        name: "   Transferências do Exterior",
        values: filtroBO_1("transferenciaEstadosSuasEntidades1"),
      },
      {
        name: "   Demais Transferências Correntes",
        values: filtroBO_1("demaistransferenciaCorrentes"),
      },
    ];

    output.receitasBO_1.forEach((val, index) => {
      const values = val.values;
      // console.log(values);
      if (values.length !== 7) return;
      output.receitasBO_1[index].values[3] = natureza.toRS(
        String(
          (
            (natureza.toInt(values[2], true) /
              natureza.toInt(values[1], true) || 0) * 100
          ).toFixed(2)
        )
      );
      output.receitasBO_1[index].values[5] = natureza.toRS(
        String(
          (
            (natureza.toInt(values[4], true) /
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
    console.error("error at getRreoAnexo1 from controller.anexo.1", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export default { getRreoAnexo };
