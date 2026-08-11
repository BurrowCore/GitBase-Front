import axiosInstance from '../axios/axiosInstance';
import type { ApiResponse } from '../types/api';
import type { Activity } from '../types/activity';

const getRecent = async (): Promise<Activity[]> => {
  const res = await axiosInstance.get<ApiResponse<Activity[]>>('/activities/recent');
  return res.data.data ?? [];
};

export default {
  getRecent,
};
