import { db } from "../database/postgres.js";

async function getAllGestor(req, res) {
  try {
    const response = await db("gestor").select("*");
    res.status(200).json({ response });
  } catch (error) {
    console.error(
      "error from getAllGestor function from /controllers/controller.gestor.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const gestor = req.body;

    await db("gestor").insert(gestor);

    res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.gestor.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirGestor(req, res) {
  const { text } = req.body;
  const registro = text.slice(0, 2);
  try {
    if (registro == 11) {
      const tiporegistro_gestor = text.slice(0, 2);
      const codorgao_gestor = text.slice(2, 4);
      const codunidade_gestor = text.slice(4, 6);
      const cpfordenadordespesa_gestor = text.slice(6, 17);
      const datainicio_gestor = text.slice(17, 25);
      const tiporesponsavel_gestor = text.slice(25, 26);
      const datafim_gestor = text.slice(26, 34);
      const nomeordenadordespesa_gestor = text.slice(34, 84);
      const cargoordenadordespesa_gestor = text.slice(84, 134);
      const lograresordenador_gestor = text.slice(134, 184);
      const setorlograordenador_gestor = text.slice(184, 204);
      const cidadelograordenador_gestor = text.slice(204, 224);
      const ufcidadelograordendor_gestor = text.slice(224, 226);
      const ceplograordenador_gestor = text.slice(226, 234);
      const foneordenador_gestor = text.slice(234, 244);
      const email_gestor = text.slice(244, 324);
      const escolaridade_gestor = text.slice(324, 326);
      const nrosequencial_gestor = text.slice(384, 390);

      

      /*
[
{10},
{11},
{12},
{13},
{14}
] 
*/

      const response = await db("gestor")
        .insert({
          tiporegistro_gestor,
          codorgao_gestor,
          codunidade_gestor,
          cpfordenadordespesa_gestor,
          datainicio_gestor,
          tiporesponsavel_gestor,
          datafim_gestor,
          nomeordenadordespesa_gestor,
          cargoordenadordespesa_gestor,
          lograresordenador_gestor,
          setorlograordenador_gestor,
          cidadelograordenador_gestor,
          ufcidadelograordendor_gestor,
          ceplograordenador_gestor,
          foneordenador_gestor,
          email_gestor,
          escolaridade_gestor,
          nrosequencial_gestor,
        })
        .returning("*");
      return res
        .status(200)
        .json({ message: "Registro inserido com sucesso!" });
    } else {
      return res
        .status(400)
        .json({ message: "Arquivo uoc.txt mal formatado." });
    }
  } catch (error) {
    console.error(
      "error from InserirGestor function from /controllers/controller.gestor.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteSoftGestao(req, res) {
  const { id } = req.params;
  try {
    await db("softgestao").delete().where({ id_softgestao: id });
    res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteGestor from /controllers/controller.gestor.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default { getAllSoftGestor, Inserir, InserirGestor, deleteGestor };
