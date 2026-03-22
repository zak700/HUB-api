import natureza from "../../helpers/natureza.js"
import layoutMSC from "./layoutMSC.js"
import { StatusCodes } from "http-status-codes"
import { db } from "../../database/postgres.js"

export default async function balanceteContabil(req, res) {
  const { lancamento, codOrgao, date } = req.params
  try {
    if (lancamento === "N") {
      const lnc = (await db("lnc").select("*")).filter(
        (lnc) => lnc.content.codOrgao === codOrgao.padStart(2, "0")
      )
      const response = []
      const datesToSee = Array.from({ length: parseInt(date.substring(0, 2)) }, (_, i) => String(i + 1).padStart(2, "0") + date.substring(2))
      const layoutMSC_map = new Map(Object.keys(layoutMSC).map((e) => ([e.padStart(9, "0"), layoutMSC[e]])))
      const layoutMSC_sinteticas_map = new Map(Object.keys(layoutMSC).filter((e) => layoutMSC[e].tipoConta?.toUpperCase() === "S").map((e) => ([e.replace(/0*$/, ""), layoutMSC[e]])))
      const contas = {}
      const template = {
        titulo: "",
        s_a: "",
        f_p: "",
        saldo_anterior: "0,00",
        D: "0,00",
        C: "0,00",
      }

      datesToSee.forEach((date, i) => {
        const filteredLnc = lnc.filter((e) => e.data === date)
        let allSum = { C: "0,00", D: "0,00" }
        filteredLnc.forEach((lnc10) => {
          lnc10.content.content.forEach((lnc11) => {
            if (lnc11.tipoRegistro !== "11") return
            if (!lnc11.codConta.startsWith("1")) return
            allSum[lnc11.natLancamento] = natureza.sumRS([allSum[lnc11.natLancamento], lnc11.valor])[0]
          })
        })
        console.log(`Total Lançado na data ${date} (${filteredLnc.length} arquivos): R$ ${allSum.D}, ${allSum.C}`)

        if (filteredLnc.length === 0) res.status(404).json({ message: "Erro: Campo LNC não importado na data: " + date })
        filteredLnc.forEach((lnc10) => {
          lnc10.content.content.forEach((lnc11) => {
            if (lnc11.tipoRegistro !== "11") return
            const cod = lnc11.codConta.substring(0, 9)
            if (cod in contas) {
              if (!date.startsWith("01")) {
                if (lnc11.natLancamento === "D") {
                  contas[cod].D = natureza.sumRS([contas[cod].D, lnc11.valor])[0]
                } else {
                  contas[cod].C = natureza.sumRS([contas[cod].C, lnc11.valor])[0]
                }
                return
              }
              if (lnc10.content.tipoLancamento === "1") {
                if (lnc11.natLancamento === "D") {
                  contas[cod].saldo_anterior = natureza.sumRS([contas[cod].saldo_anterior, lnc11.valor])[0]
                } else {
                  contas[cod].saldo_anterior = natureza.subRS([contas[cod].saldo_anterior, lnc11.valor])[0]
                }
              } else {
                if (lnc11.natLancamento === "D") {
                  contas[cod].D = natureza.sumRS([contas[cod].D, lnc11.valor])[0]
                } else {
                  contas[cod].C = natureza.sumRS([contas[cod].C, lnc11.valor])[0]
                }
              }
            } else {
              const mapped = layoutMSC_map.get(cod)
              if (date.startsWith("01")) {
                const values = {
                  titulo: mapped.titulo || "",
                  s_a: mapped.tipoConta || "",
                  f_p: { 1: "F", 2: "P" }[lnc11.atributoConta],
                  saldo_anterior: lnc10.content.tipoLancamento !== "1"
                    ? "0,00"
                    : lnc11.natLancamento === "D"
                      ? natureza.sumRS(["0,00", lnc11.valor])[0]
                      : natureza.subRS(["0,00", lnc11.valor])[0],
                  D: lnc11.natLancamento === "D" && lnc10.content.tipoLancamento !== "1"
                    ? natureza.toRS(lnc11.valor.replace(/^0*/, "").replace(",", "."))
                    : "0,00",
                  C: lnc11.natLancamento === "C" && lnc10.content.tipoLancamento !== "1"
                    ? natureza.toRS(lnc11.valor.replace(/^0*/, "").replace(",", "."))
                    : "0,00",
                }
                contas[cod] = { ...template, ...values }
              } else {
                const values = {
                  titulo: mapped.titulo || "",
                  s_a: mapped.tipoConta || "",
                  f_p: { 1: "F", 2: "P" }[lnc11.atributoConta],
                  saldo_anterior: "0,00",
                  D: lnc11.natLancamento === "D" ? natureza.toRS(lnc11.valor.replace(/^0*/, "").replace(",", ".")) : "0,00",
                  C: lnc11.natLancamento === "C" ? natureza.toRS(lnc11.valor.replace(/^0*/, "").replace(",", ".")) : "0,00",
                }
                contas[cod] = { ...template, ...values }
              }
            }
          })
        })
        if (i !== datesToSee.length - 1) {
          Object.keys(contas).forEach((key) => {
            contas[key] = {
              ...contas[key],
              saldo_anterior: natureza.subRS([natureza.sumRS([contas[key].saldo_anterior, contas[key].D])[0], contas[key].C])[0],
              D: "0,00",
              C: "0,00"
            }
          })
        }
      })

      console.log(contas)

      const contasKeys = Object.keys(contas)

      Array.from(layoutMSC_sinteticas_map.keys()).forEach((cod) => {
        const toEnv = { ...template }
        const fetchedContas = contasKeys.filter((key) => key.startsWith(cod))
        if (!fetchedContas.length) return
        const contaMSC = layoutMSC_sinteticas_map.get(cod)
        toEnv.titulo = contaMSC.titulo
        toEnv.s_a = contaMSC.tipoConta
        fetchedContas.forEach((key) => {
          toEnv.D = natureza.sumRS([toEnv.D, contas[key].D])[0]
          toEnv.C = natureza.sumRS([toEnv.C, contas[key].C])[0]
          toEnv.saldo_anterior = natureza.sumRS([toEnv.saldo_anterior, contas[key].saldo_anterior])[0]
        })

        contas[cod] = toEnv
      })
      response.push(...Object.keys(contas))
      response.sort()
      const output = response.map((key) => ([
        key,
        contas[key].titulo,
        contas[key].s_a,
        contas[key].f_p,
        contas[key].saldo_anterior.replace("-", ""),
        contas[key].saldo_anterior[0] === "-" ? "C" : "D",
        contas[key].D,
        contas[key].C,
        ((contas[key].saldo_anterior[0] === "-" ? "C" : "D") === "D"
          ? natureza.subRS([natureza.sumRS([contas[key].saldo_anterior, contas[key].D])[0], contas[key].C])[0]
          : natureza.subRS([natureza.sumRS([contas[key].saldo_anterior.replace("-", ""), contas[key].C])[0], contas[key].D])[0]).replace("-", ""),
        ((contas[key].saldo_anterior[0] === "-" ? "C" : "D") === "D"
          ? natureza.subRS([natureza.sumRS([contas[key].saldo_anterior, contas[key].D])[0], contas[key].C])[0]
          : natureza.subRS([natureza.sumRS([contas[key].saldo_anterior.replace("-", ""), contas[key].C])[0], contas[key].D])[0])[0] === "-" ? "C" : "D"
      ]))

      return res.status(StatusCodes.OK).json({ response: output })
    }
  } catch (error) {
    console.error(
      "error from balanceteContabil function from /controllers/balanceteContabil/balanceteContabil.js",
      error
    );
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Ocorreu um erro interno no servidor." });
  }
}