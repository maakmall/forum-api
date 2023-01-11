const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const Thread = require('../../../Domains/threads/entities/NewThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'akmal' });

      const newThread = new Thread({
        title: 'Ini title',
        body: 'Ini body',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(newThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'akmal' });

      const newThread = new Thread({
        title: 'Ini title',
        body: 'Ini body',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'Ini title',
        owner: 'user-123',
      }));
    });
  });

  describe('checkAvailabilityThread function', () => {
    it('should throw NotFoundError if thread not available', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.checkAvailabilityThread('thread-xxx'))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if thread available', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'akmal' });
      await ThreadsTableTestHelper.addThread({
        title: 'title thread',
        body: 'body thread',
        owner: 'user-123',
      });

      // Action & Assert
      await expect(threadRepositoryPostgres.checkAvailabilityThread('thread-123'))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('getDetailThread function', () => {
    it('should throw NotFoundError if thread not available', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getDetailThread('thread-xxx'))
        .rejects.toThrow(NotFoundError);
    });

    it('should get detail thread', async () => {
      const threadRepository = new ThreadRepositoryPostgres(pool, {});
      const userPayload = { id: 'user-123', username: 'maakmall' };
      const threadPayload = {
        id: 'thread-123',
        title: 'title thread',
        body: 'body thread',
        owner: userPayload.id,
      };
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);

      const detailThread = await threadRepository.getDetailThread(threadPayload.id);

      expect(detailThread.id).toEqual(threadPayload.id);
      expect(detailThread.title).toEqual(threadPayload.title);
      expect(detailThread.body).toEqual(threadPayload.body);
      expect(detailThread).toHaveProperty('date');
      expect(detailThread.date).toEqual('2023-01-01T08:19:09.775Z');
      expect(detailThread.username).toEqual(userPayload.username);
    });
  });
});
