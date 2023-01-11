const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const useCasePayload = {
      userId: request.auth.credentials.id,
      threadId: request.params.threadId,
      content: request.payload.content,
    };

    const addedComment = await addCommentUseCase.execute(useCasePayload);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    }).code(201);
    return response;
  }

  async deleteCommentHandler(request) {
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    const useCasePayload = {
      userId: request.auth.credentials.id,
      threadId: request.params.threadId,
      commentId: request.params.commentId,
    };

    await deleteCommentUseCase.execute(useCasePayload);
    return {
      status: 'success',
    };
  }
}

module.exports = CommentsHandler;
