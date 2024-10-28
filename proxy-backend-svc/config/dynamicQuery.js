export async function update(values, id) {
  const dataToInsert = {
    ...values,
  };
  const queryParams = [];
  let setClause = "";
  const keys = Object.keys(dataToInsert);
  keys.forEach((field, index) => {
    setClause += `${field} = ?`;
    queryParams.push(dataToInsert[field]);
    if (index < keys.length - 1) {
      setClause += ", ";
    }
  });
  queryParams.push(id);
  const finalResult = {
    setClause: setClause,
    queryParams: queryParams,
  };
  return finalResult;
}

export async function insert(values, id) {
  const dataToInsert = {
    id,
    ...values,
  };
  const keys = Object.keys(dataToInsert).join(", ");
  const val = Object.values(dataToInsert);
  const placeholders = val.map((_) => `?`).join(", ");
  const finalInsertValues = [...val];
  const finalResult = {
    keys: keys,
    placeholders: placeholders,
    finalInsertValues: finalInsertValues,
  };
  return finalResult;
}
