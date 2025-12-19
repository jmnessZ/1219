import { createContext, useState, useEffect } from "react";
import apiService from "../lib/apiService";
import { safeLocalStorageGet, safeLocalStorageRemove, safeLocalStorageSet } from "../lib/utils";

// 定义用户类型
export interface User {
  id: string;
  username: string;
  phone: string;
  role: 'admin' | 'user';
  userType?: 'student' | 'teacher'; // 新增用户类型字段
  createdAt: string;
}

// 定义认证上下文类型
export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: User | null) => void;
  login: (phone: string, password: string) => Promise<boolean>;
  register: (phone: string, username: string, password: string, userType?: 'student' | 'teacher') => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
}

// 默认管理员账号
const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  username: '管理员',
  phone: '13800138000',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

// 确保管理员账号存在
const ensureAdminExists = () => {
  try {
    const users = safeLocalStorageGet('users', []);
    const adminExists = users.some((u: any) => u.role === 'admin' && u.phone === DEFAULT_ADMIN.phone);
    
    if (!adminExists) {
      // 管理员默认密码: admin123
      const adminWithPassword = {
        ...DEFAULT_ADMIN,
        password: 'admin123' // 在实际应用中应使用加密存储
      };
      
      users.push(adminWithPassword);
      safeLocalStorageSet('users', users);
    }
  } catch (error) {
    console.error('确保管理员账号存在时出错:', error);
  }
};

// 创建默认的上下文值
// 创建默认的Context值
const defaultAuthContextValue: AuthContextType = {
  isAuthenticated: false,
  user: null,
  setIsAuthenticated: () => {},
  setUser: () => {},
  login: async () => false,
  register: async () => false,
  logout: () => {},
  isAdmin: () => false,
};

// 为了解决useState和useEffect未定义的问题，我们使用原始的Context定义
export const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);

// 自定义Hook，用于在组件中使用认证功能
export function useAuthContext() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // 从localStorage加载用户数据
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
      }
    }

    // 确保管理员账号存在
    ensureAdminExists();
  }, []);

  // 登录功能
  const login = async (phone: string, password: string): Promise<boolean> => {
    try {
      // 尝试通过API登录
      const result = await apiService.user.login(phone, password);
      
      if (result.success && result.data) {
        // API登录成功
        setUser(result.data);
        setIsAuthenticated(true);
        safeLocalStorageSet('currentUser', result.data);
        return true;
      } else {
        // API登录失败，尝试使用localStorage登录（备用方案）
        const users = safeLocalStorageGet('users', []);
        const foundUser = users.find((u: any) => u.phone === phone && u.password === password);
        
        if (foundUser) {
          // 移除密码字段后存储用户信息
          const { password: _, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword as User);
          setIsAuthenticated(true);
          safeLocalStorageSet('currentUser', userWithoutPassword);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // 注册功能
  const register = async (phone: string, username: string, password: string, userType: 'student' | 'teacher' = 'student'): Promise<boolean> => {
    try {
      // 尝试通过API注册
      const result = await apiService.user.register(phone, username, password, userType);
      
      if (result.success && result.data) {
        // API注册成功
        const { password: _, ...userWithoutPassword } = result.data;
        setUser(userWithoutPassword as User);
        setIsAuthenticated(true);
        safeLocalStorageSet('currentUser', userWithoutPassword);
        return true;
      } else {
        // API注册失败，尝试使用localStorage注册（备用方案）
        // 根据用户类型验证用户名格式
        if (userType === 'student') {
          // 学生用户：验证格式为"2025届X班姓名"
          const studentNameRegex = /^202[0-9]届[1-9]\d*[班|級][\u4e00-\u9fa5]+$/;
          if (!studentNameRegex.test(username)) {
            throw new Error('学生用户名格式不正确，请使用"2025届X班姓名"格式（如：2025届1班张三）');
          }
        } else {
          // 老师用户：验证格式为中文姓名
          const teacherNameRegex = /^[\u4e00-\u9fa5]+$/;
          if (!teacherNameRegex.test(username)) {
            throw new Error('老师用户名格式不正确，请直接使用老师姓名（如：李老师）');
          }
        }

        // 验证手机号格式
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
          throw new Error('请输入有效的手机号码');
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // 检查手机号是否已注册
        if (users.some((u: any) => u.phone === phone)) {
          throw new Error('该手机号已被注册');
        }

        // 创建新用户
        const newUser: User & { password: string; userType: 'student' | 'teacher' } = {
          id: `user-${Date.now()}`,
          username,
          phone,
          role: 'user',
          userType,
          password, // 在实际应用中应使用加密存储
          createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // 自动登录新用户
        const { password: _, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
        return true;
      }
    } catch (error) {
      console.error('Registration error:', error);
      // 抛出错误以便上层处理显示
      if (error instanceof Error) {
        throw error;
      }
      return false;
    }
  };

  // 登出功能
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  // 检查是否为管理员
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return {
    isAuthenticated,
    user,
    setIsAuthenticated,
    setUser,
    login,
    register,
    logout,
    isAdmin
  };
}