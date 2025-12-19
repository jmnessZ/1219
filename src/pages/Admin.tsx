import React, { useState, useEffect } from "react";
  import { Trophy, Upload, CheckCircle, LogOut, ChevronLeft, Users, X } from "lucide-react";
  import { useNavigate } from "react-router-dom";
  import { toast } from "sonner";
  import { cn, safeLocalStorageSet } from "../lib/utils";
  import { useContext } from "react";
  import { AuthContext, User } from "../contexts/authContext";

  // 定义作品类型
  interface SubmittedWork {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    author: string;
    timestamp: string;
    votes: number;
  }

  interface FeaturedWork extends SubmittedWork {
    comments: Array<{
      id: number;
      author: string;
      content: string;
      time: string;
      replies?: Array<{
        id: number;
        author: string;
        content: string;
        time: string;
      }>;
    }>;
    likes: number;
  }

  // 定义留言数据结构
  interface ReplyType {
    id: number;
    author: string;
    content: string;
    time: string;
  }
  
  interface Message {
    id: number;
    author: string;
    content: string;
    time: string;
    likes: number;
    likedBy: string[];
    replies: ReplyType[];
    type: 'normal' | 'featured_comment' | 'knowledge_comment'; // 留言类型
    referenceId?: string | number; // 关联的作品ID或知识ID
    isPinned?: boolean; // 是否置顶
  }

  // 定义摄影知识数据结构
  interface PhotographyKnowledgeItem {
    id: string;
    title: string;
    shortDesc: string;
    detailContent: string;
    imageUrl: string;
    value: number;
    心得?: Array<{
      id: number;
      author: string;
      content: string;
      time: string;
      comments?: Array<{
        id: number;
        author: string;
        content: string;
        time: string;
      }>;
    }>;
  }

  // 定义投票活动接口
  interface VotingActivity {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    works: Array<{
      id: number;
      title: string;
      author: string;
      imageUrl: string;
      votes: number;
    }>;
  }

  export default function Admin() {
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);
  const [submittedWorks, setSubmittedWorks] = useState<SubmittedWork[]>([]);
  const [featuredWorks, setFeaturedWorks] = useState<FeaturedWork[]>([]);
  const [selectedWork, setSelectedWork] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFeaturedWork, setSelectedFeaturedWork] = useState<number | null>(null);
  // 摄影知识数据结构
  const [photographyKnowledgeItems, setPhotographyKnowledgeItems] = useState<PhotographyKnowledgeItem[]>([]);
  const [activeTab, setActiveTab] = useState<'works' | 'featured' | 'messages' | 'users' | 'activities'>('works');
  const [messageTypeFilter, setMessageTypeFilter] = useState<'all' | 'normal' | 'featured_comment' | 'knowledge_comment'>('all');
  // 投票活动相关状态
  const [votingActivities, setVotingActivities] = useState<VotingActivity[]>([]);
  const [createActivityDialog, setCreateActivityDialog] = useState(false);
  const [showActivityDetail, setShowActivityDetail] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<VotingActivity | null>(null);
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    startTime: new Date().toISOString().split('T')[0],
    endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

       // 从localStorage加载数据
  useEffect(() => {
    const loadData = () => {
      // 加载作品数据
      const savedSubmissions = localStorage.getItem('submittedWorks');
      const savedFeaturedWorks = localStorage.getItem('featuredWorks');
      const savedMessages = localStorage.getItem('messages');
      const savedActivities = localStorage.getItem('votingActivities');
      const savedKnowledgeItems = localStorage.getItem('photographyKnowledge');
      
      if (savedSubmissions) {
        setSubmittedWorks(JSON.parse(savedSubmissions));
      }
      
      if (savedFeaturedWorks) {
        setFeaturedWorks(JSON.parse(savedFeaturedWorks));
      }

      if (savedMessages) {
        try {
          const loadedMessages = JSON.parse(savedMessages);
          // 确保每条留言都有类型字段
          const messagesWithType = loadedMessages.map((msg: any) => ({
            ...msg,
            type: msg.type || 'normal' // 如果没有类型，默认为普通留言
          }));
          setMessages(messagesWithType);
        } catch (error) {
          console.error('Failed to parse messages:', error);
          // 如果解析失败，创建默认数据
          createDefaultMessages();
        }
      } else {
        // 如果没有留言数据，创建默认的测试数据，包含不同类型的留言
        createDefaultMessages();
      }

      if (savedActivities) {
        setVotingActivities(JSON.parse(savedActivities));
      }

      // 加载摄影知识数据
      if (savedKnowledgeItems) {
        setPhotographyKnowledgeItems(JSON.parse(savedKnowledgeItems));
      }

      // 加载用户数据
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        // 移除密码字段
        const usersWithoutPassword = parsedUsers.map((u: any) => {
          const { password: _, ...userWithoutPassword } = u;
          return userWithoutPassword;
        });
        setUsers(usersWithoutPassword);
      }
    };
    
    // 创建默认留言数据的函数
    const createDefaultMessages = () => {
      const defaultMessages = [
        {
          id: 1,
          author: "小明",
          content: "社团活动很精彩！这是一条普通留言。",
          time: "2025-12-12 09:30",
          likes: 5,
          likedBy: [],
          replies: [],
          type: 'normal'
        },
        {
          id: 2,
          author: "小红",
          content: "校园秋景那组照片拍得太美了，构图和光线处理都很专业！",
          time: "2025-12-11 16:45",
          likes: 3,
          likedBy: [],
          replies: [],
          type: 'featured_comment',
          referenceId: 1
        },
        {
          id: 3,
          author: "小华",
          content: "学习了构图技巧后，我的照片有了很大进步，三分法确实很实用！",
          time: "2025-12-10 14:20",
          likes: 2,
          likedBy: [],
          replies: [],
          type: 'knowledge_comment',
          referenceId: "composition"
        },
        {
          id: 4,
          author: "小李",
          content: "舞台摄影需要注意什么？灯光变化很快很难捕捉。",
          time: "2025-12-09 10:15",
          likes: 4,
          likedBy: [],
          replies: [],
          type: 'normal'
        },
        {
          id: 5,
          author: "小王",
          content: "优秀作品展示里的《黄昏操场》拍得太有感觉了，光影处理很到位！",
          time: "2025-12-08 15:30",
          likes: 6,
          likedBy: [],
          replies: [],
          type: 'featured_comment',
          referenceId: 3
        },
        {
          id: 6,
          author: "小张",
          content: "曝光补偿的使用技巧让我受益匪浅，现在拍照时更有自信了！",
          time: "2025-12-07 11:25",
          likes: 1,
          likedBy: [],
          replies: [],
          type: 'knowledge_comment',
          referenceId: "exposure"
        }
      ];
      setMessages(defaultMessages);
      localStorage.setItem('messages', JSON.stringify(defaultMessages));
    };
    
    loadData();
    
    // 监听storage变化，实时更新数据
    const handleStorageChange = () => {
      loadData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
   }, []);
   
    // 清理事件监听器已在上面的useEffect中处理

  // 监听活动ID变化，更新选中的活动
  useEffect(() => {
    if (selectedActivityId) {
      const activity = votingActivities.find(a => a.id === selectedActivityId);
      setSelectedActivity(activity || null);
    }
  }, [selectedActivityId, votingActivities]);

  // 添加作品到优秀作品展示
  const addToFeatured = (work: SubmittedWork) => {
    const newFeaturedWork: FeaturedWork = {
      ...work,
      likes: 0,
      comments: []
    };
    
    const updatedFeaturedWorks = [...featuredWorks, newFeaturedWork];
    setFeaturedWorks(updatedFeaturedWorks);
    localStorage.setItem('featuredWorks', JSON.stringify(updatedFeaturedWorks));
    
    // 从投稿列表中移除
    const updatedSubmittedWorks = submittedWorks.filter(w => w.id !== work.id);
    setSubmittedWorks(updatedSubmittedWorks);
    localStorage.setItem('submittedWorks', JSON.stringify(updatedSubmittedWorks));
    
    toast.success("作品已添加到优秀作品展示！");
  };

  // 删除投稿作品
  const deleteSubmission = (id: number) => {
    if (window.confirm("确定要删除这个投稿作品吗？")) {
      const updatedSubmittedWorks = submittedWorks.filter(w => w.id !== id);
      setSubmittedWorks(updatedSubmittedWorks);
      localStorage.setItem('submittedWorks', JSON.stringify(updatedSubmittedWorks));
      toast.success("作品已删除");
    }
  };

  // 删除优秀作品
  const deleteFeaturedWork = (id: number) => {
    if (window.confirm("确定要删除这个优秀作品吗？此操作不可撤销！")) {
      const updatedFeaturedWorks = featuredWorks.filter(w => w.id !== id);
      setFeaturedWorks(updatedFeaturedWorks);
      localStorage.setItem('featuredWorks', JSON.stringify(updatedFeaturedWorks));
      toast.success("优秀作品已删除");
    }
  };

  // 删除优秀作品评论
  const deleteFeaturedComment = (workId: number, commentId: number) => {
    if (window.confirm("确定要删除这条评论吗？")) {
      const updatedFeaturedWorks = featuredWorks.map(work => {
        if (work.id === workId) {
          return {
            ...work,
            comments: work.comments.filter(comment => comment.id !== commentId)
          };
        }
        return work;
      });
      
      setFeaturedWorks(updatedFeaturedWorks);
      localStorage.setItem('featuredWorks', JSON.stringify(updatedFeaturedWorks));
      toast.success("评论已删除");
    }
  };

   // 删除留言
  const deleteMessage = (id: number) => {
    if (window.confirm("确定要删除这条留言吗？此操作不可撤销！")) {
      const updatedMessages = messages.filter(msg => msg.id !== id);
      setMessages(updatedMessages);
      localStorage.setItem('messages', JSON.stringify(updatedMessages));
      toast.success("留言已删除");
    }
  };

  // 删除留言的回复
  // 删除优秀作品评论的回复
  const deleteFeaturedReply = (workId: number, commentId: number, replyId: number) => {
    if (window.confirm("确定要删除这条回复吗？")) {
      const updatedFeaturedWorks = featuredWorks.map(work => {
        if (work.id === workId) {
          return {
            ...work,
            comments: work.comments.map(comment => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  replies: comment.replies.filter(reply => reply.id !== replyId)
                };
              }
              return comment;
            })
          };
        }
        return work;
      });
      
      setFeaturedWorks(updatedFeaturedWorks);
      localStorage.setItem('featuredWorks', JSON.stringify(updatedFeaturedWorks));
      toast.success("回复已删除");
    }
  };
  const deleteReply = (messageId: number, replyId: number) => {
    if (window.confirm("确定要删除这条回复吗？")) {
      const updatedMessages = messages.map(message => {
        if (message.id === messageId) {
          return {
            ...message,
            replies: message.replies.filter(reply => reply.id !== replyId)
          };
        }
        return message;
      });
      
      setMessages(updatedMessages);
      localStorage.setItem('messages', JSON.stringify(updatedMessages));
      toast.success("回复已删除");
    }
  };

  // 置顶/取消置顶留言
  const togglePinMessage = (id: number) => {
    const updatedMessages = messages.map(message => {
      if (message.id === id) {
        return {
          ...message,
          isPinned: !message.isPinned
        };
      }
      return message;
    });
    
    // 按置顶状态和时间排序
    updatedMessages.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });
    
    setMessages(updatedMessages);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    toast.success(`${updatedMessages.find(m => m.id === id)?.isPinned ? "留言已置顶" : "已取消置顶"}`);
  };

  // 预览作品
  const previewWork = (id: number) => {
    setSelectedWork(id === selectedWork ? null : id);
  };

  // 处理登出
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 重置用户密码
  const resetUserPassword = (userId: string) => {
    if (window.confirm("确定要重置该用户的密码吗？重置后密码将变为123456")) {
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = allUsers.map((u: any) => 
        u.id === userId ? { ...u, password: '123456' } : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // 更新用户列表
      const usersWithoutPassword = updatedUsers.map((u: any) => {
        const { password: _, ...userWithoutPassword } = u;
        return userWithoutPassword;
      });
      setUsers(usersWithoutPassword);
      
      toast.success("用户密码已重置为123456");
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 检查活动是否在进行中
  const isActivityActive = (activity: VotingActivity) => {
    const now = new Date();
    const startTime = new Date(activity.startTime);
    const endTime = new Date(activity.endTime);
    return now >= startTime && now <= endTime;
  };

  // 创建新活动
  const handleCreateActivity = () => {
    if (!newActivity.title || !newActivity.description) {
      toast.error("请填写活动标题和描述");
      return;
    }

    const startDate = new Date(newActivity.startTime);
    const endDate = new Date(newActivity.endTime);

    if (startDate >= endDate) {
      toast.error("开始时间必须早于结束时间");
      return;
    }

    // 移除活动时间重叠的限制，允许多个活动同时进行

    const activity: VotingActivity = {
      id: `activity-${Date.now()}`,
      title: newActivity.title,
      description: newActivity.description,
      startTime: newActivity.startTime,
      endTime: newActivity.endTime,
      works: []
    };

    const updatedActivities = [...votingActivities, activity];
    setVotingActivities(updatedActivities);
    localStorage.setItem('votingActivities', JSON.stringify(updatedActivities));

    setCreateActivityDialog(false);
    setNewActivity({
      title: '',
      description: '',
      startTime: new Date().toISOString().split('T')[0],
      endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    toast.success("投票活动创建成功");
  };

  // 删除活动
  const deleteActivity = (activityId: string) => {
    // 找到要删除的活动
    const activityToDelete = votingActivities.find(a => a.id === activityId);
    
    // 根据活动状态显示不同的确认信息
    const isActive = activityToDelete ? isActivityActive(activityToDelete) : false;
    const confirmMessage = isActive 
      ? "确定要删除这个进行中的投票活动吗？此操作将清空所有投票数据，且不可撤销！" 
      : "确定要删除这个投票活动吗？此操作不可撤销！";
    
    if (window.confirm(confirmMessage)) {
      const updatedActivities = votingActivities.filter(a => a.id !== activityId);
      setVotingActivities(updatedActivities);
      localStorage.setItem('votingActivities', JSON.stringify(updatedActivities));
      toast.success("投票活动已删除");
    }
  };

  // 直接上传照片到活动
  const handleActivityPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, activityId: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        toast.error("请上传图片文件");
        return;
      }
      
      // 检查文件大小（限制为30MB）
      if (file.size > 30 * 1024 * 1024) {
        toast.error("图片大小不能超过30MB");
        return;
      }
      
      // 创建图片对象用于压缩
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          img.src = event.target.result;
          
          img.onload = () => {
            // 创建canvas进行图片压缩
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) return;
            
            // 设置压缩后的图片尺寸（保持比例）
            const maxWidth = 800;
            const maxHeight = 600;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
              if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // 在canvas上绘制图片
            ctx.drawImage(img, 0, 0, width, height);
            
            // 将canvas内容转换为DataURL（压缩质量为0.7）
            const compressedDataUrl = canvas.toDataURL(file.type, 0.7);
            
            // 创建新作品对象
            const newWork = {
              id: Date.now(),
              title: "评选照片",
              author: "管理员",
              imageUrl: compressedDataUrl,
              votes: 0
            };
            
            // 更新活动数据
            const updatedActivities = votingActivities.map(activity => {
              if (activity.id === activityId) {
                return {
                  ...activity,
                  works: [...activity.works, newWork]
                };
              }
              return activity;
            });
            
              setVotingActivities(updatedActivities);
             
             // 尝试保存到localStorage
             const saved = safeLocalStorageSet('votingActivities', updatedActivities);
             
             if (saved) {
               // 更新选中的活动
               if (selectedActivityId === activityId) {
                 const updatedActivity = updatedActivities.find(a => a.id === activityId);
                 setSelectedActivity(updatedActivity || null);
               }
               
               toast.success("照片已成功添加到活动中");
             } else {
               // 处理存储错误
               toast.error("存储空间不足或发生其他错误，请删除部分不需要的活动或图片后重试");
             }
          };
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  // 从活动中移除作品
  const removeWorkFromActivity = (activityId: string, workId: number) => {
    if (window.confirm("确定要删除这个作品吗？")) {
      const updatedActivities = votingActivities.map(activity => {
        if (activity.id === activityId) {
          return {
            ...activity,
            works: activity.works.filter(work => work.id !== workId)
          };
        }
        return activity;
      });

      setVotingActivities(updatedActivities);
      localStorage.setItem('votingActivities', JSON.stringify(updatedActivities));

      // 更新选中的活动
      if (selectedActivityId === activityId) {
        const updatedActivity = updatedActivities.find(a => a.id === activityId);
        setSelectedActivity(updatedActivity || null);
      }

      toast.success("作品已从活动中移除");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-orange-500 mr-3"
              >
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-xl font-bold text-gray-800">后台管理</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{user?.username}</span>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm bg-orange-500 hover:bg-orange-600 text-white font-medium py-1.5 px-3 rounded-md transition-colors"
              >
                <LogOut size={16} className="mr-1" /> 退出
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* 标签页切换 */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-1 flex flex-wrap">
          <button
            onClick={() => setActiveTab('works')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${
              activeTab === 'works' ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Upload size={18} className="mr-2" />
            投稿管理
          </button>
          <button
            onClick={() => setActiveTab('featured')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${
              activeTab === 'featured' ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Trophy size={18} className="mr-2" />
            优秀作品管理
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${
              activeTab === 'messages' ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users size={18} className="mr-2" />
            留言管理
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${
              activeTab === 'activities' ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Trophy size={18} className="mr-2" />
            投票活动管理
          </button>
        </div>

        {activeTab === 'works' ? (
          // 投稿作品管理内容
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 统计卡片 */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mr-4">
                  <Upload size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">待审核投稿</p>
                  <p className="text-2xl font-bold text-gray-800">{submittedWorks.length}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mr-4">
                  <Trophy size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">优秀作品数</p>
                  <p className="text-2xl font-bold text-gray-800">{featuredWorks.length}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mr-4">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">总作品数</p>
                  <p className="text-2xl font-bold text-gray-800">{submittedWorks.length + featuredWorks.length}</p>
                </div>
              </div>
            </div>

            {/* 投稿管理列表 */}
            <div className="md:col-span-3 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Upload className="mr-2 text-orange-500" size={20} />投稿作品管理
              </h2>
              
              {submittedWorks.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  暂无投稿作品
                </div>
              ) : (
                <div className="space-y-6">
                  {submittedWorks.map((work) => (
                    <div 
                      key={work.id} 
                      className={`border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 ${
                        selectedWork === work.id ? 'ring-2 ring-orange-500 shadow-lg' : 'hover:shadow-md'
                      }`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-5">
                        <div className="md:col-span-2 h-48 bg-gray-200 overflow-hidden">
                          <img 
                            src={work.imageUrl} 
                            alt={work.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="md:col-span-3 p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-gray-800">{work.title}</h3>
                            <span className="text-xs text-gray-500">{work.timestamp}</span>
                          </div>
                          <p className="text-gray-600 mb-2">{work.description}</p>
                          <p className="text-sm text-gray-500 mb-4">作者: {work.author}</p>
                          <p className="text-sm text-gray-500 mb-4">投票数: {work.votes}</p>
                           <div className="flex flex-wrap gap-2 mt-auto">
                              <button
                                onClick={() => previewWork(work.id)}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                              >
                                {selectedWork === work.id ? '收起预览' : '预览作品'}
                              </button>
                              
                              {/* 添加到优秀作品按钮 - 独立显示 */}
                              <button
                                onClick={() => addToFeatured(work)}
                                className="px-3 py-1 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600 transition-colors"
                              >
                                添加到优秀作品
                              </button>
                              
                              {/* 检查是否有进行中的活动，如果有则显示添加到投票活动按钮 */}
                              {(() => {
                                const now = new Date();
                                const activeActivity = votingActivities.find(activity => {
                                  const startTime = new Date(activity.startTime);
                                  const endTime = new Date(activity.endTime);
                                  return now >= startTime && now <= endTime;
                                });
                                
                                if (activeActivity) {
                                  return (
                                    <button
                                      onClick={() => {
                                        // 添加到当前活动
                                        const updatedActivities = votingActivities.map(activity => {
                                          if (activity.id === activeActivity.id) {
                                            // 检查作品是否已在活动中
                                            const workExists = activity.works.some(w => w.id === work.id);
                                            if (workExists) {
                                              toast.error("该作品已在当前活动中");
                                              return activity;
                                            }
                                            return {
                                              ...activity,
                                              works: [...activity.works, {
                                                id: work.id,
                                                title: work.title,
                                                author: work.author,
                                                imageUrl: work.imageUrl,
                                                votes: 0
                                              }]
                                            };
                                          }
                                          return activity;
                                        });
                                        setVotingActivities(updatedActivities);
                                        localStorage.setItem('votingActivities', JSON.stringify(updatedActivities));
                                        toast.success("作品已添加到当前投票活动");
                                      }}
                                      className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                                    >
                                      添加到投票活动
                                    </button>
                                  );
                                }
                                return null;
                              })()}
                              
                              <button
                                onClick={() => deleteSubmission(work.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors"
                              >
                                删除
                              </button>
                            </div>
                        </div>
                      </div>
                      
                      {selectedWork === work.id && (
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                          <h4 className="font-medium text-gray-700 mb-2">作品详情</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">ID</p>
                              <p className="font-medium">{work.id}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">提交时间</p>
                              <p className="font-medium">{work.timestamp}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-gray-500">完整描述</p>
                              <p className="font-medium">{work.description}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'featured' ? (
          // 优秀作品管理内容
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-3 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Trophy className="mr-2 text-orange-500" size={20} />优秀作品管理
              </h2>
              
              {/* 上传照片按钮 */}
              <div className="mb-6">
                <button
                  onClick={() => {
                    const fileInput = document.getElementById('featured-photo-upload') as HTMLInputElement;
                    if (fileInput) {
                      fileInput.click();
                    }
                  }}
                  className="w-full md:w-auto py-3 px-6 border border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-orange-500 transition-colors cursor-pointer"
                >
                  <Upload size={20} className="text-gray-400 mr-2" />
                  <span className="text-gray-600">直接上传优秀作品照片</span>
                </button>
                <input
                  id="featured-photo-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      
                      // 检查文件类型
                      if (!file.type.startsWith('image/')) {
                        toast.error("请上传图片文件");
                        return;
                      }
                      
                      // 检查文件大小（限制为30MB）
                      if (file.size > 30 * 1024 * 1024) {
                        toast.error("图片大小不能超过30MB");
                        return;
                      }
                      
                      // 创建图片对象用于压缩
                      const img = new Image();
                      const reader = new FileReader();
                      
                      reader.onload = (event) => {
                        if (event.target && typeof event.target.result === 'string') {
                          img.src = event.target.result;
                          
                          img.onload = () => {
                            // 创建canvas进行图片压缩
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            
                            if (!ctx) return;
                            
                            // 设置压缩后的图片尺寸（保持比例）
                            const maxWidth = 800;
                            const maxHeight = 600;
                            let width = img.width;
                            let height = img.height;
                            
                            if (width > height) {
                              if (width > maxWidth) {
                                height *= maxWidth / width;
                                width = maxWidth;
                              }
                            } else {
                              if (height > maxHeight) {
                                width *= maxHeight / height;
                                height = maxHeight;
                              }
                            }
                            
                            canvas.width = width;
                            canvas.height = height;
                            
                            // 在canvas上绘制图片
                            ctx.drawImage(img, 0, 0, width, height);
                            
                            // 将canvas内容转换为DataURL（压缩质量为0.7）
                            const compressedDataUrl = canvas.toDataURL(file.type, 0.7);
                            
                            // 获取当前时间
                            const now = new Date();
                            const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
                            
                            // 创建新的优秀作品对象
                            const newFeaturedWork: FeaturedWork = {
                              id: Date.now(),
                              title: "优秀作品",
                              description: "管理员上传的优秀作品",
                              imageUrl: compressedDataUrl,
                              author: "管理员",
                              timestamp,
                              votes: 0,
                              likes: 0,
                              comments: []
                            };
                            
                            // 更新优秀作品数据
                            const updatedFeaturedWorks = [...featuredWorks, newFeaturedWork];
                            setFeaturedWorks(updatedFeaturedWorks);
                            
                              // 尝试保存到localStorage
                              const saved = safeLocalStorageSet('featuredWorks', updatedFeaturedWorks);
                              
                              if (saved) {
                                toast.success("优秀作品照片已成功上传");
                              } else {
                                // 处理存储错误
                                toast.error("存储空间不足或发生其他错误，请删除部分不需要的作品或图片后重试");
                              }
                          };
                        }
                      };
                      
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              {featuredWorks.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  暂无优秀作品
                </div>
              ) : (
                <div className="space-y-6">
                  {featuredWorks.map((work) => (
                    <div 
                      key={work.id} 
                      className={`border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 ${
                        selectedFeaturedWork === work.id ? 'ring-2 ring-orange-500 shadow-lg' : 'hover:shadow-md'
                      }`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-5">
                        <div className="md:col-span-2 h-48 bg-gray-200 overflow-hidden">
                          <img 
                            src={work.imageUrl} 
                            alt={work.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="md:col-span-3 p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-gray-800">{work.title}</h3>
                            <span className="text-xs text-gray-500">{work.timestamp}</span>
                          </div>
                          <p className="text-gray-600 mb-2">{work.description}</p>
                          <p className="text-sm text-gray-500 mb-4">作者: {work.author}</p>
                          <p className="text-sm text-gray-500 mb-4">点赞数: {work.likes} | 评论数: {work.comments.length}</p>
                          <div className="flex flex-wrap gap-2 mt-auto">
                            <button onClick={() => setSelectedFeaturedWork(selectedFeaturedWork === work.id ? null : work.id)}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                            >
                              {selectedFeaturedWork === work.id ? '收起详情' : '查看详情'}
                            </button>
                            <button
                              onClick={() => deleteFeaturedWork(work.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors"
                            >
                              删除作品
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {selectedFeaturedWork === work.id && (
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                          <h4 className="font-medium text-gray-700 mb-2">评论管理</h4>
                          {work.comments.length === 0 ? (
                            <p className="text-gray-500 text-sm">暂无评论</p>
                          ) : (
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                              {work.comments.map(comment => (
                                <div key={comment.id} className="bg-white p-3 rounded-lg shadow-sm">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-medium text-gray-800 text-sm">{comment.author}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500 text-xs">{comment.time}</span>
                                      <button 
                                        onClick={() => deleteFeaturedComment(work.id, comment.id)}
                                        className="text-red-500 hover:text-red-600 text-xs"
                                      >
                                        删除
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-gray-700 text-sm">{comment.content}</p>
                                  
                                  {/* 回复列表 */}
                                  {comment.replies && comment.replies.length > 0 && (
                                    <div className="mt-2 space-y-2 pl-4 border-l-2 border-gray-100">
                                      {comment.replies.map(reply => (
                                        <div key={reply.id} className="bg-gray-50 p-2 rounded-md">
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium text-gray-800 text-xs">{reply.author}</span>
                                            <div className="flex items-center gap-2">
                                              <span className="text-gray-500 text-xs">{reply.time}</span>
                                              <button 
                                                onClick={() => deleteFeaturedReply(work.id, comment.id, reply.id)}
                                                className="text-red-500 hover:text-red-600 text-xs"
                                              >
                                                删除
                                              </button>
                                            </div>
                                          </div>
                                          <p className="text-gray-700 text-xs">{reply.content}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
         ) : activeTab === 'messages' ? (
  // 留言管理内容
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    <div className="md:col-span-3 bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <Users className="mr-2 text-orange-500" size={20} />留言管理
      </h2>
      
      {/* 留言类型筛选 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setMessageTypeFilter('all')}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            messageTypeFilter === 'all' 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          全部留言
        </button>
        <button
          onClick={() => setMessageTypeFilter('normal')}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            messageTypeFilter === 'normal' 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          普通留言
        </button>
        <button
          onClick={() => setMessageTypeFilter('featured_comment')}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            messageTypeFilter === 'featured_comment' 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          优秀作品评论
        </button>
        <button
          onClick={() => setMessageTypeFilter('knowledge_comment')}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            messageTypeFilter === 'knowledge_comment' 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          学习心得
        </button>
      </div>
      
      {messages.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          暂无留言
        </div>
      ) : (
        <div className="space-y-4">
               {/* 首先按置顶状态排序，然后按时间排序 */}
               {[...messages]
                .sort((a, b) => {
                  if (a.isPinned && !b.isPinned) return -1;
                  if (!a.isPinned && b.isPinned) return 1;
                  return new Date(b.time).getTime() - new Date(a.time).getTime();
                })
                .filter(message => messageTypeFilter === 'all' || message.type === messageTypeFilter)
                .map(message => (
                <div 
                  key={message.id} 
                  className={`p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 ${
                    message.isPinned ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      {message.isPinned && (
                        <i className="fa-solid fa-thumbtack text-orange-500 mr-2"></i>
                      )}
                      <span className="font-medium text-gray-800">{message.author}</span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        message.type === 'featured_comment' 
                          ? 'bg-blue-100 text-blue-600' 
                          : message.type === 'knowledge_comment'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                        {message.type === 'featured_comment' ? '优秀作品评论' : 
                         message.type === 'knowledge_comment' ? '学习心得' : '普通留言'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">{message.time}</span>
                      <span className="text-xs text-gray-500">点赞: {message.likes}</span>
                      <button 
                        onClick={() => togglePinMessage(message.id)}
                        className={`text-xs ${message.isPinned ? 'text-orange-500' : 'text-gray-500 hover:text-orange-500'}`}
                      >
                        {message.isPinned ? '取消置顶' : '置顶'}
                      </button>
                      <button 
                        onClick={() => deleteMessage(message.id)}
                        className="text-red-500 hover:text-red-600 text-xs"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{message.content}</p>
                      
                      {/* 回复列表 */}
                      {message.replies.length > 0 && (
                        <div className="mt-2 space-y-2 pl-4 border-l-2 border-gray-200">
                          {message.replies.map(reply => (
                            <div key={reply.id} className="bg-white p-2 rounded-md">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-gray-800 text-xs">{reply.author}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 text-xs">{reply.time}</span>
                                  <button 
                                    onClick={() => deleteReply(message.id, reply.id)}
                                    className="text-red-500 hover:text-red-600 text-xs"
                                  >
                                    删除
                                  </button>
                                </div>
                              </div>
                              <p className="text-gray-700 text-xs">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'activities' ? (
           // 投票活动管理
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Trophy className="mr-2 text-orange-500" size={20} />投票活动管理
              </h2>
              <button 
                onClick={() => {
                  // 打开创建活动对话框
                  setCreateActivityDialog(true);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                创建新活动
              </button>
            </div>
            
            {/* 活动列表 */}
            {votingActivities.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                暂无投票活动
              </div>
            ) : (
              <div className="space-y-6">
                {votingActivities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{activity.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          isActivityActive(activity) 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isActivityActive(activity) ? '进行中' : '已结束'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <span>
                          时间：{formatDate(activity.startTime)} - {formatDate(activity.endTime)}
                        </span>
                        <span className="mx-2">|</span>
                        <span>作品数：{activity.works.length}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setSelectedActivityId(activity.id);
                            setShowActivityDetail(true);
                          }}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                        >
                          查看详情
                        </button>
                              <button
                                onClick={() => deleteActivity(activity.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors"
                              >
                                删除活动
                              </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* 创建活动对话框 */}
            {createActivityDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800">创建投票活动</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">活动标题</label>
                        <input
                          type="text"
                          value={newActivity.title}
                          onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                          placeholder="请输入活动标题"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">活动描述</label>
                        <textarea
                          value={newActivity.description}
                          onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px] transition-all"
                          placeholder="请描述活动内容..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                          <input
                            type="date"
                            value={newActivity.startTime}
                            onChange={(e) => setNewActivity({...newActivity, startTime: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                          <input
                            type="date"
                            value={newActivity.endTime}
                            onChange={(e) => setNewActivity({...newActivity, endTime: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
                    <button
                      onClick={() => setCreateActivityDialog(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleCreateActivity}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                    >
                      创建
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* 活动详情对话框 */}
            {showActivityDetail && selectedActivity && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-800">{selectedActivity.title} - 详情</h3>
                      <button
                        onClick={() => setShowActivityDetail(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1">
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-2">活动信息</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-600 mb-2">{selectedActivity.description}</p>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                          <div>
                            <span className="font-medium text-gray-700">时间：</span>
                            {formatDate(selectedActivity.startTime)} - {formatDate(selectedActivity.endTime)}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">状态：</span>
                            <span className={`${
                              isActivityActive(selectedActivity) 
                                ? 'text-green-600' 
                                : 'text-gray-600'
                            }`}>
                              {isActivityActive(selectedActivity) ? '进行中' : '已结束'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-2">参与作品 ({selectedActivity.works.length})</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedActivity.works
                          .sort((a, b) => b.votes - a.votes)
                          .map((work, index) => (
                            <div key={work.id} className="border border-gray-200 rounded-lg overflow-hidden">
                              <div className="relative">
                                <div className="h-40 bg-gray-200 overflow-hidden">
                                  <img
                                    src={work.imageUrl}
                                    alt={work.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  #{index + 1}
                                </div>
                              </div>
                              <div className="p-3">
                                <h5 className="font-medium text-gray-800">{work.title}</h5>
                                <p className="text-xs text-gray-500 mt-1">作者: {work.author}</p>
                                <div className="mt-2 flex justify-between items-center">
                                  <div className="flex items-center text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mr-1">
                                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                    <span>{work.votes} 票</span>
                                  </div>
                                  <button
                                    onClick={() => removeWorkFromActivity(selectedActivity.id, work.id)}
                                    className="text-red-500 hover:text-red-600 text-xs"
                                  >
                                    删除
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">添加作品</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-500 transition-colors cursor-pointer">
                          <button
                            onClick={() => {
                              setShowActivityDetail(false);
                              setActiveTab('works');
                            }}
                            className="text-orange-500 hover:text-orange-600"
                          >
                            从投稿作品中选择
                          </button>
                        </div>
                        
                        {/* 直接上传照片功能 */}
                        <div>
                          <button
                            onClick={() => {
                              const fileInput = document.getElementById('activity-photo-upload') as HTMLInputElement;
                              if (fileInput) {
                                fileInput.click();
                              }
                            }}
                            className="w-full py-4 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-orange-500 transition-colors cursor-pointer"
                          >
                            <Upload size={24} className="text-gray-400 mb-2" />
                            <span className="text-gray-600">直接上传照片</span>
                          </button>
                          <input
                            id="activity-photo-upload"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleActivityPhotoUpload(e, selectedActivity.id)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // 用户管理内容
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Users className="mr-2 text-orange-500" size={20} />用户管理
            </h2>
            
            {users.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                暂无用户数据
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户名</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">手机号</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注册时间</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role === 'admin' ? '管理员' : '普通用户'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleString('zh-CN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => resetUserPassword(user.id)}
                              className="text-orange-500 hover:text-orange-600 transition-colors"
                            >
                              重置密码
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} 杭州第九中学树范学校摄影与舞台社 - 后台管理系统
        </div>
      </footer>
    </div>
  );
}