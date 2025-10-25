import axiosInstance from '../axios/axiosInstance';
import type { Activity } from '../types/activity';


const getRecent = async (): Promise<Activity[]> => {
  const res = await axiosInstance.get(`/activities/recent`);
  const data = (res.data as { data?: Activity[] } | Activity[]);
  if (Array.isArray(data)) return data as Activity[];
  if ((data as any).data && Array.isArray((data as any).data)) return (data as any).data;
  return [];
};

export default {
  getRecent,
};
