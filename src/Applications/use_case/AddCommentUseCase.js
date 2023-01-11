const Comment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const newComment = new Comment(useCasePayload);
    await this._threadRepository.checkAvailabilityThread(newComment.threadId);
    return this._commentRepository.addComment(newComment);
  }
}

module.exports = AddCommentUseCase;
