import { dashboardService } from '../services/dashboard.service.js';
import { asyncHandler } from '../utils/async-handler.js';

export const getDashboardSummary = asyncHandler(async (request, response) => {
  response.json(await dashboardService.summary());
});
