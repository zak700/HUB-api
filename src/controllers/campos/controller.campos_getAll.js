import { StatusCodes } from "http-status-codes";
import { db } from "../../database/postgres.js";
import natureza from "../../helpers/natureza.js";
import { header, query } from "express-validator";
import tokenHelper from "../../helpers/tokens.js";

async function getAllCampos(req, res) {
  try {
    const { name } = req.params;

    const response = await db(name);

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
}

async function criarAnalize(req, res) {
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
}

async function enviarJson(req, res) {
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
}

async function novo_registro(req, res) {
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
}

async function editarRegistro(req, res) {
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
}

async function deleteCampo(req, res) {
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
      await db(`${user.schema}.${dbName}` ).where({ id }).del()
      return res.status(200).json({ message: "Registro deletado com sucesso." });
    }
  } catch (error) {
    console.error(
      "error from deleteCampo function from /controllers/campos/controller.campos_getAll.js",
      error
    );
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function getAsJson(req, res) {
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
}

export default { getAllCampos, criarAnalize, enviarJson, novo_registro, editarRegistro, deleteCampo, getAsJson };