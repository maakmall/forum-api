const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DetailThreadUseCase = require('../DetailThreadUseCase');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');

describe('DetailThreadUseCase', () => {
  it('should throw error if use case payload not contain threadId', async () => {
    // Arrange
    const useCasePayload = {};
    const detailThreadUseCase = new DetailThreadUseCase({});

    // Action & Assert
    await expect(detailThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DETAIL_THREAD_USE_CASE.NOT_CONTAIN_VALID_PAYLOAD');
  });

  it('should throw error if threadId not string', async () => {
    // Arrange
    const useCasePayload = { threadId: 123 };
    const detailThreadUseCase = new DetailThreadUseCase({});

    // Action & Assert
    await expect(detailThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DETAIL_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating and return detail thread correctly', async () => {
    const useCasePayload = { threadId: 'thread-123' };

    const expectedThread = {
      id: 'thread-123',
      title: 'title thread',
      body: 'body thread',
      date: '2023-01-01T07:19:09.775Z',
      username: 'maakmall',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve());
    mockThreadRepository.getDetailThread = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'title thread',
        body: 'body thread',
        date: '2023-01-01T07:19:09.775Z',
        username: 'maakmall',
      }));
    mockCommentRepository.getCommentsThread = jest.fn()
      .mockImplementation(() => Promise.resolve(new DetailComment({
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
      }).comments));

    const detailThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const detailThread = await detailThreadUseCase.execute(useCasePayload);

    expect(mockThreadRepository.checkAvailabilityThread)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockThreadRepository.getDetailThread)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsThread)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(detailThread).toStrictEqual({
      thread: {
        ...expectedThread,
        comments: [
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
        ],
      },
    });
  });
});
