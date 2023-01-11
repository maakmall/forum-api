const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const DetailThreadUseCase = require('../../../../Applications/use_case/DetailThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getDetailThreadHandler = this.getDetailThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const useCasePayload = {
      title: request.payload.title,
      body: request.payload.body,
      owner: request.auth.credentials.id,
    };
    const addedThread = await addThreadUseCase.execute(useCasePayload);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    }).code(201);
    return response;
  }

  async getDetailThreadHandler(request, h) {
    const detailThreadUseCase = this._container.getInstance(DetailThreadUseCase.name);
    const useCasePayload = { threadId: request.params.threadId };

    const { thread } = await detailThreadUseCase.execute(useCasePayload);

    return h.response({
      status: 'success',
      data: {
        thread,
      },
    });
  }
}

module.exports = ThreadsHandler;
