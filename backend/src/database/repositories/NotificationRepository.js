const BaseRepository = require('./BaseRepository');

class NotificationRepository extends BaseRepository {
  constructor() {
    super('notifications', {
      softDelete: false,
      timestamps: false,
    });
  }

  async findByUser(userId, page = 1, limit = 20, unreadOnly = false) {
    const offset = (page - 1) * limit;
    const unreadClause = unreadOnly ? 'AND is_read = FALSE' : '';

    const countResult = await this.rawQuery(
      `SELECT COUNT(*) as total FROM notifications
       WHERE user_id = $1 ${unreadClause}`,
      [userId]
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const { rows } = await this.rawQuery(
      `SELECT * FROM notifications
       WHERE user_id = $1 ${unreadClause}
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return {
      data: rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUnreadCount(userId) {
    const { rows } = await this.rawQuery(
      `SELECT COUNT(*) as count FROM notifications
       WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
    return parseInt(rows[0].count, 10);
  }

  async markAsRead(notificationId, userId) {
    const { rows } = await this.rawQuery(
      `UPDATE notifications
       SET is_read = TRUE, read_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [notificationId, userId]
    );
    return rows[0] || null;
  }

  async markAllAsRead(userId) {
    const { rowCount } = await this.rawQuery(
      `UPDATE notifications
       SET is_read = TRUE, read_at = NOW()
       WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
    return rowCount;
  }

  async createNotification(userId, type, title, body, data = null) {
    const { rows } = await this.rawQuery(
      `INSERT INTO notifications (user_id, type, title, body, data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, type, title, body, data ? JSON.stringify(data) : null]
    );
    return rows[0];
  }

  async bulkCreate(notifications) {
    if (notifications.length === 0) return [];

    const values = notifications.map((n, i) => {
      const offset = i * 5;
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
    }).join(', ');

    const params = notifications.flatMap(n => [
      n.userId, n.type, n.title, n.body,
      n.data ? JSON.stringify(n.data) : null,
    ]);

    const { rows } = await this.rawQuery(
      `INSERT INTO notifications (user_id, type, title, body, data)
       VALUES ${values}
       RETURNING *`,
      params
    );
    return rows;
  }
}

module.exports = new NotificationRepository();
