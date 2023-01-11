const Comment = require('../NewComment');

describe('a NewComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      userId: 'user-123',
      content: 'abc',
    };

    // Action and Assert
    expect(() => new Comment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      userId: 123,
      threadId: true,
      content: {},
    };

    // Action and Assert
    expect(() => new Comment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewComment entities correctly', () => {
    // Arrange
    const payload = {
      userId: 'user-123',
      threadId: 'thread-123',
      content: 'abc',
    };

    // Action
    const newComment = new Comment(payload);

    // Assert
    expect(newComment).toBeInstanceOf(Comment);
    expect(newComment.userId).toEqual(payload.userId);
    expect(newComment.threadId).toEqual(payload.threadId);
    expect(newComment.content).toEqual(payload.content);
  });
});
