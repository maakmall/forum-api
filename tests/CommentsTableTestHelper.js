/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123', userId = 'user-123', threadId = 'thread-123', content = 'Dicoding Indonesia',
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5)',
      values: [id, userId, threadId, '2023-01-01T08:19:09.775Z', content],
    };

    await pool.query(query);
  },

  async findCommentById(id, isDelete = false) {
    let query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    if (isDelete) {
      query = {
        text: 'SELECT * FROM comments WHERE id = $1 AND is_delete = FALSE',
        values: [id],
      };
    }

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
