export interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'agent' | 'va';
  isActive: boolean;
}

export interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'va';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddEditUserFormProps {
  mode?: 'add' | 'edit';
  userId?: string;
  initialUser?: User;
}
