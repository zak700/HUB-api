import { StatusCodes } from "http-status-codes";
import natureza from "../../helpers/natureza.js";
import tokenHelper from "../../helpers/tokens.js";
import { db, query } from "../../database/postgres.js";
import codND from "./addicionalInfo/codND.js";
import bulkUpdate from "../../helpers/bulkUpdate.js";
import codPO from "./addicionalInfo/codPO.js";
import codFR from "./addicionalInfo/codFR.js";
const campos = [
  "abl",
  "isi",
  "lnc",
  "lqd",
  "pct",
  "ops",
  "orgao",
  "par",
  "prl",
  "rec",
  "reo",
  "rpl",
  "rsp",
  "tfr",
  "trb",
  "anl",
  "aoc",
  "aop",
  "uoc",
  "are",
  "arp",
  "cvc",
  "ctb",
  "dcl",
  "dfr",
  "dmr",
  "dic",
  "dsi",
  "ecl",
  "eoc",
  "cob",
  "emp",
  "con",
  "hml",
  "ide",
  "jgl",
  "ext",
  "hbl",
  "aex",
  "alq",
];
const addValtoLnc = async function (lnc, codOrgao, data, user, ManejOrgao) {
  console.time("addVal")
  console.log(ManejOrgao)
  try {
    const layoutMSC = (await natureza.getLayoutMSC(natureza.dataToYear(data), user.schema)).asMap()
    const campos = {};
    const getCamposValues = async () => {
      const dataClip = "01" + data.substring(2, 4)
      const dataY = String(natureza.dataToYear(data))
      const pastDataY = String(parseInt(dataY) - 1)
      const addSch = (str) => user.schema + "." + str
      const pastDateI = "01" + pastDataY.substring(2)
      const pastDateF = "12" + pastDataY.substring(2)
      campos.rec = await natureza.getCampo(addSch("rec"), "m", codOrgao, "false", dataClip, data)
      campos.are = await natureza.getCampo(addSch("are"), "m", codOrgao, "false", dataClip, data)
      campos.aoc = await natureza.getCampo(addSch("aoc"), "m", codOrgao, "false", pastDateI, data)
      campos.emp = await natureza.getCampo(addSch("emp"), "m", codOrgao, "false", dataClip, data)
      campos.lastEmp = await natureza.getCampo(addSch("emp"), "m", codOrgao, "false", pastDateI, pastDateF)
      campos.anl = await natureza.getCampo(addSch("anl"), "m", codOrgao, "false", data, data)
      campos.lqd = await natureza.getCampo(addSch("lqd"), "m", codOrgao, "false", dataClip, data)
      campos.alq = await natureza.getCampo(addSch("alq"), "m", codOrgao, "false", dataClip, data)
      campos.ext = await natureza.getCampo(addSch("ext"), "m", codOrgao, "false", data, data)
      campos.aex = await natureza.getCampo(addSch("aex"), "m", codOrgao, "false", data, data)
      campos.ops = await natureza.getCampo(addSch("ops"), "m", codOrgao, "false", data, data)
      campos.aop = await natureza.getCampo(addSch("aop"), "m", codOrgao, "false", data, data)
      campos.rsp = await natureza.getCampo(addSch("rsp"), "m", codOrgao, "false", data, data)
      campos.con = await natureza.getCampo(addSch("con"), "m", codOrgao, "false", data, data)
      campos.ctb = await natureza.getCampo(addSch("ctb"), "m", codOrgao, "false", data, data)
      campos.trb = await natureza.getCampo(addSch("trb"), "m", codOrgao, "false", data, data)
      campos.recO = await natureza.getCampo(addSch("recO"), "y", codOrgao, "false", dataY, dataY)
      campos.dspO = await natureza.getCampo(addSch("dspO"), "y", codOrgao, "false", dataY, dataY)
    }
    console.time("getCamposValues")
    await getCamposValues()
    console.timeEnd("getCamposValues")

    // ------------------------- -- ----------------------
    const ICs = ["PO", "FP", "FR", "CO", "FS", "AI", "DC"]
    const tipoArquivo = ["00", "REC", "ARE", "AOC", "EMP", "ANL", "LQD", "ALQ", "EXT", "AEX", "OPS", "AOP", "RSP", "CON", "CTB", "TRB"]
    const getOnlyIcs = (lncVal, values) => {
      const output = [];
      values.forEach((v) => output.push(lncVal[v]));
      return output;
    }

    console.log(natureza.getLncVerSum(lnc))

    const tipos = {
      CENTI: function () {
        lnc.forEach((e, index) => {
          /**
            * @typedef {Object} content
            * @property {String} tipoRegistro
            * @property {String} codOrgao
            * @property {String} tipoUnidade
            * @property {String} numControle
            * @property {String} mesReferencia
            * @property {String} dataRegistro
            * @property {String} tipoLancamento
            * @property {String} dataTransacao
            * @property {String} histórico
            * @property {String} nroSequencial
            * @property {String} content
            * @property {String} line
          */
          /** @type {content} */
          const content = e.content
          const innerContent = content.content
          /**
            * @typedef {'A' | 'S'} TipoConta
            * @typedef {'F' | 'P' | 'F/P'} Indicador
            * @typedef {'C' | 'D'} Natureza
            * @typedef {'PO'|'FP'|'FR'|'CO'|'FS'|'AI'} ValueIC
            * @typedef {'00'|'REC'|'ARE'|'AOC'|'EMP'|'ANL'|'LQD'|'ALQ'|'EXT'|'AEX'|'OPS'|'AOP'|'RSP'|'CON'|'CTB'|'TRB'} arq
            * @typedef {'beginning_balance'|'period_change'|'ending_balance'} tipoLancamento
            * @typedef {Object} lncVal
              * @property {String} tipoRegistro
              * @property {String} tipoUnidade
              * @property {String} numrControle
              * @property {String} codConta - Código da conta. Somente os primeiros 9 caracteres são utilizados como chave do layoutMSC
              * @property {String} atributoConta
              * @property {String} natLancamento
              * @property {String} valor
              * @property {String} tipoArquivoSicom
              * @property {String} chaveArquivo
              * @property {String} nroSequencial
              * @property {String} PO
              * @property {String} line
            * @typedef {Object} LayoutVal
              * @property {string} title - Título da conta
              * @property {ValueIC[]} values - Valores IC da conta
              * @property {Natureza} natureza - Natureza da conta (Crédito ou Débito)
              * @property {Indicador} indicador - Indicador da conta (Financeiro, Permanente ou ambos)
              * @property {TipoConta} tipoConta - Nível de profundidade da conta (Analítica ou Sintética)
              * @property {string} description - Descrição detalhada da conta
            * @typedef {Object} cachedItem
              * @property {string} title - Título da conta
              * @property {ValueIC[]} values - Valores IC da conta
              * @property {Natureza} natureza - Natureza da conta (Crédito ou Débito)
              * @property {Indicador} indicador - Indicador da conta (Financeiro, Permanente ou ambos)
              * @property {TipoConta} tipoConta - Nível de profundidade da conta (Analítica ou Sintética)
              * @property {string} description - Descrição detalhada da conta
              * @property {lncVal} lncVal - Valores presentes no lnc registro 11
              * @property {arq} arq - Arquivo presente no lnc registro 11
              * @property {tipoLancamento} tipoLancamento Tipo do lançamento encontrado no lnc registro 10:  
                * - 1: "beginning_balance"  
                * - 2: "period_change"  
                * - 3: "ending_balance"  
              
          */
          /** @type {cachedItem[]} */
          const cached = []
          /** 
           * @typedef {Object} allAsked
           * @property {String} [PO] - Valor IC: PO
           * @property {String} [FP] - Valor IC: FP
           * @property {String} [FR] - Valor IC: FR
           * @property {String} [CO] - Valor IC: CO
           * @property {String} [FS] - Valor IC: FS
           * @property {String} [AI] - Valor IC: AI
           */
          /** @type {allAsked} */
          const allAsked = {}

          // --- fetching values from innerContent

          innerContent.forEach((e, innerIndex) => {
            /** @type {lncVal} */
            const lncVal = e
            const codConta = lncVal.codConta.substring(0, 9)

            /** @type {LayoutVal | undefined} */
            const layout = layoutMSC.get(codConta)
            if (!layout) {
              console.error(`codConta ${codConta} não encontrado no layoutMSC`)
              return
            }

            // Starts to filter the lnc
            layout.values.forEach((v) => allAsked[v] = "")
            cached.push({
              ...layout, codConta, lncVal,
              arq: tipoArquivo[parseInt(lncVal.tipoArquivoSicom)].toUpperCase(),
              tipoLancamento: { "1": "beginning_balance", "2": "period_change", "3": "period_change", "4": "period_change" }[content.tipoLancamento]
            })
          })

          cached.forEach((item, cachedIndex) => {
            const { lncVal } = item

            ICs.forEach((ic) => delete lncVal[ic])
            if (item.values.includes("PO")) lncVal.PO = codPO.get(codOrgao)
            if (item.values.includes("FP")) {
              lncVal.FP = lncVal.atributoConta
            }

            let noNeedForFetch = false
            if (item.values.includes("PO") && item.values.length === 1) noNeedForFetch = true
            if (item.values.includes("FP") && item.values.length === 1) noNeedForFetch = true
            if (item.values.includes("PO") && item.values.includes("FP") && item.values.length === 2) noNeedForFetch = true

            if (!noNeedForFetch) {
              switch (item.arq.toUpperCase()) {
                case "00": {
                  console.log("00", lncVal.chaveArquivo)
                  break;
                }
                case "REC": {
                  console.log("REC", lncVal.chaveArquivo)
                  break;
                }
                case "ARE": {
                  console.log("ARE", lncVal.chaveArquivo)
                  break;
                }
                case "AOC": {
                  lncVal.FS = lncVal.chaveArquivo.substring(10, 15)
                  break;
                }
                case "EMP": {
                  const { content } = campos.emp.find((e) => [
                    e.content.tipoRegistro,
                    e.content.codPrograma,
                    e.content.codOrgao,
                    e.content.codUnidade,
                    e.content.codFuncao,
                    e.content.codSubFuncao,
                    e.content.naturezaAcao,
                    e.content.nroProjAtiv,
                    e.content.elementoDespesa,
                    e.content.subElemento,
                    e.content.nroEmpenho,
                  ].join("").startsWith(lncVal.chaveArquivo))

                  lncVal.ND = codND.get(content.elementoDespesa + content.subElemento)
                  lncVal.FS = content.codFuncao + content.codSubFuncao
                  const [FR, CO] = codFR.autoSend(content.content.find((e) => e.tipoRegistro === "11").codFontRecursos)
                  lncVal.FR = FR
                  lncVal.CO = CO
                  lncVal.AI = content.dtEmpenho.substring(4)
                  break;
                }
                case "ANL": {
                  const { content } = campos.anl.find((e) => e.content.line.startsWith(lncVal.chaveArquivo))
                  lncVal.FS = content.codFuncao + content.codSubFuncao
                  lncVal.ND = codND.get(content.elementoDespesa + content.subElemento)
                  lncVal.AI = content.dtEmpenho.substring(4)
                  const [FR, CO] = codFR.autoSend(content.content.find((e) => e.tipoRegistro === "11").codFontRecursos)
                  lncVal.FR = FR
                  lncVal.CO = CO
                  break;
                }
                case "LQD": {
                  const lqd = campos.lqd.find((e) => e.content.line.startsWith(lncVal.chaveArquivo.substring(0, 68)))
                  if (!lqd) break;
                  lncVal.ND = codND.get(lqd.content.elementoDespesa + lqd.content.subElemento)
                  lncVal.FS = lqd.content.codFuncao + lqd.content.codSubFuncao
                  lncVal.AI = lqd.content.dtEmpenho.substring(4)
                  const subLqd = lqd.content.content.find((l) => l.tipoRegistro === "11")
                  if (!subLqd) break;
                  const codes = codFR.map.get(subLqd.codFonteRecurso.substring(1))
                  lncVal.FR = subLqd.codFonteRecurso.substring(0, 1) + codes[0]
                  lncVal.CO = codes[1]
                  break;
                }
                case "ALQ": {
                  console.log("ALQ", lncVal.chaveArquivo)
                  break;
                }
                case "EXT": {
                  const { content } = campos.ext.find((e) => e.content.line.startsWith(lncVal.chaveArquivo))
                  const [FR, CO] = codFR.autoSend(content.content.find((e) => e.tipoRegistro === "12").codFonteRecurso)
                  lncVal.FR = FR
                  lncVal.CO = CO
                  break;
                }
                case "AEX": {
                  console.log("AEX", lncVal.chaveArquivo)
                  break;
                }
                case "OPS": {
                  if (item.values.includes("ND")) {
                    const ND = codND.get(lncVal.chaveArquivo.substring(19, 27))
                    if (!ND) {
                      console.warn("ND NOT FOUND FOR OPS")
                    }
                    lncVal.ND = ND
                  }

                  const ops = campos.ops.find((ops) => ops.content.line.substring(0, 60) === lncVal.chaveArquivo)
                  if (!ops) {
                    console.warn("No ops found!")
                    break;
                  }
                  const content = ops.content
                  const innerContent = ops.content.content
                  const tipo13 = innerContent.find((innerItem) => innerItem.tipoRegistro === "13")
                  if (!tipo13) {
                    console.warn("No tipo13 for ops found!")
                    break;
                  }
                  // console.log("tipo13.codFonteRecurso", tipo13.codFonteRecurso)
                  const codes = codFR.map.get(tipo13.codFonteRecurso.substring(1))
                  if (!codes) {
                    console.warn("codes not found for tipo13 in OPS switch!")
                    break;
                  }
                  const FR = tipo13.codFonteRecurso.substring(0, 1) + codes[0]
                  const CO = codes[1]
                  const FS = tipo13.codFuncao + tipo13.codSubFuncao
                  const AI = content.dtInscricao.substring(4)
                  if (item.values.includes("FR")) lncVal.FR = FR
                  if (item.values.includes("CO")) lncVal.CO = CO
                  if (item.values.includes("FS")) lncVal.FS = FS
                  if (item.values.includes("AI")) lncVal.AI = AI
                  break;
                }
                case "AOP": {
                  if (item.values.includes("ND")) {
                    const ND = codND.get(lncVal.chaveArquivo.substring(19, 27))
                    if (!ND) {
                      console.warn("ND NOT FOUND FOR AOP")
                    }
                    lncVal.ND = ND
                    const aop = campos.aop.find((aop) => aop.content.line.substring(0, 71) === lncVal.chaveArquivo)
                    if (!aop) {
                      console.warn("No aop found!", lncVal.chaveArquivo)
                      break;
                    }
                    const content = aop.content
                    const innerContent = aop.content.content
                    const tipo13 = innerContent.find((innerItem) => innerItem.tipoRegistro === "13")
                    if (!tipo13) {
                      console.warn("No tipo13 for aop found!")
                      break;
                    }
                    const codes = codFR.map.get(tipo13.codFonteRecurso.substring(1))
                    if (!codes) {
                      console.warn("codes not found for tipo13 in aop switch!")
                      break;
                    }
                    const FR = tipo13.codFonteRecurso.substring(0, 1) + codes[0]
                    const CO = codes[1]
                    const FS = tipo13.codFuncao + tipo13.codSubFuncao
                    const AI = content.dtInscricao.substring(4)
                    if (item.values.includes("FR")) lncVal.FR = FR
                    if (item.values.includes("CO")) lncVal.CO = CO
                    if (item.values.includes("FS")) lncVal.FS = FS
                    if (item.values.includes("AI")) lncVal.AI = AI
                  }
                  break;
                }
                case "RSP": {
                  console.log("RSP", lncVal.chaveArquivo)
                  break;
                }
                case "CON": {
                  console.log("CON", lncVal.chaveArquivo)
                  break;
                }
                case "CTB": {
                  const { content } = campos.ctb.find((e) => e.content.line.startsWith(lncVal.chaveArquivo))
                  const [FR, CO] = codFR.autoSend(content.content.find((e) => e.tipoRegistro === "11").codFonteRecurso)
                  lncVal.FR = FR
                  lncVal.CO = CO
                  break;
                }
                case "TRB": {
                  console.log("TRB", lncVal.chaveArquivo)
                  break;
                }
              }
            }
            const onlyIcs = getOnlyIcs(lncVal, item.values)
            if (onlyIcs.includes(undefined)) {
              console.log(item.arq, item.values, onlyIcs)
              lnc[index].content.valido = "0"
            }
            lnc[index].content.content[cachedIndex] = lncVal
          })
        })
      },
      FIORILLI: function () {
        lnc.forEach((e, index) => {
          /**
           * @typedef {Object} innerContent
           * @property {String} tipoRegistro
           * @property {String} tipoUnidade
           * @property {String} numrControle
           * @property {String} codConta
           * @property {String} atributoConta
           * @property {String} natLancamento
           * @property {String} valor
           * @property {String} tipoArquivoSicom
           * @property {String} chaveArquivo
           * @property {String} nroSequencial
           * @property {String} line
           * @property {String} PO
           * @property {String} FP
           * @property {String} FR
           * @property {String} FS
           * @property {String} ND
           * @property {String} AI
           * @property {String} CO
           * @property {String} DC
           */
          /**
            * @typedef {Object} content
            * @property {String} tipoRegistro
            * @property {String} codOrgao
            * @property {String} tipoUnidade
            * @property {String} numControle
            * @property {String} mesReferencia
            * @property {String} dataRegistro
            * @property {String} tipoLancamento
            * @property {String} dataTransacao
            * @property {String} histórico
            * @property {String} nroSequencial
            * @property {innerContent[]} content
            * @property {String} line
          */
          /** @type {content} */
          const content = e.content
          const innerContent = content.content

          const allIcsFound = {}
          const tipos = []

          innerContent.forEach((innerE, innerIndex) => {
            const codConta = innerE.codConta.substring(0, 9)
            const layout = layoutMSC.get(codConta)
            const tipo = tipoArquivo[parseInt(innerE.tipoArquivoSicom)]
            tipos.push(tipo)
            const innerCopy = { ...innerE }
            innerCopy.PO = codPO.get(content.codOrgao)

            if (layout.values.includes("FP")) {
              innerCopy.FP = innerE.atributoConta
            }

            switch (tipo) {
              case "00": {
                break;
              }
              case "REC": {
                const chave = innerE.chaveArquivo.substring(innerE.chaveArquivo.length - 13)
                const rec = campos.rec.find((e) => e.content.line.substring(2, 2 + chave.length) === chave)?.content
                if (!rec) {
                  console.warn("REC NOT FOUND:", chave)
                  break;
                }
                const inner = rec.content.find((e) => e.tipoRegistro === "12")
                const [FR, CO] = codFR.autoSend(inner.codFonteRecurso)
                innerCopy.FR = FR
                innerCopy.CO = CO
                innerCopy.NR = inner.rubrica
                break;
              }
              case "TRB": {
                const chave = innerE.chaveArquivo.substring(96)
                const trb =
                  campos.trb.flatMap((e) => e.content.content).find((e) => e.line.substring(4, 58) === chave) ||
                  campos.trb.flatMap((e) => e.content).find((e) => e.line.substring(4, 28) === chave.substring(30))?.content?.find((e) => e.tipoRegistro === "11")
                if (!trb) {
                  console.warn("TRB NOT FOUND:", chave)
                  break;
                }
                const [FR, CO] = codFR.autoSend(trb.codFonteRecurso)
                innerCopy.FR = FR
                innerCopy.CO = CO
                break;
              }
              case "OPS": {
                const chave = innerE.chaveArquivo.substring(138, 144)
                const emp = campos.emp.map((e) => e.content).find((e) => e.nroEmpenho === chave)?.content?.find((e) => e.tipoRegistro === "11")
                if (!emp) {
                  console.warn("EMP NOT FOUND:", chave)
                  break;
                }
                innerCopy.FS = emp.codFuncao + emp.codSubFuncao
                innerCopy.ND = codND.get(emp.elementoDespesa + emp.subElemento)
                const [FR, CO] = codFR.autoSend(emp.codFontRecursos)
                innerCopy.FR = FR
                innerCopy.CO = CO
                break;
              }
              case "CTB": {
                const chave = innerE.chaveArquivo.substring(135, 148)
                const ops = campos
                  .ops
                  .flatMap((e) => e.content.content)
                  .filter((e) => e.tipoRegistro === "12")
                  .find((e) => (e.contaCorrente + e.contaCorrenteDigVerif) === chave)
                if (!ops) {
                  console.warn("Could not find OPS for CTB:", chave)
                  break;
                }
                const emp =
                  campos.emp.find((e) => e.content.nroEmpenho === ops.nroEmpenho)?.content
                  || campos.lastEmp.find((e) => e.content.nroEmpenho === ops.nroEmpenho)?.content
                if (!emp) {
                  console.warn("Could not find EMP for CTB:", ops.nroEmpenho)
                  break;
                }
                innerCopy.FS = emp.codFuncao + emp.codSubFuncao
                innerCopy.ND = codND.get(emp.elementoDespesa + emp.subElemento)
                const [FR, CO] = codFR.autoSend(emp.content.find((e) => e.tipoRegistro === "11").codFontRecursos)
                innerCopy.FR = FR
                innerCopy.CO = CO
                break;
              }
              case "LQD": {
                const nroEmpenho = innerE.chaveArquivo.substring(122, 128)
                const dataEmpenho = innerE.chaveArquivo.substring(132, 136)
                const dataAtual = natureza.dataToYear(data)
                const areDataEqual = dataEmpenho === dataAtual
                const emp = areDataEqual
                  ? campos.emp.find((e) => e.content.nroEmpenho === nroEmpenho)?.content
                  : campos.lastEmp.find((e) => e.content.nroEmpenho === nroEmpenho)?.content

                if (!emp) {
                  console.warn("no EMP found for LQD:", nroEmpenho, dataEmpenho, dataAtual, areDataEqual)
                  break;
                }

                try {
                  innerCopy.ND = codND.get(emp.elementoDespesa + emp.subElemento)
                  const [FR, CO] = codFR.autoSend(emp.content.find((e) => e.tipoRegistro === "11").codFontRecursos)
                  innerCopy.FR = FR
                  innerCopy.CO = CO
                  innerCopy.FS = emp.codFuncao + emp.codSubFuncao
                  innerCopy.AI = dataEmpenho
                } catch (err) {
                  console.log(err, "ERROR ON LQD/EMP!")
                }
                break;
              }
              case "ALQ": {
                const nroEmpenho = innerE.chaveArquivo.substring(122, 128)
                const dataEmpenho = innerE.chaveArquivo.substring(132, 136)
                const dataAtual = natureza.dataToYear(data)
                const areDataEqual = dataEmpenho === dataAtual
                const emp = areDataEqual
                  ? campos.emp.find((e) => e.content.nroEmpenho === nroEmpenho)?.content
                  : campos.lastEmp.find((e) => e.content.nroEmpenho === nroEmpenho)?.content

                if (!emp) {
                  console.warn("no EMP found for ALQ:", nroEmpenho, dataEmpenho, dataAtual, areDataEqual)
                  break;
                }

                try {
                  innerCopy.ND = codND.get(emp.elementoDespesa + emp.subElemento)
                  const [FR, CO] = codFR.autoSend(emp.content.find((e) => e.tipoRegistro === "11").codFontRecursos)
                  innerCopy.FR = FR
                  innerCopy.CO = CO
                  innerCopy.FS = emp.codFuncao + emp.codSubFuncao
                  innerCopy.AI = dataEmpenho
                } catch (err) {
                  console.log(err, "ERROR ON ALQ/EMP!")
                }
                break;
              }
              case "EMP": {
                const chave = innerE.chaveArquivo.substring(144, 150)
                const emp = campos.emp.find((e) => e.content.nroEmpenho === chave)?.content
                if (!emp) {
                  console.warn("no EMP found:", chave)
                  break;
                }
                try {
                  innerCopy.ND = codND.get(emp.elementoDespesa + emp.subElemento)
                  const [FR, CO] = codFR.autoSend(emp.content.find((e) => e.tipoRegistro === "11").codFontRecursos)
                  innerCopy.FR = FR
                  innerCopy.CO = CO
                  innerCopy.FS = emp.codFuncao + emp.codSubFuncao
                } catch (err) {
                  console.log(err, "ERROR ON EMP!")
                }
                break;
              }
              case "EXT": {
                const chave = innerE.chaveArquivo.substring(131)
                const ext = campos.ext.find((e) => e.content.line.substring(2, 2 + chave.length))?.content
                if (!ext) {
                  console.log("could not find EXT:", chave)
                  break;
                }
                try {
                  const [FR, CO] = codFR.autoSend(ext.content.find((e) => e.tipoRegistro === "12").codFonteRecurso)
                  innerCopy.FR = FR
                  innerCopy.CO = CO
                } catch (err) {
                  console.log("no tipo 12 on EXT")
                }
                break;
              }
              default: {
                console.log("TO ADD:", innerE.tipoArquivoSicom, "/", tipo)
                break;
              }
            }
            const ICs = getOnlyIcs(innerCopy, layout.values)

            if (tipo !== "00" && ICs.includes(undefined)) {
              // console.log(tipo)
              // console.table([layout.values, ICs])
            }

            layout.values.forEach((e, i) => {
              if (["PO", "FP"].includes(e)) return
              if (!(e in allIcsFound)) allIcsFound[e] = ""
              if (ICs[i]) allIcsFound[e] = ICs[i]
            })

            lnc[index].content.content[innerIndex] = innerCopy
          })
          if (Object.values(allIcsFound).includes("")) lnc[index].content.valido = "0"
          innerContent.forEach((e, i) => lnc[index].content.content[i] = { ...e, ...allIcsFound })
        })
      }
    }

    tipos[ManejOrgao]()

    console.log(natureza.getLncVerSum(lnc))

    for (const i in lnc) {
      await db.withSchema(user.schema).table("lnc").update({ content: lnc[i].content }).where({ id: lnc[i].id })
    }

    return 0
  } catch (error) {
    console.error(
      "error from addValtoLnc function from C:\\Users\\isacc\\Documents\\newHub\\hub-api\\src\\controllers\\campos\\controller.lnc.js",
      error,
    );
    return null;
  } finally {
    console.timeEnd("addVal")
  }
}

export default {
  query: {
    saveTipoOrgaos: async function (req, res) {
      try {
        const tipos = req.body
        const user = await natureza.getUser(req)
        const hasTable = await db.schema.withSchema(user.schema).hasTable("tipoOrgaos")
        if (!hasTable) {
          await db.schema.withSchema(user.schema).createTable("tipoOrgaos", (table) => {
            table.specificType('tipos', 'jsonb[]');
          })
          await db.withSchema(user.schema).table("tipoOrgaos").insert({ tipos })
        } else {
          await db.withSchema(user.schema).table("tipoOrgaos").update({ tipos })
        }
        res.status(200).json({ message: "ok" })
      } catch (err) {
        console.log(err)
      }
    },
    getAllTipoOrgaos: async function (req, res) {
      try {
        const user = await natureza.getUser(req)
        const hasTable = await db.schema.withSchema(user.schema).hasTable("tipoOrgaos")
        if (!hasTable) {
          res.status(200).json([])
        } else {
          const output = await db.withSchema(user.schema).table("tipoOrgaos").select("*").first()
          res.status(200).json(output.tipos)
        }
        res.status(200).json({ message: "ok" })
      } catch (err) {
        console.log(err)
      }
    },
    getInvalidLnc: async function (req, res) {
      const user = await natureza.getUser(req)
      const lnc = await db.withSchema(user.schema).table("lnc").select("*").whereRaw("content ->> 'valido' = '0'")
      res.status(200).json(lnc)
    },
    getOrgaoNames: async function (req, res) {
      try {
        const user = await natureza.getUser(req)
        const orgaos = await db(`${user.schema}.orgao`).select("*")
        const response = []
        const tipos = {}

        const dtToNum = (dt) => {
          return parseInt(dt.substring(2, 4)) + parseInt(dt.substring(4)) * 12
        }

        orgaos.forEach(({ content }) => {
          const find = response.findIndex(e => e.value === content.codOrgao)
          if (find >= 0) {
            if (response[find].i < dtToNum(content.dtInicio)) {
              response.splice(find, 1, {
                value: content.codOrgao,
                label: `${content.codOrgao} - ${content.descOrgao}`,
                i: dtToNum(content.dtInicio)
              })
            }
            return
          }
          response.push({
            value: content.codOrgao,
            label: `${content.codOrgao} - ${content.descOrgao}`,
            i: dtToNum(content.dtInicio)
          })
        })

        return res.status(200).json({ response });
      } catch (error) {
        console.error(
          "error from getOrgaoNames function from /controllers/controller.orgao.js",
          error
        );
        return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
      }
    },
    getAllCampos: async function (req, res) {
      try {
        const { name } = req.params;
        const user = await natureza.getUser(req)

        const response = await db.withSchema(user.schema).table(name).select("*");

        const campoFiltered = {
          content: [],
        };

        response.forEach((e) => {
          const content = e.content;
          for (const label in content) {
            if (label === "content") {
              content.content.forEach((e) => {
                const registros = campoFiltered.content.map((e) => e.tipoRegistro);
                if (registros.includes(e.tipoRegistro)) return;

                const newValues = {};

                for (const label in e) {
                  newValues[label] = "";
                }
                newValues.tipoRegistro = e.tipoRegistro;

                campoFiltered.content.push(newValues);
              });

              continue;
            }
            campoFiltered[label] = null;
          }
        });

        res
          .status(StatusCodes.OK)
          .json({ campoChamado: name, campos: campoFiltered });
      } catch (error) {
        console.error(
          "error from getAllCampos function from /controllers/controller.campos_getAll.js",
          error
        );
        return res.status(500).json({ message: "Internal server error." });
      }
    },
    criarAnalize: async function (req, res) {
      try {
        const { name } = req.params;
        const { data, dataI, dataF, filtrarPorData } = req.body;
        const campo = filtrarPorData
          ? await natureza.getCampo(
            name,
            name.length === 4 ? "y" : "m",
            "",
            "",
            dataI.substring(5, 7) + dataI.substring(2, 4),
            dataF.substring(5, 7) + dataF.substring(2, 4)
          )
          : await db(name).select("*");

        let remainingCampos = campo;

        const keys = Object.keys(data).filter((e) => e !== "content");

        const contentKeys = data.content.map((e) => ({
          tipoRegistro: e.tipoRegistro.value,
          content: Object.keys(e).filter((x) => x !== "tipoRegistro"),
        }));

        for (const keyIndex in keys) {
          if (remainingCampos.length === 0) break;
          remainingCampos = remainingCampos.filter((e) => {
            const valueToCheck = e.content[keys[keyIndex]];
            const checkData = data[keys[keyIndex]];
            if (checkData.infoType === "disabled") {
              return true;
            }
            if (checkData.infoType === "type") {
              return checkData.value === valueToCheck;
            }
            if (checkData.infoType === "multiType") {
              return checkData.value.split("\n").includes(valueToCheck);
            }
          });
        }

        contentKeys.forEach((contentKey) => {
          const tipoRegistro = contentKey.tipoRegistro;

          contentKey.content.forEach((dataKey) => {
            remainingCampos = remainingCampos.filter((campo) => {
              const valuesToCheck = campo.content.content.filter(
                (e) => e.tipoRegistro === tipoRegistro
              );

              const dataValue = data.content.find(
                (e) => e.tipoRegistro.value === tipoRegistro
              )?.[dataKey];

              // if no filter config exists, keep campo
              if (!dataValue) return true;

              // if disabled, always keep
              if (dataValue.infoType === "disabled") return true;

              // if expected values missing, fail
              if (valuesToCheck.length === 0) return false;

              // check if any of the values match
              return valuesToCheck.some((val) => {
                const checkingValue = val[dataKey];

                if (dataValue.infoType === "type") {
                  return dataValue.value === checkingValue;
                }

                if (dataValue.infoType === "multiType") {
                  return dataValue.value.split("\n").includes(checkingValue);
                }

                return false;
              });
            });
          });
        });

        const toSum10 = Object.keys(data)
          .filter((e) => e !== "content")
          .filter((e) => data[e].sum);

        const toSumContent = data.content
          .map((e, i) => {
            const toSum = Object.keys(e).filter((e) => data.content[i][e].sum);
            if (toSum.length === 0) return null;
            return {
              tipoRegistro: e.tipoRegistro.value,
              toSum: toSum,
            };
          })
          .filter((e) => e !== null);
        const sums = { 10: [] };
        if (toSum10.length !== 0) {
          toSum10.forEach((key) => {
            sums["10"].push({
              name: key,
              sum: natureza.sum([
                {
                  campo: remainingCampos,
                  toSum: key,
                },
              ]),
            });
          });
        }

        toSumContent.forEach((e) => {
          sums[e.tipoRegistro] = [];
          e.toSum.forEach((x) => {
            sums[e.tipoRegistro].push({
              name: x,
              sum: natureza.sum([
                {
                  campo: remainingCampos
                    .map((e) => e.content.content)
                    .flat()
                    .filter(
                      (filtering) => filtering.tipoRegistro === e.tipoRegistro
                    )
                    .map((e) => ({ content: e })),
                  toSum: x,
                },
              ]),
            });
          });
        });

        const sumTable = { head: [[], []], body: [], showTable: true };

        Object.keys(sums).forEach((e) => {
          sumTable.head[0].push({
            content: e,
            colSpan: sums[e].length,
          });
          sumTable.head[1].push(...sums[e].map((e) => e.name));
          if (sumTable.body[0]) {
            sumTable.body[0].push(sums[e].map((e) => e.sum));
          } else {
            sumTable.body.push([...sums[e].map((e) => e.sum)]);
          }
        });

        if (remainingCampos.length === 0) {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "Nenhum campo encontrado." });
        }

        if (toSum10.length === 0 && toSumContent.length === 0) {
          sumTable.showTable = false;
        }

        return res
          .status(StatusCodes.OK)
          .json({ message: "OK!", data: remainingCampos, sumTable });
      } catch (error) {
        console.error(
          "error from searchCampos function from /controllers/controller.campos_getAll.js",
          error
        );
        return res.status(500).json({ message: "Internal server error." });
      }
    },
    enviarJson: async function (req, res) {
      try {
        const user = await natureza.getUser(req)
        const file = req.file;
        if (!file) {
          return res.status(400).json({ message: "No file uploaded." });
        }

        const jsonFile = file.buffer.toString("UTF-8");
        const obj = JSON.parse(jsonFile)

        await Promise.all(obj.campo.map((e) => {
          delete e.id
          return db(`${user.schema}.${obj.name}`).insert(e)
        }))

        return res.status(200).json({ message: "File uploaded and data inserted successfully." });
      } catch (error) {
        console.error(
          "error from enviarCsv function from /controllers/campos/controller.campos_getAll.js",
          error
        );
        return res.status(500).json({ message: "Internal server error." });
      }
    },
    novo_registro: async function (req, res) {
      try {
        const { name } = req.params;
        const { data } = req.body
        const user = await natureza.getUser(req)

        const lastOne = await db(`${user.schema}.${name}`).select("*").where({ id: data.id }).first()

        if (!lastOne || lastOne?.length === 0) res.status(404).json({ message: "id was not encountered" })

        const obj = {}
        data.controls.forEach((e) => {
          obj[e.databaseName] = e.value
        })

        if ("content" in lastOne) {
          lastOne.content.content.push(obj)
        } else {
          lastOne.content = { content: [obj] }
        }

        await db(`${user.schema}.${name}`).where({ id: data.id }).update({ content: lastOne.content })

        return res.status(200).json({ message: "File uploaded and data inserted successfully." });
      } catch (error) {
        console.error(
          "error from novo_registro function from /controllers/campos/controller.campos_getAll.js",
          error
        );
        return res.status(500).json({ message: "Internal server error." });
      }
    },
    editarRegistro: async function (req, res) {
      try {
        const { name, id } = req.params;
        const { data, index } = req.body
        const user = await natureza.getUser(req)
        const dbName = { dspo: "dspO", reco: "recO" }[name] || name

        const lastOne = await db(`${user.schema}.${dbName}`).select("*").where({ id }).first()
        if (!lastOne || lastOne?.length === 0) res.status(404).json({ message: "id was not encountered" })

        index === null ? lastOne.content = data : lastOne.content.content[index] = data

        console.log(lastOne.content)

        await db(`${user.schema}.${dbName}`).where({ id }).update({ content: lastOne.content })

        return res.status(200).json({ message: "Registro atualizado com sucesso." });
      } catch (error) {
        console.error(
          "error from editarRegistro function from /controllers/campos/controller.campos_getAll.js",
          error
        );
        return res.status(500).json({ message: "Internal server error." });
      }
    },
    deleteCampo: async function (req, res) {
      try {
        const { name, id, subId } = req.params;
        const user = await natureza.getUser(req)
        if (!user.permissoes.includes("admin")) return res.status(403).json({ message: "Apenas administradores podem deletar registros." });
        if (subId) {
          const dbName = { dspo: "dspO", reco: "recO" }[name] || name
          const lastOne = await db(`${user.schema}.${dbName}`).select("*").where({ id }).first()
          if (!lastOne || lastOne?.length === 0) res.status(404).json({ message: "id was not encountered" })
          lastOne.content.content = lastOne.content.content.filter((_, index) => index.toString() !== subId)
          await db(`${user.schema}.${dbName}`).where({ id }).update({ content: lastOne.content })
          return res.status(200).json({ message: "Registro deletado com sucesso." });
        } else {
          const dbName = { dspo: "dspO", reco: "recO" }[name] || name
          await db(`${user.schema}.${dbName}`).where({ id }).del()
          return res.status(200).json({ message: "Registro deletado com sucesso." });
        }
      } catch (error) {
        console.error(
          "error from deleteCampo function from /controllers/campos/controller.campos_getAll.js",
          error
        );
        return res.status(500).json({ message: "Internal server error." });
      }
    },
    getAsJson: async function (req, res) {
      try {
        const name = { dspo: "dspO", reco: "recO", org: "orgao" }[req.params.name] || req.params.name;
        const user = await natureza.getUser(req)
        // fetch all rows from the table
        const campo = await db(`${user.schema}.${name}`).select("*");

        const output = { name, campo, at: new Date().toLocaleDateString("pt-BR"), by: user.id_usuario }

        return res.status(StatusCodes.OK).json(JSON.stringify(output, null, 2))

      } catch (error) {
        console.error(
          "error from getAsJson function from /controllers/campos/controller.campos_getAll.js",
          error
        );
        return res.status(500).json({ message: "Internal server error." });
      }
    },
    deleteCampos: async function (req, res) {
      try {
        const user = await natureza.getUser(req)
        let { data, orgao } = req.params
        data = data === "null" ? null : data
        orgao = orgao === "null" ? null : orgao
        console.log(data, orgao)
        const whereClauses = []
        const whereBindings = []

        if (data) {
          whereClauses.push("data = ?")
          whereBindings.push(data)
        }
        if (orgao) {
          whereClauses.push("content ->> 'codOrgao' = ?")
          whereBindings.push(orgao)
        }

        const whereStr = whereClauses.join(" AND ")
        console.log(whereStr, whereBindings)

        for (const name in campos) {
          if (data) {
            try {
              whereStr
                ? await db.withSchema(user.schema).table(campos[name]).whereRaw(whereStr, whereBindings).delete()
                : await db.withSchema(user.schema).table(campos[name]).delete()
            } catch {
              // console.log(`'${date.substring(0, 2)}${natureza.dataToYear(date)}' ${campos[name]}`)
              await db(`${user.schema}.${campos[name]}`).whereRaw(`SUBSTRING(content ->> 'dtInicio', 3, 6) = '${data.substring(0, 2)}${natureza.dataToYear(data)}'`).delete()
            }
          } else {
            await db(`${user.schema}.${campos[name]}`).delete()
          }
        }
        res.status(200).json({ message: "Todos os campos deletados com sucesso" });
      } catch (error) {
        console.error("Error in deleteCampos function controller.campos.js", error);
        return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
      }
    },
    getCampo: async function (req, res) {
      // Paginacao
      let { page, pageSize, name } = req.params;
      page = parseInt(page, 10);
      pageSize = parseInt(pageSize, 10);
      if (isNaN(page) || page < 0) page = 0;
      if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
      const { mes, ano, org } = req.query;
      const user = await natureza.getUser(req)
      console.log(user.schema)
      try {
        let query = db(`${user.schema}.${name}`);

        if (mes) {
          query = query.whereRaw("SUBSTRING(data, 1, 2) = ?", [
            mes.padStart(2, "0"),
          ]);
        }
        if (org) {
          query = query.whereRaw(`content ->> 'codOrgao' = '${String(org).padStart(2, "0")}'`)
        }
        if (ano) {
          query = query.whereRaw("SUBSTRING(data, 3, 2) = ?", [
            String(ano).substring(2, 4),
          ]);
        }

        const totalCount = await query.clone().count("* as count");
        const total = Math.ceil(totalCount[0]?.count / pageSize);

        if (Number(page) >= Number(total)) {
          page = Math.max(0, total - 1);
        }

        const all = await query
          .clone()
          .select("*")
          .orderBy("id", "asc")

        const response = all.splice(page * pageSize, pageSize)
        all.push(...response)
        let cascaderData = []

        response.forEach((e) => {
          const res = []
          const onObject = (obj, k) => {
            const res = []
            Object.entries(obj).forEach(([key, val]) => {
              const useKey = k ? k + "." + key : key
              if (["string", "number"].includes(typeof val)) {
                res.push(onVal(useKey, key))
              } else if (Array.isArray(val)) {
                const response = onArray(useKey, val)
                if (response) res.push(response)
              } else {
                res.push({ label: key, children: onObject(val, useKey) })
              }
            })
            return res
          }
          const onArray = (key, val) => {
            const res = []
            const already = []
            val.forEach((e) => {
              if (already.includes(e.tipoRegistro)) return
              already.push(e.tipoRegistro)
              const realK = key + "." + e.tipoRegistro
              res.push({ children: onObject(e, realK), label: e.tipoRegistro })
            })
            console.log(res)
            return { children: res, label: "content" }
          }
          const onVal = (key, val) => {
            return { value: key, label: val }
          }
          cascaderData = onObject(e)
        })

        console.log(cascaderData)
        return res.status(200).json({ cascaderData, response, totalPages: total, currentPage: page });
      } catch (error) {
        console.error(
          "error from getAllAre function from /controllers/controller.are.js",
          error
        );
        return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
      }
    },
    getAllFromTable: async function (req, res) {
      try {
        const user = await natureza.getUser(req)
        const { name } = req.params
        const result = await db.raw(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = '${user.schema}'
          ORDER BY table_name
        `);
        const tableNames = result.rows.map(row => row.table_name);

        if (!tableNames.includes(name)) return res.status(404).json({ message: "Campo não encontrado." })

        const table = await db.withSchema(user.schema).table(name).select("*")

        res.status(200).json(table)

      } catch (error) {
        console.error("Error in getAllFromTable function controller.campos.js", error);
        return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
      }
    },
    updateTable: async function (req, res) {
      try {
        const user = await natureza.getUser(req)
        const { name } = req.params
        const { campoToEnv } = req.body

        const idName = {}[name] || "id"
        const id = campoToEnv[idName]
        delete campoToEnv[idName]

        await db.withSchema(user.schema).table(name).where({ [idName]: id }).update(campoToEnv)

        res.status(200).json({ message: "ok" })
      } catch (error) {
        console.error("Error in updateTable function controller.campos.js", error);
        return res.status(500).json({ message: "Ocorreu um erro ao enviar o campo, não altere o id." });
      }
    },
    recarregarLnc: async function (req, res) {
      try {
        const { data, orgao } = req.params
        const user = await natureza.getUser(req)
        if (!data) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Parametro \"data\" em falta." })
        if (!orgao) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Parametro \"orgao\" em falta." })
        if (!user) return res.status(StatusCodes.FAILED_DEPENDENCY).json({ message: "Não foi possível verificar o usuário." })

        const lncFetched = await db.withSchema(user.schema).table("lnc").select("*").where({ data })
        if (!lncFetched || lncFetched.length === 0) return res.status(StatusCodes.NOT_FOUND).json({ message: "Nenhum lnc encontrado." })

        await addValtoLnc(lncFetched, orgao, data, user)

        res.status(StatusCodes.OK).json({ message: "OK" })
      } catch (err) {
        console.error(err, "controllerCampos.js: recarregarLnc.")
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Ocorreu um erro interno no servidor" })
      }
    }
  },
  inserir: {
    /**
     * @typedef {Object} infoArgument 
     * @property {String} text - Conteúdo do arquivo.
     * @property {String} data - Data do arquivo.
     * @property {String} sch - O schema a inserir.
     * @property {String} codOrgao - Orgão responsável pelo arquivo.
     */
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    abl: async function (info) {
      const { text, data, sch } = info
      const abl = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              abl.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  exercicioLicitacao: line.slice(6, 10).trim(),
                  nroProcessoLicitatorio: line.slice(10, 22).trim(),
                  codModalidadeLicita: line.slice(22, 23).trim(),
                  nroModalidade: line.slice(23, 33).trim(),
                  naturezaProcedimento: line.slice(33, 34).trim(),
                  dtAbertura: line.slice(34, 42).trim(),
                  dtEditalConvite: line.slice(42, 50).trim(),
                  dtPublicacaoEditalDO: line.slice(50, 58).trim(),
                  dtRecebimentoDoc: line.slice(58, 66).trim(),
                  tipoLicitacao: line.slice(66, 67).trim(),
                  naturezaObjeto: line.slice(67, 68).trim(),
                  Objeto: line.slice(68, 568).trim(),
                  regimeExecucaoObras: line.slice(568, 569).trim(),
                  nroConvidado: line.slice(569, 572).trim(),
                  clausulaProrrogacao: line.slice(572, 822).trim(),
                  unidadeMedidaPrazo: line.slice(822, 823).trim(),
                  prazoExecucao: line.slice(823, 827).trim(),
                  formaPagamento: line.slice(827, 927).trim(),
                  criterioAceitabilidade: line.slice(927, 1027).trim(),
                  descontoTabela: line.slice(1027, 1028).trim(),
                  nroSequencial: line.slice(1028, 1034).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                abl[dataHelper] &&
                abl[dataHelper].content &&
                Array.isArray(abl[dataHelper].content.content)
              ) {
                abl[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  exercicioLicitacao: line.slice(6, 10).trim(),
                  nroProcessoLicitatorio: line.slice(10, 22).trim(),
                  nroLote: line.slice(22, 26).trim(),
                  nroItem: line.slice(26, 30).trim(),
                  dtCotacao: line.slice(30, 38).trim(),
                  dscItem: line.slice(38, 288).trim(),
                  vlCotPrecosUnitario: line.slice(288, 301).trim(),
                  quantidade: line.slice(301, 314).trim(),
                  unidade: line.slice(314, 316).trim(),
                  vlMinAlienBens: line.slice(316, 329).trim(),
                  nroSequencial: line.slice(1028, 1034).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "12") {
              if (
                abl[dataHelper] &&
                abl[dataHelper].content &&
                Array.isArray(abl[dataHelper].content.content)
              ) {
                abl[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  exercicioLicitacao: line.slice(6, 10).trim(),
                  nroProcessoLicitatorio: line.slice(10, 22).trim(),
                  nroLote: line.slice(22, 26).trim(),
                  nroItem: line.slice(26, 30).trim(),
                  dscItem: line.slice(30, 280).trim(),
                  vlItem: line.slice(280, 293).trim(),
                  nroSequencial: line.slice(1028, 1034).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "13") {
              if (
                abl[dataHelper] &&
                abl[dataHelper].content &&
                Array.isArray(abl[dataHelper].content.content)
              ) {
                abl[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  exercicioLicitacao: line.slice(6, 10).trim(),
                  nroProcessoLicitatorio: line.slice(10, 22).trim(),
                  codFuncao: line.slice(22, 24).trim(),
                  codSubfuncao: line.slice(24, 27).trim(),
                  codPrograma: line.slice(27, 31).trim(),
                  naturezaAcao: line.slice(31, 32).trim(),
                  nroProjAtiv: line.slice(32, 35).trim(),
                  elementoDespesa: line.slice(35, 41).trim(),
                  subElemento: line.slice(41, 43).trim(),
                  codFonteRecurso: line.slice(43, 49).trim(),
                  vlRecurso: line.slice(49, 62).trim(),
                  nroSequencial: line.slice(1028, 1034).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.abl`, abl, 75);

        return abl
      } catch (error) {
        console.error(
          "error from InserirAbl function from /controllers/controller.abl.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    aex: async function (info) {
      const { text, data, sch } = info
      const aex = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              aex.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  Categoria: line.slice(6, 7).trim(),
                  tipoLancamento: line.slice(7, 9).trim(),
                  subTipo: line.slice(9, 12).trim(),
                  desdobraSubTipo: line.slice(12, 15).trim(),
                  nrExtraOrcamentaria: line.slice(15, 21).trim(),
                  dataAnulacao: line.slice(21, 29).trim(),
                  vlAnulacao: line.slice(29, 42).trim(),
                  nroSequencial: line.slice(72, 78).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                aex[dataHelper] &&
                aex[dataHelper].content &&
                Array.isArray(aex[dataHelper].content.content)
              ) {
                aex[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  Categoria: line.slice(6, 7).trim(),
                  tipoLancamento: line.slice(7, 9).trim(),
                  subTipo: line.slice(9, 12).trim(),
                  desdobraSubTipo: line.slice(12, 15).trim(),
                  nrExtraOrcamentaria: line.slice(15, 21).trim(),
                  dataAnulacao: line.slice(21, 29).trim(),
                  codUnidadeFinanceira: line.slice(29, 31).trim(),
                  banco: line.slice(31, 34).trim(),
                  agencia: line.slice(34, 38).trim(),
                  contaCorrente: line.slice(38, 50).trim(),
                  contaCorrenteDigVerif: line.slice(50, 51).trim(),
                  tipoConta: line.slice(51, 53).trim(),
                  vlAnulacaoMovimentacao: line.slice(53, 66).trim(),
                  nroSequencial: line.slice(72, 78).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "12") {
              if (
                aex[dataHelper] &&
                aex[dataHelper].content &&
                Array.isArray(aex[dataHelper].content.content)
              ) {
                aex[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  Categoria: line.slice(6, 7).trim(),
                  tipoLancamento: line.slice(7, 9).trim(),
                  subTipo: line.slice(9, 12).trim(),
                  desdobraSubTipo: line.slice(12, 15).trim(),
                  nrExtraOrcamentaria: line.slice(15, 21).trim(),
                  dataAnulacao: line.slice(21, 29).trim(),
                  codUnidadeFinanceira: line.slice(29, 31).trim(),
                  banco: line.slice(31, 34).trim(),
                  agencia: line.slice(34, 38).trim(),
                  contaCorrente: line.slice(38, 50).trim(),
                  contaCorrenteDigVerif: line.slice(50, 51).trim(),
                  tipoConta: line.slice(51, 53).trim(),
                  codFonteRecurso: line.slice(53, 59).trim(),
                  vlAnulacaoFR: line.slice(59, 72).trim(),
                  nroSequencial: line.slice(72, 78).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.aex`, aex, 75);

        return aex
      } catch (error) {
        console.error(
          "error from InserirAex function from /controllers/controller.aex.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    alq: async function (info) {
      const { text, data, sch } = info
      const alq = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              alq.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  dotOrigP2001: line.slice(27, 48).trim(),
                  nroEmpenho: line.slice(48, 54).trim(),
                  dtEmpenho: line.slice(54, 62).trim(),
                  nrLiquidacao: line.slice(62, 68).trim(),
                  dtLiquidacao: line.slice(68, 76).trim(),
                  nrLiquidacaoANL: line.slice(76, 82).trim(),
                  dtAnulacaoLiq: line.slice(82, 90).trim(),
                  tpLiquidacao: line.slice(90, 91).trim(),
                  vlLiquidado: line.slice(91, 104).trim(),
                  vlAnulado: line.slice(104, 117).trim(),
                  nroSequencial: line.slice(236, 242).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                alq[dataHelper] &&
                alq[dataHelper].content &&
                Array.isArray(alq[dataHelper].content.content)
              ) {
                alq[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  dotOrigP2001: line.slice(27, 48).trim(),
                  nroEmpenho: line.slice(48, 54).trim(),
                  dtEmpenho: line.slice(54, 62).trim(),
                  nrLiquidacao: line.slice(62, 68).trim(),
                  dtLiquidacao: line.slice(68, 76).trim(),
                  nrLiquidacaoANL: line.slice(76, 82).trim(),
                  dtAnulacaoLiq: line.slice(82, 90).trim(),
                  codFonteRecurso: line.slice(90, 96).trim(),
                  vlLiquidadoFR: line.slice(96, 109).trim(),
                  vlAnuladoFR: line.slice(109, 122).trim(),
                  nroSequencial: line.slice(236, 242).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "12") {
              if (
                alq[dataHelper] &&
                alq[dataHelper].content &&
                Array.isArray(alq[dataHelper].content.content)
              ) {
                alq[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  dotOrigP2001: line.slice(27, 48).trim(),
                  nroEmpenho: line.slice(48, 54).trim(),
                  dtEmpenho: line.slice(54, 62).trim(),
                  nrLiquidacao: line.slice(62, 68).trim(),
                  dtLiquidacao: line.slice(68, 76).trim(),
                  nrLiquidacaoANL: line.slice(76, 82).trim(),
                  dtAnulacaoLiq: line.slice(82, 90).trim(),
                  tipoDocFiscal: line.slice(90, 92).trim(),
                  nroDocFiscal: line.slice(92, 102).trim(),
                  serieDocFiscal: line.slice(102, 110).trim(),
                  dtDocFiscal: line.slice(110, 118).trim(),
                  vlAnulado: line.slice(118, 131).trim(),
                  CNPJCPFCredor: line.slice(131, 145).trim(),
                  tipoCredor: line.slice(145, 146).trim(),
                  nrInscEstadual: line.slice(146, 161).trim(),
                  nrInscMunicipal: line.slice(161, 176).trim(),
                  CEPMunicipio: line.slice(176, 184).trim(),
                  ufCredor: line.slice(184, 186).trim(),
                  nomeCredor: line.slice(186, 236).trim(),
                  nroSequencial: line.slice(236, 242).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "13") {
              if (
                alq[dataHelper] &&
                alq[dataHelper].content &&
                Array.isArray(alq[dataHelper].content.content)
              ) {
                alq[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  dotOrigP2001: line.slice(27, 48).trim(),
                  nroEmpenho: line.slice(48, 54).trim(),
                  dtEmpenho: line.slice(54, 62).trim(),
                  nrLiquidacao: line.slice(62, 68).trim(),
                  dtLiquidacao: line.slice(68, 76).trim(),
                  nrLiquidacaoANL: line.slice(76, 82).trim(),
                  dtAnulacaoLiq: line.slice(82, 90).trim(),
                  tipoDocFiscal: line.slice(90, 92).trim(),
                  nroDocFiscal: line.slice(92, 102).trim(),
                  serieDocFiscal: line.slice(102, 110).trim(),
                  dtDocFiscal: line.slice(110, 118).trim(),
                  vlCancelado: line.slice(118, 131).trim(),
                  CNPJCPFCredor: line.slice(131, 145).trim(),
                  tipoCredor: line.slice(145, 146).trim(),
                  nrInscEstadual: line.slice(146, 161).trim(),
                  nrInscMunicipal: line.slice(161, 176).trim(),
                  CEPMunicipio: line.slice(176, 184).trim(),
                  ufCredor: line.slice(184, 186).trim(),
                  nomeCredor: line.slice(186, 236).trim(),
                  nroSequencial: line.slice(236, 242).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.alq`, alq, 75);

        return alq
      } catch (error) {
        console.error(
          "error from InserirAlq function from /controllers/controller.alq.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    anl: async function (info) {
      const { text, data, sch } = info
      const anl = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              anl.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  nroEmpenho: line.slice(27, 33).trim(),
                  dtAnulacao: line.slice(33, 41).trim(),
                  nrAnulacao: line.slice(41, 44).trim(),
                  dtEmpenho: line.slice(44, 52).trim(),
                  vlOriginal: line.slice(52, 65).trim(),
                  vlAnulacao: line.slice(65, 78).trim(),
                  nomeCredor: line.slice(78, 128).trim(),
                  tipoCredor: line.slice(128, 129).trim(),
                  cpfCnpj: line.slice(129, 143).trim(),
                  especificacaoEmpenho: line.slice(143, 343).trim(),
                  nroSequencial: line.slice(343, 349).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                anl[dataHelper] &&
                anl[dataHelper].content &&
                Array.isArray(anl[dataHelper].content.content)
              ) {
                anl[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  nroEmpenho: line.slice(27, 33).trim(),
                  dtAnulacao: line.slice(33, 41).trim(),
                  nrAnulacao: line.slice(41, 44).trim(),
                  codFontRecursos: line.slice(44, 50).trim(),
                  vlEmpFonte: line.slice(50, 63).trim(),
                  vlAnulacaoFonte: line.slice(63, 76).trim(),
                  nroSequencial: line.slice(343, 349).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "12") {
              if (
                anl[dataHelper] &&
                anl[dataHelper].content &&
                Array.isArray(anl[dataHelper].content.content)
              ) {
                anl[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  nroEmpenho: line.slice(27, 33).trim(),
                  dtAnulacao: line.slice(33, 41).trim(),
                  nrAnulacao: line.slice(41, 44).trim(),
                  codUnidadeObra: line.slice(44, 46).trim(),
                  codObra: line.slice(46, 50).trim(),
                  anoObra: line.slice(50, 54).trim(),
                  vlAnuladoObra: line.slice(54, 67).trim(),
                  nroSequencial: line.slice(343, 349).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "13") {
              if (
                anl[dataHelper] &&
                anl[dataHelper].content &&
                Array.isArray(anl[dataHelper].content.content)
              ) {
                anl[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  nroEmpenho: line.slice(27, 33).trim(),
                  dtAnulacao: line.slice(33, 41).trim(),
                  nrAnulacao: line.slice(41, 44).trim(),
                  codUnidadeContrato: line.slice(44, 46).trim(),
                  nroContrato: line.slice(46, 66).trim(),
                  anoContrato: line.slice(66, 70).trim(),
                  tipoAjuste: line.slice(70, 71).trim(),
                  vlAnuladoContrato: line.slice(71, 84).trim(),
                  nroSequencial: line.slice(343, 349).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "14") {
              if (
                anl[dataHelper] &&
                anl[dataHelper].content &&
                Array.isArray(anl[dataHelper].content.content)
              ) {
                anl[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  nroEmpenho: line.slice(27, 33).trim(),
                  dtAnulacao: line.slice(33, 41).trim(),
                  nrAnulacao: line.slice(41, 44).trim(),
                  cpfCnpjCredor: line.slice(44, 58).trim(),
                  tipoCredor: line.slice(58, 59).trim(),
                  nomeCredor: line.slice(59, 109).trim(),
                  vlAnuladoCredor: line.slice(109, 122).trim(),
                  nroSequencial: line.slice(343, 349).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.anl`, anl, 75)

        return anl
      } catch (error) {
        console.error(
          "error from InserirAnl function from /controllers/controller.anl.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    aoc: async function (info) {
      const { text, data, sch } = info
      const aoc = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              aoc.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  vlSaldoAntOrcado: line.slice(19, 32).trim(),
                  vlSaldoAtual: line.slice(32, 45).trim(),
                  nroSequencial: line.slice(80, 86).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                aoc[dataHelper] &&
                aoc[dataHelper].content &&
                Array.isArray(aoc[dataHelper].content.content)
              ) {
                aoc[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  codNaturezaDaDespesa: line.slice(19, 25).trim(),
                  dataAlteracao: line.slice(25, 33).trim(),
                  nrAlteracao: line.slice(33, 36).trim(),
                  tipoAlteracao: line.slice(36, 38).trim(),
                  vlAlteracao: line.slice(38, 51).trim(),
                  vlSaldoAntDotacao: line.slice(51, 64).trim(),
                  vlSaldoAtual: line.slice(64, 77).trim(),
                  nroSequencial: line.slice(80, 86).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "12") {
              if (
                aoc[dataHelper] &&
                aoc[dataHelper].content &&
                Array.isArray(aoc[dataHelper].content.content)
              ) {
                aoc[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  codNaturezaDaDespesa: line.slice(19, 25).trim(),
                  dataAlteracao: line.slice(25, 33).trim(),
                  nrAlteracao: line.slice(33, 36).trim(),
                  tipoAlteracao: line.slice(36, 38).trim(),
                  codFontRecursos: line.slice(38, 41).trim(),
                  vlAlteracaoFonte: line.slice(41, 54).trim(),
                  vlSaldoAntFonte: line.slice(54, 67).trim(),
                  vlSaldoAtualFonte: line.slice(67, 80).trim(),
                  nroSequencial: line.slice(80, 86).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "90") {
              if (
                aoc[dataHelper] &&
                aoc[dataHelper].content &&
                Array.isArray(aoc[dataHelper].content.content)
              ) {
                aoc[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  nrLeiSuplementacao: line.slice(2, 8).trim(),
                  dataLeiSuplementacao: line.slice(8, 16).trim(),
                  vlAutorizadoSuplementacao: line.slice(16, 29).trim(),
                  nroSequencial: line.slice(80, 86).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "91") {
              if (
                aoc[dataHelper] &&
                aoc[dataHelper].content &&
                Array.isArray(aoc[dataHelper].content.content)
              ) {
                aoc[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  nrLeiCreditoEsp: line.slice(2, 8).trim(),
                  dataLeiCreditoEsp: line.slice(8, 16).trim(),
                  vlAutorizadoCreditoEsp: line.slice(16, 29).trim(),
                  nroSequencial: line.slice(80, 86).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "92") {
              if (
                aoc[dataHelper] &&
                aoc[dataHelper].content &&
                Array.isArray(aoc[dataHelper].content.content)
              ) {
                aoc[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  nrLeiRealocRec: line.slice(2, 8).trim(),
                  dataLeiRealocRec: line.slice(8, 16).trim(),
                  vlAutorizadoRealocRec: line.slice(16, 29).trim(),
                  nroSequencial: line.slice(80, 86).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "93") {
              if (
                aoc[dataHelper] &&
                aoc[dataHelper].content &&
                Array.isArray(aoc[dataHelper].content.content)
              ) {
                aoc[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  nrLeiAltPPA: line.slice(2, 8).trim(),
                  dataLeiAltPPA: line.slice(8, 16).trim(),
                  nroSequencial: line.slice(80, 86).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "94") {
              if (
                aoc[dataHelper] &&
                aoc[dataHelper].content &&
                Array.isArray(aoc[dataHelper].content.content)
              ) {
                aoc[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  nrDecreto: line.slice(2, 8).trim(),
                  dataDecreto: line.slice(8, 16).trim(),
                  vlDecreto: line.slice(16, 29).trim(),
                  tipoCredito: line.slice(29, 30).trim(),
                  nroSequencial: line.slice(80, 86).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.aoc`, aoc, 75);

        return aoc
      } catch (error) {
        console.error(
          "error from InserirAoc function from /controllers/controller.aoc.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    aop: async function (info) {
      const { text, data, sch } = info
      const aop = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              aop.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  dotOrigP2001: line.slice(27, 48).trim(),
                  nroEmpenho: line.slice(48, 54).trim(),
                  nroOP: line.slice(54, 60).trim(),
                  dtAnulacao: line.slice(60, 68).trim(),
                  nrAnulacaoOP: line.slice(68, 71).trim(),
                  tipoOP: line.slice(71, 72).trim(),
                  dtInscricao: line.slice(72, 80).trim(),
                  dtEmissao: line.slice(80, 88).trim(),
                  vlOP: line.slice(88, 101).trim(),
                  vlAnuladoOP: line.slice(101, 114).trim(),
                  nomeCredor: line.slice(114, 164).trim(),
                  tipoCredor: line.slice(164, 165).trim(),
                  cpfCnpj: line.slice(165, 179).trim(),
                  especificacaoOP: line.slice(179, 379).trim(),
                  nrExtraOrcamentaria: line.slice(379, 385).trim(),
                  nroSequencial: line.slice(385, 391).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                aop[dataHelper] &&
                aop[dataHelper].content &&
                Array.isArray(aop[dataHelper].content.content)
              ) {
                aop[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  dotOrigP2001: line.slice(27, 48).trim(),
                  nroEmpenho: line.slice(48, 54).trim(),
                  nroOP: line.slice(54, 60).trim(),
                  dtAnulacao: line.slice(60, 68).trim(),
                  nrAnulacaoOP: line.slice(68, 71).trim(),
                  nrLiquidacao: line.slice(71, 77).trim(),
                  dtLiquidacao: line.slice(77, 85).trim(),
                  vlAnulacao: line.slice(85, 98).trim(),
                  nroSequencial: line.slice(385, 391).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "12") {
              if (
                aop[dataHelper] &&
                aop[dataHelper].content &&
                Array.isArray(aop[dataHelper].content.content)
              ) {
                aop[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  dotOrigP2001: line.slice(27, 48).trim(),
                  nroEmpenho: line.slice(48, 54).trim(),
                  nroOP: line.slice(54, 60).trim(),
                  dtAnulacao: line.slice(60, 68).trim(),
                  nrAnulacaoOP: line.slice(68, 71).trim(),
                  codUnidadeFinanceira: line.slice(71, 73).trim(),
                  banco: line.slice(73, 76).trim(),
                  agencia: line.slice(76, 80).trim(),
                  contaCorrente: line.slice(80, 92).trim(),
                  contaCorrenteDigVerif: line.slice(92, 93).trim(),
                  tipoConta: line.slice(93, 95).trim(),
                  nrDocumento: line.slice(95, 110).trim(),
                  tipoDocumento: line.slice(110, 112).trim(),
                  vlDocumento: line.slice(112, 125).trim(),
                  dtEmissao: line.slice(125, 133).trim(),
                  vlAnulacao: line.slice(133, 146).trim(),
                  nroSequencial: line.slice(385, 391).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "13") {
              if (
                aop[dataHelper] &&
                aop[dataHelper].content &&
                Array.isArray(aop[dataHelper].content.content)
              ) {
                aop[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  dotOrigP2001: line.slice(27, 48).trim(),
                  nroEmpenho: line.slice(48, 54).trim(),
                  nroOP: line.slice(54, 60).trim(),
                  dtAnulacao: line.slice(60, 68).trim(),
                  nrAnulacaoOP: line.slice(68, 71).trim(),
                  codUnidadeFinanceira: line.slice(71, 73).trim(),
                  banco: line.slice(73, 76).trim(),
                  agencia: line.slice(76, 80).trim(),
                  contaCorrente: line.slice(80, 92).trim(),
                  contaCorrenteDigVerif: line.slice(92, 93).trim(),
                  tipoConta: line.slice(93, 95).trim(),
                  nrDocumento: line.slice(95, 110).trim(),
                  codFonteRecurso: line.slice(110, 116).trim(),
                  vlAnulacaoFR: line.slice(116, 129).trim(),
                  nroSequencial: line.slice(385, 391).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "14") {
              if (
                aop[dataHelper] &&
                aop[dataHelper].content &&
                Array.isArray(aop[dataHelper].content.content)
              ) {
                aop[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  dotOrigP2001: line.slice(27, 48).trim(),
                  nroEmpenho: line.slice(48, 54).trim(),
                  nroOP: line.slice(54, 60).trim(),
                  dtAnulacao: line.slice(60, 68).trim(),
                  nrAnulacaoOP: line.slice(68, 71).trim(),
                  tipoRetencao: line.slice(71, 73).trim(),
                  VlAnulacaoRetencao: line.slice(73, 86).trim(),
                  nrExtraOrcamentaria: line.slice(86, 92).trim(),
                  nroSequencial: line.slice(385, 391).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.aop`, aop, 75);

        return aop
      } catch (error) {
        console.error(
          "error from InserirAop function from /controllers/controller.aop.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    are: async function (info) {
      const { text, data, sch } = info
      const are = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              are.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  rubrica: line.slice(6, 15).trim(),
                  vlAnulacao: line.slice(15, 28).trim(),
                  justificativa: line.slice(28, 283).trim(),
                  nroSequencial: line.slice(283, 289).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                are[dataHelper] &&
                are[dataHelper].content &&
                Array.isArray(are[dataHelper].content.content)
              ) {
                are[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  rubrica: line.slice(6, 15).trim(),
                  banco: line.slice(15, 18).trim(),
                  agencia: line.slice(18, 22).trim(),
                  contaCorrente: line.slice(22, 34).trim(),
                  contaCorrenteDigVerif: line.slice(34, 35).trim(),
                  tipoConta: line.slice(35, 37).trim(),
                  vlAnulado: line.slice(37, 50).trim(),
                  nroSequencial: line.slice(283, 289).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "12") {
              if (
                are[dataHelper] &&
                are[dataHelper].content &&
                Array.isArray(are[dataHelper].content.content)
              ) {
                are[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  rubrica: line.slice(6, 15).trim(),
                  banco: line.slice(15, 18).trim(),
                  agencia: line.slice(18, 22).trim(),
                  contaCorrente: line.slice(22, 34).trim(),
                  contaCorrenteDigVerif: line.slice(34, 35).trim(),
                  tipoConta: line.slice(35, 37).trim(),
                  codFonteRecurso: line.slice(37, 43).trim(),
                  vlAnuladoFonteRecurso: line.slice(43, 56).trim(),
                  nroSequencial: line.slice(283, 289).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.are`, are, 75);

        return are
      } catch (error) {
        console.error(
          "error from InserirAre function from /controllers/controller.are.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    arp: async function (info) {
      const { text, data, sch } = info
      const arp = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              arp.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  nroProcessoAdesao: line.slice(6, 10).trim(),
                  dataAberturaProc: line.slice(10, 18).trim(),
                  nomeOrgaoGerenciador: line.slice(18, 118).trim(),
                  exercicioLicitacao: line.slice(118, 122).trim(),
                  nroProcessoLicitatorio: line.slice(122, 134).trim(),
                  codModalidadeLicitacao: line.slice(134, 135).trim(),
                  nroModalidade: line.slice(135, 145).trim(),
                  dataAtaRegPreco: line.slice(145, 153).trim(),
                  dataValidade: line.slice(153, 161).trim(),
                  naturezaProcedimento: line.slice(161, 162).trim(),
                  dtPublicacaoAvisoIntencao: line.slice(162, 170).trim(),
                  objetoAdesao: line.slice(170, 420).trim(),
                  nroCpfResponsavel: line.slice(420, 431).trim(),
                  nomeResponsavel: line.slice(431, 481).trim(),
                  logradouro: line.slice(481, 531).trim(),
                  setor: line.slice(531, 551).trim(),
                  cidade: line.slice(551, 571).trim(),
                  uf: line.slice(571, 573).trim(),
                  CEP: line.slice(573, 581).trim(),
                  telefone: line.slice(581, 591).trim(),
                  email: line.slice(591, 671).trim(),
                  descontoTabela: line.slice(671, 672).trim(),
                  nroSequencial: line.slice(672, 678).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                arp[dataHelper] &&
                arp[dataHelper].content &&
                Array.isArray(arp[dataHelper].content.content)
              ) {
                arp[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  nroProcessoAdesao: line.slice(6, 10).trim(),
                  dataAberturaProc: line.slice(10, 18).trim(),
                  nroLote: line.slice(18, 22).trim(),
                  nroItem: line.slice(22, 26).trim(),
                  dtCotacao: line.slice(26, 34).trim(),
                  dscItem: line.slice(34, 284).trim(),
                  vlCotPrecosUnitario: line.slice(284, 297).trim(),
                  quantidade: line.slice(297, 310).trim(),
                  unidade: line.slice(310, 312).trim(),
                  nroSequencial: line.slice(672, 678).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "12") {
              if (
                arp[dataHelper] &&
                arp[dataHelper].content &&
                Array.isArray(arp[dataHelper].content.content)
              ) {
                arp[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  nroProcessoAdesao: line.slice(6, 10).trim(),
                  dataAberturaProc: line.slice(10, 18).trim(),
                  nroLote: line.slice(18, 22).trim(),
                  nroItem: line.slice(22, 26).trim(),
                  dscItem: line.slice(27, 276).trim(),
                  precoUnitario: line.slice(276, 289).trim(),
                  quantidadeLicitada: line.slice(289, 302).trim(),
                  quantidadeAderida: line.slice(302, 315).trim(),
                  unidade: line.slice(315, 317).trim(),
                  nomeVencedor: line.slice(317, 417).trim(),
                  tipoDocumento: line.slice(417, 418).trim(),
                  nroDocumento: line.slice(418, 432).trim(),
                  nroSequencial: line.slice(672, 678).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "20") {
              if (
                arp[dataHelper] &&
                arp[dataHelper].content &&
                Array.isArray(arp[dataHelper].content.content)
              ) {
                arp[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  nroProcessoAdesao: line.slice(6, 10).trim(),
                  dataAberturaProc: line.slice(10, 18).trim(),
                  nroLote: line.slice(18, 22).trim(),
                  nroItem: line.slice(22, 26).trim(),
                  dscItem: line.slice(27, 276).trim(),
                  percDesconto: line.slice(276, 289).trim(),
                  nomeVencedor: line.slice(289, 389).trim(),
                  tipoDocumento: line.slice(389, 390).trim(),
                  nroDocumento: line.slice(390, 404).trim(),
                  nroSequencial: line.slice(672, 678).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.arp`, arp, 75);

        return arp
      } catch (error) {
        console.error(
          "error from InserirArp function from /controllers/controller.arp.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    cob: async function (info) {
      const { text, data, sch } = info
      const cob = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              cob.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  codObra: line.slice(6, 10).trim(),
                  anoObra: line.slice(10, 14).trim(),
                  especificacao: line.slice(14, 114).trim(),
                  latitude: line.slice(114, 122).trim(),
                  longitude: line.slice(122, 130).trim(),
                  unidadeMedida: line.slice(130, 132).trim(),
                  quantidade: line.slice(132, 137).trim(),
                  enderecoObra: line.slice(137, 237).trim(),
                  bairroObra: line.slice(237, 257).trim(),
                  nomeFiscalObra: line.slice(257, 307).trim(),
                  cpfFiscalObra: line.slice(307, 318).trim(),
                  nroSequencial: line.slice(318, 324).trim(),
                  content: [],
                  line
                },
              });
            }
          }
        }

        await db.batchInsert(`${sch}.cob`, cob, 75);

        return cob
      } catch (error) {
        console.error(
          "error from InserirCob function from /controllers/controller.cob.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    con: async function (info) {
      const { text, data, sch } = info
      const con = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              con.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  nroContrato: line.slice(6, 26).trim(),
                  anoContrato: line.slice(26, 30).trim(),
                  tipoAjuste: line.slice(30, 31).trim(),
                  cpfCnpj: line.slice(31, 45).trim(),
                  dataFirmaturaContrato: line.slice(45, 53).trim(),
                  dataPublicacao: line.slice(53, 61).trim(),
                  dataInicio: line.slice(61, 69).trim(),
                  dataFinal: line.slice(69, 77).trim(),
                  tipoContrato: line.slice(77, 78).trim(),
                  objetoContrato: line.slice(78, 333).trim(),
                  vlContrato: line.slice(333, 346).trim(),
                  nomeCredor: line.slice(346, 396).trim(),
                  tipoPessoa: line.slice(396, 397).trim(),
                  cmodalidadeLicitacao: line.slice(397, 399).trim(),
                  fundamentacaoLegal: line.slice(399, 401).trim(),
                  justificativaDispensaInexibilidade: line.slice(401, 651).trim(),
                  razaoEscolha: line.slice(651, 896).trim(),
                  nroProcLicitacao: line.slice(896, 904).trim(),
                  anoProcLicitacao: line.slice(904, 908).trim(),
                  nroProcAdmCorrespondente: line.slice(908, 928).trim(),
                  nroInstrumentoContrato: line.slice(928, 931).trim(),
                  assunto: line.slice(931, 933).trim(),
                  nroSequencial: line.slice(933, 939).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                con[dataHelper] &&
                con[dataHelper].content &&
                Array.isArray(con[dataHelper].content.content)
              ) {
                con[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  nroContrato: line.slice(6, 26).trim(),
                  anoContrato: line.slice(26, 30).trim(),
                  tipoAjuste: line.slice(30, 31).trim(),
                  subAssunto: line.slice(31, 33).trim(),
                  codObra: line.slice(33, 37).trim(),
                  anoObra: line.slice(37, 41).trim(),
                  detalhamentoSubAssunto: line.slice(41, 241).trim(),
                  nroSequencial: line.slice(933, 939).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "21") {
              if (
                con[dataHelper] &&
                con[dataHelper].content &&
                Array.isArray(con[dataHelper].content.content)
              ) {
                con[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  nroContrato: line.slice(6, 26).trim(),
                  anoContrato: line.slice(26, 30).trim(),
                  tipoAjuste: line.slice(30, 31).trim(),
                  nroTermo: line.slice(31, 35).trim(),
                  dataFirmatura: line.slice(35, 43).trim(),
                  prazo: line.slice(43, 47).trim(),
                  nroSequencial: line.slice(933, 939).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "22") {
              if (
                con[dataHelper] &&
                con[dataHelper].content &&
                Array.isArray(con[dataHelper].content.content)
              ) {
                con[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  nroContrato: line.slice(6, 26).trim(),
                  anoContrato: line.slice(26, 30).trim(),
                  tipoAjuste: line.slice(30, 31).trim(),
                  numeroTermo: line.slice(31, 35).trim(),
                  dataLancamento: line.slice(35, 43).trim(),
                  valorAcrescimo: line.slice(43, 56).trim(),
                  valorDecrescimo: line.slice(56, 69).trim(),
                  valorContratual: line.slice(69, 82).trim(),
                  nroSequencial: line.slice(933, 939).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "23") {
              if (
                con[dataHelper] &&
                con[dataHelper].content &&
                Array.isArray(con[dataHelper].content.content)
              ) {
                con[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  nroContrato: line.slice(6, 26).trim(),
                  anoContrato: line.slice(26, 30).trim(),
                  tipoAjuste: line.slice(30, 31).trim(),
                  nroTermo: line.slice(31, 35).trim(),
                  dataRescisao: line.slice(35, 43).trim(),
                  dataCancelamento: line.slice(43, 51).trim(),
                  valorCancelamento: line.slice(51, 64).trim(),
                  valorFinalContrato: line.slice(64, 77).trim(),
                  nroSequencial: line.slice(933, 939).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.con`, con, 75);

        return con
      } catch (error) {
        console.error(
          "error from InserirCon function from /controllers/controller.con.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    ctb: async function (info) {
      const { text, data, sch } = info
      const ctb = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              ctb.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  banco: line.slice(6, 9).trim(),
                  agencia: line.slice(9, 13).trim(),
                  contaCorrente: line.slice(13, 25).trim(),
                  contaCorrenteDigVerif: line.slice(25, 26).trim(),
                  tipoConta: line.slice(26, 28).trim(),
                  saldoInicial: line.slice(28, 41).trim(),
                  vlEntradas: line.slice(41, 54).trim(),
                  vlSaidas: line.slice(54, 67).trim(),
                  saldoFinal: line.slice(67, 80).trim(),
                  nroSequencial: line.slice(90, 96).trim(),
                  codFontRecursosMSC: "nan", // FR
                  codAEO: "nan", // CO
                  content: [],
                  line,
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                ctb[dataHelper] &&
                ctb[dataHelper].content &&
                Array.isArray(ctb[dataHelper].content.content)
              ) {
                ctb[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  banco: line.slice(6, 9).trim(),
                  agencia: line.slice(9, 13).trim(),
                  contaCorrente: line.slice(13, 25).trim(),
                  contaCorrenteDigVerif: line.slice(25, 26).trim(),
                  tipoConta: line.slice(26, 28).trim(),
                  codFonteRecurso: line.slice(28, 34).trim(),
                  codFontRecursosMSC: "nan", // FR
                  codAEO: "nan", // CO
                  saldoInicial: line.slice(34, 47).trim(),
                  vlEntradas: line.slice(47, 60).trim(),
                  vlSaidas: line.slice(60, 73).trim(),
                  saldoFinal: line.slice(73, 90).trim(),
                  nroSequencial: line.slice(90, 96).trim(),
                  line,
                });
              }
            } else if (line.substring(0, 2) === "90") {
              if (
                ctb[dataHelper] &&
                ctb[dataHelper].content &&
                Array.isArray(ctb[dataHelper].content.content)
              ) {
                ctb[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  vlSaldoExercAntCaixa: line.slice(6, 19).trim(),
                  vlSaldoExercAntBanco: line.slice(19, 32).trim(),
                  vlSaldoExercAntVinculado: line.slice(32, 45).trim(),
                  contaCorrenteDigVerif: line.slice(45, 58).trim(),
                  vlSaldoMesSegCaixa: line.slice(58, 71).trim(),
                  vlSaldoMesSegBanco: line.slice(71, 84).trim(),
                  vlSaldoMesSegVinculado: line.slice(84, 90).trim(),
                  nroSequencial: line.slice(90, 96).trim(),
                  line,
                });
              }
            } else if (line.substring(0, 2) === "91") {
              if (
                ctb[dataHelper] &&
                ctb[dataHelper].content &&
                Array.isArray(ctb[dataHelper].content.content)
              ) {
                ctb[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  codFonteRecurso: line.slice(6, 12).trim(),
                  vlSaldoExercAntCaixa: line.slice(12, 25).trim(),
                  vlSaldoExercAntBanco: line.slice(25, 38).trim(),
                  vlSaldoExercAntVinculado: line.slice(38, 51).trim(),
                  vlSaldoMesSegCaixa: line.slice(51, 64).trim(),
                  vlSaldoMesSegBanco: line.slice(64, 77).trim(),
                  vlSaldoMesSegVinculado: line.slice(77, 90).trim(),
                  nroSequencial: line.slice(90, 96).trim(),
                  line,
                });
              }
            }
          }
        }

        const allOrgaos = await db(`${sch}.orgao`).select("*");
        const orgaoTypes = { ...Object.fromEntries(natureza.filterOrgaosByDate(allOrgaos.map((e) => e.content), data).map((e) => [e.codOrgao, e.tipoOrgao])) }

        ctb.forEach((ctbValue, ctbIndex) => {
          const tipo10 = ctbValue.content;

          if (orgaoTypes[tipo10.codOrgao]) {
            ctb[ctbIndex].content.tipoOrgao = orgaoTypes[tipo10.codOrgao];
          } else {
            console.error("É obrigatório que o orgão correspondente seja adicionado antes da Conta Bancária !")
            return null
          }
        });

        await db.batchInsert(`${sch}.ctb`, ctb, 75);

        return ctb
      } catch (error) {
        console.error(
          "error from InserirCtb function from /controllers/controller.ctb.js",
          error,
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    cvc: async function (info) {
      const { text, data, sch } = info
      const cvc = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              cvc.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  codVeiculo: line.slice(6, 16).trim(),
                  descVeiculo: line.slice(16, 116).trim(),
                  tpVeiculo: line.slice(116, 118).trim(),
                  subTipoVeiculo: line.slice(118, 120).trim(),
                  modelo: line.slice(120, 170).trim(),
                  ano: line.slice(170, 174).trim(),
                  placa: line.slice(174, 182).trim(),
                  chassi: line.slice(182, 212).trim(),
                  nrSerie: line.slice(212, 232).trim(),
                  situacao: line.slice(232, 234).trim(),
                  tpDeslocamento: line.slice(234, 236).trim(),
                  qtdeInicial: line.slice(236, 242).trim(),
                  qtdeFinal: line.slice(242, 248).trim(),
                  trocaHodHor: line.slice(248, 249).trim(),
                  qtdeHodHorAnt: line.slice(249, 255).trim(),
                  atestadoControle: line.slice(255, 256).trim(),
                  nroSequencial: line.slice(256, 262).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                cvc[dataHelper] &&
                cvc[dataHelper].content &&
                Array.isArray(cvc[dataHelper].content.content)
              ) {
                cvc[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  codVeiculo: line.slice(6, 16).trim(),
                  tipoGasto: line.slice(16, 18).trim(),
                  tpCombustivelLub: line.slice(18, 20).trim(),
                  origemCombustivel: line.slice(20, 21).trim(),
                  orgaoLotacao: line.slice(21, 23).trim(),
                  unidadeLotacao: line.slice(23, 25).trim(),
                  qtdeUtilizada: line.slice(25, 30).trim(),
                  nroSequencial: line.slice(256, 262).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "20") {
              if (
                cvc[dataHelper] &&
                cvc[dataHelper].content &&
                Array.isArray(cvc[dataHelper].content.content)
              ) {
                cvc[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subelementoDespesa: line.slice(25, 27).trim(),
                  nroEmpenho: line.slice(27, 33).trim(),
                  dtEmpenho: line.slice(33, 41).trim(),
                  nroSequencial: line.slice(256, 262).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.cvc`, cvc, 75);

        return cvc
      } catch (error) {
        console.error(
          "error from InserirCvc function from /controllers/controller.cvc.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    dcl: async function (info) {
      const { text, data, sch } = info
      const dcl = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              dcl.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  vlSaldoAtualConcGarantia: line.slice(6, 19).trim(),
                  recPrivatizacao: line.slice(19, 32).trim(),
                  vlLiqIncentContrib: line.slice(32, 45).trim(),
                  vlLiqIncenInstFinanc: line.slice(45, 58).trim(),
                  vlInscRPNPIcentContrib: line.slice(58, 71).trim(),
                  vlInscRPNPIncentInstFinanc: line.slice(71, 84).trim(),
                  nroSequencial: line.slice(84, 90).trim(),
                  content: [],
                  line
                },
              });
            }
          }
        }

        await db.batchInsert(`${sch}.dcl`, dcl, 75);

        return dcl
      } catch (error) {
        console.error(
          "error from InserirDcl function from /controllers/controller.dcl.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    dfr: async function (info) {
      const { text, data, sch } = info
      const dfr = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              dfr.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codDetalhamentoFR: line.slice(4, 7).trim(),
                  descricaoDetalhamentoFR: line.slice(7, 207).trim(),
                  nroSequencial: line.slice(207, 213).trim(),
                  content: [],
                  line
                },
              });
            }
          }
        }

        await db.batchInsert(`${sch}.dfr`, dfr, 75);

        return dfr
      } catch (error) {
        console.error(
          "error from InserirDfr function from /controllers/controller.dfr.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    dic: async function (info) {
      const { text, data, sch } = info
      const dic = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              dic.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  tpLancamento: line.slice(6, 8).trim(),
                  nroLeiAutorizacao: line.slice(8, 16).trim(),
                  dtLeiAutorizacao: line.slice(16, 24).trim(),
                  nomeCredor: line.slice(24, 104).trim(),
                  tipoPessoa: line.slice(104, 105).trim(),
                  cpfCnpjCredor: line.slice(105, 119).trim(),
                  vlSaldoAnterior: line.slice(119, 132).trim(),
                  vlContratacao: line.slice(132, 145).trim(),
                  vlAmortizacao: line.slice(145, 158).trim(),
                  vlCancelamento: line.slice(158, 171).trim(),
                  vlEncampacao: line.slice(171, 184).trim(),
                  vlAtualizacao: line.slice(184, 197).trim(),
                  vlSaldoAtual: line.slice(197, 210).trim(),
                  nroSequencial: line.slice(210, 216).trim(),
                  content: [],
                  line
                },
              });
            }
          }
        }

        await db.batchInsert(`${sch}.dic`, dic, 75);

        return dic
      } catch (error) {
        console.error(
          "error from InserirDic function from /controllers/controller.dic.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    dmr: async function (info) {
      const { text, data, sch } = info
      const dmr = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              dmr.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  tipo: line.slice(4, 5).trim(),
                  nroDecretoMunicipal: line.slice(5, 13).trim(),
                  dataDecretoMunicipal: line.slice(13, 21).trim(),
                  dataPublicacaoDecretoMunicipal: line.slice(21, 29).trim(),
                  nroSequencial: line.slice(29, 35).trim(),
                  content: [],
                  line
                },
              });
            }
          }
        }

        await db.batchInsert(`${sch}.dmr`, dmr, 75);

        return dmr
      } catch (error) {
        console.error(
          "error from InserirDmr function from /controllers/controller.dmr.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    dsi: async function (info) {
      const { text, data, sch } = info
      const dsi = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              dsi.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  nroProcesso: line.slice(6, 18).trim(),
                  anoExercicioProcesso: line.slice(18, 22).trim(),
                  tipoProcesso: line.slice(22, 23).trim(),
                  dtAbertura: line.slice(23, 31).trim(),
                  naturezaObjeto: line.slice(31, 32).trim(),
                  objeto: line.slice(32, 282).trim(),
                  Justificativa: line.slice(282, 532).trim(),
                  Razão: line.slice(532, 782).trim(),
                  dtPublicacaoTermoRatificacao: line.slice(782, 790).trim(),
                  veiculoPublicacao: line.slice(790, 1040).trim(),
                  nroSequencial: line.slice(1040, 1046).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                dsi[dataHelper] &&
                dsi[dataHelper].content &&
                Array.isArray(dsi[dataHelper].content.content)
              ) {
                dsi[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  nroProcesso: line.slice(6, 18).trim(),
                  anoExercicioProcesso: line.slice(18, 22).trim(),
                  tipoProcesso: line.slice(22, 23).trim(),
                  tipoResp: line.slice(23, 24).trim(),
                  nroCPFResponsavel: line.slice(24, 35).trim(),
                  nomeResp: line.slice(35, 135).trim(),
                  logradouro: line.slice(135, 185).trim(),
                  setor: line.slice(185, 205).trim(),
                  cidade: line.slice(205, 225).trim(),
                  uf: line.slice(225, 227).trim(),
                  CEP: line.slice(227, 235).trim(),
                  telefone: line.slice(235, 245).trim(),
                  email: line.slice(245, 325).trim(),
                  nroSequencial: line.slice(1040, 1046).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "12") {
              if (
                dsi[dataHelper] &&
                dsi[dataHelper].content &&
                Array.isArray(dsi[dataHelper].content.content)
              ) {
                dsi[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  nroProcesso: line.slice(6, 18).trim(),
                  anoExercicioProcesso: line.slice(18, 22).trim(),
                  tipoProcesso: line.slice(22, 23).trim(),
                  nroLote: line.slice(23, 27).trim(),
                  nroItem: line.slice(27, 31).trim(),
                  dscItem: line.slice(31, 281).trim(),
                  vlCotPrecosUnitario: line.slice(281, 294).trim(),
                  nroSequencial: line.slice(1040, 1046).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "13") {
              if (
                dsi[dataHelper] &&
                dsi[dataHelper].content &&
                Array.isArray(dsi[dataHelper].content.content)
              ) {
                dsi[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  nroProcesso: line.slice(6, 18).trim(),
                  anoExercicioProcesso: line.slice(18, 22).trim(),
                  tipoProcesso: line.slice(22, 23).trim(),
                  codFuncao: line.slice(23, 25).trim(),
                  codSubfuncao: line.slice(25, 28).trim(),
                  codPrograma: line.slice(28, 32).trim(),
                  naturezaAcao: line.slice(32, 33).trim(),
                  nroProjAtiv: line.slice(33, 36).trim(),
                  elementoDespesa: line.slice(36, 42).trim(),
                  subElemento: line.slice(42, 44).trim(),
                  codFonteRecurso: line.slice(44, 50).trim(),
                  valorRecurso: line.slice(50, 63).trim(),
                  nroSequencial: line.slice(1040, 1046).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "14") {
              if (
                dsi[dataHelper] &&
                dsi[dataHelper].content &&
                Array.isArray(dsi[dataHelper].content.content)
              ) {
                dsi[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  nroProcesso: line.slice(6, 18).trim(),
                  anoExercicioProcesso: line.slice(18, 22).trim(),
                  tipoProcesso: line.slice(22, 23).trim(),
                  tipoDocumento: line.slice(23, 24).trim(),
                  nroDocumento: line.slice(24, 38).trim(),
                  nroLote: line.slice(38, 42).trim(),
                  nroItem: line.slice(42, 46).trim(),
                  nomeRazaoSocial: line.slice(46, 146).trim(),
                  nroInscricaoEstadual: line.slice(146, 161).trim(),
                  ufInscricaoEstadual: line.slice(161, 163).trim(),
                  nroCertidaoRegularidadeINSS: line.slice(163, 183).trim(),
                  dtEmissaoCertidaoRegularidadeINSS: line.slice(183, 191).trim(),
                  dtValidadeCertidaoRegularidadeINSS: line.slice(191, 199).trim(),
                  nroCertidaoRegularidadeFGTS: line.slice(199, 229).trim(),
                  dtEmissaoCertidaoRegularidadeFGTS: line.slice(229, 237).trim(),
                  dtValidadeCertidaoRegularidadeFGTS: line.slice(237, 245).trim(),
                  dtEmissaoCNDT: line.slice(245, 260).trim(),
                  dtValidadeCNDT: line.slice(260, 268).trim(),
                  quantidade: line.slice(268, 276).trim(),
                  valorItem: line.slice(276, 289).trim(),
                  nroSequencial: line.slice(1040, 1046).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "15") {
              if (
                dsi[dataHelper] &&
                dsi[dataHelper].content &&
                Array.isArray(dsi[dataHelper].content.content)
              ) {
                dsi[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  nroProcesso: line.slice(6, 18).trim(),
                  anoExercicioProcesso: line.slice(18, 22).trim(),
                  tipoProcesso: line.slice(22, 23).trim(),
                  tipoDocumento: line.slice(23, 24).trim(),
                  nroDocumento: line.slice(24, 38).trim(),
                  dataCredenciamento: line.slice(38, 46).trim(),
                  nroLote: line.slice(46, 50).trim(),
                  nroItem: line.slice(50, 54).trim(),
                  nomeRazaoSocial: line.slice(54, 154).trim(),
                  nroInscricaoEstadual: line.slice(154, 169).trim(),
                  ufInscricaoEstadual: line.slice(169, 171).trim(),
                  nroCertidaoRegularidadeINSS: line.slice(171, 191).trim(),
                  dtEmissaoCertidaoRegularidadeINSS: line.slice(191, 199).trim(),
                  dtValidadeCertidaoRegularidadeINSS: line.slice(199, 207).trim(),
                  nroCertidaoRegularidadeFGTS: line.slice(207, 237).trim(),
                  dtEmissaoCertidaoRegularidadeFGTS: line.slice(237, 245).trim(),
                  dtValidadeCertidaoRegularidadeFGTS: line.slice(245, 253).trim(),
                  nroCNDT: line.slice(253, 268).trim(),
                  dtEmissaoCNDT: line.slice(268, 276).trim(),
                  dtValidadeCNDT: line.slice(276, 284).trim(),
                  nroSequencial: line.slice(1040, 1046).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.dsi`, dsi, 75);

        return dsi
      } catch (error) {
        console.error(
          "error from InserirEmp function from /controllers/controller.dsi.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    ecl: async function (info) {
      const { text, data, sch } = info
      const ecl = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              ecl.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  tipoCombustivelLub: line.slice(6, 8).trim(),
                  subTipoCombustívelLub: line.slice(8, 10).trim(),
                  qtdeInicial: line.slice(10, 20).trim(),
                  qtdeEntradaCompra: line.slice(20, 30).trim(),
                  qtdeEntradaDoacao: line.slice(30, 40).trim(),
                  qtdeSaidaConsumo: line.slice(40, 50).trim(),
                  qtdeSaidaDoacao: line.slice(50, 60).trim(),
                  qtdeFinal: line.slice(60, 70).trim(),
                  nroSequencial: line.slice(70, 76).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "20") {
              if (
                ecl[dataHelper] &&
                ecl[dataHelper].content &&
                Array.isArray(ecl[dataHelper].content.content)
              ) {
                ecl[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codCodFuncao: line.slice(10, 12).trim(),
                  codCodSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  SubelementoDespesa: line.slice(25, 27).trim(),
                  nroEmpenho: line.slice(27, 33).trim(),
                  dtEmpenho: line.slice(33, 41).trim(),
                  nroSequencial: line.slice(70, 76).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.ecl`, ecl, 75);

        return ecl
      } catch (error) {
        console.error(
          "error from InserirEcl function from /controllers/controller.ecl.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    emp: async function (info) {
      let { text, data, codOrgao, sch } = info;
      const emp = [];
      const orgao = (await db(`${sch}.orgao`).select("*")).filter(
        (e) =>
          e.content.dtInicio.substring(4) === String(natureza.dataToYear(data)),
      );

      const orgaoTypes = {};

      orgao.forEach((org) => {
        const content = org.content;
        orgaoTypes[content.codOrgao] = content.tipoOrgao;
      });

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              emp.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao,
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  nroEmpenho: line.slice(27, 33).trim(),
                  modalidadeLicitacao: line.slice(33, 35).trim(),
                  fundamentacaoLegal: line.slice(35, 37).trim(),
                  justificativaDispensaInexibilidade: line.slice(37, 250).trim(),
                  razaoEscolha: line.slice(250, 532).trim(),
                  nroProcLicitacao: line.slice(532, 540).trim(),
                  anoProcLicitacao: line.slice(540, 544).trim(),
                  nroProcAdmCorrespondente: line.slice(544, 564).trim(),
                  nroInstrumentoContrato: line.slice(564, 567).trim(),
                  assunto: line.slice(567, 569).trim(),
                  tpEmpenho: line.slice(569, 571).trim(),
                  dtEmpenho: line.slice(571, 579).trim(),
                  vlBruto: line.slice(579, 592).trim(),
                  nomeCredor: line.slice(592, 642).trim(),
                  tipoCredor: line.slice(642, 643).trim(),
                  cpfCnpj: line.slice(643, 657).trim(),
                  especificacaoEmpenho: line.slice(657, 912).trim(),
                  cpfRespEmpenho: line.slice(912, 923).trim(),
                  nomeRespEmpenho: line.slice(923, 958).trim(),
                  idColare: line.slice(958, 973).trim(),
                  nroSequencial: line.slice(973, 979).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                emp[dataHelper] &&
                emp[dataHelper].content &&
                Array.isArray(emp[dataHelper].content.content)
              ) {
                emp[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(), // FS (junção)
                  codSubFuncao: line.slice(12, 15).trim(), // FS (junção)
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  contaDeb: "nan", // conta pra filtrar
                  contaCred: "nan",
                  elementoDespesaMSC: "nan", // ND (junção)
                  subElementoMSC: "nan", // ND (junção)
                  nroEmpenho: line.slice(27, 33).trim(), // chave
                  codFontRecursos: line.slice(33, 39).trim(),
                  codFontRecursosMSC: "nan", // FR
                  poderOrgao: "nan", // PO
                  codAEO: "nan", // CO
                  ficha: "nan",
                  vlRecurso: line.slice(39, 52).trim(),
                  nroSequencial: line.slice(973, 979).trim(),
                  line,
                });
              }
            } else if (line.substring(0, 2) === "12") {
              if (
                emp[dataHelper] &&
                emp[dataHelper].content &&
                Array.isArray(emp[dataHelper].content.content)
              ) {
                emp[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  nroEmpenho: line.slice(27, 33).trim(),
                  codUnidadeObra: line.slice(33, 35).trim(),
                  codObra: line.slice(35, 39).trim(),
                  anoObra: line.slice(39, 43).trim(),
                  vlAssociadoObra: line.slice(43, 56).trim(),
                  nroSequencial: line.slice(973, 979).trim(),
                  line,
                });
              }
            } else if (line.substring(0, 2) === "13") {
              if (
                emp[dataHelper] &&
                emp[dataHelper].content &&
                Array.isArray(emp[dataHelper].content.content)
              ) {
                emp[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  nroEmpenho: line.slice(27, 33).trim(),
                  codUnidadeContrato: line.slice(33, 35).trim(),
                  nroContrato: line.slice(35, 55).trim(),
                  anoContrato: line.slice(55, 59).trim(),
                  tipoAjuste: line.slice(59, 60).trim(),
                  vlAssociadoContrato: line.slice(60, 73).trim(),
                  idColare: line.slice(73, 88).trim(),
                  nroSequencial: line.slice(973, 979).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "14") {
              if (
                emp[dataHelper] &&
                emp[dataHelper].content &&
                Array.isArray(emp[dataHelper].content.content)
              ) {
                emp[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  nroEmpenho: line.slice(27, 33).trim(),
                  cpfCnpjCredor: line.slice(33, 47).trim(),
                  tipoCredor: line.slice(47, 48).trim(),
                  nomeCredor: line.slice(48, 98).trim(),
                  vlAssociadoCredor: line.slice(98, 111).trim(),
                  nroSequencial: line.slice(973, 979).trim(),
                  line,
                });
              }
            }
          }
        }
        text = "";

        const lnc = (await db(`${sch}.lnc`).select("*")).filter(
          (e) => e.data === data && e.content.codOrgao === codOrgao,
        );

        const empElementoLNC = {
          // elemento e sub TCM, contadeb, contacred, elemento e sub STN
          // CONTRATAÇÃO POR TEMPO DETERMINADO
          31900400: [
            "311210401-211110101-31900401",
            "311210414-211110101-31900414",
          ],
          // PESSOAL(RECURSOS: MÍNIMO DE 60% FUNDEB)
          31901101: [
            "311110101-211110101-31901101",
            "311110101-211110101-31901137",
            "311110101-211110101-31901150",
            "311110103-211110101-31901105",
            "311110103-211110101-31901145",
            "311110104-211110101-31901107",
            "311110108-211110101-31901101",
            "311110108-211110101-31901113",
            "311110114-211110101-31901131",
            "311110114-211110101-31901133",
            "311110114-211110103-31901145",
            "311110116-211110101-31901133",
            "311110118-211110101-31901131",
            "311110118-211110101-31901137",
            "311110122-211110102-31901143",
            "311110124-211110103-31901145",
            "311110133-211110101-31901150",
            "311110199-211110101-31901199",
            "311110199-211110101-31901151",
            "311110199-211110103-31901151",
          ],
          // PESSOAL CARGO EFETIVO (VINCULADO AO RPPS), EXCLUSIVE FUNDEB
          31901103: [
            "311110101-211110101-31901101",
            "311110102-211110101-31901101",
            "311110102-211110101-31901104",
            "311110104-211110101-31901107",
            "311110105-211110101-31901109",
            "311110106-211110101-31901101",
            "311110106-211110101-31901110",
            "311110108-211110101-31901101",
            "311110108-211110101-31901113",
            "311110112-211110101-31901101",
            "311110112-211110101-31901104",
            "311110114-211110101-31901131",
            "311110114-211110101-31901133",
            "311110116-211110101-31901101",
            "311110116-211110101-31901133",
            "311110118-211110101-31901101",
            "311110118-211110101-31901131",
            "311110118-211110101-31901137",
            "311110121-211110102-31901142",
            "311210121-211110103-31901142",
            "311110121-211110103-31901101",
            "311110122-211110101-31901101",
            "311110122-211110101-31901143",
            "311210122-211110102-31901143",
            "311110124-211110101-31901145",
            "311110124-211110103-31901145",
            "311110131-211110101-31901174",
            "311210131-211110101-31901175",
            "311110132-211110101-31901101",
            "311110132-211110101-31901133",
            "311110199-211110101-31901151",
            "311110199-211110101-31901152",
          ],
          // PESSOAL CARGO COMISSIONADO, EXCLUSIVE FUNDEB
          31901105: [
            "311110101-211110101-31901101",
            "311210101-211110101-31901101",
            "311210121-211110103-31901101",
            "311210121-211110103-31901142",
            "311210124-211110103-31901145",
            "311110133-211110101-31901150",
            "311210133-211110101-31901150",
          ],
          31901107: [
            "311110131-211110101-31901175",
            "311210131-211110101-31901175",
          ],
          // SUBSÍDIO VICE-PREFEITO
          31901108: ["311210131-211110101-31901175"],
          // SUBSÍDIO SECRETÁRIO MUNICIPAL
          31901109: [
            "311110101-211110101-31901175",
            "311210101-211110101-31901101",
            "311110114-211110101-31901133",
            "311110122-211110102-31901143",
            "311110124-211110103-31901145",
            "311210124-211110103-31901145",
            "311210131-211110101-31901175",
          ],
          // SALÁRIO MATERNIDADE
          31901150: ["329111100-211110101-31901150"],
          // LICENÇA SAÚDE
          31901152: [
            "311110199-211110101-31901152",
            "311210199-211110101-31901152",
          ],
          // OUTRAS DESPESAS FIXAS - PESSOAL CIVIL
          31901199: [
            "311110109-211110101-31901177",
            "311110124-211110103-31901145",
            "311110133-211110101-31901150",
            "311210131-211110101-31901175",
            "311110199-211110101-31901177",
            "311110199-211110101-31901199",
            "311210199-211110101-31901199",
          ],
          // CONTRIBUIÇÃO PATRONAL PARA O INSS
          31901302: ["312230100-211430101-31901302"],
          // CONTRATO POR TEMPO DETERMINADO
          31901307: ["311210299-211110101-31901307"],
          // ENCARGOS DE PESSOAL REQUISIT. DE OUTROS ENTES
          31901399: ["312230400-211459800-31901340"],
          // OUTRAS DESPESAS VARIÁVEIS – PESSOAL CIVIL
          31901600: ["311210299-211110101-31901699"],
          // INDENIZAÇÕES E RESTITUIÇÕES TRABALHISTAS
          31909401: ["319110000-218910101-31909401"],
          // OBRIGAÇÕES PATRONAIS INTRA-ORÇAMENTÁRIA
          31911302: [
            "312129900-218959800-31911302",
            "312129900-218959800-31911308",
          ],
          // CONTRIBUICAO DE SALARIO-EDUCACAO
          31911304: [
            "312129900-218959800-31911302",
            "312129900-218959800-31911308",
          ],
          // OUTRAS OBRIGACOES PATRONAIS
          31911399: [
            "312129900-218959800-31911308",
            "312129900-218959800-31911399",
          ],
          // ENCARGOS DE PESSOAL REQUISIT. DE OUTROS ENTES
          31901399: ["312230400-211459800-31901340"],
          // OUTROS BENEFÍCIOS ASSISTENCIAIS DO SERVIDOR OU DO MILITAR
          33900856: ["329111201-213110101-33900856"],
          // DIÁRIAS - CIVIL
          33901400: ["332110100-218910200-33901400"],
          // AUXÍLIO FINANCEIRO A ESTUDANTE
          33901800: ["394110100-211310100-33901800"],
          // AUXÍLIO-FARDAMENTO
          33901900: ["394910000-211310100-33901900"],
          // COMBUSTÍVEIS E LUBRIFICANTES AUTOMOTIVOS
          33903001: [
            "115610100-331110100-33903001",
            "115619900-331110100-33903001",
          ],
          // COMBUSTÍVEIS E LUBRIFICANTES PARA OUTRAS FINALIDADES / MAS é MATERIAL HOSPITALAR
          33903003: ["115610500-331113600-33903036"],
          // GÁS ENGARRAFADO
          33903004: [
            "115619900-331110300-33903011", // MATERIAL QUIMICO STN
            "115610100-331110300-33903099", // OUTROS - ALMOXARIFADO
          ],
          // GÊNEROS DE ALIMENTAÇÃO
          33903007: [
            "115610100-331110600-33903007",
            "115610200-331110600-33903007",
          ],
          // MATERIAL FARMACOLÓGICO / MEDICAMENTOS PARA USO EM UNIDADE DE SAÚDE
          33903009: ["115610500-331110800-33903009"],
          // MATERIAL ODONTOLÓGICO
          33903010: ["115610500-331110900-33903010"],
          // MATERIAL QUÍMICO
          33903011: ["115619900-331111000-33903011"],
          // MATERIAL EDUCATIVO E ESPORTIVO
          33903014: [
            "115610100-331111400-33903014",
            "115619900-331111400-33903014",
          ],
          // MATERIAL PARA FESTIVIDADES E HOMENAGENS
          33903015: ["115619900-331111500-33903099"],
          // MATERIAL DE EXPEDIENTE
          33903016: [
            "115610100-331111600-33903016",
            "115610700-331111600-33903016",
            "115610700-331111600-33903099",
          ],
          // MATERIAL DE PROCESSAMENTO DE DADOS
          33903017: ["115610100-331111700-33903017"],
          // MATERIAL DE ACONDICIONAMENTO E EMBALAGEM
          33903019: ["115610100-331111900-33903099"],
          // MATERIAL DE CAMA, MESA E BANHO
          33903020: [
            "115610100-331111200-33903020",
            "115610100-331111200-33903099",
          ],
          // MATERIAL DE COPA E COZINHA
          33903021: [
            "115610100-331112100-33903099",
            "115610700-331112100-33903020",
            "115619900-331112100-33903020",
            "115619900-331112100-33903099",
          ],
          // MATERIAL DE LIMPEZA E PRODUÇÃO DE HIGIENIZAÇÃO
          33903022: [
            "115610100-331112200-33903021",
            "115610600-331112200-33903021",
            "115610700-331112200-33903021",
            "115619900-331112200-33903021",
          ],
          // UNIFORMES, TECIDOS E AVIAMENTOS
          33903023: [
            "115610100-331112300-33903099",
            "115610700-331112300-33903023",
            "115619900-331112300-33903099",
          ],
          // MATERIAL PARA MANUTENÇÃO DE BENS IMÓVEIS
          33903024: [
            "115610100-331112400-33903099",
            "115610100-331112400-33903099",
            "115610101-331112400-33903099",
            "115610300-331112400-33903099",
          ],
          // MATERIAL PARA MANUTENÇÃO DE BENS MÓVEIS
          33903025: [
            "115610100-331112500-33903099",
            "115619900-331112500-33903099",
          ],
          // MATERIAL ELÉTRICO E ELETRÔNICO
          33903026: [
            "115610100-331112600-33903099",
            "115610300-331112600-33903099",
            "115610700-331112600-33903099",
            "115619900-331112600-33903099",
          ],
          // MATERIAL DE PROTEÇÃO E SEGURANÇA
          33903028: [
            "115610100-331112800-33903028",
            "115619900-331112800-33903028",
            "115619900-331112800-33903099",
          ],
          // MATERIAL PARA ÁUDIO, VÍDEO E FOTO
          33903029: [
            "115610100-331112900-33903099",
            "115610700-331112900-33903016",
          ],
          // SEMENTES, MUDAS DE PLANTAS E INSUMOS
          33903031: [
            "115610100-331113100-33903007",
            "115610100-331113100-33903099",
          ],
          // OUTROS MATERIAIS DE DISTRIBUICAO GRATUITA
          33903300: ["332315600-213110101-33903300"],
          // MATERIAL HOSPITALAR
          33903036: ["115610500-331113600-33903036"],
          // MATERIAL PARA MANUTENÇÃO DE VEÍCULOS
          33903039: [
            "115610400-331113900-33903039",
            "115619900-331113900-33903039",
          ],
          // FERRAMENTAS
          33903042: ["115619900-331114200-33903039"],
          // MATERIAL DE SINALIZAÇÃO VISUAL E AFINS
          33903044: ["115610100-331114400-33903099"],
          // BANDEIRAS, FLÂMULAS E INSÍGNIAS
          33903050: ["115610300-331115000-33903099"],
          // OUTROS MATERIAIS DE CONSUMO
          33903099: ["115610100-331119900-33903099"],
          // Premiações Culturais, Artísticas, Científicas, Desportivas e
          33903100: ["391110000-213110101-33903100"],
          // Passagens e Despesas com Locomoção
          33903300: ["332315600-213110101-33903300"],
          // Outras Despesas de Pessoal decorrentes de Contratos de TerceL
          33903401: ["332410000-213110101-33903400"],
          // ASSESSORIA CONTÁBIL
          33903402: ["332410000-213110101-33903400"],
          // OUTROS SERVIÇOS DE TERCEIROS – PESSOA FÍSICA
          33903615: ["332212100-213110101-33903699"],
          // JETONS E GRATIFICACOES A CONSELHEIROS
          33903645: ["332213100-213110101-33903645"],
          // OUTROS SERVICOS
          33903699: ["332219900-213110101-33903699"],
          // ASSINATURAS DE PERIÓDICOS E ANUIDADES
          33903901: ["332311400-213110101-33903999"],
          // SERVIÇOS TÉCNICOS PROFISSIONAIS
          33903905: ["332315100-213110101-33903999"],
          // LOCAÇÃO DE IMÓVEIS
          33903910: ["332311000-213110101-33903999"],
          // LOCAÇÃO DE MÁQUINAS E EQUIPAMENTOS
          33903912: ["332311000-213110101-33903999"],
          // LOCAÇÃO DE BENS MÓVEIS E OUTRAS NATUREZAS E INTANGÍVEIS
          33903914: ["332311000-213110101-33903999"],
          // MANUTENÇÃO E CONSERVAÇÃO DE BENS IMÓVEIS
          33903916: ["332310600-213110101-33903999"],
          // MANUTENÇÃO E CONSERVAÇÃO DE MÁQUINAS E EQUIPAMENTOS
          33903917: ["332310600-213110101-33903917"],
          // MANUTENÇÃO E CONSERVAÇÃO DE VEÍCULOS
          33903919: [
            "332310600-213110101-33903917",
            "332310600-213110101-33903999",
          ],
          // MANUTENÇÃO E CONSERVAÇÃO DE BENS MÓVEIS DE OUTRAS NATUREZAS
          33903920: ["332310600-213110101-33903999"],
          // MANUTENCAO E CONSERV. DE ESTRADAS E VIAS
          33903921: ["332310600-213110101-33903999"],
          // EXPOSIÇÕES, CONGRESSOS E CONFERÊNCIAS - TCM
          33903922: ["332312200-213110101-33903999"],
          // FESTIVIDADES E HOMENAGENS - TCM
          33903923: ["332312300-213110101-33903999"],
          // FORNECIMENTO DE ALIMENTAÇÃO -TCM
          33903941: ["332310900-213110101-33903999"],
          // SERVIÇOS DE ENERGIA ELÉTRICA
          33903943: ["332310800-213110101-33903943"],
          // SERVIÇOS DE ÁGUA E ESGOTO
          33903944: ["332310800-213110101-33903944"],
          // SERVIÇOS DE COMUNICAÇÃO EM GERAL
          33903947: ["332310400-213110101-33903947"],
          // SERVIÇO DE SELEÇÃO E TREINAMENTO
          33903948: ["332310300-213110101-33903999"],
          // SERVIÇO MÉDICO-HOSPITALAR, ODONTOLÓGICO E LABORATORIAL
          33903950: ["332313100-213110101-33903950"],
          // SERVIÇOS DE ANÁLISES E PESQUISAS CIENTÍFICAS
          33903951: ["332313300-213110101-33903999"],
          // SERVIÇOS DE ASSISTÊNCIA SOCIAL
          33903953: ["332313500-2131110101-33903953"],
          // SERVIÇOS DE TELECOMUNICAÇÕES, NÃO INTEGRANTES DE PACOTES DE
          33903958: ["332319900-213110101-33903999"],
          // SERVIÇOS DE SOCORRO E SALVAMENTO
          33903961: ["332319900-213110101-33903999"],
          // SERVIÇOS GRÁFICOS - TCM
          33903963: ["332314600-213110101-33903999"],
          // SERVIÇOS DE APOIO AO ENSINO
          33903965: ["332313400-213110101-33903965"],
          // SERVIÇOS JUDICIÁRIOS
          33903966: ["332314700-213110101-33903999"],
          // SEGUROS EM GERAL
          33903969: ["332312900-213110101-33903999"],
          // CONFECÇÃO DE UNIFORMES, BANDEIRAS E FLÂMULAS
          33903970: ["332312000-213110101-33903999"],
          // CONFECÇÃO DE MATERIAL DE ACONDICIONAMENTO E EMBALAGEM
          33903971: ["332311900-213110102-33903999"],
          // FRETES E TRANSPORTES DE ENCOMENDAS
          33903974: ["332311200-213110101-33903999"],
          // VIGILÂNCIA OSTENSIVA
          33903977: ["332315400-2131110101-33903977"],
          // LIMPEZA E CONSERVAÇÃO
          33903978: ["332315400-213110101-33903978"],
          // SERVIÇO DE APOIO ADMINISTRATIVO, TÉCNICO E OPERACIONAL
          33903979: ["332310700-213110101-33903999"],
          // SERVIÇOS BANCÁRIOS
          33903981: ["332313200-213110101-33903999"],
          // SERVIÇOS DE PUBLICIDADE E PROPAGANDA
          33903988: ["332310500-213110101-33903990"],
          // OUTROS SERVIÇOS DE TERCEIROS PJ- PAGTO ANTECIPADO
          33903996: ["332319900-213110101-33903999"],
          // OUTROS SERVIÇOS DE TERCEIROS, PESSOA JURÍDICA
          33903999: ["332319900-213110101-33903999"],
          // AUXÍLIO-ALIMENTAÇÃO
          33904600: ["332212200-213110301-33904600"],
          // LOCAÇÃO DE EQUIPAMENTOS DE TIC
          33904001: ["332311100-213110101-33904099"],
          // MANUTENÇÃO E CONSERVAÇÃO DE EQUIPAMENTOS DE TIC
          33904002: ["332311100-213110101-33904012"],
          // AQUISIÇÃO DE SOFTWARE
          33904003: ["332311100-213110101-33904099"],
          // LOCAÇÃO DE SOFTWARE
          33904004: ["332311100-213110101-33904006"],
          // SERVIÇOS DE COMUNICAÇÃO DE DADOS
          33904007: ["332311100-213110101-33904099"],
          // SERVIÇOS DE TELEFONIA INTEGRANTES DE PACOTES DE COMUNICAÇÃO
          33904008: ["332311100-213110101-33904014"],
          // SUPORTE A USUÁRIOS DE TIC
          33904009: ["332311100-213110101-33904099"],
          // SERVIÇOS TÉCNICOS PROFISSIONAIS DE TIC
          33904011: ["332311100-213110101-33904099"],
          // SERVIÇOS RELACIONADOS A COMPUTAÇÃO EM NUVEM
          33904014: ["332311100-213110101-33904099"],
          // OUTROS SERVIÇOS DE TIC
          33904018: ["332311100-213110101-33904099"],
          // CONTRIBUIÇÕES
          33904100: ["372919900-213110101-33904100"],
          // SUBVENÇÕES ECONÔMICAS
          33904500: ["395119900-218911200-33904500"],
          // AUXÍLIO-ALIMENTAÇÃO
          33904600: ["332212200-213110301-33904600"],
          // OBRIGAÇÕES TRIBUTÁRIAS E CONTRIBUTIVAS
          33904700: ["372919900-213110301-33904700"],
          // AUXÍLIO-TRANSPORTE
          33904900: ["332311200-213110301-33904900"],
          // OBRIGAÇÕES TRIBUTÁRIAS E CONTRIBUTIVAS
          33904700: ["372919900-213110301-33904700"],
          // SENTENÇAS JUDICIAIS DE PEQUENO VALOR
          33909100: ["213110900-213110900-33909105"],
          // INDENIZAÇÕES E RESTITUIÇÕES
          33909300: ["399610000-218910102-33909399"],
          // RESSARCIMENTO DE DESPESAS DE PESSOAL REQUISITADO
          33909600: ["311110213-211110101-33909600"],
          // APORTE PARA COBERTURA DO DÉFICIT ATUARIAL DO RPPS
          33919700: ["351320202-211429900-33919700"],
          // OBRAS EM ANDAMENTO
          44905100: ["123210700-213110101-44905191"],
          // OUTRAS OBRAS E INSTALACOES
          44905100: ["123210601-213110101-44905199"],
          // APARELHOS E EQUIPAMENTOS DE COMUNICAÇÃO
          44905206: ["123110102-213110101-44905299"],
          // APARELHOS E EQUIPAMENTOS PARA ESPORTES E DIVERSÕES
          44905210: ["123110104-213110101-44905299"],
          // APARELHOS E UTENSÍLIOS DOMÉSTICOS
          44905212: ["123110301-213110101-44905242"],
          // EQUIPAMENTO DE PROTEÇÃO, SEGURANÇA E SOCORRO
          44905224: ["123110105-213110101-44905299"],
          // INSTRUMENTOS MUSICAIS E ARTÍSTICOS
          44905226: ["123110404-213110101-44905299"],
          // EQUIPAMENTOS PARA ÁUDIO, VÍDEO E FOTO
          44905233: ["123110405-213110101-44905299"],
          // MÁQUINAS, UTENSÍLIOS E EQUIPAMENTOS DIVERSOS
          44905234: ["123110199-213110101-44905299"],
          // EQUIPAMENTOS DE PROCESSAMENTO DE DADOS
          44905235: ["123110201-213110101-44905299"],
          // MÁQUINAS, INSTALAÇÕES E UTENSÍLIOS DE ESCRITÓRIO
          44905236: ["123110302-213110101-44905299"],
          // MÁQUINAS, FERRAMENTAS E UTENSÍLIOS DE OFICINA
          44905238: ["123110109-213110101-44905299"],
          // EQUIPAMENTOS E UTENSÍLIOS HIDRÁULICOS E ELÉTRICOS
          44905239: ["123110121-213110101-44905299"],
          // MÁQUINAS E EQUIPAMENTOS AGRÍCOLAS E RODOVIÁRIOS
          44905240: ["123110120-213110101-44905299"],
          // MOBILIÁRIO EM GERAL
          44905242: ["123110303-213110101-44905242"],
          // OUTROS MATERIAIS PERMANENTES
          44905299: ["123119999-213110101-44905299"],
          // INDENIZAÇÕES E RESTITUIÇÕES
          44909300: ["399610000-218910102-44909300"],
          // AUXÍLIOS
          45704200: ["354110000-218911300-45704200"],
          // Principal da Dívida por Contrato - Interna
          46907101: ["222110298-212110201-46907199"],
        };

        const checkedTipo11 = {};
        emp.forEach((empValue, empIndex) => {
          const tipo10 = empValue.content;
          tipo10.content.forEach((tipo11, tipo11Index) => {
            if (tipo11.tipoRegistro === "11") {
              const element = tipo11.elementoDespesa + tipo11.subElemento;

              const tipoUsando = empElementoLNC[element];
              if (!tipoUsando) return;
              const tipoUsando_array = tipoUsando;
              const tipoUsando_possivel = tipoUsando_array.map(
                (e) => e.split("-")[0],
              );

              const lncFiltered = natureza
                .filtrarPerm(
                  natureza.filtrarSubPerm(
                    lnc,
                    "11",
                    "codConta",
                    tipoUsando_possivel,
                  ),
                  "natLancamento",
                  ["D"],
                )
                .filter((e) => {
                  return (
                    e.content.valor.replace(/0*/, "") ===
                    tipo11.vlRecurso.replace(/0*/, "")
                  );
                });

              if (lncFiltered.length !== 0) {
                const lncChosen = lncFiltered[0];
                const tipoChosen = tipoUsando_array
                  .filter(
                    (e) =>
                      lncChosen.content.codConta.substring(0, 9) ===
                      e.substring(0, 9),
                  )[0]
                  .split("-");

                const newValues = {
                  contaDeb: tipoChosen[0],
                  contaCred: tipoChosen[1],
                  elementoDespesaMSC: tipoChosen[2].substring(0, 6),
                  subElementoMSC: tipoChosen[2].substring(6),
                };

                checkedTipo11[element] = newValues;

                emp[empIndex].content.content[tipo11Index] = {
                  ...emp[empIndex].content.content[tipo11Index],
                  ...newValues,
                };
              }
            }
          });
        });
        emp.forEach((empValue, empIndex) => {
          const tipo10 = empValue.content;
          tipo10.content.forEach((tipo11, tipo11Index) => {
            if (tipo11.tipoRegistro === "11") {
              if (
                ![
                  tipo11.contaDeb,
                  tipo11.contaCred,
                  tipo11.elementoDespesaMSC,
                  tipo11.subElementoMSC,
                ].includes("nan")
              )
                return;
              const lnc11 = natureza
                .filtrarSubPerm(lnc, "11", "tipoArquivoSicom", ["06"])
                .filter((e) => {
                  return (
                    e.content.chaveArquivo.substring(114, 122) ===
                    tipo11.elementoDespesa + tipo11.subElemento &&
                    e.content.chaveArquivo.substring(122, 128) ===
                    tipo11.nroEmpenho &&
                    e.content.natLancamento === "D" &&
                    tipo10.dtEmpenho === e.content.chaveArquivo.substring(128, 136)
                  );
                });

              if (lnc11.length === 0) return;

              const lncChosen = lnc11[lnc11.length - 1];

              const element = tipo11.elementoDespesa + tipo11.subElemento;

              const tipoUsando = empElementoLNC[element];
              if (!tipoUsando) return;

              const tipoChosen = tipoUsando
                .filter(
                  (e) =>
                    lncChosen.content.codConta.substring(0, 9) ===
                    e.substring(0, 9),
                )[0]
                ?.split("-");

              if (!tipoChosen) return;

              const newValues = {
                contaDeb: tipoChosen[0],
                contaCred: tipoChosen[1],
                elementoDespesaMSC: tipoChosen[2].substring(0, 6),
                subElementoMSC: tipoChosen[2].substring(6),
              };

              checkedTipo11[element] = newValues;

              emp[empIndex].content.content[tipo11Index] = {
                ...emp[empIndex].content.content[tipo11Index],
                ...newValues,
              };

              // console.log(newValues);

              // console.log(lnc11.length);
              // console.log(lnc11[0]?.content.chaveArquivo.substring(114, 122));
              // console.log(tipo11.elementoDespesa + tipo11.subElemento);
              // console.log(lnc11[0]?.content.chaveArquivo.substring(122, 128));
              // console.log(tipo11.nroEmpenho);
              // console.log(lnc11[0]?.content.chaveArquivo.substring(128, 136));
              // console.log(tipo10.dtEmpenho);
              // console.log("--------------------------");
            }
          });
        });
        emp.forEach((empValue, empIndex) => {
          const tipo10 = empValue.content;
          tipo10.content.forEach((tipo11, tipo11Index) => {
            if (tipo11.tipoRegistro !== "11") return;
            const element =
              "FR MSC" +
              " " +
              tipo11.codFontRecursosMSC +
              " " +
              tipo11.elementoDespesa +
              "-" +
              tipo11.subElemento +
              "  " +
              tipo11.codAEO +
              " " +
              tipo11.nroEmpenho;
            //const element = tipo11.elementoDespesa + "-" + tipo11.subElemento;
            // console.log(element);
            if (checkedTipo11[element] == false) return;
            emp[empIndex].content.content[tipo11Index] = {
              ...emp[empIndex].content.content[tipo11Index],
              ...checkedTipo11[element],
            };
            // console.log(checkedTipo11[element]);
            // console.log(emp[empIndex].content.content[tipo11Index]);
          });
        });
        // console.log(checkedTipo11);
        const getDspOMapKey = (e) => {
          return [
            e.codPrograma,
            e.codOrgao,
            e.codUnidade,
            e.codFuncao,
            e.codSubFuncao,
            e.naturezaAcao,
            e.codNaturezaDaDespesa || e.elementoDespesa,
            e.codFontRecursos.substring(0, 3),
          ].join("|");
        };
        /*
        const dspO = await db(`${sch}.dspO`)
          .select("*")
          .where({ data: natureza.dataToYear(data) });
        const dspOMap = new Map(
          dspO
            .flatMap((e) => e.content.content)
            .filter((e) => e.tipoRegistro === "11")
            .map((e) => [
              getDspOMapKey(e),
              {
                codFontRecursosMSC: e.codFontRecursosMSC,
                codAEO: e.codAEO,
                ficha: e.ficha,
              },
            ]),
        );
    
        emp.forEach((e, index) => {
          e.content.content.forEach((e, i) => {
            if (e.tipoRegistro !== "11") return;
            const g = dspOMap.get(getDspOMapKey(e));
            if (!g) {
              console.log("g not found for:", getDspOMapKey(e));
              return;
            }
            emp[index].content.content[i] = {
              ...e,
              ...g,
            };
          });
        });*/

        const output = codFR.addValuesToEmp(emp)
        const returning = await db.batchInsert(`${sch}.emp`, output, 75);
        return returning
      } catch (error) {
        console.error(
          "error from InserirEmp function from /controllers/controller.emp.js",
          error,
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    eoc: async function (info) {
      const { text, data, sch } = info
      const eoc = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              eoc.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  nroEmpenho: line.slice(27, 33).trim(),
                  nroSequencial: line.slice(71, 77).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                eoc[dataHelper] &&
                eoc[dataHelper].content &&
                Array.isArray(eoc[dataHelper].content.content)
              ) {
                eoc[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  nroEmpenho: line.slice(27, 33).trim(),
                  codUnidadeObra: line.slice(33, 35).trim(),
                  codObra: line.slice(35, 39).trim(),
                  anoObra: line.slice(39, 43).trim(),
                  vlAssociadoObra: line.slice(43, 56).trim(),
                  nroSequencial: line.slice(71, 77).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "12") {
              if (
                eoc[dataHelper] &&
                eoc[dataHelper].content &&
                Array.isArray(eoc[dataHelper].content.content)
              ) {
                eoc[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  nroEmpenho: line.slice(27, 33).trim(),
                  codUnidadeContrato: line.slice(33, 35).trim(),
                  nroContrato: line.slice(35, 55).trim(),
                  anoContrato: line.slice(55, 59).trim(),
                  tipoAjuste: line.slice(59, 60).trim(),
                  vlAssociadoContrato: line.slice(60, 71).trim(),
                  nroSequencial: line.slice(71, 77).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.eoc`, eoc, 75);

        return eoc
      } catch (error) {
        console.error(
          "error from InserirEoc function from /controllers/controller.eoc.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    ext: async function (info) {
      const { text, data, sch } = info
      const ext = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              ext.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  Categoria: line.slice(6, 7).trim(),
                  tipoLancamento: line.slice(7, 9).trim(),
                  subTipo: line.slice(9, 12).trim(),
                  desdobraSubTipo: line.slice(12, 15).trim(),
                  nrExtraOrcamentaria: line.slice(15, 21).trim(),
                  descExtraOrc: line.slice(21, 71).trim(),
                  vlLancamento: line.slice(71, 84).trim(),
                  nroSequencial: line.slice(84, 90).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                ext[dataHelper] &&
                ext[dataHelper].content &&
                Array.isArray(ext[dataHelper].content.content)
              ) {
                ext[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  Categoria: line.slice(6, 7).trim(),
                  tipoLancamento: line.slice(7, 9).trim(),
                  subTipo: line.slice(9, 12).trim(),
                  desdobraSubTipo: line.slice(12, 15).trim(),
                  nrExtraOrcamentaria: line.slice(15, 21).trim(),
                  codUnidadeFinanceira: line.slice(21, 23).trim(),
                  banco: line.slice(23, 26).trim(),
                  agencia: line.slice(26, 30).trim(),
                  contaCorrente: line.slice(30, 42).trim(),
                  contaCorrenteDigVerif: line.slice(42, 43).trim(),
                  tipoConta: line.slice(43, 45).trim(),
                  vlMovimentacao: line.slice(45, 58).trim(),
                  nroSequencial: line.slice(84, 90).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "12") {
              if (
                ext[dataHelper] &&
                ext[dataHelper].content &&
                Array.isArray(ext[dataHelper].content.content)
              ) {
                ext[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  Categoria: line.slice(6, 7).trim(),
                  tipoLancamento: line.slice(7, 9).trim(),
                  subTipo: line.slice(9, 12).trim(),
                  desdobraSubTipo: line.slice(12, 15).trim(),
                  nrExtraOrcamentaria: line.slice(15, 21).trim(),
                  codUnidadeFinanceira: line.slice(21, 23).trim(),
                  banco: line.slice(23, 26).trim(),
                  agencia: line.slice(26, 30).trim(),
                  contaCorrente: line.slice(30, 42).trim(),
                  contaCorrenteDigVerif: line.slice(42, 43).trim(),
                  tipoConta: line.slice(43, 45).trim(),
                  codFonteRecurso: line.slice(45, 51).trim(),
                  vlFR: line.slice(51, 64).trim(),
                  nroSequencial: line.slice(84, 90).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.ext`, ext, 75);

        return ext
      } catch (error) {
        console.error(
          "error from InserirExt function from /controllers/controller.ext.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    hbl: async function (info) {
      const { text, data, sch } = info
      const hbl = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              hbl.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  exercicioLicitacao: line.slice(6, 10).trim(),
                  nroProcessoLicitatorio: line.slice(10, 22).trim(),
                  tipoDocumento: line.slice(22, 23).trim(),
                  nroDocumento: line.slice(23, 37).trim(),
                  nomeRazaoSocial: line.slice(37, 137).trim(),
                  objetoSocial: line.slice(137, 637).trim(),
                  orgaoRespRegistro: line.slice(637, 737).trim(),
                  dataRegistro: line.slice(738, 745).trim(),
                  nroRegistro: line.slice(745, 760).trim(),
                  dataRegistroCVM: line.slice(760, 768).trim(),
                  nroRegistroCVM: line.slice(768, 783).trim(),
                  nroInscricaoEstadual: line.slice(783, 798).trim(),
                  ufInscricaoEstadual: line.slice(798, 800).trim(),
                  nroCertidaoRegularidadeINSS: line.slice(800, 820).trim(),
                  dtEmissaoCertidaoRegularidadeINSS: line.slice(820, 828).trim(),
                  dtValidadeCertidaoRegularidadeINSS: line.slice(828, 836).trim(),
                  nroCertidaoRegularidadeFGTS: line.slice(836, 866).trim(),
                  dtEmissaoCertidaoRegularidadeFGTS: line.slice(866, 874).trim(),
                  dtValidadeCertidaoRegularidadeFGTS: line.slice(874, 882).trim(),
                  nroCNDT: line.slice(882, 897).trim(),
                  dtEmissaoCNDT: line.slice(897, 905).trim(),
                  dtValidadeCNDT: line.slice(905, 913).trim(),
                  dtHabilitacao: line.slice(913, 921).trim(),
                  AtaPresençaLicitantes: line.slice(921, 922).trim(),
                  renunciaRecurso: line.slice(922, 923).trim(),
                  nroSequencial: line.slice(923, 929).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                hbl[dataHelper] &&
                hbl[dataHelper].content &&
                Array.isArray(hbl[dataHelper].content.content)
              ) {
                hbl[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  exercicioLicitacao: line.slice(6, 10).trim(),
                  nroProcessoLicitatorio: line.slice(10, 22).trim(),
                  nroCNPJ: line.slice(22, 36).trim(),
                  tipoDocumentoSocio: line.slice(36, 37).trim(),
                  nroDocumentoSocio: line.slice(37, 51).trim(),
                  tipoParticipacao: line.slice(51, 52).trim(),
                  nomeSocio: line.slice(52, 152).trim(),
                  nroSequencial: line.slice(923, 929).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "20") {
              if (
                hbl[dataHelper] &&
                hbl[dataHelper].content &&
                Array.isArray(hbl[dataHelper].content.content)
              ) {
                hbl[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  exercicioLicitacao: line.slice(6, 10).trim(),
                  nroProcessoLicitatorio: line.slice(10, 22).trim(),
                  tipoDocumentoSocio: line.slice(22, 23).trim(),
                  nroDocumentoSocio: line.slice(23, 37).trim(),
                  dataCredenciamento: line.slice(37, 45).trim(),
                  nroLote: line.slice(45, 49).trim(),
                  nroItem: line.slice(49, 53).trim(),
                  nomRazaoSocial: line.slice(53, 153).trim(),
                  nroInscricaoEstadual: line.slice(153, 168).trim(),
                  ufInscricaoEstadual: line.slice(168, 170).trim(),
                  nroCertidaoRegularidadeINSS: line.slice(170, 190).trim(),
                  dtEmissaoCertidaoRegularidadeINSS: line.slice(190, 198).trim(),
                  dtValidadeCertidaoRegularidadeINSS: line.slice(198, 206).trim(),
                  nroCertidaoRegularidadeFGTS: line.slice(206, 236).trim(),
                  dtEmissaoCertidaoRegularidadeFGTS: line.slice(236, 244).trim(),
                  dtValidadeCertidaoRegularidadeFGTS: line.slice(244, 252).trim(),
                  nroCNDT: line.slice(252, 267).trim(),
                  dtEmissaoCNDT: line.slice(267, 275).trim(),
                  dtValidadeCNDT: line.slice(275, 283).trim(),
                  nroSequencial: line.slice(923, 929).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.hbl`, hbl, 75);

        return hbl
      } catch (error) {
        console.error(
          "error from InserirHbl function from /controllers/controller.hbl.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    hml: async function (info) {
      const { text, data, sch } = info
      const hml = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              hml.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  exercicioLicitacao: line.slice(6, 10).trim(),
                  nroProcessoLicitatorio: line.slice(10, 22).trim(),
                  tipoDocumento: line.slice(22, 23).trim(),
                  nroDocumento: line.slice(23, 37).trim(),
                  nroLote: line.slice(37, 41).trim(),
                  nroItem: line.slice(41, 45).trim(),
                  dscItem: line.slice(45, 295).trim(),
                  quantidade: line.slice(295, 308).trim(),
                  unidade: line.slice(308, 310).trim(),
                  vlUnitarioHomologacao: line.slice(310, 323).trim(),
                  nroSequencial: line.slice(323, 329).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "20") {
              if (
                hml[dataHelper] &&
                hml[dataHelper].content &&
                Array.isArray(hml[dataHelper].content.content)
              ) {
                hml[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  exercicioLicitacao: line.slice(6, 10).trim(),
                  nroProcessoLicitatorio: line.slice(10, 22).trim(),
                  tipoDocumento: line.slice(22, 23).trim(),
                  nroDocumento: line.slice(23, 37).trim(),
                  nroLote: line.slice(37, 41).trim(),
                  nroItem: line.slice(41, 45).trim(),
                  percDesconto: line.slice(45, 58).trim(),
                  nroSequencial: line.slice(323, 329).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "30") {
              if (
                hml[dataHelper] &&
                hml[dataHelper].content &&
                Array.isArray(hml[dataHelper].content.content)
              ) {
                hml[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  exercicioLicitacao: line.slice(6, 10).trim(),
                  nroProcessoLicitatorio: line.slice(10, 22).trim(),
                  tipoDocumento: line.slice(22, 23).trim(),
                  nroDocumento: line.slice(23, 37).trim(),
                  dtHomologacao: line.slice(37, 45).trim(),
                  dtAdjudicacao: line.slice(45, 53).trim(),
                  nroSequencial: line.slice(323, 329).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.hml`, hml, 75);

        return hml
      } catch (error) {
        console.error(
          "error from Inserirhml function from /controllers/controller.hml.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    ide: async function (info) {
      const { text, data, sch } = info
      const ide = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              ide.push({
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codMunicipio: line.slice(2, 6).trim(),
                  tipoBalancete: line.slice(6, 8).trim(),
                  anoReferencia: line.slice(8, 12).trim(),
                  mesReferencia: line.slice(12, 14).trim(),
                  dataGeracao: line.slice(14, 22).trim(),
                  nroSequencial: line.slice(22, 28).trim(),
                  content: [],
                  line
                },
              });
            }
          }
        }

        await db.batchInsert(`${sch}.ide`, ide, 75);

        return ide
      } catch (error) {
        console.error(
          "error from InserirIde function from /controllers/controller.ide.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    isi: async function (info) {
      const { text, data, sch } = info
      const isi = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              isi.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  cpfCnpjProprietario: line.slice(2, 16).trim(),
                  tipoPessoa: line.slice(16, 17).trim(),
                  nomeRazaoSocial: line.slice(17, 117).trim(),
                  lograProprietario: line.slice(117, 167).trim(),
                  setorLograProprietario: line.slice(167, 187).trim(),
                  cidadeLograProprietario: line.slice(187, 207).trim(),
                  ufLograProprietario: line.slice(207, 209).trim(),
                  cepLograProprietario: line.slice(209, 217).trim(),
                  foneProprietario: line.slice(217, 227).trim(),
                  emailProprietario: line.slice(227, 307).trim(),
                  cpfRespTecnico: line.slice(307, 318).trim(),
                  nomeRespTecnico: line.slice(318, 368).trim(),
                  emailRespTecnico: line.slice(368, 468).trim(),
                  nomeSistema: line.slice(468, 518).trim(),
                  versaoSistema: line.slice(518, 528).trim(),
                  possuiPortalTransparencia: line.slice(528, 529).trim(),
                  urlPortalTransparencia: line.slice(529, 629).trim(),
                  possuiSistemaIntegrado: line.slice(629, 630).trim(),
                  disponibilizaDespesa: line.slice(630, 631).trim(),
                  disponibilizaReceita: line.slice(631, 632).trim(),
                  nroSequencial: line.slice(632, 638).trim(),
                  content: [],
                  line
                },
              });
            }
          }
        }

        await db.batchInsert(`${sch}.isi`, isi, 75);

        return isi
      } catch (error) {
        console.error(
          "error from InserirIsi function from /controllers/controller.isi.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    jgl: async function (info) {
      const { text, data, sch } = info
      const jgl = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              jgl.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  exercicioLicitacao: line.slice(6, 10).trim(),
                  nroProcessoLicitatorio: line.slice(10, 22).trim(),
                  tipoDocumento: line.slice(22, 23).trim(),
                  nroDocumento: line.slice(23, 37).trim(),
                  nroLote: line.slice(37, 41).trim(),
                  nroItem: line.slice(41, 45).trim(),
                  dscProdutoServico: line.slice(45, 295).trim(),
                  vlUnitario: line.slice(295, 308).trim(),
                  quantidade: line.slice(308, 321).trim(),
                  unidade: line.slice(321, 323).trim(),
                  nroSequencial: line.slice(323, 329).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "20") {
              if (
                jgl[dataHelper] &&
                jgl[dataHelper].content &&
                Array.isArray(jgl[dataHelper].content.content)
              ) {
                jgl[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  exercicioLicitacao: line.slice(6, 10).trim(),
                  nroProcessoLicitatorio: line.slice(10, 22).trim(),
                  tipoDocumento: line.slice(22, 23).trim(),
                  nroDocumento: line.slice(23, 37).trim(),
                  nroLote: line.slice(37, 41).trim(),
                  nroItem: line.slice(41, 45).trim(),
                  percDesconto: line.slice(45, 58).trim(),
                  nroSequencial: line.slice(323, 329).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "30") {
              if (
                jgl[dataHelper] &&
                jgl[dataHelper].content &&
                Array.isArray(jgl[dataHelper].content.content)
              ) {
                jgl[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  exercicioLicitacao: line.slice(6, 10).trim(),
                  nroProcessoLicitatorio: line.slice(10, 22).trim(),
                  dtJulgamento: line.slice(22, 30).trim(),
                  AtaPresençaLicitantes: line.slice(30, 31).trim(),
                  renunciaRecurso: line.slice(31, 32).trim(),
                  nroSequencial: line.slice(323, 329).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.jgl`, jgl, 75);

        return jgl
      } catch (error) {
        console.error(
          "error from InserirJgl function from /controllers/controller.jgl.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    lnc: async function (item) {
      const { text, data, codOrgao, sch } = item
      const lnc = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              lnc.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao,
                  tipoUnidade: line.slice(2, 4).trim(),
                  numControle: line.slice(4, 17).trim(),
                  mesReferencia: line.slice(17, 19).trim(),
                  dataRegistro: line.slice(19, 27).trim(),
                  tipoLancamento: line.slice(27, 28).trim(),
                  dataTransacao: line.slice(28, 36).trim(),
                  histórico: line.slice(36, 1036).trim(),
                  nroSequencial: line.slice(1036, 1042).trim(),
                  content: [],
                  line,
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                lnc[dataHelper] &&
                lnc[dataHelper].content &&
                Array.isArray(lnc[dataHelper].content.content)
              ) {
                lnc[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  tipoUnidade: line.slice(2, 4).trim(),
                  numrControle: line.slice(4, 17).trim(),
                  codConta: line.slice(17, 47).trim(),
                  atributoConta: line.slice(47, 48).trim(),
                  natLancamento: line.slice(48, 49).trim(),
                  valor: line.slice(49, 65).trim(),
                  tipoArquivoSicom: line.slice(65, 67).trim(),
                  chaveArquivo: line.slice(67, 217).trim(),
                  nroSequencial: line.slice(1036, 1042).trim(),
                  line,
                })
              }
            }
          }
        }

        const output = await db.batchInsert(`${sch}.lnc`, lnc, 75).returning("*")
        return output
      } catch (error) {
        console.error(
          "error from InserirLnc function from /controllers/controller.lnc.js",
          error,
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    lqd: async function (info) {
      const { text, data, sch } = info
      const lqd = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              lqd.push({
                data,
                content: {
                  line,
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  dotOrigP2001: line.slice(27, 48).trim(),
                  nroEmpenho: line.slice(48, 54).trim(),
                  dtEmpenho: line.slice(54, 62).trim(),
                  nrLiquidacao: line.slice(62, 68).trim(),
                  dtLiquidacao: line.slice(68, 76).trim(),
                  tpLiquidacao: line.slice(76, 77).trim(),
                  vlLiquidado: line.slice(77, 90).trim(),
                  respLiquidacao: line.slice(90, 140).trim(),
                  cpfRespLiquidacao: line.slice(140, 151).trim(),
                  especificacaoLiquidacao: line.slice(151, 351).trim(),
                  nroSequencial: line.slice(351, 357).trim(),
                  content: [],
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                lqd[dataHelper] &&
                lqd[dataHelper].content &&
                Array.isArray(lqd[dataHelper].content.content)
              ) {
                lqd[dataHelper].content.content.push({
                  line,
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  dotOrigP2001: line.slice(27, 48).trim(),
                  nroEmpenho: line.slice(48, 54).trim(), // chave
                  dtEmpenho: line.slice(54, 62).trim(),
                  nrLiquidacao: line.slice(62, 68).trim(),
                  dtLiquidacao: line.slice(68, 76).trim(),
                  codFonteRecurso: line.slice(76, 82).trim(),
                  vlDespesaFR: line.slice(82, 95).trim(),
                  nroSequencial: line.slice(351, 357).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "12") {
              if (
                lqd[dataHelper] &&
                lqd[dataHelper].content &&
                Array.isArray(lqd[dataHelper].content.content)
              ) {
                lqd[dataHelper].content.content.push({
                  line,
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  dotOrigP2001: line.slice(27, 48).trim(),
                  nroEmpenho: line.slice(48, 54).trim(),
                  dtEmpenho: line.slice(54, 62).trim(),
                  nrLiquidacao: line.slice(62, 68).trim(),
                  dtLiquidacao: line.slice(68, 76).trim(),
                  tipoDocFiscal: line.slice(76, 78).trim(),
                  nroDocFiscal: line.slice(78, 88).trim(),
                  serieDocFiscal: line.slice(88, 96).trim(),
                  dtDocFiscal: line.slice(96, 104).trim(),
                  chaveAcesso: line.slice(104, 148).trim(),
                  vlDocValorTotal: line.slice(148, 161).trim(),
                  vlDocAssociado: line.slice(161, 174).trim(),
                  CNPJCPFCredor: line.slice(174, 188).trim(),
                  tipoCredor: line.slice(188, 189).trim(),
                  nrInscEstadual: line.slice(189, 204).trim(),
                  nrInscMunicipal: line.slice(204, 219).trim(),
                  CEPMunicipio: line.slice(219, 227).trim(),
                  ufCredor: line.slice(227, 229).trim(),
                  nomeCredor: line.slice(229, 279).trim(),
                  nroSequencial: line.slice(351, 357).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.lqd`, lqd, 75);

        return lqd
      } catch (error) {
        console.error(
          "error from InserirLqd function from /controllers/controller.lqd.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    ops: async function (info) {
      const { text, data, sch } = info
      const ops = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              ops.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  dotOrigP2001: line.slice(27, 48).trim(),
                  nroEmpenho: line.slice(48, 54).trim(),
                  nroOP: line.slice(54, 60).trim(),
                  tipoOP: line.slice(60, 61).trim(),
                  dtInscricao: line.slice(61, 69).trim(),
                  dtEmissao: line.slice(69, 77).trim(),
                  vlOP: line.slice(77, 90).trim(),
                  nomeCredor: line.slice(90, 140).trim(),
                  tipoCredor: line.slice(140, 141).trim(),
                  cpfCnpj: line.slice(141, 155).trim(),
                  especificacaoOP: line.slice(155, 355).trim(),
                  cpfRespOP: line.slice(355, 366).trim(),
                  nomeRespOP: line.slice(366, 416).trim(),
                  nrExtraOrcamentaria: line.slice(416, 422).trim(),
                  idColare: line.slice(422, 437).trim(),
                  nroSequencial: line.slice(437, 443).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                ops[dataHelper] &&
                ops[dataHelper].content &&
                Array.isArray(ops[dataHelper].content.content)
              ) {
                ops[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  dotOrigP2001: line.slice(27, 48).trim(),
                  nroEmpenho: line.slice(48, 54).trim(), // chave
                  nroOP: line.slice(54, 60).trim(),
                  nrLiquidacao: line.slice(60, 66).trim(),
                  dtLiquidacao: line.slice(66, 74).trim(),
                  vlLiquidacao: line.slice(74, 87).trim(),
                  vlOPVinculadoLiquidacao: line.slice(87, 100).trim(),
                  nroSequencial: line.slice(437, 443).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "12") {
              if (
                ops[dataHelper] &&
                ops[dataHelper].content &&
                Array.isArray(ops[dataHelper].content.content)
              ) {
                ops[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  dotOrigP2001: line.slice(27, 48).trim(),
                  nroEmpenho: line.slice(48, 54).trim(),
                  nroOP: line.slice(54, 60).trim(),
                  codUnidadeFinanceira: line.slice(60, 62).trim(),
                  banco: line.slice(62, 65).trim(),
                  agencia: line.slice(65, 69).trim(),
                  contaCorrente: line.slice(69, 81).trim(),
                  contaCorrenteDigVerif: line.slice(81, 82).trim(),
                  tipoConta: line.slice(82, 84).trim(),
                  nrDocumento: line.slice(84, 99).trim(),
                  tipoDocumento: line.slice(99, 101).trim(),
                  vlDocumento: line.slice(101, 114).trim(),
                  dtEmissao: line.slice(114, 122).trim(),
                  vlAssociado: line.slice(122, 135).trim(),
                  nroSequencial: line.slice(437, 443).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "13") {
              if (
                ops[dataHelper] &&
                ops[dataHelper].content &&
                Array.isArray(ops[dataHelper].content.content)
              ) {
                ops[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  dotOrigP2001: line.slice(27, 48).trim(),
                  nroEmpenho: line.slice(48, 54).trim(),
                  nroOP: line.slice(54, 60).trim(),
                  codUnidadeFinanceira: line.slice(60, 62).trim(),
                  banco: line.slice(62, 65).trim(),
                  agencia: line.slice(65, 69).trim(),
                  contaCorrente: line.slice(69, 81).trim(),
                  contaCorrenteDigVerif: line.slice(81, 82).trim(),
                  tipoConta: line.slice(82, 84).trim(),
                  nrDocumento: line.slice(84, 99).trim(),
                  codFonteRecurso: line.slice(99, 105).trim(),
                  vlFR: line.slice(105, 118).trim(),
                  nroSequencial: line.slice(437, 443).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "14") {
              if (
                ops[dataHelper] &&
                ops[dataHelper].content &&
                Array.isArray(ops[dataHelper].content.content)
              ) {
                ops[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codPrograma: line.slice(2, 6).trim(),
                  codOrgao: line.slice(6, 8).trim(),
                  codUnidade: line.slice(8, 10).trim(),
                  codFuncao: line.slice(10, 12).trim(),
                  codSubFuncao: line.slice(12, 15).trim(),
                  naturezaAcao: line.slice(15, 16).trim(),
                  nroProjAtiv: line.slice(16, 19).trim(),
                  elementoDespesa: line.slice(19, 25).trim(),
                  subElemento: line.slice(25, 27).trim(),
                  dotOrigP2001: line.slice(27, 48).trim(),
                  nroEmpenho: line.slice(48, 54).trim(),
                  nroOP: line.slice(54, 60).trim(),
                  tipoRetencao: line.slice(60, 62).trim(),
                  nrExtraOrcamentaria: line.slice(62, 68).trim(),
                  descricaoRetencao: line.slice(68, 118).trim(),
                  VlRetencao: line.slice(118, 131).trim(),
                  nroSequencial: line.slice(437, 443).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.ops`, ops, 75);

        return ops
      } catch (error) {
        console.error(
          "error from InserirOps function from /controllers/controller.ops.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    orgao: async function (info) {
      const { text, data, sch } = info
      const orgao = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              orgao.push({
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  cpfGestor: line.slice(4, 15).trim(),
                  dtInicio: line.slice(15, 23).trim(),
                  dtFinal: line.slice(23, 31).trim(),
                  descOrgao: line.slice(31, 81).trim(),
                  tipoOrgao: line.slice(81, 83).trim(),
                  cnpjOrgao: line.slice(83, 97).trim(),
                  nomeGestor: line.slice(97, 147).trim(),
                  cargoGestor: line.slice(147, 197).trim(),
                  lograResGestor: line.slice(197, 247).trim(),
                  setorLograGestor: line.slice(247, 267).trim(),
                  cidadeLograGestor: line.slice(267, 287).trim(),
                  ufCidadeLograGestor: line.slice(287, 289).trim(),
                  cepLograGestor: line.slice(289, 297).trim(),
                  foneGestor: line.slice(297, 307).trim(),
                  emailGestor: line.slice(307, 407).trim(),
                  nroSequencial: line.slice(407, 413).trim(),
                  content: [],
                  line
                },
              });
            }
          }
        }


        await db.batchInsert(`${sch}.orgao`, orgao, 75);

        return orgao
      } catch (error) {
        console.error(
          "error from InserirOrgao function from /controllers/controller.orgao.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    par: async function (info) {
      const { text, data, sch } = info
      const par = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              par.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  exercício: line.slice(4, 8).trim(),
                  vlReceitaPrevidenciaria: line.slice(8, 24).trim(),
                  vlDespesaPrevidenciaria: line.slice(24, 40).trim(),
                  vlSaldoFinanceiroExercicioAnterior: line.slice(40, 56).trim(),
                  nroSequencial: line.slice(56, 62).trim(),
                  content: [],
                  line
                },
              });
            }
          }
        }

        await db.batchInsert(`${sch}.par`, par, 75);

        return par
      } catch (error) {
        console.error(
          "error from InserirPar function from /controllers/controller.par.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    pct: async function (info) {
      const { text, data, sch } = info
      const pct = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              pct.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  tipoUnidade: line.slice(2, 4).trim(),
                  envioPlanoContas: line.slice(4, 5).trim(),
                  nroSequencial: line.slice(179, 185).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                pct[dataHelper] &&
                pct[dataHelper].content &&
                Array.isArray(pct[dataHelper].content.content)
              ) {
                pct[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  tipoUnidade: line.slice(2, 4).trim(),
                  nível: line.slice(4, 6).trim(),
                  qtDigitosNivel: line.slice(6, 8).trim(),
                  nroSequencial: line.slice(179, 185).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "12") {
              if (
                pct[dataHelper] &&
                pct[dataHelper].content &&
                Array.isArray(pct[dataHelper].content.content)
              ) {
                pct[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  tipoUnidade: line.slice(2, 4).trim(),
                  codConta: line.slice(4, 34).trim(),
                  indicadorCalcSupFinanceiro: line.slice(34, 35).trim(),
                  codContaSuperior: line.slice(35, 65).trim(),
                  nível: line.slice(65, 67).trim(),
                  descricao: line.slice(67, 167).trim(),
                  naturezaConta: line.slice(167, 168).trim(),
                  tipoConta: line.slice(168, 169).trim(),
                  contaPCASP: line.slice(169, 178).trim(),
                  indicadorCalcSupFinanceiroPCASP: line.slice(178, 179).trim(),
                  nroSequencial: line.slice(179, 185).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "13") {
              if (
                pct[dataHelper] &&
                pct[dataHelper].content &&
                Array.isArray(pct[dataHelper].content.content)
              ) {
                pct[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  tipoUnidade: line.slice(2, 4).trim(),
                  codConta: line.slice(4, 34).trim(),
                  indicadorCalcSupFinanceiro: line.slice(34, 35).trim(),
                  descricao: line.slice(35, 135).trim(),
                  contaPCASP: line.slice(135, 144).trim(),
                  indicadorCalcSupFinanceiroPCASP: line.slice(144, 179).trim(),
                  nroSequencial: line.slice(179, 185).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "14") {
              if (
                pct[dataHelper] &&
                pct[dataHelper].content &&
                Array.isArray(pct[dataHelper].content.content)
              ) {
                pct[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  tipoUnidade: line.slice(2, 4).trim(),
                  codConta: line.slice(4, 34).trim(),
                  indicadorCalcSupFinanceiro: line.slice(34, 35).trim(),
                  nroSequencial: line.slice(179, 185).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.pct`, pct, 75);

        return pct
      } catch (error) {
        console.error(
          "error from InserirPct function from /controllers/controller.pct.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    prl: async function (info) {
      const { text, data, sch } = info
      const prl = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              prl.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  exercicioLicitacao: line.slice(6, 10).trim(),
                  nroProcessoLicitatorio: line.slice(10, 22).trim(),
                  dataParecer: line.slice(22, 30).trim(),
                  tipoParecer: line.slice(30, 31).trim(),
                  nroCpf: line.slice(31, 42).trim(),
                  nomeRespParecer: line.slice(42, 142).trim(),
                  lograResp: line.slice(142, 192).trim(),
                  setorLogra: line.slice(192, 212).trim(),
                  cidadeLogra: line.slice(212, 232).trim(),
                  ufCidadeLogra: line.slice(232, 234).trim(),
                  cepLogra: line.slice(234, 242).trim(),
                  fone: line.slice(242, 252).trim(),
                  email: line.slice(252, 332).trim(),
                  nroSequencial: line.slice(332, 338).trim(),
                  content: [],
                  line
                },
              });
            }
          }
        }

        await db.batchInsert(`${sch}.prl`, prl, 75);

        return prl
      } catch (error) {
        console.error(
          "error from InserirPrl function from /controllers/controller.prl.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    rec: async function (info) {
      const { text, data, sch } = info
      const rec = [];

      try {
        const lines = text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              rec.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  rubrica: line.slice(6, 15).trim(),
                  especificacao: line.slice(15, 115).trim(),
                  vlPrevistoAtualizado: line.slice(115, 128).trim(),
                  vlArrecadado: line.slice(128, 141).trim(),
                  vlAcumulado: line.slice(141, 154).trim(),
                  nroSequencial: line.slice(154, 160).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                rec[dataHelper] &&
                rec[dataHelper].content &&
                Array.isArray(rec[dataHelper].content.content)
              ) {
                rec[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  rubrica: line.slice(6, 15).trim(),
                  banco: line.slice(15, 18).trim(),
                  agencia: line.slice(18, 22).trim(),
                  contaCorrente: line.slice(22, 34).trim(),
                  contaCorrenteDigVerif: line.slice(34, 35).trim(),
                  tipoConta: line.slice(35, 37).trim(),
                  vlRecolhimento: line.slice(37, 50).trim(),
                  nroSequencial: line.slice(154, 160).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "12") {
              if (
                rec[dataHelper] &&
                rec[dataHelper].content &&
                Array.isArray(rec[dataHelper].content.content)
              ) {
                rec[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  rubrica: line.slice(6, 15).trim(),
                  banco: line.slice(15, 18).trim(),
                  agencia: line.slice(18, 22).trim(),
                  contaCorrente: line.slice(22, 34).trim(),
                  contaCorrenteDigVerif: line.slice(34, 35).trim(),
                  tipoConta: line.slice(35, 37).trim(),
                  codFonteRecurso: line.slice(37, 43).trim(),
                  poderOrgao: "nan", // PO
                  codFontRecursosMSC: "nan", // FR
                  codAEO: "nan", // CO
                  vlFonteRecurso: line.slice(43, 56).trim(),
                  nroSequencial: line.slice(154, 160).trim(),
                  line
                });
              }
            }
          }
        }

        rec.forEach((recValue, recIndex) => {
          const tipo10 = recValue.content;

          if (tipo10.tipoRegistro != "99") {
            tipo10.content.forEach((tipo12, tipo12Index) => {
              if (tipo12.tipoRegistro !== "12") return
              let poderOrgao = "nan";
              let codFontRecursosMSC = "nan";
              let codAEO = "nan";
              // 03 - PREFEITURA MUNICIPAL DE SENADOR CANEDO
              if (tipo12.codOrgao === "03") {
                if (
                  verificarCod(
                    tipo12,
                    ["100"],
                    [
                      "011125001",
                      "011125002",
                      "011125003",
                      "011125004",
                      "011125301",
                      "011130311",
                      "011130341",
                      "011145111",
                      "011145112",
                      "011145113",
                      "011145114",
                      "011210101",
                      "011220101",
                      "011220102",
                      "013399901",
                      "017115111",
                      "017115121",
                      "017115201",
                      "017195801",
                      "017215001",
                      "017215101",
                      "017215201",
                      "019110101",
                    ],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1500";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["101"],
                    [
                      "011125001",
                      "011125002",
                      "011125003",
                      "011125004",
                      "011125301",
                      "011130311",
                      "011130341",
                      "011145111",
                      "011145112",
                      "011145113",
                      "011145114",
                      "017115111",
                      "017115121",
                      "017115201",
                      "017215001",
                      "017215101",
                      "017215201",
                    ],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1500";
                  codAEO = "1001";
                } else if (
                  verificarCod(
                    tipo12,
                    ["101"],
                    [
                      "9510000001",
                      "9510000002",
                      "9510000004",
                      "9510000005",
                      "9510000006",
                    ],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1500";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["102"],
                    [
                      "011125001",
                      "011125002",
                      "011125003",
                      "011125004",
                      "011125301",
                      "011130311",
                      "011130341",
                      "011145111",
                      "011145112",
                      "011145113",
                      "011145114",
                      "013110201",
                      "012415001",
                      "013110201",
                      "013210101",
                      "017115111",
                      "017115121",
                      "017115201",
                      "017215001",
                      "017215101",
                      "017215201",
                    ],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1500";
                  codAEO = "1002";
                } else if (
                  verificarCod(
                    tipo12,
                    ["144"],
                    ["013210101", "019991221"],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1501";
                  codAEO = "nan";
                } else if (
                  verificarCod(tipo12, ["190"], ["021125001"], ["021"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1574";
                  codAEO = "nan";
                } else if (
                  verificarCod(tipo12, ["137"], ["013210101"], ["000"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1599";
                  codAEO = "3110";
                } else if (
                  verificarCod(
                    tipo12,
                    ["137"],
                    ["017249901", "024229901"],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1599";
                  codAEO = "3210";
                } else if (
                  verificarCod(tipo12, ["190"], ["021125101"], ["023"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1634";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["123"],
                    ["013210101", "017179901", "024149901"],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1700";
                  codAEO = "nan";
                } else if (
                  verificarCod(tipo12, ["127"], ["013210101"], ["000"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1701";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["170"],
                    ["013210101", "017125241"],
                    ["074"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1705";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["180"],
                    ["013210101", "024195101", "024199901"],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1706";
                  codAEO = "3110";
                } else if (
                  verificarCod(tipo12, ["181"], ["013210101"], ["000"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1706";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["170"],
                    ["013210101", "017125101"],
                    ["072"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1708";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["136", "137"],
                    ["013210101", "024229901"],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1710";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["100"],
                    ["013210101", "017195801"],
                    ["089"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1749";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["116"],
                    ["013210101", "017215301"],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1750";
                  codAEO = "nan";
                } else if (
                  verificarCod(tipo12, ["100"], ["012415001"], ["000"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1751";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["171"],
                    ["013210101", "019110101"],
                    ["019"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1752";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["106"],
                    [
                      "011210101",
                      "011210102",
                      "011210103",
                      "011210104",
                      "011215001",
                      "011215002",
                      "011215003",
                      "011215004",
                    ],
                    ["000", "015"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1753";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["190"],
                    ["013210101", "021120101", "021125201"],
                    ["024"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1754";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["192"],
                    ["013210101", "022110101"],
                    ["032"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1755";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["100"],
                    [
                      "9999000001",
                      "9999000002",
                      "9999000003",
                      "9999000009",
                      "9999000025",
                      "9999000028",
                      "9999000029",
                      "9999000030",
                      "9999000031",
                      "9999000032",
                      "9999000034",
                      "9999000035",
                      "9999000036",
                      "9999000037",
                      "9999000038",
                      "9999000040",
                      "9999000041",
                      "9999000042",
                      "9999000043",
                      "9999000045",
                      "9999000047",
                      "9999000048",
                      "9999000049",
                      "9999000050",
                      "9999000051",
                      "9999000052",
                      "9999000053",
                      "9999000054",
                      "9999000055",
                      "9999000056",
                      "9999000057",
                      "9999000058",
                      "9999000059",
                      "9999000060",
                      "9999000061",
                      "9999000064",
                      "9999000066",
                      "9999000067",
                      "9999000068",
                      "9999000070",
                      "9999000071",
                      "9999000072",
                      "9999000073",
                      "9999000074",
                      "9999000075",
                      "9999000076",
                    ],
                    ["00"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1869";
                  codAEO = "nan";
                }
              }
              // 06 - FUNDEB - SENADOR CANEDO
              if (tipo12.codOrgao === "06") {
                if (
                  verificarCod(
                    tipo12,
                    ["118"],
                    ["013210101", "017515001"],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1540";
                  codAEO = "1070";
                } else if (
                  verificarCod(tipo12, ["119"], ["017515001"], ["000"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1540";
                  codAEO = "nan";
                } else if (
                  verificarCod(tipo12, ["187"], ["017155201"], ["000"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1543";
                  codAEO = "nan";
                } else if (
                  verificarCod(tipo12, ["149"], ["017155301"], ["000"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1546";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["100"],
                    [
                      "9999000027",
                      "9999000039",
                      "9999000044",
                      "9999000127",
                      "9999000128",
                      "9999000130",
                      "9999000131",
                      "9999000132",
                      "9999000133",
                      "9999000134",
                      "9999000135",
                      "9999000137",
                      "9999000138",
                      "9999000139",
                      "9999000142",
                      "9999000143",
                      "9999000145",
                      "9999000146",
                      "9999000148",
                      "9999000149",
                      "9999000151",
                      "9999000152",
                      "9999000153",
                      "9999000154",
                      "9999000155",
                      "9999000156",
                      "9999000157",
                      "9999000158",
                      "9999000159",
                      "9999000160",
                      "9999000161",
                      "9999000162",
                      "9999000163",
                      "9999000165",
                      "9999000166",
                      "9999000167",
                      "9999000168",
                      "9999000169",
                      "9999000173",
                      "9999000187",
                      "9999000191",
                      "9999000202",
                      "9999000205",
                      "9999060100",
                      "9999210104",
                      "9999210139",
                      "9999210170",
                    ],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1869";
                  codAEO = "nan";
                }
              }
              // 07 - INSTITUTO DE PREVIDENCIA DO SERVIDOR PUBLICO DE SENADOR CANEDO
              if (tipo12.codOrgao === "07") {
                if (
                  verificarCod(
                    tipo12,
                    ["103"],
                    [
                      "012150111",
                      "012150221",
                      "019239901",
                      "019990101",
                      "019990301",
                      "072150211",
                      "072150212",
                      "072155111",
                    ],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10132";
                  codFontRecursosMSC = "1800";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["103"],
                    [
                      "012150121",
                      "013210401",
                      "019990102",
                      "019990302",
                      "9910000001",
                    ],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10132";
                  codFontRecursosMSC = "1800";
                  codAEO = "1111";
                } else if (
                  verificarCod(
                    tipo12,
                    ["177"],
                    ["012150111", "013210101", "072150211", "991000002"],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10132";
                  codFontRecursosMSC = "1802";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["100"],
                    [
                      "9999000013",
                      "9999000022",
                      "9999000174",
                      "9999000175",
                      "9999000176",
                      "9999000177",
                      "9999000178",
                      "9999000179",
                      "9999000180",
                      "9999000181",
                      "9999000183",
                      "9999000184",
                      "9999000189",
                      "9999000193",
                      "9999000194",
                      "9999000195",
                      "9999000196",
                      "9999000198",
                      "9999000199",
                      "9999000211",
                      "9999010100",
                      "9999070100",
                      "9999120100",
                      "9999210116",
                      "9999210135",
                      "9999210148",
                    ],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10132";
                  codFontRecursosMSC = "1869";
                  codAEO = "nan";
                }
              }
              // 08 - FEMBOM - FUNDO ESPECIAL MUNICIPAL PARA FRAÇÃO CORPO DE BOMBEIRO
              if (tipo12.codOrgao === "08") {
                if (
                  verificarCod(
                    tipo12,
                    ["100"],
                    ["011210101", "013210101"],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1759";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["100"],
                    ["9999000218", "9999000219", "9999000220", "99990801"],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1869";
                  codAEO = "nan";
                }
              }
              // 09 - FMS - FUNDO MUNICIPAL DE SAÚDE
              if (tipo12.codOrgao === "09") {
                if (verificarCod(tipo12, ["102"], ["013210101"], ["000"])) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1500";
                  codAEO = "1002";
                } else if (
                  verificarCod(
                    tipo12,
                    ["107"],
                    [
                      "013210101",
                      "017135011",
                      "017135021",
                      "017135031",
                      "017135041",
                      "017135051",
                    ],
                    [
                      "008",
                      "011",
                      "013",
                      "008",
                      "017",
                      "020",
                      "057",
                      "062",
                      "063",
                      "097",
                    ]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1600";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["109"],
                    ["013210101", "017135111", "024115121"],
                    ["000", "008", "064"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1601";
                  codAEO = "nan";
                } else if (
                  verificarCod(tipo12, ["195"], ["017199901"], ["091"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1604";
                  codAEO = "nan";
                } else if (
                  verificarCod(tipo12, ["107"], ["013210101"], ["097"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1605";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["131"],
                    ["013210101", "017235001"],
                    [
                      "000",
                      "008",
                      "010",
                      "060",
                      "013",
                      "017",
                      "020",
                      "060",
                      "062",
                    ]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1621";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["121"],
                    ["013210101", "024145001"],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1631";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["125"],
                    ["013210101", "017245001"],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1632";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["181"],
                    ["013210101", "017199901", "024199901"],
                    ["000", "008", "017"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1706";
                  codAEO = "3110";
                } else if (
                  verificarCod(
                    tipo12,
                    ["182"],
                    ["013210101", "017199901", "024199901"],
                    ["000", "064"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1706";
                  codAEO = "3120";
                } else if (
                  verificarCod(tipo12, ["137"], ["013210101"], ["000"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1710";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["106"],
                    [
                      "013210101",
                      "011215001",
                      "011215002",
                      "011215003",
                      "011215004",
                    ],
                    ["015"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1753";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["100", "102"],
                    [
                      "9999000010",
                      "9999000019",
                      "9999000063",
                      "9999000069",
                      "9999000069",
                      "9999000081",
                      "9999000082",
                      "9999000084",
                      "9999000087",
                      "9999000089",
                      "9999000170",
                      "9999000188",
                      "9999000190",
                      "9999000221",
                      "9999000222",
                      "9999000223",
                      "9999000224",
                      "9999000225",
                      "9999000226",
                      "9999000227",
                      "9999000228",
                      "9999000232",
                      "9999000233",
                      "9999000234",
                      "9999000236",
                      "9999000238",
                      "9999000240",
                      "9999000242",
                      "9999000246",
                      "9999000247",
                      "9999000250",
                      "9999000252",
                      "9999000253",
                      "9999000257",
                      "9999000258",
                      "9999000262",
                      "9999000263",
                      "9999090100",
                      "9999210101",
                      "9999210102",
                      "9999210106",
                      "9999210112",
                      "9999210115",
                      "9999210123",
                      "9999210138",
                      "9999000253",
                      "9999000257",
                      "9999000258",
                      "9999000262",
                      "9999000263",
                      "9999090100",
                      "9999210101",
                      "9999210102",
                      "9999210106",
                      "9999210112",
                      "9999210115",
                      "9999210123",
                      "9999210138",
                      "9999210182",
                      "9999210184",
                      "9999210188",
                    ],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1869";
                  codAEO = "nan";
                }
              }
              // 11 - FMAS - FUNDO MUNICIPAL ASSISTENCIA SOCIAL
              if (tipo12.codOrgao === "11") {
                if (verificarCod(tipo12, ["100"], ["013210101"], ["000"])) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1500";
                  codAEO = "nan";
                } else if (
                  verificarCod(tipo12, ["137"], ["013210101"], ["000"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1599";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["129"],
                    ["013210101", "017165001"],
                    ["006", "506", "507", "554", "557", "559"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1660";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["132"],
                    ["013210101", "017295101"],
                    ["000", "006"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1661";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["129"],
                    ["013210101", "017165001"],
                    ["056", "081"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1669";
                  codAEO = "nan";
                } else if (
                  verificarCod(tipo12, ["181"], ["024199901"], ["000"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1706";
                  codAEO = "3110";
                } else if (
                  verificarCod(
                    tipo12,
                    ["180", "181"],
                    ["013210101", "017199901"],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1706";
                  codAEO = "3210";
                } else if (
                  verificarCod(tipo12, ["182"], ["013210101"], ["000"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1706";
                  codAEO = "3220";
                } else if (
                  verificarCod(
                    tipo12,
                    ["100"],
                    [
                      "9999000018",
                      "9999000062",
                      "9999000172",
                      "9999000185",
                      "9999000186",
                      "9999000201",
                      "9999000203",
                      "9999000204",
                      "9999000206",
                      "9999000207",
                      "9999000241",
                      "9999000272",
                      "9999000273",
                      "9999000274",
                      "9999000275",
                      "9999000276",
                      "9999000277",
                      "9999000278",
                      "9999000279",
                      "9999000280",
                      "9999000281",
                      "9999000282",
                      "9999000284",
                      "9999000285",
                      "9999000289",
                      "9999000290",
                      "9999000296",
                      "9999000297",
                      "9999000298",
                      "9999000299",
                      "9999000301",
                      "9999000304",
                      "9999000305",
                      "9999000306",
                      "9999000307",
                      "9999000419",
                      "9999000448",
                      "9999110100",
                      "9999210111",
                      "9999210131",
                    ],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1869";
                  codAEO = "nan";
                } else if (
                  verificarCod(tipo12, ["100"], ["9999210140"], ["000"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1860";
                  codAEO = "nan";
                }
              }
              // 12 - FMDCA - FUNDO MUNICIPAL DA INFANCIA E ADOLESCENCIA
              if (tipo12.codOrgao === "12") {
                if (
                  verificarCod(
                    tipo12,
                    ["150"],
                    ["013210101", "017919901", "019110801"],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1899";
                  codAEO = "nan";
                }
              }
              // 15 - PROCON - SENADOR CANEDO
              if (tipo12.codOrgao === "15") {
                if (verificarCod(tipo12, ["110"], ["013210101"], ["000"])) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1759";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["100"],
                    ["9999210145", "9999210146", "9999210149"],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1860";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["100"],
                    [
                      "9999210150",
                      "9999210151",
                      "9999210152",
                      "9999210153",
                      "9999210154",
                      "9999210162",
                      "9999210163",
                      "9999210165",
                      "9999210166",
                      "9999210145",
                    ],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1869";
                  codAEO = "nan";
                }
              }
              // 18 - SANESC - AGENCIA DE SANEAMENTO DE SENADOR CANEDO
              if (tipo12.codOrgao === "18") {
                if (
                  verificarCod(
                    tipo12,
                    ["110"],
                    ["013210101", "019229901"],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1500";
                  codAEO = "nan";
                } else if (
                  verificarCod(tipo12, ["123"], ["013210101"], ["000"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1700";
                  codAEO = "nan";
                } else if (
                  verificarCod(tipo12, ["190"], ["013210101"], ["000"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1754";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["110"],
                    ["013210101", "016995011"],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1759";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["100"],
                    [
                      "9999000020",
                      "9999000150",
                      "9999000315",
                      "9999000316",
                      "9999000317",
                      "9999000318",
                      "9999000319",
                      "9999000320",
                      "9999000321",
                      "9999000324",
                      "9999000325",
                      "9999000326",
                      "9999000327",
                      "9999000332",
                      "9999000338",
                      "9999000340",
                      "9999000345",
                      "9999000352",
                      "9999000354",
                      "9999000355",
                      "9999180100",
                      "9999210147",
                      "9999210177",
                      "9999210178",
                    ],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1869";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["110"],
                    ["9999000024", "9999210125"],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1869";
                  codAEO = "nan";
                }
              }
              // 19 - AMMA - AGENCIA MUNICIPAL DE MEIO AMBIENTE
              if (tipo12.codOrgao === "19") {
                if (
                  verificarCod(
                    tipo12,
                    ["100"],
                    [
                      "011210401",
                      "011210402",
                      "013210101",
                      "019110611",
                      "019110612",
                    ],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1500";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["151"],
                    [
                      "011210401",
                      "011210402",
                      "013210101",
                      "019110611",
                      "019110612",
                      "019110621",
                    ],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1899";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["100"],
                    [
                      "9999000017",
                      "9999000046",
                      "9999000147",
                      "9999000360",
                      "9999000361",
                      "9999000362",
                      "9999000363",
                      "9999000364",
                      "9999000365",
                      "9999000366",
                      "9999000370",
                      "9999000371",
                      "9999000372",
                      "9999000382",
                      "9999000383",
                      "9999000385",
                      "9999000388",
                      "9999190100",
                      "9999210118",
                      "9999210119",
                      "9999210132",
                      "9999210141",
                      "9999210171",
                      "9999210173",
                      "9999210185",
                    ],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1869";
                  codAEO = "nan";
                }
              }
              // 20 - FME - FUNDO MUNICIPAL DE EDUCAÇÃO, CULTURA
              if (tipo12.codOrgao === "20") {
                if (verificarCod(tipo12, ["101"], ["013210101"], ["000"])) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1500";
                  codAEO = "1001";
                } else if (
                  verificarCod(tipo12, ["115"], ["019229901"], ["000"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1500";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["115"],
                    ["013210101", "017145001"],
                    ["049"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1550";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["115"],
                    ["013210101", "017145201"],
                    ["051"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1552";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["115"],
                    ["013210101", "017145301"],
                    ["052"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1553";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["115"],
                    ["013210101"],
                    ["002", "092", "573"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1569";
                  codAEO = "nan";
                } else if (
                  verificarCod(tipo12, ["120"], ["013210101"], ["000"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1570";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["124"],
                    ["013210101", "017245101"],
                    ["000", "085"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1571";
                  codAEO = "nan";
                } else if (
                  verificarCod(tipo12, ["181"], ["013210101"], ["000"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1706";
                  codAEO = "nan";
                } else if (
                  verificarCod(tipo12, ["137"], ["013210101"], ["000"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1710";
                  codAEO = "nan";
                } else if (
                  verificarCod(tipo12, ["178"], ["013210101"], ["092"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1715";
                  codAEO = "nan";
                } else if (
                  verificarCod(tipo12, ["178"], ["013210101"], ["093"])
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1716";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["101"],
                    [
                      "9999000004",
                      "9999000005",
                      "9999000006",
                      "9999000007",
                      "9999000011",
                      "9999000012",
                      "9999000134",
                      "9999000136",
                      "9999000140",
                      "9999000141",
                      "9999000144",
                      "9999000171",
                      "9999000216",
                      "9999000259",
                      "9999000295",
                      "9999000329",
                      "9999000393",
                      "9999000394",
                      "9999000395",
                      "9999000395",
                      "9999000396",
                      "9999000397",
                      "9999000398",
                      "9999000399",
                      "9999000402",
                      "9999000403",
                      "9999000404",
                      "9999000405",
                      "9999000406",
                      "9999000408",
                      "9999000409",
                      "9999000411",
                      "9999000413",
                      "9999000414",
                    ],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1869";
                  codAEO = "nan";
                }
              }
              // 21 - FUNDI - FUNDO MUNICIPAL DOS DIREITOS DOS IDOSO
              if (tipo12.codOrgao === "21") {
                if (
                  verificarCod(
                    tipo12,
                    ["110"],
                    ["013210101", "017919901"],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1759";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["100"],
                    ["9999210120", "9999210122", "9999210175", "9999210176"],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1869";
                  codAEO = "nan";
                }
              }
              // 22 - FUMDEC - FUNDO MUNICIPAL DE PROTEÇÃO E DEFESA
              if (tipo12.codOrgao === "22") {
                if (verificarCod(tipo12, ["100"], ["013210101"], ["000"])) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1500";
                  codAEO = "nan";
                } else if (
                  verificarCod(
                    tipo12,
                    ["100"],
                    [
                      "9999000008",
                      "9999000023",
                      "9999210134",
                      "9999210142",
                      "9999210143",
                      "9999210155",
                      "9999210156",
                      "9999210157",
                      "9999210158",
                      "9999210159",
                      "9999210160",
                      "9999210161",
                      "9999210164",
                    ],
                    ["000"]
                  )
                ) {
                  poderOrgao = "10131";
                  codFontRecursosMSC = "1869";
                  codAEO = "nan";
                }
              }
              rec[recIndex].content.content[tipo12Index].codFontRecursosMSC =
                codFontRecursosMSC;
              rec[recIndex].content.content[tipo12Index].poderOrgao = poderOrgao;
              rec[recIndex].content.content[tipo12Index].codAEO = codAEO;
            });
          }
        });

        rec.forEach(({ content }, i10) => content.content.forEach((e, i12) => {
          if (e.tipoRegistro !== "12") return
          if (!e.codFontRecursosMSC || e.codFontRecursosMSC === "nan") {
            rec[i10].content.content[i12].codFontRecursosMSC = `${e.codFonteRecurso.substring(0, 1)}${codFR.map.get(e.codFonteRecurso.substring(1))}`
          }
        }))

        /* const lnc = (await db("lnc").select("*")).filter(
         (e) => e.data === data && e.content.codOrgao === orgaoSpecifics.codOrgao
        );
        const recRubricaLNC = {
         // 19 - AMMA - AGENCIA MUNICIPAL DE MEIO AMBIENTE
         19: {
           // Rubrica do TCM, contadeb, contacred
           // MULTAS ADMINISTRATIVAS AMBIENTAIS - PRINCIPAL
           19110611: ["499510000"],
           // TAXA DE CONTROLE E FISCALIZAÇÃO AMBIENTAL - PRINCIPAL
           11210401: ["412111400"],
           // REMUNERAÇÃO DE DEPÓSITOS BANCÁRIOS - PRINCIPAL
           13210101: ["445110000"],
         },
        };
        const using = recRubricaLNC[rec[0]?.content?.codOrgao];
        rec.forEach((rec10, rec10_I) => {
         rec10.content.content.forEach((tipo11, tipo11Index) => {
           if (tipo11?.tipoRegistro !== "11") return;
           const val = using[tipo11?.rubrica];
           const toAply = {
             contaDeb: val ? val : "nan",
           };
           rec[rec10_I].content.content[tipo11Index] = {
             ...rec[rec10_I].content.content[tipo11Index],
             ...toAply,
           };
         });
        });
        */

        await db.batchInsert(`${sch}.rec`, rec, 75);

        return rec
      } catch (error) {
        console.error(
          "error from InserirRec function from /controllers/controller.rec.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    rpl: async function (info) {
      const { text, data, sch } = info
      const rpl = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              rpl.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  exercicioLicitacao: line.slice(6, 10).trim(),
                  nroProcessoLicitatorio: line.slice(10, 22).trim(),
                  tipoResponsabilidade: line.slice(22, 23).trim(),
                  cpfResponsavel: line.slice(23, 34).trim(),
                  nomeResponsavel: line.slice(34, 134).trim(),
                  cargoResponsavel: line.slice(134, 184).trim(),
                  lograResResponsavel: line.slice(184, 234).trim(),
                  setorLograResponsavel: line.slice(234, 254).trim(),
                  cidadeLograResponsavel: line.slice(254, 274).trim(),
                  ufCidadeLograResponsavel: line.slice(274, 276).trim(),
                  cepLograResponsavel: line.slice(276, 284).trim(),
                  foneResponsavel: line.slice(284, 294).trim(),
                  email: line.slice(294, 374).trim(),
                  escolaridade: line.slice(374, 376).trim(),
                  nroSequencial: line.slice(391, 397).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "20") {
              if (
                rpl[dataHelper] &&
                rpl[dataHelper].content &&
                Array.isArray(rpl[dataHelper].content.content)
              ) {
                rpl[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  exercicioLicitacao: line.slice(6, 10).trim(),
                  nroProcessoLicitatorio: line.slice(10, 22).trim(),
                  tipoComissao: line.slice(22, 23).trim(),
                  codAtribuicao: line.slice(23, 24).trim(),
                  cpfMembroComissao: line.slice(24, 35).trim(),
                  tipoAtoNomeacao: line.slice(35, 36).trim(),
                  nroAtoNomeacao: line.slice(36, 44).trim(),
                  dataAtoNomeacao: line.slice(44, 52).trim(),
                  inicioVigencia: line.slice(52, 60).trim(),
                  finalVigencia: line.slice(60, 68).trim(),
                  nomMembroComLic: line.slice(68, 148).trim(),
                  cargo: line.slice(148, 198).trim(),
                  naturezaCargo: line.slice(198, 199).trim(),
                  lograResMembro: line.slice(199, 249).trim(),
                  setorLograMembro: line.slice(249, 269).trim(),
                  cidadeLograMembro: line.slice(269, 289).trim(),
                  ufCidadeLograMembro: line.slice(289, 291).trim(),
                  cepLograMembro: line.slice(291, 299).trim(),
                  foneMembro: line.slice(299, 309).trim(),
                  email: line.slice(309, 389).trim(),
                  escolaridade: line.slice(389, 391).trim(),
                  nroSequencial: line.slice(391, 397).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.rpl`, rpl, 75);

        return rpl
      } catch (error) {
        console.error(
          "error from InserirRpl function from /controllers/controller.rpl.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    rsp: async function (info) {
      const { text, data, sch } = info
      const rsp = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              rsp.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  DotOrigP2001: line.slice(4, 25).trim(),
                  DotOrigP2002: line.slice(25, 48).trim(),
                  nroEmpenho: line.slice(48, 54).trim(),
                  dtEmpenho: line.slice(54, 62).trim(),
                  nomeCredor: line.slice(62, 112).trim(),
                  vlOriginal: line.slice(112, 125).trim(),
                  vlSaldoAnt: line.slice(125, 138).trim(),
                  vlBaixaPgto: line.slice(138, 151).trim(),
                  nroSequencial: line.slice(151, 157).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                rsp[dataHelper] &&
                rsp[dataHelper].content &&
                Array.isArray(rsp[dataHelper].content.content)
              ) {
                rsp[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  DotOrigP2001: line.slice(4, 25).trim(),
                  DotOrigP2002: line.slice(25, 48).trim(),
                  nroEmpenho: line.slice(48, 54).trim(),
                  dtEmpenho: line.slice(54, 62).trim(),
                  nomeCredor: line.slice(62, 112).trim(),
                  dtCancelamento: line.slice(112, 120).trim(),
                  nrCancelamento: line.slice(120, 123).trim(),
                  vlBaixaCancelamento: line.slice(123, 136).trim(),
                  nroSequencial: line.slice(151, 157).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "12") {
              if (
                rsp[dataHelper] &&
                rsp[dataHelper].content &&
                Array.isArray(rsp[dataHelper].content.content)
              ) {
                rsp[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  DotOrigP2001: line.slice(4, 25).trim(),
                  DotOrigP2002: line.slice(25, 48).trim(),
                  nroEmpenho: line.slice(48, 54).trim(),
                  dtEmpenho: line.slice(54, 62).trim(),
                  nomeCredor: line.slice(62, 112).trim(),
                  tipoEncampacao: line.slice(112, 114).trim(),
                  codOrgao: line.slice(114, 116).trim(),
                  codUnidade: line.slice(116, 118).trim(),
                  vlEncampacao: line.slice(118, 131).trim(),
                  nroSequencial: line.slice(151, 157).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.rsp`, rsp, 75);

        return rsp
      } catch (error) {
        console.error(
          "error from InserirRsp function from /controllers/controller.rsp.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    tfr: async function (info) {
      const { text, data, sch } = info
      const tfr = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              tfr.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  Banco: line.slice(6, 9).trim(),
                  agencia: line.slice(9, 13).trim(),
                  contaCorrente: line.slice(13, 25).trim(),
                  contaCorrenteDigVerif: line.slice(25, 26).trim(),
                  tipoConta: line.slice(26, 27).trim(),
                  codFonteOrigem: line.slice(27, 34).trim(),
                  vlDecrescido: line.slice(34, 47).trim(),
                  nroSequencial: line.slice(53, 59).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                tfr[dataHelper] &&
                tfr[dataHelper].content &&
                Array.isArray(tfr[dataHelper].content.content)
              ) {
                tfr[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(3, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  Banco: line.slice(6, 9).trim(),
                  agencia: line.slice(9, 13).trim(),
                  contaCorrente: line.slice(13, 25).trim(),
                  contaCorrenteDigVerif: line.slice(25, 27).trim(),
                  tipoConta: line.slice(27, 28).trim(),
                  codFonteOrigem: line.slice(28, 34).trim(),
                  codFonteDestino: line.slice(34, 40).trim(),
                  vlAcrescido: line.slice(40, 53).trim(),
                  nroSequencial: line.slice(53, 59).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.tfr`, tfr, 75);

        return tfr
      } catch (error) {
        console.error(
          "error from InserirTfr function from /controllers/controller.tfr.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    trb: async function (info) {
      const { text, data, sch } = info
      const trb = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              trb.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidadeOrigem: line.slice(4, 6).trim(),
                  bancoOrigem: line.slice(6, 9).trim(),
                  agenciaOrigem: line.slice(9, 13).trim(),
                  contaCorrenteOrigem: line.slice(13, 25).trim(),
                  contaCorrenteOrigemDigVerif: line.slice(25, 26).trim(),
                  tipoContaOrigem: line.slice(26, 28).trim(),
                  codFonteRecurso: line.slice(28, 34).trim(),
                  vlTransfOrigem: line.slice(34, 47).trim(),
                  nroSequencial: line.slice(71, 77).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                trb[dataHelper] &&
                trb[dataHelper].content &&
                Array.isArray(trb[dataHelper].content.content)
              ) {
                trb[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidadeOrigem: line.slice(4, 6).trim(),
                  bancoOrigem: line.slice(6, 9).trim(),
                  agenciaOrigem: line.slice(9, 13).trim(),
                  contaCorrenteOrigem: line.slice(13, 25).trim(),
                  contaCorrenteOrigemDigVerif: line.slice(25, 26).trim(),
                  tipoContaOrigem: line.slice(26, 28).trim(),
                  codFonteRecurso: line.slice(28, 34).trim(), // FR TCM
                  codFontRecursosMSC: `${line.slice(28, 29)}${(codFR.map.get(line.slice(29, 34)) || ["nan"])[0]}`, // FR
                  codUnidadeDestino: line.slice(34, 36).trim(),
                  bancoDestino: line.slice(36, 39).trim(),
                  agenciaDestino: line.slice(39, 43).trim(),
                  contaCorrenteDestino: line.slice(43, 55).trim(),
                  contaCorrenteDestinoDigVerif: line.slice(55, 56).trim(),
                  tipoContaDestino: line.slice(56, 58).trim(),
                  vlTransfDestino: line.slice(58, 71).trim(),
                  nroSequencial: line.slice(71, 77).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.trb`, trb, 75);

        return trb
      } catch (error) {
        console.error(
          "error from InserirTrb function from /controllers/controller.trb.js",
          error
        );
        return null
      }
    },
    /**
     * @param {infoArgument} info
     * @description Retorna os campos inseridos ou NULL em caso de erro. Toma "item" como único parâmetro, contendo:  
     * - text = Conteúdo do arquivo.  
     * - data = Data do arquivo.  
     * - sch = O schema a inserir.  
     * - codOrgao = Orgão responsável pelo arquivo.
     * @returns {Object}
     */
    uoc: async function (info) {
      const { text, data, sch } = info
      const uoc = [];

      try {
        const lines = await text.split("\n");

        let dataHelper = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.slice(0, 2) !== "99") {
            if (line.substring(0, 2) === "10") {
              dataHelper++;
              uoc.push({
                data,
                content: {
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  descrição: line.slice(6, 56).trim(),
                  numConsolidacao: line.slice(56, 58).trim(),
                  nroSequencial: line.slice(384, 390).trim(),
                  content: [],
                  line
                },
              });
            } else if (line.substring(0, 2) === "11") {
              if (
                uoc[dataHelper] &&
                uoc[dataHelper].content &&
                Array.isArray(uoc[dataHelper].content.content)
              ) {
                uoc[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  cpfOrdenadorDespesa: line.slice(6, 17).trim(),
                  dataInicio: line.slice(17, 25).trim(),
                  tipoResponsável: line.slice(25, 26).trim(),
                  dataFim: line.slice(26, 34).trim(),
                  nomeOrdendorDespesa: line.slice(34, 84).trim(),
                  cargoOrdenadorDespesa: line.slice(84, 134).trim(),
                  lograResOrdenador: line.slice(134, 184).trim(),
                  setorLograOrdenador: line.slice(184, 204).trim(),
                  cidadeLograOrdenador: line.slice(204, 224).trim(),
                  ufCidadeLograOrdendor: line.slice(224, 226).trim(),
                  cepLograOrdenador: line.slice(226, 234).trim(),
                  foneOrdenador: line.slice(234, 244).trim(),
                  email: line.slice(244, 324).trim(),
                  escolaridade: line.slice(324, 326).trim(),
                  nroSequencial: line.slice(384, 390).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "12") {
              if (
                uoc[dataHelper] &&
                uoc[dataHelper].content &&
                Array.isArray(uoc[dataHelper].content.content)
              ) {
                uoc[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  cpf: line.slice(6, 17).trim(),
                  dtInicio: line.slice(17, 25).trim(),
                  dtFinal: line.slice(25, 33).trim(),
                  nome: line.slice(33, 83).trim(),
                  crc: line.slice(83, 94).trim(),
                  ufCrc: line.slice(94, 96).trim(),
                  provimento: line.slice(96, 98).trim(),
                  cnpjEmpresaTerceirizada: line.slice(98, 112).trim(),
                  razaoSocialTerceirizada: line.slice(112, 192).trim(),
                  lograRes: line.slice(192, 242).trim(),
                  setorLogra: line.slice(242, 262).trim(),
                  cidadeLogra: line.slice(262, 282).trim(),
                  ufCidadeLogra: line.slice(282, 284).trim(),
                  cepLogra: line.slice(284, 292).trim(),
                  fone: line.slice(292, 302).trim(),
                  email: line.slice(302, 382).trim(),
                  escolaridade: line.slice(382, 384).trim(),
                  nroSequencial: line.slice(384, 390).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "13") {
              if (
                uoc[dataHelper] &&
                uoc[dataHelper].content &&
                Array.isArray(uoc[dataHelper].content.content)
              ) {
                uoc[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  cpf: line.slice(6, 17).trim(),
                  dtInicio: line.slice(17, 25).trim(),
                  dtFinal: line.slice(25, 33).trim(),
                  nome: line.slice(33, 83).trim(),
                  lograRes: line.slice(83, 133).trim(),
                  setorLogra: line.slice(133, 153).trim(),
                  cidadeLogra: line.slice(153, 173).trim(),
                  ufCidadeLogra: line.slice(173, 175).trim(),
                  cepLogra: line.slice(175, 183).trim(),
                  fone: line.slice(183, 193).trim(),
                  email: line.slice(193, 273).trim(),
                  escolaridade: line.slice(273, 275).trim(),
                  nroSequencial: line.slice(384, 390).trim(),
                  line
                });
              }
            } else if (line.substring(0, 2) === "14") {
              if (
                uoc[dataHelper] &&
                uoc[dataHelper].content &&
                Array.isArray(uoc[dataHelper].content.content)
              ) {
                uoc[dataHelper].content.content.push({
                  tipoRegistro: line.slice(0, 2).trim(),
                  codOrgao: line.slice(2, 4).trim(),
                  codUnidade: line.slice(4, 6).trim(),
                  cpf: line.slice(6, 17).trim(),
                  dtInicio: line.slice(17, 25).trim(),
                  dtFinal: line.slice(25, 33).trim(),
                  nome: line.slice(33, 83).trim(),
                  oab: line.slice(83, 91).trim(),
                  ufOab: line.slice(91, 93).trim(),
                  provimento: line.slice(93, 95).trim(),
                  cnpjEmpresaTerceirizada: line.slice(95, 109).trim(),
                  razaoSocialTerceirizada: line.slice(109, 189).trim(),
                  lograRes: line.slice(189, 239).trim(),
                  setorLogra: line.slice(239, 259).trim(),
                  cidadeLogra: line.slice(259, 279).trim(),
                  ufCidadeLogra: line.slice(279, 281).trim(),
                  cepLogra: line.slice(281, 289).trim(),
                  fone: line.slice(289, 299).trim(),
                  email: line.slice(299, 379).trim(),
                  nroSequencial: line.slice(384, 390).trim(),
                  line
                });
              }
            }
          }
        }

        await db.batchInsert(`${sch}.uoc`, uoc, 75);

        return uoc
      } catch (error) {
        console.error(
          "error from InserirUoc function from /controllers/controller.uoc.js",
          error
        );
        return null
      }
    },
  },
  special: {
    addValtoLnc
  }
}

function verificarCod(tipo12, codFonteRecurso, rubrica, codAplicacao) {
  return (
    rubrica.includes(tipo12.rubrica) &&
    codFonteRecurso.includes(tipo12.codFonteRecurso.substring(0, 3)) &&
    codAplicacao.includes(tipo12.codFonteRecurso.substring(3, 6))
  );
}