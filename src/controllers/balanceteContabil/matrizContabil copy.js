import { StatusCodes } from "http-status-codes";
import { db, query } from "../../database/postgres.js";
import natureza from "../../helpers/natureza.js";
import layoutMSC from "./layoutMSC.js";

export default async function matrizContabil(req, res) {
  try {
    const { codOrgao, date, consolidado } = req.body


    if (!date) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Ano e mês são campos obrigatórios." });
    if (!codOrgao && !consolidado) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Código do órgão é um campo obrigatório caso não seja consolidado." });
    let toOutput = false
    // Pre-compute layout lookup map for O(1) access
    const layoutMSC_corrected = new Map(
      Object.entries(layoutMSC).map(([key, value]) => [key.padEnd(9, "0"), value])
    )

    // Parallelize database queries
    const [lncRaw, empRaw, recRaw, aexRaw, rawOrgaos, aocRaw] = await Promise.all([
      db("lnc").select("*"),
      db("emp").select("*"),
      db("rec").select("*"),
      db("aex").select("*"),
      db("orgao").select("*"),
      db("aoc").select("*")
    ])

    const dates = []

    for (let mes = 1; mes <= (parseInt(date.substring(0, 2))); mes++) {
      dates.push(String(mes).padStart(2, "0") + date.substring(2))
    }

    const response = []
    const unfiltered = []
    let ending_values = {}
    const addEndingValues = (values = []) => {
      values.forEach((e) => {
        const key = e.filter((_, i) => i <= 12).join("_") + "_" + e[15]
        ending_values[key] = e[13]
      })
    }

    const getEndingValuesAsArray = (getAs = "beginning_balance") => {
      const array = Object
        .keys(ending_values)
        .flatMap((key) => [
          key.split("_").toSpliced(
            13,
            0,
            ending_values[key],
            getAs
          )
        ])

      return array
    }

    const orgaosTipo = {}

    rawOrgaos.forEach((e) => {
      orgaosTipo[e.codOrgao] = e.tipoOrgao
    })

    const pastDates = []

    dates.forEach((date, i) => {
      pastDates.push(pastDates)
      // Apply organ filter if not consolidated
      if (i === dates.length - 1) toOutput = true
      const emp11MapAllDates = new Map(
        (consolidado ? empRaw : empRaw.filter((e) => (e.content.codOrgao === codOrgao) && pastDates.includes(e.data)))
          .map((e) => e.content.content)
          .flat()
          .filter((e) => e.tipoRegistro === "11")
          .map(e => [`${e.nroEmpenho}|${e.codOrgao}`, e])
      )
      const emp11MapAllDatesforAop = new Map(
        (consolidado ? empRaw : empRaw.filter((e) => (e.content.codOrgao === codOrgao) && pastDates.includes(e.data)))
          .map((e) => e.content.content)
          .flat()
          .filter((e) => e.tipoRegistro === "11")
          .map(e => [`${e.codPrograma}${e.codOrgao}${e.codUnidade}${e.codFuncao}${e.codSubFuncao}${e.naturezaAcao}${e.nroProjAtiv}${e.elementoDespesa}`, e])
      )
      const emp11MapAllDatesforAoc = new Map(
        (consolidado ? empRaw : empRaw.filter((e) => (e.content.codOrgao === codOrgao) && pastDates.includes(e.data)))
          .map((e) => e.content.content)
          .flat()
          .filter((e) => e.tipoRegistro === "11")
          .map(e => [
            e.codPrograma +
            e.codOrgao +
            e.codUnidade +
            e.codFuncao +
            e.codSubFuncao +
            e.naturezaAcao +
            e.nroProjAtiv +
            e.elementoDespesa, e
          ])
      )
      const lnc = (consolidado ? lncRaw : lncRaw.filter((e) => e.content.codOrgao === codOrgao)).filter((e) => e.data === date)
      const emp = (consolidado ? empRaw : empRaw.filter((e) => e.content.codOrgao === codOrgao)).filter((e) => e.data === date)
      const rec = (consolidado ? recRaw : recRaw.filter((e) => e.content.codOrgao === codOrgao)).filter((e) => e.data === date)
      const aex = (consolidado ? aexRaw : aexRaw.filter((e) => e.content.codOrgao === codOrgao)).filter((e) => e.data === date)
      const aoc = (consolidado ? aocRaw : aocRaw.filter((e) => e.content.codOrgao === codOrgao)).filter((e) => e.data === date)

      // Pre-compute lookup maps for O(1) access
      const aex11Array = aex.map((e) => e.content.content).flat().filter((e) => e.tipoRegistro === "11")
      const emp11Array = emp.map((e) => e.content.content).flat().filter((e) => e.tipoRegistro === "11")
      const rec12Array = rec.map((e) => e.content.content).flat().filter((e) => e.tipoRegistro === "12")
      const aoc11Array = aoc.map((e) => e.content.content).flat().filter((e) => e.tipoRegistro === "11")
      const aex11Map = new Map(aex11Array.map(e => [
        `${e.codOrgao}|${e.dataAnulacao}|${e.nrExtraOrcamentaria}`,
        e
      ]))
      const aoc11Map = new Map(aoc11Array.map(e => [
        e.codPrograma +
        e.codOrgao +
        e.codUnidade +
        e.codFuncao +
        e.codSubFuncao +
        e.naturezaAcao +
        e.nroProjAtiv + "|" +
        e?.vlAlteracao?.replace(/^0*/, ""), e
      ]))
      const emp11Map = new Map(emp11Array.map(e => [`${e.nroEmpenho}|${e.codOrgao}`, e]))
      const emp11MapForAop = new Map(emp11Array.map(e => [
        e.codPrograma +
        e.codOrgao +
        e.codUnidade +
        e.codFuncao +
        e.codSubFuncao +
        e.naturezaAcao +
        e.nroProjAtiv +
        e.elementoDespesa +
        e.subElemento,
        e
      ]))
      const rec12MapByRubrica = new Map(rec12Array.map(e => [`${e.rubrica}|${e.codOrgao}`, e]))
      const rec12MapByContaCorrente = new Map(rec12Array.filter(e => e.contaCorrente && e.contaCorrenteDigVerif).map(e => [`${e.contaCorrente}|${e.contaCorrenteDigVerif}|${e.codOrgao}`, e]))

      const contas = {}

      const addTobeginningBalance = []

        const PO_values = {
          "01": "10131",
          "02": "20231",
          "03": "10131",
          "04": "10131",
          "05": "10131",
          "06": "10131",
          "07": "10131",
          "08": "10131",
          "09": "10132",
          "10": "10131",
          "11": "10131",
          "12": "10131",
          "13": "10131",
          "14": "10131",
          "15": "10131",
          "16": "10131",
        }

      lnc.forEach((tipo10) => {
        tipo10.content.content.forEach((tipo11) => {
          if (tipo11.tipoRegistro !== "11") return
          const relevant = {
            codOrgao: tipo10.content.codOrgao,
            PO: PO_values[tipo10.content.codOrgao],
            tipo: { "1": "beginning_balance", "2": "period_change", "3": "ending_balance", "4": false }[tipo10.content.tipoLancamento],
            cod: tipo11.codConta.substring(0, 9),
            tipoArq: ["00", "REC", "ARE", "AOC", "EMP", "ANL", "LQD", "ALQ", "EXT", "AEX", "OPS", "AOP", "RSP", "CON", "CTB", "TRB"][parseInt(tipo11.tipoArquivoSicom)].toLowerCase(),
            layoutEntry: layoutMSC_corrected.get(tipo11.codConta.substring(0, 9)),
            chaveArq: {
              full: tipo11.chaveArquivo,
              ctb: {
                contaCorrente: tipo11.chaveArquivo.substring(135, 147),
                contaCorrenteDigVerif: tipo11.chaveArquivo.substring(147, 148),
              },
              aop: tipo11.chaveArquivo.substring(81, 106),
              anl: tipo11.chaveArquivo.substring(133, 139),
              ops: tipo11.chaveArquivo.substring(92, 115),
              lqd: tipo11.chaveArquivo.substring(97, 120),
              emp: tipo11.chaveArquivo.substring(144, 150),
              rec: tipo11.chaveArquivo.substring(141, 150),
              are: tipo11.chaveArquivo.substring(141, 150),
              aoc: tipo11.chaveArquivo.substring(133, 150) + "|" + tipo11.valor.replace(/^0*/, ""),
              alq: tipo11.chaveArquivo.substring(136, 142),
              ext: tipo11.chaveArquivo.substring(144, 150),
              aex: {
                data: tipo11.chaveArquivo.substring(142, 150),
                nrAnl: tipo11.chaveArquivo.substring(136, 142),
                codOrgao: tipo11.chaveArquivo.substring(123, 125),
              },
              con: tipo11.chaveArquivo.substring(0, 150),
              trb: tipo11.chaveArquivo.substring(0, 150),
              rsp: tipo11.chaveArquivo.substring(136, 142),
            },
            valor: tipo11.valor,
            natLancamento: tipo11.natLancamento,
            atributoConta: tipo11.atributoConta !== "0"
              ? tipo11.atributoConta
              : (layoutMSC_corrected.get(tipo11.codConta.substring(0, 9))
                ? { "F": "1", "P": "2" }[layoutMSC_corrected.get(tipo11.codConta.substring(0, 9)).indicador]
                : false) || false,
          }

          const layoutEntry = relevant.layoutEntry
          if (!layoutEntry || layoutEntry.tipoConta !== "A") {
            relevant.layout = { IC: [] }
          } else {
            relevant.layout = { IC: layoutEntry.IC }
          }

          if (!relevant.tipoArq) return

          if (!contas[relevant.cod]) contas[relevant.cod] = {
            variants: [],
            called: [],
            IC: relevant.layout.IC,
            indicador: relevant.atributoConta
          }
          if (!contas[relevant.cod].called.includes(relevant.tipoArq)) contas[relevant.cod].called.push(relevant.tipoArq)

          const current = { tipo: relevant.tipo, PO: relevant.PO, FP: relevant.atributoConta }

          if (relevant.tipoArq === "00") {
            const icsString = tipo11.adicionais.ICS.split(" ")[0];
            const IClocale = []
            const ICs = {}
            for (let i = 0; i < icsString.length; i += 1) {
              const str = icsString.substring(i, i + 3);
              if (/\w{2}\:/.test(str)) {
                IClocale.push(i);
              }
            }
            for (let i = 0; i < IClocale.length; i += 1) {
              const icCode = icsString.substring(IClocale[i], IClocale[i] + 2)
              const icValue = IClocale[i + 1] ? icsString.substring(IClocale[i] + 3, IClocale[i + 1]) : icsString.substring(IClocale[i] + 3)
              ICs[icCode] = icValue === "0000" ? "nan" : icValue
            }
            const values = {
              order: layoutEntry.IC,
              IC: {
                FR: ICs?.FR || relevant?.atributoConta ? "1869" : "nan",
                ...current,
                ...ICs,
              }
            }

            contas[relevant.cod].variants.push({
              valor: { C: "0,00", D: "0,00" },
              ...values
            })
            contas[relevant.cod].variants[contas[relevant.cod].variants.length - 1].valor[relevant.natLancamento] = natureza.sumRS([
              relevant.valor,
              contas[relevant.cod].variants[contas[relevant.cod].variants.length - 1].valor[relevant.natLancamento],
            ])[0]

            return
          }

          // inspect
          // if (relevant.tipoArq === "ops") console.log(relevant.tipoArq, relevant.chaveArq[relevant.tipoArq], relevant.chaveArq.ops + "|" + relevant.codOrgao)
          // console.log(relevant.tipoArq, tipo11.chaveArquivo)

          if (!relevant.atributoConta) return

          if (relevant.tipoArq === "aex") {
            const aex = aex11Map.get(`${relevant.chaveArq.aex.codOrgao}|${relevant.chaveArq.aex.data}|${relevant.chaveArq.aex.nrAnl}`)
            if (!aex) return
            current.FR = "1869"

            const variantIndex = (contas[relevant.cod].variants.push({
              valor: { C: "0,00", D: "0,00" },
              order: relevant.layout.IC,
              IC: current,
              caller: relevant.tipoArq,
            })) - 1

            contas[relevant.cod].variants[variantIndex].valor[relevant.natLancamento] = natureza.sumRS([
              relevant.valor,
              contas[relevant.cod].variants[variantIndex].valor[relevant.natLancamento],
            ])[0]

            // console.log(contas[relevant.cod].variants[variantIndex], variantIndex, relevant.cod)
          }

          if (["emp", "lqd", "ops", "anl", "aop", "aoc", "alq", "ext", "rsp"].includes(relevant.tipoArq)) {

            const vals = {
              emp: () => emp11Map.get(relevant.chaveArq.emp + "|" + relevant.codOrgao),
              ext: () => emp11Map.get(relevant.chaveArq.ext + "|" + relevant.codOrgao),
              lqd: () => emp11MapAllDatesforAop.get(relevant.chaveArq.lqd),
              rsp: () => emp11Map.get(relevant.chaveArq.rsp + "|" + relevant.codOrgao),
              alq: () => emp11MapAllDates.get(relevant.chaveArq.alq + "|" + relevant.codOrgao),
              ops: () => {
                const filtered = emp11MapAllDatesforAop.get(relevant.chaveArq.ops)
                return filtered
              },
              anl: () => emp11Map.get(relevant.chaveArq.anl + "|" + relevant.codOrgao),
              aop: () => emp11MapForAop.get(relevant.chaveArq.aop),
              aoc: () => {
                const aoc = aoc11Map.get(relevant.chaveArq.aoc)
                if (!aoc) { /* console.log("aoc fail"); */ return }
                const key = aoc.codPrograma +
                  aoc.codOrgao +
                  aoc.codUnidade +
                  aoc.codFuncao +
                  aoc.codSubFuncao +
                  aoc.naturezaAcao +
                  aoc.nroProjAtiv +
                  aoc.codNaturezaDaDespesa
                const emp = emp11MapAllDatesforAoc.get(
                  key
                )
                if (!emp) {
                  // console.log("emp failure", key)
                  return
                }
                return emp
              },
            }

            const filteredEmp = vals[relevant.tipoArq]()

            if (!filteredEmp) console.log(tipo11.chaveArquivo, "\n" + relevant.tipoArq, relevant.chaveArq[relevant.tipoArq], date, relevant.valor, relevant.cod, "\n" + relevant.layoutEntry.titulo, relevant.layoutEntry.IC, "\n-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-")

            if (!filteredEmp) return

            if (relevant.layout.IC.includes("ND")) current.ND = filteredEmp.elementoDespesaMSC + filteredEmp.subElementoMSC
            if (relevant.layout.IC.includes("FR")) current.FR = filteredEmp.codFontRecursosMSC
            if (relevant.layout.IC.includes("CO")) current.CO = filteredEmp.codAEO
            if (relevant.layout.IC.includes("FS")) current.FS = filteredEmp.codFuncao + filteredEmp.codSubFuncao


            const variantIndex = (contas[relevant.cod].variants.push({
              valor: { C: "0,00", D: "0,00" },
              order: relevant.layout.IC,
              IC: current,
              caller: relevant.tipoArq,
            })) - 1

            contas[relevant.cod].variants[variantIndex].valor[relevant.natLancamento] = natureza.sumRS([
              relevant.valor,
              contas[relevant.cod].variants[variantIndex].valor[relevant.natLancamento],
            ])[0]
          }

          if (["ctb", "rec", "are", "trb"].includes(relevant.tipoArq)) {

            const vals = {
              rec: () => rec12MapByRubrica.get(relevant.chaveArq.rec + "|" + relevant.codOrgao),
              are: () => {
                const recFound = rec12MapByRubrica.get(relevant.chaveArq.are + "|" + relevant.codOrgao)
                return recFound
              },
              ctb: () => rec12MapByContaCorrente.get(`${relevant.chaveArq.ctb.contaCorrente}|${relevant.chaveArq.ctb.contaCorrenteDigVerif}|${relevant.codOrgao}`),
              trb: () => {
                const a = 105
                // console.log(tipo11.chaveArquivo.substring(a, a + 13), "TRB")
                const recFound = rec12MapByContaCorrente.get(`${tipo11.chaveArquivo.substring(a, a + 12)}|${tipo11.chaveArquivo.substring(a + 12, a + 13)}|${relevant.codOrgao}`)
                if (!recFound) {
                  // console.log("failed to fetch rec12 for trb", `${tipo11.chaveArquivo.substring(a, a + 12)}|${tipo11.chaveArquivo.substring(a + 12, a + 13)}`)
                  return null
                }
                // console.log("found trb rec12", `${tipo11.chaveArquivo.substring(a, a + 12)}|${tipo11.chaveArquivo.substring(a + 12, a + 13)}`)
                return recFound
              }
            }

            const filteredRec = vals[relevant.tipoArq]()

            if (!filteredRec) {
              console.log("failed to fetch rec12 for " + relevant.tipoArq, relevant.chaveArq[relevant.tipoArq])
              if (relevant.tipo === "beginning_balance") addTobeginningBalance.push({
                cod: relevant.cod,
                valor: relevant.valor,
                natLancamento: relevant.natLancamento,
              })
            }

            if (!filteredRec) {
              // console.log("missing rec12 for", relevant.tipoArq, relevant.chaveArq)
              return
            }
            if (relevant.layout.IC.includes("FR")) current.FR = filteredRec.codFontRecursosMSC
            if (relevant.layout.IC.includes("CO")) current.CO = filteredRec.codAEO

            const variantIndex = (contas[relevant.cod].variants.push({
              valor: { C: "0,00", D: "0,00" },
              order: relevant.layout.IC,
              IC: current,
              caller: relevant.tipoArq,
            })) - 1

            contas[relevant.cod].variants[variantIndex].valor[relevant.natLancamento] = natureza.sumRS([
              relevant.valor,
              contas[relevant.cod].variants[variantIndex].valor[relevant.natLancamento],
            ])[0]
          }
        })
      })

      let output = [
        [
          "5220454EX",
          `${natureza.dataToYear(date)}-${date.substring(0, 2)}`,
          "",
          "",
          "",
        ],
        [
          "CONTA",
          "IC1",
          "TIPO1",
          "IC2",
          "TIPO2",
          "IC3",
          "TIPO3",
          "IC4",
          "TIPO4",
          "IC5",
          "TIPO5",
          "IC6",
          "TIPO6",
          "Valor",
          "Tipo_valor",
          "Natureza_valor"
        ],
      ]

      // console.log(output)

      const nonNaN = (string) => {
        if (typeof string !== "string") return ""
        return /^(nan)*$/.test(string) ? "" : string
      }

      // Filter out invalid IC values from variant orders
      for (const contaKey in contas) {
        const conta = contas[contaKey]
        conta.variants.forEach((variant) => {
          variant.order = variant.order.filter(e => nonNaN(variant.IC[e]))
        })
      }

      // Use Map to track output entries for O(1) lookup instead of O(n) search
      const outputMap = new Map()

      const sortedKeys = Object.keys(contas)
      sortedKeys.forEach((key) => {
        const conta = contas[key]
        if (conta.variants.length === 0) return
        conta.variants.forEach((variant) => {
          const val = natureza.subRS([
            variant.valor.D,
            variant.valor.C
          ])[0]

          const ICs = [
            nonNaN(variant.IC[variant.order[0]]) || "",
            nonNaN(variant.order[0]) || "",
            nonNaN(variant.IC[variant.order[1]]) || "",
            nonNaN(variant.order[1]) || "",
            nonNaN(variant.IC[variant.order[2]]) || "",
            nonNaN(variant.order[2]) || "",
            nonNaN(variant.IC[variant.order[3]]) || "",
            nonNaN(variant.order[3]) || "",
            nonNaN(variant.IC[variant.order[4]]) || "",
            nonNaN(variant.order[4]) || "",
            nonNaN(variant.IC[variant.order[5]]) || "",
            nonNaN(variant.order[5]) || "",
          ]

          const mapKey = `${key}|${ICs.join("|")}|${variant.IC.tipo}|${val.substring(0, 1) === "-" ? "C" : "D"}`
          const cleanVal = val.replaceAll("-", "").replaceAll(".", "").replaceAll(",", ".")

          if (outputMap.has(mapKey)) {
            const existing = outputMap.get(mapKey)
            existing[13] = (natureza.sumRS([
              existing[13].replaceAll(".", ","),
              cleanVal.replaceAll(".", ",")
            ])[0]).replaceAll(".", "").replaceAll(",", ".")
          } else {
            outputMap.set(mapKey, [
              key.padEnd(9, "0"),
              ...ICs,
              cleanVal,
              variant.IC.tipo,
              val.includes("-") ? "C" : "D"
            ])
          }
        })
      })

      // add past ending_balances as beginning_balances or a sum.
      getEndingValuesAsArray("beginning_balance").forEach((e) => {
        const keyBeg = e.filter((_, i) => i <= 12).join("|") + "|" + e[14] + "|" + e[15]
        const keyPeriod = e.filter((_, i) => i <= 12).join("|") + "|" + "period_change" + "|" + e[15]
        const keyEnd = e.filter((_, i) => i <= 12).join("|") + "|" + "ending_balance" + "|" + e[15]
        const has = outputMap.has(keyBeg) || outputMap.has(keyPeriod) || outputMap.has(keyEnd)
        if (!has) return
        if (outputMap.has(keyBeg)) {
          const beg = outputMap.get(keyBeg)
          beg[13] = (natureza.sumRS([
            beg[13].replaceAll(".", ","),
            e[13].replaceAll(".", ",")
          ])[0]).replaceAll(".", "").replaceAll(",", ".")
        } else {
          outputMap.set(keyBeg, e)
        }
      })

      // Rebuild output array from map
      output.push(...Array.from(outputMap.values()))

      addTobeginningBalance.forEach((e) => {
        const availableIndex = []
        output.forEach((line, index) => {
          if (line[0] === e.cod && line[14] === "beginning_balance" && line[15] === e.natLancamento) availableIndex.push(index)
        })

        if (availableIndex.length === 0) return
        availableIndex.forEach((i) => {
          const val = natureza.sumRS([
            output[i][13].replaceAll(".", ","),
            e.valor
          ])[0].replaceAll(".", "").replaceAll(",", ".")
          output[i][13] = val
        })

      })

      const all_period_changes = new Map(
        output
          .filter((e) => e[14] === "period_change")
          .map(
            (e) => [
              e.filter((_, i) => i <= 12).join() + "|" + e[15],
              e
            ]
          )
      )

      const withoutBeg = {}
      output.forEach((e, i) => {
        if ([0, 1].includes(i)) { return }
        const key = e.filter((_, i) => i <= 12).join("|")
        if (e[14] !== "beginning_balance") {
          if (!(key in withoutBeg)) {
            withoutBeg[key] = true
            return
          }
        } else {
          withoutBeg[key] = false
        }
      })

      Object.keys(withoutBeg).forEach((key) => {
        if (!withoutBeg[key]) return
        // console.log("adding missing beginning_balance for", key)
        const vals = key.split("|")
        const beginning_balance = [...vals]
        beginning_balance.push("0.00")
        beginning_balance.push("beginning_balance")
        beginning_balance.push("D")
        output.push(beginning_balance)

      })

      // merge beginning_balances
      const beginning_balances_verified = new Map()
      output.forEach((e) => {
        const verifiedKey = e.filter((_, i) => i <= 12).join("|")
        if (e[14] !== "beginning_balance") return
        if (!beginning_balances_verified.has(verifiedKey)) {
          beginning_balances_verified.set(verifiedKey, e)
          return
        }
        const existing = beginning_balances_verified.get(verifiedKey)
        existing[13] = existing[15] === e[15] ? natureza.sumRS([
          existing[13].replaceAll(".", ","),
          e[13].replaceAll(".", ",")
        ])[0].replaceAll(".", "").replaceAll(",", ".") : natureza.subRS([
          existing[13].replaceAll(".", ","),
          e[13].replaceAll(".", ",")
        ])[0].replaceAll(".", "").replaceAll(",", ".")

        if (existing[13].split("").includes("-")) {
          existing[13] = existing[13].replace("-", "")
          existing[15] = existing[15] === "D" ? "C" : "D"
        }
      })

      output = output.filter((e) => e[14] !== "beginning_balance")
      output.push(...Array.from(beginning_balances_verified.values()))

      // add ending_balance:

      Array.from(beginning_balances_verified.values()).forEach((e, i) => {
        const val = e.filter((_, i) => i <= 12).join()
        const period_change_D = all_period_changes.get(val + "|D")
        const period_change_C = all_period_changes.get(val + "|C")
        const ending_balance = [...e]
        ending_balance[14] = "ending_balance"
        if (!period_change_D && !period_change_C) {
          output.push(ending_balance)
          return
        }
        ending_balance[13] = ending_balance[15] === "D"
          ? natureza.subRS([
            natureza.sumRS([
              ending_balance[13].replaceAll(".", ","),
              period_change_D ? period_change_D[13].replaceAll(".", ",") : "0,00"
            ])[0],
            period_change_C ? period_change_C[13].replaceAll(".", ",") : "0,00"
          ])[0].replaceAll(".", "").replaceAll(",", ".")
          : natureza.subRS([
            natureza.sumRS([
              ending_balance[13].replaceAll(".", ","),
              period_change_C ? period_change_C[13].replaceAll(".", ",") : "0,00"
            ])[0],
            period_change_D ? period_change_D[13].replaceAll(".", ",") : "0,00"
          ])[0].replaceAll(".", "").replaceAll(",", ".");

        if (ending_balance[13].split("").includes("-")) {
          ending_balance[13] = ending_balance[13].replace("-", "")
          ending_balance[15] = ending_balance[15] === "D" ? "C" : "D"
        }
        output.push(ending_balance)
      })

      // store ending_balance_values
      addEndingValues(output.filter((e) => e[14] == "ending_balance"))

      if (toOutput) response.push(...output)
    })


    response.sort((a, b) => {
      // Sort by account code first
      if (a[0] !== b[0]) return parseInt(a[0]) - parseInt(b[0])

      const IC_PRIORITY = {
        CO: 1,
        NR: 2,
        FR: 3,
        ND: 4,
        FS: 5,
        PO: 6,
      }

      // Compare IC columns (positions 2, 4, 6, 8, 10, 12)
      for (let i = 2; i <= 12; i += 2) {
        const icType_a = a[i]
        const icType_b = b[i]

        if (icType_a !== icType_b) {
          return (IC_PRIORITY[icType_a] ?? 999) - (IC_PRIORITY[icType_b] ?? 999)
        }

        // If IC types match, compare their values
        const icValue_a = parseInt(a[i - 1]) || 0
        const icValue_b = parseInt(b[i - 1]) || 0
        if (icValue_a !== icValue_b) return icValue_a - icValue_b
      }

      // Finally sort by value
      const val_a = parseFloat(a[13].replace(".", ""))
      const val_b = parseFloat(b[13].replace(".", ""))
      return val_a - val_b
    })

    const validations = { final: { D: "0,00", C: "0,00" } }
    Array.from({ length: 9 }, (_, i) => i + 1).forEach((i) => {
      validations[i] = { C: "0,00", D: "0,00" }
    })
    response.forEach((e) => {
      Array.from({ length: 9 }, (_, i) => i + 1).forEach((i) => {
        if (e[0][0] === String(i) && e[14] === "ending_balance") {
          validations[i][e[15]] = natureza.sumRS([
            validations[i][e[15]],
            e[13].replaceAll(".", ",")
          ])[0]
          validations.final[e[15]] = natureza.sumRS([
            validations.final[e[15]],
            e[13].replaceAll(".", ",")
          ])[0]
        }
      })
    })
    console.log("validations", validations)


    return res.status(StatusCodes.OK).json({ output: response.filter((e) => e[13] !== "0.00"), validations });
  } catch (error) {
    console.error(
      "error from matrizContabil function from /controllers/balanceteContabil/matrizContabil.js",
      error
    );
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Ocorreu um erro interno no servidor." });
  }
}