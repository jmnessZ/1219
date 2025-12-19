// API服务层 - 用于模拟后端API调用
// 后续部署时可以替换为真实的后端API

// 基础URL配置 - 可以根据部署环境修改
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 定义API响应类型
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 通用请求函数
async function apiRequest<T>(endpoint: string, options: object = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API请求错误:', error);
    
    // 在开发环境下，如果API调不通，尝试使用localStorage作为后备存储
    if (import.meta.env.DEV) {
      return {
        success: false,
        error: 'API服务不可用，正在使用本地存储'
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

// 作品相关API
export const worksApi = {
  // 获取所有投稿作品
  async getSubmittedWorks(): Promise<ApiResponse<any[]>> {
    const result = await apiRequest<any[]>('works/submitted');
    
    // 如果API请求失败，从localStorage读取数据作为备用
    if (!result.success) {
      try {
        const savedWorks = localStorage.getItem('submittedWorks');
        if (savedWorks) {
          return {
            success: true,
            data: JSON.parse(savedWorks)
          };
        }
      } catch (error) {
        console.error('读取本地存储失败:', error);
      }
    }
    
    return result;
  },
  
  // 获取所有优秀作品
  async getFeaturedWorks(): Promise<ApiResponse<any[]>> {
    const result = await apiRequest<any[]>('works/featured');
    
    // 如果API请求失败，从localStorage读取数据作为备用
    if (!result.success) {
      try {
        const savedWorks = localStorage.getItem('featuredWorks');
        if (savedWorks) {
          return {
            success: true,
            data: JSON.parse(savedWorks)
          };
        }
      } catch (error) {
        console.error('读取本地存储失败:', error);
      }
    }
    
    return result;
  },
  
  // 提交新作品
  async submitWork(work: any): Promise<ApiResponse<any>> {
    return apiRequest<any>('works/submit', {
      method: 'POST',
      body: JSON.stringify(work)
    });
  }
};

// 用户相关API
export const userApi = {
  // 用户登录
  async login(phone: string, password: string): Promise<ApiResponse<any>> {
    return apiRequest<any>('user/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password })
    });
  },
  
  // 用户注册
  async register(phone: string, username: string, password: string, userType: 'student' | 'teacher'): Promise<ApiResponse<any>> {
    return apiRequest<any>('user/register', {
      method: 'POST',
      body: JSON.stringify({ phone, username, password, userType })
    });
  },
  
  // 获取当前用户信息
  async getCurrentUser(): Promise<ApiResponse<any>> {
    return apiRequest<any>('user/current');
  }
};

// 留言板相关API
export const messageApi = {
  // 获取所有留言
  async getMessages(): Promise<ApiResponse<any[]>> {
    const result = await apiRequest<any[]>('messages');
    
    // 如果API请求失败，从localStorage读取数据作为备用
    if (!result.success) {
      try {
        const savedMessages = localStorage.getItem('messages');
        if (savedMessages) {
          return {
            success: true,
            data: JSON.parse(savedMessages)
          };
        }
      } catch (error) {
        console.error('读取本地存储失败:', error);
      }
    }
    
    return result;
  },
  
  // 发布新留言
  async postMessage(message: any): Promise<ApiResponse<any>> {
    return apiRequest<any>('messages', {
      method: 'POST',
      body: JSON.stringify(message)
    });
  }
};

// 投票活动相关API
export const votingApi = {
  // 获取所有投票活动
  async getActivities(): Promise<ApiResponse<any[]>> {
    const result = await apiRequest<any[]>('voting/activities');
    
    // 如果API请求失败，从localStorage读取数据作为备用
    if (!result.success) {
      try {
        const savedActivities = localStorage.getItem('votingActivities');
        if (savedActivities) {
          return {
            success: true,
            data: JSON.parse(savedActivities)
          };
        }
      } catch (error) {
        console.error('读取本地存储失败:', error);
      }
    }
    
    return result;
  },
  
  // 投票
  async vote(activityId: string, workId: number): Promise<ApiResponse<any>> {
    return apiRequest<any>(`voting/activities/${activityId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ workId })
    });
  }
};

// 摄影知识相关API
export const knowledgeApi = {
  // 获取所有摄影知识
  async getKnowledgeItems(): Promise<ApiResponse<any[]>> {
    const result = await apiRequest<any[]>('knowledge');
    
    // 如果API请求失败，从localStorage读取数据作为备用
    if (!result.success) {
      try {
        const savedItems = localStorage.getItem('photographyKnowledge');
        if (savedItems) {
          return {
            success: true,
            data: JSON.parse(savedItems)
          };
        }
      } catch (error) {
        console.error('读取本地存储失败:', error);
      }
    }
    
    return result;
  }
};

// 导出默认API对象
export default {
  works: worksApi,
  user: userApi,
  message: messageApi,
  voting: votingApi,
  knowledge: knowledgeApi
};