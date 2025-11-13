import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import dashbordReducer from './slices/dashboardSlice';
import templateReducer from './slices/templateSlice'
import requestReducer from './slices/requestSlice'



export const store = configureStore({
  reducer: {
    user: userReducer,
    template: templateReducer , // Add this
    dashboard : dashbordReducer,
    request: requestReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

