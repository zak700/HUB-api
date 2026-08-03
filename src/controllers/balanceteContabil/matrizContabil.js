import { StatusCodes } from "http-status-codes";
import { db, query } from "../../database/postgres.js";
import natureza from "../../helpers/natureza.js";
import ctaSldInicial from "../campos/addicionalInfo/ctaSldInicial.js";

export default async function matrizContabil(req, res) {
  try {
    const { codOrgao, date, consolidado } = req.body
    const user = await natureza.getUser(req)

    const PO_values = natureza.PO_values

    const layoutMSC_corrected = (await natureza.getLayoutMSC(natureza.dataToYear(date), user.schema)).filteredTipoConta("A").asMap()
    if (!date) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Ano e mês são campos obrigatórios." });
    if (!codOrgao && !consolidado) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Código do órgão é um campo obrigatório caso não seja consolidado." });
    let response = []
    const allDates = Array.from({ length: parseInt(date.substring(0, 2)) }, (_, i) => String(i + 1).padStart(2, "0") + date.substring(2));

    const [lnc, emp, rec, aex, orgao, aoc] = consolidado ? await Promise.all([
      db(user.schema + ".lnc").select("*"),
      db(user.schema + ".emp").select("*"),
      db(user.schema + ".rec").select("*"),
      db(user.schema + ".aex").select("*"),
      db(user.schema + ".orgao").select("*"),
      db(user.schema + ".aoc").select("*")
    ]) : await Promise.all([
      db(user.schema + ".lnc").select("*").whereRaw(`content->>'codOrgao' = '${codOrgao.padStart(2, "0")}'`),
      db(user.schema + ".emp").select("*").whereRaw(`content->>'codOrgao' = '${codOrgao.padStart(2, "0")}'`),
      db(user.schema + ".rec").select("*").whereRaw(`content->>'codOrgao' = '${codOrgao.padStart(2, "0")}'`),
      db(user.schema + ".aex").select("*").whereRaw(`content->>'codOrgao' = '${codOrgao.padStart(2, "0")}'`),
      db(user.schema + ".orgao").select("*").whereRaw(`content->>'codOrgao' = '${codOrgao.padStart(2, "0")}'`),
      db(user.schema + ".aoc").select("*").whereRaw(`content->>'codOrgao' = '${codOrgao.padStart(2, "0")}'`),
    ]);

    const allContas = {}

    const toNormalVal = (str) => {
      return str.replace(/^0+/, "") || "0,00"
    }

    allDates.forEach((d) => {
      lnc.filter((lncItem) => lncItem.data === d).map((lncItem) => lncItem.content).forEach((tipo10, index10) => {
        tipo10.content.forEach((tipo11) => {
          if (tipo11.tipoRegistro !== "11") return;
          const relevant = {
            codOrgao: tipo10.codOrgao,
            PO: tipo11.PO,
            tipo: { "1": "beginning_balance", "2": "period_change", "3": "period_change", "4": "period_change" }[tipo10.tipoLancamento],
            cod: tipo11.codConta.substring(0, 9),
            tipoArq: ["00", "REC", "ARE", "AOC", "EMP", "ANL", "LQD", "ALQ", "EXT", "AEX", "OPS", "AOP", "RSP", "CON", "CTB", "TRB"][parseInt(tipo11.tipoArquivoSicom)].toLowerCase(),
            layoutEntry: layoutMSC_corrected.get(tipo11.codConta.substring(0, 9)),
            valor: tipo11.valor,
            natLancamento: tipo11.natLancamento,
            atributoConta: tipo11.atributoConta !== "0"
              ? tipo11.atributoConta
              : (layoutMSC_corrected.get(tipo11.codConta.substring(0, 9))
                ? { "F": "1", "P": "2" }[layoutMSC_corrected.get(tipo11.codConta.substring(0, 9)).indicador]
                : false) || false,
          }

          let conta = {
            valor: toNormalVal(relevant.valor),
            natureza: relevant.natLancamento,
            atributoConta: relevant.atributoConta,
            tipoLancamento: relevant.tipo,
            has: relevant.layoutEntry.IC,
            IC: {
              PO: relevant.PO,
              FP: relevant.atributoConta || relevant.layoutEntry.indicador || "nan",
            }
          }

          const contaICs = relevant.layoutEntry.values
          if (!contaICs) {
            console.log(tipo11.codConta.substring(0, 9), 'WAS NOT FOUND!!!')
            return
          }
          // adicionar ICS

          if (tipo11.subCampos) {
            console.log(tipo11)
            tipo11.subCampos.forEach((e) => {
              if (!e) {
                console.log(e, "ERROROROROR")
                return
              }
              let contaCopy = { ...conta }

              contaCopy.valor = e.valor
              contaCopy.natureza = e.natureza
              contaCopy.IC = {
                ...contaCopy.IC,
                ND: e.ND,
                FS: e.FS,
                AI: e.AI,
                FR: e.FR,
                PO: relevant.PO
              }
              // tudo abaixo prepara para enviar
              // cleanup
              Object.entries(contaCopy.IC).forEach(([key, value]) => {
                if (value === "nan" || !value) {
                  if (key === "CO") {
                    contaCopy.IC[key] = "0000"
                  }
                  delete contaCopy.IC[key]
                }
              })

              // check
              contaCopy?.has?.forEach((key) => {
                if (!contaCopy.IC[key] && !["CO", "FP"].includes(key)) {
                  console.log(`Valor ${key} faltando no LNC ${index10}:`, tipo11, contaCopy)
                }
              })
              allContas[relevant.cod]?.push(contaCopy) || (allContas[relevant.cod] = [contaCopy])
            })
            return
          }

          const ICs = {}
          Object.entries(tipo11).forEach(([key, value]) => {
            if (relevant.layoutEntry.values.includes(key) && key !== "PO") {
              ICs[key] = value
            }
          })

          if (ICs.ND && ICs.ND === "nannan") {
            console.table([{ codConta: tipo11.codConta.substring(0, 9), tipoArquivoSicom: tipo11.tipoArquivoSicom, chaveArquivo: tipo11.chaveArquivo.substring(50), valor: tipo11.valor }])
          }

          conta.IC = { ...conta.IC, ...ICs, }

          // cleanup
          Object.entries(conta.IC).forEach(([key, value]) => {
            if (value.includes("nan") || !value) {
              delete conta.IC[key]
            }
            if (key === "CO" && value === "0000") delete conta.IC[key]
          })

          // check
          conta?.has?.forEach((key) => {
            if (!conta.IC[key] && !["CO", "FP"].includes(key)) {
              console.log(`Valor ${key} faltando no LNC ${index10}:`, tipo11, conta)
            }
          })

          if (conta?.IC?.FP === "0") delete conta.IC.FP
          if (conta?.IC?.NR) conta.IC.NR = conta.IC.NR.substring(conta.IC.NR.length - 8)

          allContas[relevant.cod]?.push(conta) || (allContas[relevant.cod] = [conta])
        })
        // if (d.substring(0,2) === "01") {
        //   Object.keys(allContas).forEach((codConta) => {
        //     
        //     allContas[codConta] = allContas[codConta].filter((e) => e.tipoLancamento !== "beginning_balance")
        //     const ini = ctaSldInicial.find((e) => e.cod === codConta)
        //     if (!ini) return
        //     const ics = {}
        //     for (let i = 0; i < ini.ic.length; i += 2) {
        //       ics[ini.ic[i + 1]] = ini.ic[i]
        //     }
        //     console.log(allContas[codConta])
        //     allContas[codConta].push({
        //       valor: ini.sldInicial,
        //       IC: ics,
        //       natureza: ini.naturezaValor,
        //       tipoLancamento: "beginning_balance",
        //       has: undefined,
        //       atributoConta: false,
        //     })
        //   })
        // }
      });

      const orgByKey = {}

      Object.entries(allContas).forEach(([key, value]) => {
        orgByKey[key] = {}
        value.forEach((e) => {
          console.log(e)
          const valKey = Object.entries(e.IC).map(([k, v]) => `${k}:${v}|`).join("") + `${e.tipoLancamento}|` + e.natureza
          if (valKey in orgByKey[key]) {
            orgByKey[key][valKey] = natureza.sumRS([orgByKey[key][valKey], e.valor])[0]
          } else {
            orgByKey[key][valKey] = e.valor.replace(/^0+/, "")
          }
        })
      })

      Object.entries(orgByKey).forEach(([key, value]) => {
        Object.entries(value).forEach(([k, v]) => {
          const separated_IC = []
          const Eval = k.split("|").toSpliced(0, k.split("|").length - 2)
          const ICs = Object.fromEntries(k.split("|").toSpliced(k.split("|").length - 3).map((e) => e.split(":")))
          const got = layoutMSC_corrected.get(key)
          got.values.forEach((e) => {
            if (ICs[e]) {
              separated_IC.push(e, ICs[e])
            } else {
              separated_IC.push(e, "Sem valor")
            }
          })
          const length = separated_IC.length
          for (let i = 0; i < (12 - length); i++) {
            separated_IC.push("")
          }
          const pushVal = [key, ...separated_IC, v, ...Eval]
          console.log(pushVal)
          const i = response.push(pushVal)
        })
      })

      const hasBeg = {}
      response.forEach((e, i) => {
        const key = e.filter((_, i) => i <= 12).join("|")
        if (key in hasBeg) {
          if (e[14] === "beginning_balance") {
            hasBeg[key] = true
          }
        } else {
          hasBeg[key] = e[14] === "beginning_balance"
        }
      })

      const all_beginning_balances = response.filter((e) => e[14] === "beginning_balance")
        .map((e) => [e.filter((_, i) => i <= 12).join("|"), e])

      response = response.filter((e) => e[14] !== "beginning_balance")

      Object.entries(hasBeg).forEach(([k, v]) => {
        if (!v) {
          response.push([...k.split("|"), "0,00", "beginning_balance", "D"])
          return
        }

        // merge beginning_balances
        const beg = all_beginning_balances.filter((e) => e[0] === k)
        if (beg.length > 1) {
          let finalVal = "0,00"
          const consolidado = [...beg[0][1]]
          beg.forEach(([_, val]) => {
            finalVal = val[15] === "D"
              ? natureza.sumRS([finalVal, val[13]])[0]
              : natureza.subRS([finalVal, val[13]])[0]
          })
          if (finalVal.startsWith("-")) {
            consolidado[13] = finalVal.substring(1)
            consolidado[15] = "C"
          } else {
            consolidado[13] = finalVal
            consolidado[15] = "D"
          }
          response.push(consolidado)
        } else {
          response.push(beg[0][1])
        }
      })

      const all_period_changes = new Map(response.filter((e) => e[14] === "period_change")
        .map((e) => [e.filter((_, i) => i <= 12).join("|") + "|" + e[15], e]))

      // add ending_balance
      const ending_balances = []
      response.filter((e) => e[14] === "beginning_balance").forEach((value) => {
        const key = value.filter((_, i) => i <= 12).join("|")
        const ending_balance = [...value]
        ending_balance[14] = "ending_balance"

        const period_change = {
          C: all_period_changes.get(key + "|C") || natureza.zerado(15),
          D: all_period_changes.get(key + "|D") || natureza.zerado(15)
        }

        ending_balance[13] = value[15] === "D"
          ? natureza.subRS([
            natureza.sumRS([value[13], period_change.D[13]])[0],
            period_change.C[13]
          ])[0]
          : natureza.subRS([
            natureza.sumRS([value[13], period_change.C[13]])[0],
            period_change.D[13]
          ])[0]

        if (ending_balance[13].startsWith("-")) {
          ending_balance[13] = ending_balance[13].substring(1)
          ending_balance[15] = ending_balance[15] === "D" ? "C" : "D"
        }

        ending_balances.push(ending_balance)
      })
      response.push(...ending_balances)

      if (d !== date) {
        const newRes = []
        response.forEach((e) => {
          if (e[14] !== "ending_balance") return
          const newOne = [...e]
          newOne[14] = "beginning_balance"
          newRes.push(newOne)
        })
        console.table(newRes)
        response = newRes
      }
    })

    const validations = { final: { D: "0,00", C: "0,00", f: "0,00" } }

    Array.from({ length: 8 }, (_, i) => i + 1).forEach((i) => {
      validations[i] = { C: "0,00", D: "0,00", f: "0,00" }
    })

    response.forEach((e) => {
      Array.from({ length: 8 }, (_, i) => i + 1).forEach((i) => {
        if (e[0][0] == String(i) && e[14] === "ending_balance") {

          validations[i][e[15]] = natureza.sumRS([
            validations[i][e[15]],
            e[13]
          ])[0]

          validations.final[e[15]] = natureza.sumRS([
            validations.final[e[15]],
            e[13]
          ])[0]

          if (e[15] === "D") {
            validations[i].f = natureza.sumRS([validations[i].f, e[13]])[0]
            validations.final.f = natureza.sumRS([validations.final.f, e[13]])[0]
          } else {
            validations[i].f = natureza.subRS([validations[i].f, e[13]])[0]
            validations.final.f = natureza.subRS([validations.final.f, e[13]])[0]
          }


        }
      })
    })

    console.log("validations", validations)


    const responseSorted = response
      .map((e) => e.map((e) => e.padEnd(20, " ")).join("|"))
      .toSorted()
      .map((e) => e.split("|").map((e) => e.trim()))

    return res.status(StatusCodes.OK).json({
      output: [
        ["5220454EX", `${natureza.dataToYear(date)}-${date.substring(0, 2)}`, "", "", "",],
        [
          "CONTA", "IC1", "TIPO1", "IC2", "TIPO2", "IC3", "TIPO3", "IC4", "TIPO4",
          "IC5", "TIPO5", "IC6", "TIPO6", "Valor", "Tipo_valor", "Natureza_valor"
        ],
        ...responseSorted.map((e) => [
          e[0],
          e[2],
          e[1],
          e[4],
          e[3],
          e[6],
          e[5],
          e[8],
          e[7],
          e[10],
          e[9],
          e[12],
          e[11],
          e[13].replaceAll(".", "").replace(",", "."),
          ...e.toSpliced(0, 14)
        ])
          .filter((e) => e[13] !== "0.00")
      ],
      validations
    });
  } catch (error) {
    console.error(
      "error from matrizContabil function from /controllers/balanceteContabil/matrizContabil.js",
      error
    );
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Ocorreu um erro interno no servidor." });
  }
}