import { aiAgent } from '../ai/agent.js';
import { sendSuccess } from '../utils/response.js';

export const aiController = {
  async chat(req, res, next) {
    try {
      const { message } = req.body;
      const result = await aiAgent.processQuery({
        message,
        userId: req.user?.userId || null,
      });

      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },
};
