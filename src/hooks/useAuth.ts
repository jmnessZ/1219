import { useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/authContext';
import { safeLocalStorageGet, safeLocalStorageRemove, safeLocalStorageSet } from '../lib/utils';
import { toast } from 'sonner';
import apiService from '../lib/apiService';

// 默认管理员账号
const DEFAULT_ADMIN = {
  id: 'admin-001',
  username: '管理员',
  phone: '13800138000',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  const { isAuthenticated, user, login, logout } = context;
  
  // 确保管理员账号存在
  useEffect(() => {
    const ensureAdminExists = () => {
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
    };
    
    ensureAdminExists();
  }, []);
  
  // 安全的登录方法（包含额外的错误处理）
  const safeLogin = async (phone: string, password: string): Promise<boolean> => {
    try {
      // 优先尝试API登录
      const result = await apiService.user.login(phone, password);
      
      if (result.success && result.data) {
        // API登录成功，更新本地状态
        safeLocalStorageSet('currentUser', result.data);
        // 刷新页面以更新全局状态
        window.location.reload();
        return true;
      } else {
        // API登录失败，尝试本地登录
        return await login(phone, password);
      }
    } catch (error) {
      console.error('Login error:', error);
      // 如果API失败，回退到本地登录
      try {
        return await login(phone, password);
      } catch (localError) {
        toast.error('登录过程中发生错误，请稍后重试');
        return false;
      }
    }
  };
  
  // 安全的登出方法
  const safeLogout = () => {
    try {
      logout();
      // 清除所有与用户相关的会话数据
      safeLocalStorageRemove('votedWorks');
      
      // 在生产环境中，调用API登出
      if (import.meta.env.PROD) {
        // 这里可以添加API登出逻辑
        console.log('Production environment: User logged out');
      }
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('登出过程中发生错误，请稍后重试');
      return false;
    }
  };
  
  // 检查用户是否已登录
  const checkAuthStatus = (): boolean => {
    return isAuthenticated && user !== null;
  };
  
  // 检查用户是否为管理员
  const checkIsAdmin = (): boolean => {
    return isAuthenticated && user?.role === 'admin';
  };
  
  return {
    ...context,
    safeLogin,
    safeLogout,
    checkAuthStatus,
    checkIsAdmin
  };
}