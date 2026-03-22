import { StatusCodes } from "http-status-codes";
import { db } from "../../../database/postgres.js";

async function CorrigirEmp(req, res) {
  try {
    const campos = await db("emp").select("*");
    const output = [];

    campos.forEach((campo) => {
      campo.content.content.forEach((tipo11) => {
        if (tipo11.tipoRegistro !== "11") return;
        if (
          ![
            tipo11.contaDeb,
            tipo11.contaCred,
            tipo11.elementoDespesaMSC,
            tipo11.subElementoMSC,
          ].includes("nan")
        )
          return;

        const name = campo.data + tipo11.elementoDespesa + tipo11.subElemento;

        if (output.includes(name)) return;

        output.push(name);
      });
    });

    res.status(200).json({ output });
  } catch (error) {
    console.error(
      "error from getAllAbl function from /controllers/campos/corrigir/controller.emp.js",
      error
    );
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function UpdateEmp(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    const elementoDespesa = id.substring(4, 10);
    const subElemento = id.substring(10);

    const emp = await db("emp").select("*");

    const toChange = [];

    emp.forEach((tipo10, tipo10Index) => {
      if (tipo10.data !== id.substring(0, 4)) return;

      tipo10.content.content.forEach((tipo11, tipo11Index) => {
        if (tipo11.tipoRegistro !== "11") return;

        if (
          tipo11.elementoDespesa !== elementoDespesa ||
          tipo11.subElemento !== subElemento
        )
          return;
        if (!toChange.includes(tipo10.id)) toChange.push(tipo10.id);

        [
          "elementoDespesaMSC",
          "contaDeb",
          "contaCred",
          "subElementoMSC",
        ].forEach(
          (key) =>
            (emp[tipo10Index].content.content[tipo11Index][key] = data[key])
        );
      });
    });

    if (toChange.size === 0) {
      return res
        .status(StatusCodes.NOT_MODIFIED)
        .json({ message: "No records updated." });
    }

    const toSend = emp.filter((e) => toChange.includes(e.id));

    for (const key in toSend) {
      const content = toSend[key].content;

      await db("emp").update({ content }).where({ id: toSend[key].id });
    }

    return res.status(StatusCodes.OK).json({message: "Ok"})

  } catch (error) {
    console.error(
      "error from UpdateEmp function from /controllers/campos/corrigir/controller.emp.js",
      error
    );
    return res.status(500).json({ message: "Internal server error." });
  }
}

export default { CorrigirEmp, UpdateEmp };
