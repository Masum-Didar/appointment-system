const db = require('../../config/database');
const { NotFoundError } = require('../../constants/errors');
const logger = require('../../utils/logger');

class BaseRepository {
  constructor(tableName, options = {}) {
    this.tableName = tableName;
    this.primaryKey = options.primaryKey || 'id';
    this.softDelete = options.softDelete !== false;
    this.timestamps = options.timestamps !== false;
    this.allowedSortFields = options.allowedSortFields || ['created_at', 'updated_at'];
  }

  buildSelectClause(fields) {
    if (!fields || fields.length === 0) return '*';
    return fields.map(f => `"${f}"`).join(', ');
  }

  buildWhereClause(filters, useSoftDelete = true) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (useSoftDelete && this.softDelete) {
      conditions.push(`deleted_at IS NULL`);
    }

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null) continue;

      if (Array.isArray(value)) {
        const placeholders = value.map(() => `$${paramIndex++}`);
        conditions.push(`"${key}" IN (${placeholders.join(', ')})`);
        params.push(...value);
      } else if (typeof value === 'object' && value.operator) {
        const ops = {
          gt: '>', gte: '>=', lt: '<', lte: '<=',
          neq: '!=', like: 'ILIKE', ilike: 'ILIKE',
        };
        const op = ops[value.operator] || '=';
        conditions.push(`"${key}" ${op} $${paramIndex++}`);
        params.push(value.operator === 'like' || value.operator === 'ilike'
          ? `%${value.value}%` : value.value);
      } else {
        conditions.push(`"${key}" = $${paramIndex++}`);
        params.push(value);
      }
    }

    return { where: conditions.length > 0 ? conditions.join(' AND ') : '1=1', params };
  }

  buildOrderClause(sort, order) {
    if (!sort) return 'created_at DESC';
    const field = this.allowedSortFields.includes(sort) ? sort : 'created_at';
    const dir = order === 'asc' ? 'ASC' : 'DESC';
    return `"${field}" ${dir}`;
  }

  async findById(id, fields) {
    const select = this.buildSelectClause(fields);
    const softDeleteClause = this.softDelete ? 'AND deleted_at IS NULL' : '';

    const { rows } = await db.query(
      `SELECT ${select} FROM "${this.tableName}"
       WHERE "${this.primaryKey}" = $1 ${softDeleteClause}`,
      [id]
    );

    if (rows.length === 0) {
      throw new NotFoundError(this.tableName);
    }

    return rows[0];
  }

  async findAll(filters = {}, options = {}) {
    const {
      fields,
      page = 1,
      limit = 20,
      sort,
      order,
      softDelete = true,
    } = options;

    const select = this.buildSelectClause(fields);
    const { where, params } = this.buildWhereClause(filters, softDelete);
    const orderClause = this.buildOrderClause(sort, order);

    const offset = (page - 1) * limit;

    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM "${this.tableName}" WHERE ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const { rows } = await db.query(
      `SELECT ${select} FROM "${this.tableName}"
       WHERE ${where}
       ORDER BY ${orderClause}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return {
      data: rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data, returning = ['*']) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`);

    const { rows } = await db.query(
      `INSERT INTO "${this.tableName}" (${columns.map(c => `"${c}"`).join(', ')})
       VALUES (${placeholders.join(', ')})
       RETURNING ${returning.join(', ')}`,
      values
    );

    return rows[0];
  }

  async update(id, data, returning = ['*']) {
    const existing = await this.findById(id);

    if (!existing) {
      throw new NotFoundError(this.tableName);
    }

    const columns = Object.keys(data);
    const values = Object.values(data);

    const setClause = columns
      .map((col, i) => `"${col}" = $${i + 1}`)
      .join(', ');

    if (this.timestamps) {
      setClause += `, updated_at = NOW()`;
    }

    const { rows } = await db.query(
      `UPDATE "${this.tableName}"
       SET ${setClause}
       WHERE "${this.primaryKey}" = $${columns.length + 1}
       RETURNING ${returning.join(', ')}`,
      [...values, id]
    );

    return rows[0];
  }

  async softDelete(id) {
    if (!this.softDelete) {
      throw new Error(`${this.tableName} does not support soft delete`);
    }

    const { rows } = await db.query(
      `UPDATE "${this.tableName}"
       SET deleted_at = NOW(), updated_at = NOW()
       WHERE "${this.primaryKey}" = $1 AND deleted_at IS NULL
       RETURNING id, deleted_at`,
      [id]
    );

    if (rows.length === 0) {
      throw new NotFoundError(this.tableName);
    }

    return rows[0];
  }

  async hardDelete(id) {
    const { rowCount } = await db.query(
      `DELETE FROM "${this.tableName}" WHERE "${this.primaryKey}" = $1`,
      [id]
    );

    if (rowCount === 0) {
      throw new NotFoundError(this.tableName);
    }
  }

  async exists(filters) {
    const { where, params } = this.buildWhereClause(filters);
    const { rows } = await db.query(
      `SELECT EXISTS(SELECT 1 FROM "${this.tableName}" WHERE ${where}) as exists`,
      params
    );
    return rows[0].exists;
  }

  async count(filters = {}) {
    const { where, params } = this.buildWhereClause(filters);
    const { rows } = await db.query(
      `SELECT COUNT(*) as count FROM "${this.tableName}" WHERE ${where}`,
      params
    );
    return parseInt(rows[0].count, 10);
  }

  async rawQuery(text, params) {
    return db.query(text, params);
  }

  async transaction(callback) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error('Transaction failed, rolled back', {
        error: err.message,
        table: this.tableName,
      });
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = BaseRepository;
