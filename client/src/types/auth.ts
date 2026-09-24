export interface User { [key: string]: any; id: string; email: string; fullName: string; }
export interface Tenant { [key: string]: any; id: string; name: string; }
export interface Plan { [key: string]: any; id: string; name: string; }
export interface RegisterInput { [key: string]: any; email: string; password: string; fullName: string; }
export interface LoginResponse { accessToken: string; refreshToken?: string; user: User; tenant?: Tenant; plan?: Plan | null; }
export interface RegisterResponse { accessToken: string; refreshToken?: string; user: User; tenant?: Tenant; plan?: Plan | null; }
export interface CreateStaffInput { [key: string]: any; email: string; fullName?: string; role?: string; }
export interface UserInvitation { [key: string]: any; id: string; email: string; }
