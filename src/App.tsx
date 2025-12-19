import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import { useState, useEffect } from "react";
import { AuthContext, User } from './contexts/authContext';
import { toast } from "sonner";
import { safeLocalStorageGet, safeLocalStorageSet } from './lib/utils';
import apiService from './lib/apiService';

// 默认管理员账号
const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  username: '管理员',
  phone: '13800138000',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

export default function App() {
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
    
    // 在生产环境中，我们可以尝试从API获取当前用户信息
    if (import.meta.env.PROD) {
      loadUserFromApi();
    }
  }, []);

  // 尝试从API加载用户信息（生产环境）
  const loadUserFromApi = async () => {
    try {
      const result = await apiService.user.getCurrentUser();
      if (result.success && result.data) {
        setUser(result.data);
        setIsAuthenticated(true);
        safeLocalStorageSet('currentUser', result.data);
      }
    } catch (error) {
      console.error('Failed to load user from API:', error);
    }
  };

  // 确保管理员账号存在于localStorage中
  const ensureAdminExists = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const adminExists = users.some((u: any) => u.role === 'admin' && u.phone === DEFAULT_ADMIN.phone);
    
    if (!adminExists) {
      // 管理员默认密码: admin123
      const adminWithPassword = {
        ...DEFAULT_ADMIN,
        password: 'admin123' // 在实际应用中应使用加密存储
      };
      
      users.push(adminWithPassword);
      localStorage.setItem('users', JSON.stringify(users));
      
      // 显示管理员账号信息
      toast.info('管理员账号已创建：手机号13800138000，密码admin123');
    }
  };

  // 登录功能 - 支持API和localStorage
  const login = async (phone: string, password: string): Promise<boolean> => {
    try {
      // 尝试通过API登录
      const apiResult = await apiService.user.login(phone, password);
      
      if (apiResult.success && apiResult.data) {
        // API登录成功
        setUser(apiResult.data);
        setIsAuthenticated(true);
        safeLocalStorageSet('currentUser', apiResult.data);
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

  // 注册功能 - 支持API和localStorage
  const register = async (phone: string, username: string, password: string, userType: 'student' | 'teacher' = 'student'): Promise<boolean> => {
    try {
      // 尝试通过API注册
      const apiResult = await apiService.user.register(phone, username, password, userType);
      
      if (apiResult.success && apiResult.data) {
        // API注册成功
        const { password: _, ...userWithoutPassword } = apiResult.data;
        setUser(userWithoutPassword);
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
            toast.error('学生用户名格式不正确，请使用"2025届X班姓名"格式（如：2025届1班张三）');
            return false;
          }
        } else {
          // 老师用户：验证格式为中文姓名
          const teacherNameRegex = /^[\u4e00-\u9fa5]+$/;
          if (!teacherNameRegex.test(username)) {
            toast.error('老师用户名格式不正确，请直接使用老师姓名（如：李老师）');
            return false;
          }
        }

        // 验证手机号格式
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
          toast.error('请输入有效的手机号码');
          return false;
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // 检查手机号是否已注册
        if (users.some((u: any) => u.phone === phone)) {
          toast.error('该手机号已被注册');
          return false;
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

  // 管理员路由保护
  const ProtectedAdminRoute = () => {
    if (!isAuthenticated || !isAdmin()) {
      return <Navigate to="/login" replace />;
    }
    return <Admin />;
  };

  return (
    <AuthContext.Provider
      value={{ 
        isAuthenticated, 
        user,
        setIsAuthenticated, 
        setUser,
        login,
        register,
        logout,
        isAdmin
      }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedAdminRoute />} />
        <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
      </Routes>
    </AuthContext.Provider>
  );
}
