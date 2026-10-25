import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import activityReducer from './activity/activitySlice';
import reposReducer from './repos/reposSlice';
import pullRequestReducer from './pullRequests/pullRequestSlice';
import issueReducer from './issues/issueSlice';
import orgReducer from './orgs/orgSlice';
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";

const rootReducer = {
  auth: authReducer,
  activity: activityReducer,
  repos: reposReducer,
  pullRequests: pullRequestReducer,
  issues: issueReducer,
  orgs: orgReducer,
}

export const store = configureStore({
  reducer: rootReducer,
  devTools: true // for development, must be disabled in production
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;