import { StatusCodes } from "http-status-codes";
import { db } from "../../database/postgres.js";

async function checkPapelFree(req, res) {
  try {
    const { id } = req.params;

    const PapelFree = (
      await db("usuarios")
        .select("*")
        .where({ id_usuario: id })
        .returning("PapelFree")
    )[0].PapelFree;

    if (PapelFree == null) {
      res.status(StatusCodes.OK).json({ result: false });
    } else {
      res.status(StatusCodes.OK).json({ result: PapelFree });
    }
  } catch (error) {
    console.error(
      "Error in checkPapelFree function in papelFree\\controller.usuario.js",
      error
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function connect(req, res) {
  try {
    const { id_usuario, id_entidade } = req.body;

    if (!id_usuario || !id_entidade) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Informações em falta." });
    }

    const entidade = await db("entidade")
      .select("*")
      .where({ id: parseInt(id_entidade) });

    if (entidade.length !== 1) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Entidade não encontrada/inexistente" });
    }

    // console.log(id_usuario, id_entidade);
  } catch (error) {
    console.error(
      "Error in connect function in papelFree\\controller.usuario.js",
      error
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default { checkPapelFree, connect };
