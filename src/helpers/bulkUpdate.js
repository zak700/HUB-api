export default async function bulkUpdate({
  db,
  table,
  data,
  idField = "id",
  chunkSize = 20,
  trx = null,
}) {
  if (!data || data.length === 0) return;

  const executor = trx || db;

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);

    await Promise.all(
      chunk.map((row) => {
        const id = row[idField];
        const updateData = { ...row };
        delete updateData[idField];

        return executor(table)
          .where({ [idField]: id })
          .update(updateData);
      })
    );
  }
}