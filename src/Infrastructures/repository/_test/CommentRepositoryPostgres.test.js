const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const Comment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'akmal' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        body: 'body thread',
        owner: 'user-123',
      });

      const newComment = new Comment({
        userId: 'user-123',
        threadId: 'thread-123',
        content: 'test',
      });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(newComment);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'akmal' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        body: 'body thread',
        owner: 'user-123',
      });

      const newComment = new Comment({
        userId: 'user-123',
        threadId: 'thread-123',
        content: 'test',
      });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        owner: 'user-123',
        content: 'test',
      }));
    });
  });

  describe('checkAvailabilityComment function', () => {
    it('should throw NotFoundError if comment not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.checkAvailabilityComment('comment-xxx'))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if comment available', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'akmal' });
      await ThreadsTableTestHelper.addThread({
        title: 'title thread',
        body: 'body thread',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', content: 'Test' });

      // Action & Assert
      await expect(commentRepositoryPostgres.checkAvailabilityComment('comment-123'))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError if comment not belong to owner', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'akmal' });
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'unknown' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', body: 'body thread', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123', content: 'test komentar', threadId: 'thread-123', userId: 'user-123',
      });
      const comment = 'comment-123';
      const owner = 'user-1234';

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(comment, owner))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError if comment is belongs to owner', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'akmal' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', body: 'body thread', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123', content: 'test komentar', threadId: 'thread-123', userId: 'user-123',
      });

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123'))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('deleteComment', () => {
    it('should delete comment from database', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'akmal' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', body: 'body thread', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123', content: 'test komentar', threadId: 'thread-123', userId: 'user-123',
      });

      // Action
      await commentRepositoryPostgres.deleteComment('comment-123');

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById('comment-123', true);
      const commentDeleted = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(commentDeleted[0].is_delete).toEqual(true);
      expect(comment).toHaveLength(0);
    });
  });

  describe('getCommentsThread', () => {
    it('should get comments of thread', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const userPayload = { id: 'user-123', username: 'maakmall' };
      const threadPayload = {
        id: 'thread-123',
        title: 'title thread',
        body: 'body thread',
        owner: userPayload.id,
      };
      const commentPayload = {
        id: 'comment-123',
        userId: userPayload.id,
        threadId: threadPayload.id,
        content: 'test komentar',
      };

      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);

      const comments = await commentRepositoryPostgres.getCommentsThread(threadPayload.id);

      expect(Array.isArray(comments)).toBe(true);
      expect(comments[0].id).toEqual(commentPayload.id);
      expect(comments[0].username).toEqual(userPayload.username);
      expect(comments[0].date).toBeDefined();
      expect(comments[0].date).toEqual('2023-01-01T08:19:09.775Z');
      expect(comments[0].content).toEqual('test komentar');
    });
  });
});
