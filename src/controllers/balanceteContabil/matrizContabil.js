import { StatusCodes } from "http-status-codes";
import { db, query } from "../../database/postgres.js";
import natureza from "../../helpers/natureza.js";
import ctaSldInicial from "../campos/addicionalInfo/ctaSldInicial.js";

export default async function matrizContabil(req, res) {
  try {
    const { codOrgao, date, consolidado } = req.body

    const preRespMap = new Map()
    const response = []

    const user = await natureza.getUser(req)
    const layout = (await natureza.getLayoutMSC(natureza.dataToYear(date), user.schema)).asMap()
    /**
     * @typedef {Object} innerLnc
     * @property {'11'|'12'} tipoRegistro
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
     */
    /**
     * @typedef {Object} tipo10Lnc
     * @property {String} codOrgao
     * @property {String} tipoUnidade
     * @property {String} numControle
     * @property {String} mesReferencia
     * @property {String} dataRegistro
     * @property {String} tipoLancamento
     * @property {String} dataTransacao
     * @property {String} histórico
     * @property {String} nroSequencial
     * @property {String} line
     * @property {innerLnc[]} content
     */
    /** 
     * @typedef {Object} lnc 
     * @property {String} data
     * @property {tipo10Lnc} content
    */
    /** @type {lnc[]} */
    const lnc = await natureza.getCampo(`${user.schema}.lnc`, "m", codOrgao, consolidado ? true : "false", "01" + date.substring(2), date)
    for (let i = 1; i <= parseInt(date.substring(0, 2)); i++) {
      const d = String(i).padStart(2, "0") + date.substring(2)
      const filtered = lnc.filter((e) => e.data === d)
      if (!filtered.length) {
        return res.status(404).json({ message: "Lnc não encontrado na data: " + d + "." })
      }
      filtered.forEach(({ content }) => {
        content.content.forEach((inner) => {
          const cod = inner.codConta.substring(0, 9)
          const got = layout.get(cod)
          const IcsArr = []
          got.values.forEach((e) => {
            if (inner[e]) {
              if (inner[e] === "0000") return
              IcsArr.push(inner[e], e)
            }
          })
          while (IcsArr.length < 12) IcsArr.push("")
          const balanceType = ["00", "beginning_balance", "period_change", "00", "00"][parseInt(content.tipoLancamento)]
          if (balanceType === "00") return
          const fullArr = [cod, ...IcsArr, balanceType]
          const def = {
            C: "0,00",
            D: "0,00"
          }
          const key = fullArr.join("|")
          const respMap = preRespMap.has(key) ? preRespMap.get(key) : preRespMap.set(key, def).get(key)
          respMap[inner.natLancamento] = natureza.sumRS([respMap[inner.natLancamento], inner.valor])[0]
        })
      })
      if (d !== date) {
        preRespMap.keys().forEach((k) => {
          if (k.endsWith("period_change")) {
            const newVal = { ...preRespMap.get(k) }
            const beg_key = k.replace("period_change", "beginning_balance")
            preRespMap.delete(k)
            const hasBeg = preRespMap.has(beg_key)
            if (hasBeg) {
              const beg = preRespMap.get(beg_key)
              newVal.C = natureza.sumRS([beg.C, newVal.C])[0]
              newVal.D = natureza.sumRS([beg.D, newVal.D])[0]
              preRespMap.delete(beg_key)
            }
            preRespMap.set(beg_key, newVal)
          }
        })
      }
    }

    const validations = natureza.getLncVerSum([])
    const allKeys = Array.from(preRespMap.keys()).toSorted()
    const already = []
    allKeys.forEach((k) => {
      const v = preRespMap.get(k)
      if (k.endsWith("beginning_balance")) {
        const end_k = k.replace("beginning_balance", "ending_balance")
        const end_v = preRespMap.get(end_k) || preRespMap.set(end_k, { C: "0,00", D: "0,00" }).get(end_k)
        end_v.C = natureza.sumRS([end_v.C, v.C])[0]
        end_v.D = natureza.sumRS([end_v.D, v.D])[0]
      }
      if (k.endsWith("period_change")) {
        const end_k = k.replace("period_change", "ending_balance")
        const end_v = preRespMap.get(end_k) || preRespMap.set(end_k, { C: "0,00", D: "0,00" }).get(end_k)
        end_v.C = natureza.sumRS([end_v.C, v.C])[0]
        end_v.D = natureza.sumRS([end_v.D, v.D])[0]
      }
    })

    Array.from(preRespMap.keys()).toSorted().forEach((k) => {
      const type = k.split("|")[13]
      const arr = k.split("|")
      const v = preRespMap.get(k)
      const natValor = arr.pop()
      switch (type) {
        case "period_change": {
          if (v.D !== "0,00") response.push([...arr, v.D, "D", natValor])
          if (v.C !== "0,00") response.push([...arr, v.C, "C", natValor])
          break;
        }
        default: {
          console.log(type)
          const valor = natureza.subRS([v.D, v.C])[0]
          if (valor.replace("-", "") === "0,00") return
          if (type === "ending_balance") {
            validations[arr[0].substring(0, 1)].f = natureza.sumRS([validations[arr[0].substring(0, 1)].f, valor])[0]
            validations.final.f = natureza.sumRS([validations.final.f, valor])[0]
            if (valor.includes("-")) {
              validations[arr[0].substring(0, 1)].C = natureza.sumRS([validations[arr[0].substring(0, 1)].C, valor.replace("-", "")])[0]
              validations.final.C = natureza.sumRS([validations.final.C, valor.replace("-", "")])[0]
            } else {
              validations[arr[0].substring(0, 1)].D = natureza.sumRS([validations[arr[0].substring(0, 1)].D, valor])[0]
              validations.final.D = natureza.sumRS([validations.final.D, valor])[0]
            }
          }
          if (valor.includes("-")) response.push([...arr, valor.replace("-", ""), "C", natValor])
          else response.push([...arr, valor, "D", natValor])
        }
      }
    })

    return res.status(StatusCodes.OK).json({
      output: [
        ["5220454EX", `${natureza.dataToYear(date)}-${date.substring(0, 2)}`, "", "", "",],
        [
          "CONTA", "IC1", "TIPO1", "IC2", "TIPO2", "IC3", "TIPO3", "IC4", "TIPO4",
          "IC5", "TIPO5", "IC6", "TIPO6", "Valor", "Tipo_valor", "Natureza_valor"
        ],
        ...response.map((e) => [
          ...e.toSpliced(13, 3),
          e[13].replaceAll(".", "").replace(",", "."),
          e[15],
          e[14],
        ])
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