/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpService } from "../index";

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  businessName: string;
  country?: string;
  phone?: string;
  role: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  position?: string;
  phoneNumber?: string;
  website?: string;
  about?: string;
  profileImage?: string | null; 
  socialLinks?: string[]; // we'll send plain URLs array
}

class AuthBaseService extends HttpService {
  private readonly base = "user";

  register = (data: RegisterDto) =>
    this.post(`${this.base}/register`, data);

  login = (data: LoginDto) =>
    this.post(`${this.base}/login`, data);

  me = () =>
    this.get(`${this.base}/me`);

  forgotPassword = (data: ForgotPasswordDto) =>
    this.post(`${this.base}/forgot-password`, data);

  verifyOTP = (data: any) => this.post(`${this.base}/verify-otp`, data);

  resetPassword = (data: any) =>
    this.post(`${this.base}/reset-password`, data); // small fix

  googleLogin = (data: any) =>
    this.post(`${this.base}/google-login`, data);

  // NEW: update current user
  updateMe = (data: UpdateUserDto) =>
    this.put(`${this.base}/update`, data);

  // NEW: delete current user
  deleteMe = () =>
    this.delete(`${this.base}/me`);
}


export const authBaseService = new AuthBaseService();
