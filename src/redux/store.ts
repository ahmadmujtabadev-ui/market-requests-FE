import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import dashbordReducer from './slices/dashboardSlice';
import templateReducer from './slices/templateSlice'
import requestReducer from './slices/requestSlice'
import userManagementReducer from './slices/userManagementSlice'
import  adminStatsReducer  from './slices/adminstatsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    template: templateReducer , // Add this
    dashboard : dashbordReducer,
    request: requestReducer,
    admin: userManagementReducer,
    stats: adminStatsReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

