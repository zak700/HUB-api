import { StatusCodes } from "http-status-codes";
import { db } from "../../database/postgres.js";

async function accessRequest(req, res) {
  try {
    // console.log(req.body);

    const { id_usuario, id_entidade, area_acesso } = req.body;

    if (!id_usuario || !id_entidade || !area_acesso)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Informações em falta." });

    const entidade = await db("entidade")
      .select("*")
      .where({ id: parseInt(id_entidade) });

    if (entidade.length !== 1)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Entidade não encontrada/inexistente" });

    if (
      entidade[0].usuarios_pedido.map((e) => e.id_usuario).includes(id_usuario)
    )
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Pedido já enviado, aguarde até uma resposta..." });

    const pastUsers = entidade[0].usuarios_pedido || [];
    pastUsers.push({ id_usuario, area_acesso });
    await db("entidade").update({ usuarios_pedido: pastUsers });

    res.status(StatusCodes.OK).json({ message: "pedido enviado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
}



export default { accessRequest };
