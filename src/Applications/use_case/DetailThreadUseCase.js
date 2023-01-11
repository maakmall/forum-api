class DetailThreadUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);

    const { threadId } = useCasePayload;
    await this._threadRepository.checkAvailabilityThread(threadId);
    const detailThread = await this._threadRepository.getDetailThread(threadId);
    detailThread.comments = await this._commentRepository.getCommentsThread(threadId);
    return {
      thread: detailThread,
    };
  }

  _validatePayload(payload) {
    const { threadId } = payload;
    if (!threadId) {
      throw new Error('DETAIL_THREAD_USE_CASE.NOT_CONTAIN_VALID_PAYLOAD');
    }

    if (typeof threadId !== 'string') {
      throw new Error('DETAIL_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailThreadUseCase;
