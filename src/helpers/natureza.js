import { db } from "../database/postgres.js";

const natureza = {

  PO_values: {
    "01": "10131",
    "02": "20231",
    "03": "10131",
    "04": "10131",
    "05": "10131",
    "06": "10131",
    "07": "10132",
    "08": "10131",
    "09": "10131",
    "10": "10131",
    "11": "10131",
    "12": "10131",
    "13": "10131",
    "14": "10131",
    "15": "10131",
    "16": "10131",
  },
  // filter by consolidados
  filterOrg: function (toFilter, orgao, consolidado) {
    if (consolidado !== "false") {
      return toFilter;
    } else {
      const filtered = toFilter.filter(
        (e) => parseInt(e.content.codOrgao) === parseInt(orgao)
      );
      return filtered;
    }
  },

  getOrgaosByDate: async function (date = "") {
    if (!date) return null
    const dataYear = this.dataToYear(date)
    const fullData = `${date.substring(0, 2)}${dataYear}`
    const fullDataYear = parseInt(fullData.substring(2))
    const fullDataMonth = parseInt(fullData.substring(0, 2))
    const allOrgaos = (await db("orgao").select("*")).map((e) => e.content)
    const filtered = allOrgaos.filter((e) => {
      const val = {
        dtInicio: e.dtInicio.substring(2),
        dtFinal: e.dtFinal.substring(2),
        dtInicioAno: parseInt(e.dtInicio.substring(4)),
        dtInicioMes: parseInt(e.dtInicio.substring(2, 4)),
        dtFinalAno: parseInt(e.dtFinal.substring(4)),
        dtFinalMes: parseInt(e.dtFinal.substring(2, 4))
      }

      if (val.dtInicio === fullData || val.dtFinal === fullData) return true

      if (val.dtInicioAno <= fullDataYear && val.dtFinalAno >= fullDataYear) {
        if (val.dtInicioAno === fullDataYear) return val.dtInicioMes <= fullDataMonth
        if (val.dtFinalAno === fullDataYear) return val.dtFinalMes >= fullDataMonth
        return true
      }

      return false
    })

    return filtered
  },

  filterOrgaosByDate: function (allOrgaos = [], date) {
    if (!date) return null
    const dataYear = this.dataToYear(date)
    const fullData = `${date.substring(0, 2)}${dataYear}`
    const fullDataYear = parseInt(fullData.substring(2))
    const fullDataMonth = parseInt(fullData.substring(0, 2))
    const filtered = allOrgaos.filter((e) => {
      const val = {
        dtInicio: e.dtInicio.substring(2),
        dtFinal: e.dtFinal.substring(2),
        dtInicioAno: parseInt(e.dtInicio.substring(4)),
        dtInicioMes: parseInt(e.dtInicio.substring(2, 4)),
        dtFinalAno: parseInt(e.dtFinal.substring(4)),
        dtFinalMes: parseInt(e.dtFinal.substring(2, 4))
      }

      if (val.dtInicio === fullData || val.dtFinal === fullData) return true

      if (val.dtInicioAno <= fullDataYear && val.dtFinalAno >= fullDataYear) {
        if (val.dtInicioAno === fullDataYear) return val.dtInicioMes <= fullDataMonth
        if (val.dtFinalAno === fullDataYear) return val.dtFinalMes >= fullDataMonth
        return true
      }

      return false
    })

    return filtered
  },

  toRS: function (string) {
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
        : dots(string.split(".")[0]) +
        "," +
        string.split(".")[1].padEnd(2, "0");
    } else {
      return Dash
        ? "-" + dots(string.substring(1)) + ",00"
        : dots(string) + ",00";
    }
  },

  toNum: function (string, accurate = false) {
    return accurate ? parseInt(string.replaceAll(".", "").replaceAll(",", "")) / 100 : parseInt(string.replaceAll(".", "").replaceAll(",", ""))
  },

  sum: function (campos = [{ campo: Array, toSum: String }]) {
    let sum = 0;

    campos.forEach((campos) => {
      campos.campo?.forEach((e) => {
        sum += parseInt(
          e.content[campos.toSum].replaceAll(",", "").replaceAll(".", "")
        );
      });
    });

    return natureza.toRS(String(sum / 100));
  },

  onlyPositive: function (values) {
    const output = [];
    values.forEach((value) => {
      output.push(value.replaceAll("-", ""));
    });
    return output;
  },

  sum: function (campos = [{ campo: Array, toSum: String }]) {
    let sum = 0;

    campos.forEach((campos) => {
      campos.campo?.forEach((e) => {
        sum += parseInt(
          e.content[campos.toSum].replaceAll(",", "").replaceAll(".", "")
        );
      });
    });

    let result = sum / 100;
    // Prevent exponential notation
    if (!isFinite(result) || String(result).includes("e")) result = 0;
    return natureza.toRS(result.toFixed(2));
  },

  sub: function (campos = [{ campo: Array, toSub: String }]) {
    let sum = 0;

    campos[0].campo?.forEach((e) => {
      sum += parseInt(
        e.content[campos[0].toSub]?.replaceAll(",", "").replaceAll(".", "")
      );
    });

    campos.shift();

    campos?.forEach((campos) => {
      campos?.campo?.forEach((e) => {
        sum -= parseInt(
          e.content[campos.toSub]?.replaceAll(",", "").replaceAll(".", "")
        );
      });
    });

    let result = sum / 100;
    // Prevent exponential notation
    if (!isFinite(result) || String(result).includes("e")) result = 0;
    return natureza.toRS(result.toFixed(2));
  },

  sumRS: function (values = Array) {
    const sum = [];
    values.forEach((value) => {
      if (Array.isArray(value)) {
        value.forEach((e, i) => {
          sum[i] =
            (sum[i] || 0) +
            parseInt((e ?? "0").replaceAll(",", "").replaceAll(".", ""));
        });
      } else {
        sum[0] =
          (sum[0] || 0) +
          parseInt((value ?? "0").replaceAll(",", "").replaceAll(".", ""));
      }
    });

    sum.forEach((e, i) => {
      let result = e / 100;
      if (!isFinite(result) || String(result).includes("e")) result = 0;
      sum[i] = natureza.toRS(result.toFixed(2));
    });

    return sum;
  },

  subRS: function (values = Array) {
    const sum = [];

    if (Array.isArray(values[0])) {
      values[0].forEach((e, i) => {
        sum[i] =
          (sum[i] || 0) +
          parseInt((e ?? "0").replaceAll(",", "").replaceAll(".", ""));
      });
    } else {
      sum[0] =
        (sum[0] || 0) +
        parseInt((values[0] ?? "0").replaceAll(",", "").replaceAll(".", ""));
    }

    values.shift();

    values.forEach((value) => {
      if (Array.isArray(value)) {
        value.forEach((e, i) => {
          sum[i] =
            (sum[i] || 0) -
            parseInt((e ?? "0").replaceAll(",", "").replaceAll(".", ""));
        });
      } else {
        sum[0] =
          (sum[0] || 0) -
          parseInt((value ?? "0").replaceAll(",", "").replaceAll(".", ""));
      }
    });

    sum.forEach((e, i) => {
      let result = e / 100;
      if (!isFinite(result) || String(result).includes("e")) result = 0;
      sum[i] = natureza.toRS(result.toFixed(2));
    });

    return sum;
  },

  getCampo: async function (campo, dataType, orgao, consolidado, dataI, dataF) {
    const res = await this.filterOrg(
      await db(campo).select("*"),
      orgao,
      consolidado
    );
    if (dataType === "y") {
      return res.filter((e) => {
        return (
          e.data >= this.dataToYear(dataI) &&
          e.data <= this.dataToYear(dataF)
        );
      });
    } else if (dataType === "m") {
      return res.filter((e) => {
        let returns = true;

        if (this.dataToYear(dataI) < this.dataToYear(e.data)) {
          returns = false;
        }

        if (this.dataToYear(dataI) === this.dataToYear(e.data)) {
          dataI.substring(0, 2) > e.data.substring(0, 2)
            ? (returns = false)
            : null;
        }

        if (this.dataToYear(dataF) > this.dataToYear(e.data)) {
          returns = false;
        }

        if (this.dataToYear(dataF) === this.dataToYear(e.data)) {
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
            "12" + String(parseInt(dataF.substring(2, 4)) - 1).padStart(2, "0");
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
  },

  filtrarPerm: function (
    campo,
    content_type,
    inicial = [],
    fromInicial = 0,
    final = false,
    fromFinal = 0,
    exceto = false,
    fromExceto = 0
  ) {

    const filtered = campo.filter((campo) => {
      const content = campo.content[content_type];

      // ✅ Keep campo if AT LEAST ONE inicialItem matches
      const hasInicialMatch = inicial.some((inicialItem) => {
        const expected = String(inicialItem);
        const actual = content.substring(
          fromInicial || 0,
          expected.length + (fromInicial || 0)
        );
        return expected == actual;
      });

      if (!hasInicialMatch) return false;

      // ✅ Final logic
      if (final != false) {
        for (const finalItem of final) {
          const finalStr = String(finalItem);
          if (
            finalStr !==
            content.substring(fromFinal, fromFinal + finalStr.length)
          ) {
            return false;
          }
        }
      }

      if (exceto != false) {
        for (const excetoItem of exceto) {
          const excetoStr = String(excetoItem);
          if (
            excetoStr ===
            content.substring(fromExceto, excetoStr.length + fromExceto)
          ) {
            return false;
          }
        }
      }

      return true;
    });

    return filtered;
  },

  filtrarSubPerm: function (
    campo,
    campoType,
    content_type,
    inicial = [],
    fromInicial = 0,
    final = false,
    fromFinal = 0,
    exceto = false,
    fromExceto = 0
  ) {
    const subCampo = campo.map((e) => e.content.content).flat();

    const filtered = subCampo.filter((subCampo) => {
      if (subCampo.tipoRegistro !== campoType) return false;
      if (!subCampo[content_type]) return false;

      const content = subCampo[content_type];

      // ✅ Keep subCampo if AT LEAST ONE inicialItem matches
      const hasInicialMatch = inicial.some((inicialItem) => {
        const expected = String(inicialItem);
        const actual = content.substring(
          fromInicial || 0,
          expected.length + (fromInicial || 0)
        );
        return expected == actual;
      });

      if (!hasInicialMatch) return false;

      // ✅ Final logic
      if (final != false) {
        for (const finalItem of final) {
          const finalStr = String(finalItem);
          if (
            finalStr !==
            content.substring(fromFinal, fromFinal + finalStr.length)
          ) {
            return false;
          }
        }
      }

      if (exceto != false) {
        for (const excetoItem of exceto) {
          const excetoStr = String(excetoItem);
          if (
            excetoStr ===
            content.substring(fromExceto, excetoStr.length + fromExceto)
          ) {
            return false;
          }
        }
      }

      return true;
    });

    return filtered.map((e) => {
      return { content: e };
    });
  },

  zerado: function (length) {
    const output = [];
    for (let i = 0; i < length; i++) {
      output.push("0,00");
    }
    return output;
  },

  dataToYear: function (data) {
    data = String(data).substring(2, 4);
    const date = new Date().getFullYear();
    const dateEnd = String(date).substring(2, 4);
    const dateStart = String(date).substring(0, 2);
    if (parseInt(data) > parseInt(dateEnd)) {
      return String(parseInt(dateStart) - 1) + data;
    } else {
      return dateStart + data;
    }
  },

  toInt: function (string) {
    return parseInt(string.replaceAll(".", "").replaceAll(",", ""));
  },

  multRS: function (a, b) {
    const valA = this.toInt(a) / 100;
    const valB = this.toInt(b) / 100;
    return this.toRS(String((valA / valB).toFixed(2)))
  }
};

export default natureza;
