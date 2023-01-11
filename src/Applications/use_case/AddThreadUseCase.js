const Thread = require('../../Domains/threads/entities/NewThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const newThread = new Thread(useCasePayload);
    return this._threadRepository.addThread(newThread);
  }
}

module.exports = AddThreadUseCase;
