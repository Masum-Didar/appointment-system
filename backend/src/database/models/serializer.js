function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function serializeRow(row) {
  if (!row || typeof row !== 'object') return row;
  if (Array.isArray(row)) return row.map(serializeRow);

  const result = {};
  for (const [key, value] of Object.entries(row)) {
    result[toCamelCase(key)] = value;
  }
  return result;
}

function deserializeRow(row) {
  if (!row || typeof row !== 'object') return row;
  if (Array.isArray(row)) return row.map(deserializeRow);

  const result = {};
  for (const [key, value] of Object.entries(row)) {
    result[toSnakeCase(key)] = value;
  }
  return result;
}

function serializePagination(result) {
  return {
    data: result.data.map(serializeRow),
    meta: result.meta,
  };
}

module.exports = {
  serializeRow,
  deserializeRow,
  serializePagination,
  toCamelCase,
  toSnakeCase,
};
