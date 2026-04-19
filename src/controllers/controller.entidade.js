import { StatusCodes } from "http-status-codes";
import { db } from "../database/postgres.js";
import serviceEntidade from "../services/service.entidade.js";
import natureza from "../helpers/natureza.js";

async function register(req, res) {
  try {
    const result = await serviceEntidade.Inserir(req.body.entidade);

    if (result.error) {
      console.error(result.error);
      return res.status(400).json(result);
    }

    return res
      .status(201)
      .json({ message: "Entidade cadastrada com sucesso!", entidade: result });
  } catch (error) {
    console.error("Error in register function controller.entidade.js", error);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getAllEntitys(req, res) {
  try {
    const result = await db("entidade").select("*").returning("*");
    res.status(200).json(result);
  } catch (error) {
    console.error(
      "Error in getAllUsers function controller.entidade.js",
      error
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getUsableEntitys(req, res) {
  try {
    const result = await db("entidade").select(
      "entidade_nome",
      "id",
      "id_usuario_autorizado"
    );
    res.status(200).json(result);
  } catch (error) {
    console.error(
      "Error in getAllUsers function controller.entidade.js",
      error
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function deleteEntity(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(404).message("Não foi possível encontrar a entidade");
  }
  try {
    await db("entidade").delete().where({ id: id });
    res.status(200).json({ message: "Deletado com sucesso" });
  } catch (error) {
    console.error(
      "Error in deleteEntity function controller.entidade.js",
      error
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateEntity(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(404).message("Não foi possível encontrar a entidade");
  }
  try {
    const result = await serviceEntidade.updateEntity(req.body.entidade, id);

    if (result.error) {
      console.error(result.error);
      return res.status(400).json(result);
    }

    return res
      .status(201)
      .json({ message: "Entidade atualizada com sucesso!", entidade: result });
  } catch (error) {
    console.error("Error in register function controller.entidade.js", error);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getAllEntitysSafe(req, res) {
  try {
    const result = await db("entidade").select("*");

    const filteredResult = result.map((entidade) => {
      return {
        entidade_nome: entidade.entidade_nome,
        id_usuario_autorizado: entidade.id_usuario_autorizado,
        id: entidade.id,
      };
    });

    res.status(200).json(filteredResult);
  } catch (error) {
    console.error(
      "Error in getAllUsers function controller.entidade.js",
      error
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function newRubrica(req, res) {
  try {
    const { anexo } = req.params;
    const { info } = req.body;

    let valid = true;

    for (let key in info) {
      info[key].forEach((rubrica) => {
        if (rubrica.replaceAll(/\D/g, "").length !== 9) valid = false;
      });
      info[key].length === 0 ? (valid = false) : null;
    }

    if (!valid) {
      return res.status(400).json({ message: "Existem rubricas inválidas." });
    }

    if (!anexo || !info) {
      return res
        .status(400)
        .json({ message: "Anexo ou informações não fornecidas." });
    }

    const has = await db("rubricas").select("*");

    const toInsert = { ["anexo" + anexo]: info };

    if (has.length !== 0) {
      await db("rubricas").update(toInsert);
    } else {
      await db("rubricas").insert(toInsert);
    }

    return res.status(200).json({
      message: "Rubrica(s) salva(s) com sucesso!",
    });
  } catch (error) {
    console.error("Error in newRubrica function controller.entidade.js", error);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getRubrica(req, res) {
  try {
    const user = await natureza.getUser(req);
    const response = await db(`${user.schema}.rubricas`).select("*").first();

    const output = {};

    Object.entries(response).forEach(([key, value]) => {
      output[key.replace("anexo", "")] = Object.entries(value).map(([k, v]) => ({ label: k, value: v }))
    });

    delete output.id;

    res.status(200).json({ output });
  } catch (error) {
    console.error("Error in getRubrica function controller.entidade.js", error);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function organograma(req, res) {
  try {
    const { id } = req.params;

    let entidades;

    if (id) entidades = (await db("entidade").select("*").where({ id }))[0];
    else entidades = await db("entidade").select("*");

    return res.status(StatusCodes.OK).json({
      response: entidades.map((e) => {
        return {
          id: e.id,
          entidade_nome: e.entidade_nome,
          owner: e.id_usuario_autorizado,
          organograma: e.organograma,
        };
      }),
    });
  } catch (error) {
    console.error(
      "Error in organograma function controller.entidade.js",
      error
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function saveRubrica(req, res) {
  try {
    const user = await natureza.getUser(req);
    const info = req.body
    const toUpload = {};
    Object.entries(info).forEach(([key, value]) => {
      toUpload["anexo" + key] = value.reduce((acc, curr) => {
        acc[curr.label] = curr.value;
        return acc;
      }, {});
    });

    await db(`${user.schema}.rubricas`).update(toUpload);

    return res.status(200).json({
      message: "Rubrica(s) salva(s) com sucesso!",
    });
  } catch (error) {
    console.error(
      "Error in organograma function controller.entidade.js",
      error
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  register,
  getAllEntitys,
  getUsableEntitys,
  deleteEntity,
  updateEntity,
  getAllEntitysSafe,
  newRubrica,
  getRubrica,
  organograma,
  saveRubrica
};
