const DetailComment = require('../DetailComment');

describe('a DetailComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = { comments: {} };

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should mapping comments data and create DetailComment entities correctly', () => {
    // Arrange
    const payload = {
      comments: [
        {
          id: 'comment-123',
          username: 'maakmall',
          date: '2023-01-01T08:19:09.775Z',
          content: 'test comment 1',
          is_delete: false,
        },
        {
          id: 'comment-124',
          username: 'maakmall',
          date: '2023-01-01T09:19:09.775Z',
          content: 'test comment 2',
          is_delete: true,
        },
      ],
    };

    // Action
    const detailComment = new DetailComment(payload).comments;

    // Assert
    expect(detailComment).toStrictEqual([
      {
        id: 'comment-123',
        username: 'maakmall',
        date: '2023-01-01T08:19:09.775Z',
        content: 'test comment 1',
      },
      {
        id: 'comment-124',
        username: 'maakmall',
        date: '2023-01-01T09:19:09.775Z',
        content: '**komentar telah dihapus**',
      },
    ]);
  });
});
