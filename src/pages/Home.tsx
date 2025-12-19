import React, { useState, useEffect, useRef } from "react";
  import { toast } from "sonner";

   import {
       Camera,
       Book,
       Upload,
       Trophy,
       MessageSquare,
       ChevronRight,
       Send,
       Heart,
       User,
       LogIn,
       Menu,
       X,
       ChevronDown,
       ChevronUp,
       Reply,
       Smile,
       Info
   } from "lucide-react";
   
   import ImageViewer from "../components/ImageViewer";

  import EmojiPicker from "../components/EmojiPicker";
  import ImageComparison from "../components/ImageComparison";
  import AIPhotoAnalyzer from "../components/AIPhotoAnalyzer";

  import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
  import { AuthContext } from "../contexts/authContext";
  import { useContext } from "react";
  import { useNavigate } from "react-router-dom";

  // 摄影知识数据结构
  interface PhotographyKnowledgeItem {
    id: string;
    title: string;
    shortDesc: string;
    detailContent: string;
    imageUrl: string;
    value: number;
    comparison?: {
      beforeImage: string;
      afterImage: string;
      beforeLabel: string;
      afterLabel: string;
      description: string;
    };
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

  // 摄影知识详细数据
  const photographyKnowledgeData: PhotographyKnowledgeItem[] = [{
      id: "composition",
      name: "构图",
      title: "构图技巧",
      shortDesc: "学习黄金分割、对角线等构图方法",
      detailContent: "摄影构图是指如何在画面中安排元素的位置和关系。常见的构图技巧包括：\n\n1. 黄金分割：将画面按照1:0.618的比例分割，将主体放在分割点上\n2. 三分法：将画面分成九宫格，主体放在交叉点上\n3. 对角线构图：利用对角线引导视线\n4. 框架构图：利用前景元素形成框架\n5. 引导线：利用线条引导观众视线到主体\n\n好的构图能够突出主题，引导观众视线，增强画面的美感和故事性。",
      imageUrl: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=photography%20composition%20tutorial%2C%20golden%20ratio%2C%20rule%20of%20thirds&sign=7f9bc8c8b23dccebdc96a268e2295870",
      value: 85,
      comparison: {
        beforeImage: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=poor%20composition%20photo%2C%20subject%20not%20focused&sign=d005c996844907ff3f309b00196ee093",
        afterImage: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=good%20composition%20photo%2C%20rule%20of%20thirds&sign=0e6cc1073b8762909275e1c36b1fa55c",
        beforeLabel: "普通构图",
        afterLabel: "三分法构图",
        description: "左侧照片主体位于画面中央，显得呆板且缺乏深度感。右侧照片遵循三分法构图原则，将主体放置在画面的交叉点上，使画面更加平衡和有吸引力，同时留出了足够的空间引导观众视线。"
      }
  }, {
      id: "lighting",
      name: "光线",
      title: "光线运用",
      shortDesc: "掌握顺光、逆光、侧光的拍摄技巧",
      detailContent: "光线是摄影的灵魂，不同的光线方向和质量会产生截然不同的效果：\n\n1. 顺光：光线从相机背后照射，画面明亮，但缺乏立体感\n2. 侧光：光线从侧面照射，能产生强烈的阴影和立体感\n3. 逆光：光线从被摄物体后方照射，可产生剪影和光晕效果\n4. 散射光：阴天或阴影下的柔和光线，适合人像拍摄\n5. 硬光：晴天的直射阳光，产生强烈的明暗对比\n\n了解光线的特性并善加利用，可以极大地提升照片的质量和艺术表现力。",
      imageUrl: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=photography%20lighting%20techniques%2C%20natural%20light%20photography&sign=3cdeaabdb54f9f4c9c196aca8cbe4307",
      value: 90,
      comparison: {
        beforeImage: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=front%20lighting%20photo%2C%20flat%20lighting&sign=d90266f2f249acc3cb07de5ba0418232",
        afterImage: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=side%20lighting%20photo%2C%20dramatic%20shadows&sign=bc024483ed06e640595b46bd4db4d035",
        beforeLabel: "顺光拍摄",
        afterLabel: "侧光拍摄",
        description: "左侧照片使用顺光拍摄，光线从相机背后照射，画面明亮但缺乏立体感。右侧照片使用侧光拍摄，光线从侧面照射，创造出丰富的阴影和层次感，使被摄物体的形态更加突出，增强了照片的深度和艺术性。"
      }
  }, {
      id: "exposure",
      name: "曝光",
      title: "曝光控制",
      shortDesc: "了解光圈、快门、ISO的相互关系",
      detailContent: "曝光三要素是摄影的基础，它们共同决定了照片的亮度：\n\n1. 光圈：控制镜头进光量，影响景深。大光圈(f/1.4-f/2.8)景深浅，小光圈(f/8-f/22)景深深\n2. 快门速度：控制曝光时间，影响动态效果。高速快门(1/1000s以上)冻结运动，低速快门(1/30s以下)产生模糊\n3. ISO：控制传感器敏感度，影响画质。低ISO(100-400)画质细腻，高ISO(1600以上)噪点增加\n\n曝光补偿可以调整相机的自动曝光判断，+增加曝光，-减少曝光。正确的曝光是获得高质量照片的关键。",
      imageUrl: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=photography%20exposure%20triangle%2C%20aperture%20shutter%20speed%20iso&sign=29db5e3243f94cbaa7e2ef8a14390e0a",
      value: 75,
      comparison: {
        beforeImage: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=underexposed%20photo%2C%20dark%20image&sign=3024344c35cd5e54c4cab315a5ff7a95",
        afterImage: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=correctly%20exposed%20photo%2C%20balanced%20lighting&sign=1f0d453c2c723d572a27a07d3f37df16",
        beforeLabel: "曝光不足",
        afterLabel: "正确曝光",
        description: "左侧照片曝光不足，导致画面过暗，细节丢失。右侧照片使用正确的曝光参数，保持了高光和阴影的细节，色彩更加准确自然。通过调整光圈、快门速度和ISO的组合，可以获得理想的曝光效果。"
      }
  }, {
      id: "color",
      name: "色彩",
      title: "色彩理论",
      shortDesc: "学习色彩搭配和白平衡调节",
      detailContent: "色彩是摄影中表达情感和氛围的重要元素：\n\n1. 色彩三要素：色相、饱和度、明度\n2. 互补色：色环上相对的颜色，如红-绿、蓝-橙、黄-紫\n3. 相似色：色环上相邻的颜色，如红-橙-黄、蓝-绿-青\n4. 冷暖色调：暖色(红、橙、黄)给人温暖、活力的感觉；冷色(蓝、青、紫)给人冷静、沉稳的感觉\n5. 白平衡：调整照片的色温，确保白色物体在不同光线条件下都呈现为白色\n\n掌握色彩理论可以帮助摄影师更好地表达创作意图，增强照片的视觉冲击力。",
      imageUrl: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=color%20theory%20in%20photography%2C%20color%20wheel&sign=4efbe6e4b614bf753eee7ab1a8e92f52",
      value: 80,
      comparison: {
        beforeImage: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=unbalanced%20color%20photo%2C%20incorrect%20white%20balance&sign=7436002d6a9990b9b2c988ed4106623c",
        afterImage: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=balanced%20color%20photo%2C%20correct%20white%20balance&sign=c1a314412f004b9dae12993ec5ad7ae2",
        beforeLabel: "色彩失衡",
        afterLabel: "色彩平衡",
        description: "左侧照片色彩偏暖，白平衡设置不正确，导致整体色调失真。右侧照片通过正确设置白平衡和色彩校正，恢复了真实的色彩表现，画面更加自然和谐。色彩平衡对于传达正确的视觉信息和情感至关重要。"
      }
  }, {
      id: "focal-length",
      name: "焦距",
      title: "焦距选择",
      shortDesc: "不同焦段镜头的特点和应用场景",
      detailContent: "镜头焦距决定了视角和透视关系，不同焦段适合不同的拍摄题材：\n\n1. 广角镜头(10-35mm)：视角宽广，适合风景、建筑摄影，有拉伸感\n2. 标准镜头(35-70mm)：接近人眼视角，透视自然，适合人文、纪实摄影\n3. 中长焦镜头(70-200mm)：压缩空间感，适合人像、野生动物摄影\n4. 长焦镜头(200mm以上)：远距离拍摄，适合体育、野生动物摄影\n5. 微距镜头：近距离拍摄微小物体，适合花卉、昆虫摄影\n\n了解不同焦段的特点，可以根据拍摄需求选择合适的镜头。",
      imageUrl: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=camera%20lenses%20focal%20length%2C%20wide%20angle%20telephoto&sign=cb6772df821ac5b0e54e90e6110f736f",
      value: 70,
      comparison: {
        beforeImage: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=wide%20angle%20portrait%2C%20distorted%20features&sign=97393658813d0a3489e7ddf0d15fd5e8",
        afterImage: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=telephoto%20portrait%2C%20flattering%20perspective&sign=d084f3f46bc5f112bb50de74dba1e604",
        beforeLabel: "广角镜头",
        afterLabel: "中长焦镜头",
        description: "左侧照片使用广角镜头拍摄人像，导致面部特征出现明显变形，尤其是边缘部分。右侧照片使用中长焦镜头拍摄，压缩了空间感，使面部比例更加自然美观，同时背景虚化效果更好，突出了主体。"
      }
  }, {
      id: "post-processing",
      name: "后期",
      title: "后期处理",
      shortDesc: "基础修图技巧和软件使用",
      detailContent: "后期处理是现代摄影创作的重要环节：\n\n1. 基础调整：曝光、对比度、高光、阴影、白色、黑色、色温、色调\n2. 色彩校正：色相、饱和度、明亮度，曲线调整\n3. 细节处理：锐化、降噪、清晰度\n4. 裁剪和构图调整\n5. 局部调整：渐变滤镜、径向滤镜、调整画笔\n6. 创意效果：黑白转换、色调分离、HDR合成\n\n常用的后期软件有Adobe Lightroom、Photoshop、Capture One等。好的后期处理应该是自然的，增强照片的表现力而不显得过度。",
      imageUrl: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=photo%20editing%20workflow%2C%20post%20processing%20software&sign=a26539ef9bf9f1a14fada950f00e034f",
      value: 65,
      comparison: {
        beforeImage: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=unedited%20raw%20photo%2C%20flat%20colors&sign=1b85b1883c063e215424b762ab4c9059",
        afterImage: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=professionally%20edited%20photo%2C%20enhanced%20colors&sign=3a745ad125229677b8d278d08c6009ea",
        beforeLabel: "原片",
        afterLabel: "后期处理后",
        description: "左侧照片为原始RAW格式，色彩平淡，对比度不足。右侧照片经过专业后期处理，调整了曝光、对比度、色彩平衡和锐度，增强了画面的视觉冲击力，同时保持了自然真实的效果。好的后期处理能够提升照片的艺术表现力。"
      }
  }];

   // 使用从API或localStorage加载的优秀作品数据
  // 初始数据将在FeaturedWorks组件中设置

  const submissionWorks = [{
      id: 101,
      title: "图书馆一角",
      author: "赵六",
      imageUrl: "https://images.unsplash.com/photo-1581092923732-6a5d8c6b5463",
      votes: 45
  }, {
      id: 102,
      title: "雨后校园",
      author: "钱七",
      imageUrl: "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a",
      votes: 32
  }, {
      id: 103,
      title: "课堂瞬间",
      author: "孙八",
      imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7",
      votes: 58
  }];

  const navLinks = [{
      id: 1,
      title: "首页",
      icon: <Camera size={18} />
  }, {
      id: 2,
      title: "摄影知识",
      icon: <Book size={18} />
  }, {
      id: 3,
      title: "作品投稿",
      icon: <Upload size={18} />
  }, {
      id: 4,
      title: "优秀作品",
      icon: <Trophy size={18} />
  }, {
      id: 5,
      title: "留言区",
      icon: <MessageSquare size={18} />
  }];

  const SchoolLogo = () => <div className="flex items-center">
      <div className="relative w-12 h-12 bg-orange-500 rounded-md overflow-hidden">
          <div
              className="absolute top-1 left-1 w-10 h-10 bg-white rounded-full overflow-hidden">
              <div
                  className="absolute top-0 left-0 w-full h-full bg-orange-500 rounded-br-full"
                  style={{
                      backgroundColor: "#FED7AA",
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "50% 50%"
                  }}></div>
              <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full"></div>
          </div>
          <div className="absolute bottom-0 left-0 text-black font-bold text-xs p-0.5">&nbsp;S F S Y</div>
      </div>
      <div className="ml-3">
          <div className="text-lg font-bold text-gray-800">摄影与舞台社</div>
          <div className="text-xs text-gray-500">杭州第九中学树范学校</div>
      </div>
  </div>;

    // 摄影知识详情组件
  const KnowledgeDetail: React.FC<{
  knowledge: PhotographyKnowledgeItem;
  onClose: () => void;
  setSelectedImage: (src: string) => void;
}> = ({ knowledge, onClose, setSelectedImage }) => {
    const [showDetail, setShowDetail] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<{ commentId: number, knowledgeId: string } | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [isCommentEmojiPickerOpen, setIsCommentEmojiPickerOpen] = useState(false);
    const [isReplyEmojiPickerOpen, setIsReplyEmojiPickerOpen] = useState<{ commentId: number } | null>(null);
    const [showComparisonHint, setShowComparisonHint] = useState(true);
    
    const { isAuthenticated, user, isAdmin } = useContext(AuthContext);
    const commentInputRef = useRef<HTMLInputElement>(null);
    const replyInputRef = useRef<HTMLInputElement>(null);
    
    // 插入emoji到评论输入框
    const insertCommentEmoji = (emoji: string) => {
      if (commentInputRef.current) {
        const input = commentInputRef.current;
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const newValue = newComment.slice(0, start) + emoji + newComment.slice(end);
        setNewComment(newValue);
        
        // 恢复焦点并设置光标位置
        setTimeout(() => {
          input.focus();
          input.selectionStart = input.selectionEnd = start + emoji.length;
        }, 0);
      }
    };
    
    // 插入emoji到回复输入框
    const insertReplyEmoji = (emoji: string) => {
      if (replyInputRef.current) {
        const input = replyInputRef.current;
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const newValue = replyContent.slice(0, start) + emoji + replyContent.slice(end);
        setReplyContent(newValue);
        
        // 恢复焦点并设置光标位置
        setTimeout(() => {
          input.focus();
          input.selectionStart = input.selectionEnd = start + emoji.length;
        }, 0);
      }
    };
    
    // 切换回复的emoji选择器
    const toggleReplyEmojiPicker = (commentId: number) => {
      if (isReplyEmojiPickerOpen && isReplyEmojiPickerOpen.commentId === commentId) {
        setIsReplyEmojiPickerOpen(null);
      } else {
        setIsReplyEmojiPickerOpen({ commentId });
        setIsCommentEmojiPickerOpen(false);
      }
    };
    
    // 从localStorage加载心得数据
    useEffect(() => {
      const savedKnowledgeItems = localStorage.getItem('photographyKnowledge');
      if (savedKnowledgeItems) {
        const parsedItems = JSON.parse(savedKnowledgeItems);
        const updatedKnowledge = parsedItems.find((item: PhotographyKnowledgeItem) => item.id === knowledge.id);
        if (updatedKnowledge && updatedKnowledge.心得) {
          // 更新当前知识项的心得数据
          // 注意：这里不能直接修改props，需要通过父组件更新
          // 为了简化，我们暂时只在本地状态中处理
        }
      }
    }, [knowledge.id]);
    
    // 保存心得数据到localStorage
    const saveKnowledgeData = (updatedKnowledge: PhotographyKnowledgeItem) => {
      const savedKnowledgeItems = localStorage.getItem('photographyKnowledge');
      let knowledgeItems = savedKnowledgeItems ? JSON.parse(savedKnowledgeItems) : [...photographyKnowledgeData];
      
      const index = knowledgeItems.findIndex((item: PhotographyKnowledgeItem) => item.id === updatedKnowledge.id);
      if (index !== -1) {
        knowledgeItems[index] = updatedKnowledge;
      } else {
        knowledgeItems.push(updatedKnowledge);
      }
      
      localStorage.setItem('photographyKnowledge', JSON.stringify(knowledgeItems));
    };
    
    // 添加心得
    const handleAddComment = () => {
      if (!isAuthenticated) {
        toast.error("请先登录再添加心得");
        return;
      }
      
      if (!newComment.trim()) {
        return;
      }
      
      const now = new Date();
      const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      
      const updatedKnowledge: PhotographyKnowledgeItem = {
        ...knowledge,
        心得: [
          ...(knowledge.心得 || []),
          {
            id: Date.now(),
            author: user?.username || "匿名用户",
            content: newComment,
            time: timeString,
            comments: []
          }
        ]
      };
      
      saveKnowledgeData(updatedKnowledge);
      
      // 触发父组件更新
      window.dispatchEvent(new Event('storage'));
      
      setNewComment("");
      toast.success("心得添加成功");
    };
    
    // 添加评论回复
    const handleAddReply = (commentId: number) => {
      if (!isAuthenticated) {
        toast.error("请先登录再评论");
        return;
      }
      
      if (!replyContent.trim()) {
        return;
      }
      
      const now = new Date();
      const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      
      // 找到要回复的评论并添加回复
      const updatedKnowledge: PhotographyKnowledgeItem = {
        ...knowledge,
        心得: knowledge.心得?.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              comments: [
                ...(comment.comments || []),
                {
                  id: Date.now(),
                  author: user?.username || "匿名用户",
                  content: replyContent,
                  time: timeString
                }
              ]
            };
          }
          return comment;
        })
      };
      
      saveKnowledgeData(updatedKnowledge);
      
      // 触发父组件更新
      window.dispatchEvent(new Event('storage'));
      
      setReplyContent("");
      setReplyingTo(null);
      toast.success("评论添加成功");
    };

    // 删除心得
    const handleDeleteComment = (commentId: number) => {
      if (window.confirm("确定要删除这条心得吗？")) {
        const updatedKnowledge: PhotographyKnowledgeItem = {
          ...knowledge,
          心得: knowledge.心得?.filter(comment => comment.id !== commentId)
        };
        
        saveKnowledgeData(updatedKnowledge);
        
        // 触发父组件更新
        window.dispatchEvent(new Event('storage'));
        
        toast.success("心得已删除");
      }
    };

    // 删除回复
    const handleDeleteReply = (commentId: number, replyId: number) => {
      if (window.confirm("确定要删除这条回复吗？")) {
        const updatedKnowledge: PhotographyKnowledgeItem = {
          ...knowledge,
          心得: knowledge.心得?.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                comments: comment.comments?.filter(reply => reply.id !== replyId)
              };
            }
            return comment;
          })
        };
        
        saveKnowledgeData(updatedKnowledge);
        
        // 触发父组件更新
        window.dispatchEvent(new Event('storage'));
        
        toast.success("回复已删除");
      }
    };
    
    return (
      <div className={`border border-orange-100 rounded-lg overflow-hidden transition-all duration-300 ${showDetail ? 'ring-2 ring-orange-500 shadow-lg' : 'hover:shadow-md'}`}>
        <div 
          className="p-4 cursor-pointer flex justify-between items-center" 
          onClick={() => setShowDetail(!showDetail)}
        >
          <div>
            <h3 className="font-semibold text-gray-800">{knowledge.title}</h3>
            <p className="text-sm text-gray-600">{knowledge.shortDesc}</p>
          </div>
          {showDetail ? <ChevronUp size={20} className="text-orange-500" /> : <ChevronDown size={20} className="text-orange-500" />}
        </div>
        
        {showDetail && (
          <div className="border-t border-gray-100 p-4 bg-orange-50">
            {/* 图片对比教学区域 */}
            {knowledge.comparison && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <Info size={16} className="mr-1 text-orange-500" />
                  技巧对比演示
                </h4>
                <ImageComparison
                   beforeImage={knowledge.comparison.beforeImage}
                   afterImage={knowledge.comparison.afterImage}
                   beforeLabel={knowledge.comparison.beforeLabel}
                   afterLabel={knowledge.comparison.afterLabel}
                   description={knowledge.comparison.description}
                   loading="lazy" // 懒加载对比图片
                />
                {showComparisonHint && (
                  <div className="mt-2 flex justify-between items-center p-2 bg-orange-100/70 text-orange-800 text-sm rounded-md">
                    <p>拖动滑块查看两种不同技巧的对比效果</p>
                    <button
                      onClick={() => setShowComparisonHint(false)}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
               <img 
                   src={knowledge.imageUrl} 
                   loading="lazy" // 懒加载知识图谱图片
                   alt={knowledge.title} 
                   className="w-full h-48 object-cover rounded-lg mb-4 cursor-pointer"
                   onClick={() => setSelectedImage(knowledge.imageUrl)} 
               />
                <div className="whitespace-pre-line text-gray-700">
                  {knowledge.detailContent}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <MessageSquare size={16} className="mr-1 text-orange-500" />
                  学习心得 ({knowledge.心得?.length || 0})
                </h4>
                
                 {/* 心得输入框 */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="flex gap-2">
                      <input
                        ref={commentInputRef}
                        type="text"
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="分享你的学习心得..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" 
                      />
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setIsCommentEmojiPickerOpen(!isCommentEmojiPickerOpen)}
                          className="bg-gray-100 text-gray-600 font-medium py-2 px-2 rounded-md transition-colors text-xs"
                        >
                          <span className="text-xl">😀</span>
                        </button>
                        <button
                          onClick={handleAddComment}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-3 rounded-md transition-colors"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                    {isCommentEmojiPickerOpen && (
                      <div className="absolute -bottom-full left-0 mb-2">
                        <EmojiPicker
                          isOpen={isCommentEmojiPickerOpen}
                          onClose={() => setIsCommentEmojiPickerOpen(false)}
                          onSelect={(emoji) => {
                            insertCommentEmoji(emoji);
                          }}
                          position="bottom"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 心得列表 */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {knowledge.心得 && knowledge.心得.map(comment => (
                    <div key={comment.id} className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-800 text-sm">{comment.author}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-xs">{comment.time}</span>
                          {/* 删除心得按钮 - 管理员或评论者本人可以删除 */}
                          {(isAdmin() || (user && comment.author === user.username)) && (
                            <button 
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-500 hover:text-red-600 text-xs"
                            >
                              删除
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{comment.content}</p>
                      
                      {/* 回复按钮 */}
                      <button 
                        onClick={() => setReplyingTo({ commentId: comment.id, knowledgeId: knowledge.id })}
                        className="text-orange-500 hover:text-orange-600 text-xs flex items-center"
                      >
                        <Reply size={12} className="mr-1" /> 回复
                      </button>
                      
                       {/* 回复输入框 */}
                      {replyingTo && replyingTo.commentId === comment.id && (
                        <div className="mt-2 relative">
                          <div className="flex gap-2">
                            <input
                              ref={replyInputRef}
                              type="text"
                              value={replyContent}
                              onChange={e => setReplyContent(e.target.value)}
                              placeholder="写下你的回复..."
                              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs" 
                            />
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => toggleReplyEmojiPicker(comment.id)}
                                className="bg-gray-100 text-gray-600 font-medium py-1.5 px-1 rounded-md transition-colors text-xs"
                              >
                                <span className="text-xl">😀</span>
                              </button>
                              <button
                                onClick={() => handleAddReply(comment.id)}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-1.5 px-2 rounded-md transition-colors text-xs"
                              >
                                发送
                              </button>
                            </div>
                          </div>
                          {isReplyEmojiPickerOpen && isReplyEmojiPickerOpen.commentId === comment.id && (
                            <div className="absolute -bottom-full left-0 mb-2">
                              <EmojiPicker
                                isOpen={true}
                                onClose={() => setIsReplyEmojiPickerOpen(null)}
                                onSelect={(emoji) => {
                                  insertReplyEmoji(emoji);
                                }}
                                position="bottom"
                              />
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* 回复列表 */}
                      {comment.comments && comment.comments.length > 0 && (
                        <div className="mt-2 space-y-2 pl-4 border-l-2 border-gray-100">
                          {comment.comments.map(reply => (
                            <div key={reply.id} className="bg-gray-50 p-2 rounded-md">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-gray-800 text-xs">{reply.author}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 text-xs">{reply.time}</span>
                                  {/* 删除回复按钮 - 管理员或回复者本人可以删除 */}
                                  {(isAdmin() || (user && reply.author === user.username)) && (
                                    <button 
                                      onClick={() => handleDeleteReply(comment.id, reply.id)}
                                      className="text-red-500 hover:text-red-600 text-xs"
                                    >
                                      删除
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-700 text-xs">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {(!knowledge.心得 || knowledge.心得.length === 0) && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      暂无学习心得，快来分享你的想法吧！
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const PhotographyKnowledge: React.FC<{setSelectedImage: (src: string) => void}> = ({setSelectedImage}) => {
    const [knowledgeItems, setKnowledgeItems] = useState<PhotographyKnowledgeItem[]>(photographyKnowledgeData);
    
    // 从localStorage加载数据
    useEffect(() => {
      const savedKnowledgeItems = localStorage.getItem('photographyKnowledge');
      if (savedKnowledgeItems) {
        setKnowledgeItems(JSON.parse(savedKnowledgeItems));
      }
      
      // 监听storage变化，实时更新数据
      const handleStorageChange = () => {
        const saved = localStorage.getItem('photographyKnowledge');
        if (saved) {
          setKnowledgeItems(JSON.parse(saved));
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }, []);
    
    // 准备图表数据
    const chartData = knowledgeItems.map(item => ({
      name: item.name,
      value: item.value
    }));
    
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Book className="mr-2 text-orange-500" size={20} />摄影基本知识图谱
        </h2>
        
        {/* 知识掌握度图表 */}
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#FF7E36"
                strokeWidth={2}
                dot={{
                  r: 4
                }}
                activeDot={{
                  r: 6
                }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* 知识详情卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {knowledgeItems.map((item) => (
             <KnowledgeDetail 
               key={item.id} 
               knowledge={item}
               onClose={() => {}} // 这个函数在当前实现中没有使用
               setSelectedImage={setSelectedImage}
             />
          ))}
        </div>
        
        {/* AI照片分析功能 */}
        <div className="mt-8">
          <AIPhotoAnalyzer />
        </div>
      </div>
    );
  };

   const SubmissionForm = () => {
      const [title, setTitle] = useState("");
      const [description, setDescription] = useState("");
      const [image, setImage] = useState<File | null>(null);
      const [previewUrl, setPreviewUrl] = useState<string | null>(null);
      const [compressedImageUrl, setCompressedImageUrl] = useState<string | null>(null);

      const { isAuthenticated, user } = useContext(AuthContext);

      // 处理图片上传并生成预览
      const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.files && e.target.files[0]) {
              const file = e.target.files[0];
              
              // 检查文件大小（限制为30MB）
              if (file.size > 30 * 1024 * 1024) {
                  toast.error("图片大小不能超过30MB");
                  return;
              }
              
              setImage(file);
              
              // 创建图片对象用于压缩
              const img = new Image();
              const reader = new FileReader();
              
              reader.onload = (event) => {
                  if (event.target && typeof event.target.result === 'string') {
                      setPreviewUrl(event.target.result);
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
                          setCompressedImageUrl(compressedDataUrl);
                      };
                  }
              };
              reader.readAsDataURL(file);
          }
      };

      // 提交表单
      const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();

          if (!isAuthenticated) {
              toast.error("请先登录再投稿");
              return;
          }

          if (!image || !compressedImageUrl) {
              toast.error("请上传作品图片");
              return;
          }

          // 生成唯一ID
          const id = Date.now();
          
          // 获取当前时间
          const now = new Date();
          const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
          
          // 创建新作品对象
          const newWork = {
              id,
              title,
              description,
              imageUrl: compressedImageUrl,
              author: user?.username || "匿名用户",
              timestamp,
              votes: 0
          };
          
          try {
              // 从localStorage获取现有作品
              const existingWorks = JSON.parse(localStorage.getItem('submittedWorks') || '[]');
              
              // 添加新作品并保存到localStorage
              const updatedWorks = [...existingWorks, newWork];
              localStorage.setItem('submittedWorks', JSON.stringify(updatedWorks));
              
              // 显示成功提示
              toast.success("作品提交成功！管理员审核后将展示");
              
              // 重置表单
              setTitle("");
              setDescription("");
              setImage(null);
              setPreviewUrl(null);
              setCompressedImageUrl(null);
              
              // 重置文件输入
              const fileInput = document.getElementById('image-upload') as HTMLInputElement;
              if (fileInput) {
                  fileInput.value = '';
              }
          } catch (error) {
              // 处理存储超出配额的错误
              toast.error("存储空间不足，请稍后再试");
              console.error("LocalStorage quota exceeded:", error);
          }
      };

      return (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Upload className="mr-2 text-orange-500" size={20} />作品投稿
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">作品标题</label>
                      <input
                          type="text"
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                          placeholder="请输入作品标题"
                          required />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">作品描述</label>
                      <textarea
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px] transition-all"
                          placeholder="请描述你的作品..."
                          required />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">上传作品</label>
                      <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                          required />
                  </div>
                  
                  {/* 图片预览 */}
                  {previewUrl && (
                      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-2">作品预览：</p>
                          <div className="relative h-48 border border-dashed border-gray-300 rounded-md overflow-hidden">
                              <img 
                                  src={previewUrl} 
                                  alt="作品预览" 
                                  className="w-full h-full object-contain"
                              />
                              <button 
                                  type="button"
                                  onClick={() => {
                                      setImage(null);
                                      setPreviewUrl(null);
                                      setCompressedImageUrl(null);
                                      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
                                      if (fileInput) {
                                          fileInput.value = '';
                                      }
                                  }}
                                  className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 rounded-full p-1 backdrop-blur-sm transition-all"
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                  </svg>
                              </button>
                          </div>
                      </div>
                  )}
                  
                  <button
                      type="submit"
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                  >
                      提交作品
                  </button>
              </form>
          </div>
      );
  };

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

   const VotingSystem: React.FC<{setSelectedImage: (src: string) => void}> = ({setSelectedImage}) => {
      const [currentActivities, setCurrentActivities] = useState<VotingActivity[]>([]);
      const [pastActivities, setPastActivities] = useState<VotingActivity[]>([]);
      const [showPastActivities, setShowPastActivities] = useState(false);
      const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

      const {
          isAuthenticated,
          user,
          isAdmin
      } = useContext(AuthContext);
      
      const navigate = useNavigate();

      // 从localStorage加载数据
      useEffect(() => {
        const loadActivities = () => {
          const savedActivities = localStorage.getItem('votingActivities');
          const now = new Date();
          
          if (savedActivities) {
            const activities: VotingActivity[] = JSON.parse(savedActivities);
            
            // 找出所有当前进行中的活动
            const current = activities.filter(activity => {
              const startTime = new Date(activity.startTime);
              const endTime = new Date(activity.endTime);
              return now >= startTime && now <= endTime;
            });
            
            // 找出已结束的活动
            const past = activities.filter(activity => {
              const endTime = new Date(activity.endTime);
              return now > endTime;
            }).sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());
            
            setCurrentActivities(current);
            setPastActivities(past);
            
            // 如果有进行中的活动且没有选中的活动，则默认选中第一个
            if (current.length > 0 && !selectedActivityId) {
              setSelectedActivityId(current[0].id);
            }
          } else {
            // 如果没有活动数据，创建默认的模拟活动
            const mockActivities: VotingActivity[] = [
              {
                id: 'activity-1',
                title: '最美树范照片评选',
                description: '选出你心目中最能代表树范学校美丽景色的照片',
                startTime: new Date('2025-12-01').toISOString(),
                endTime: new Date('2025-12-31').toISOString(),
                works: submissionWorks
              },
              {
                id: 'activity-2',
                title: '校园生活瞬间',
                description: '记录校园生活中难忘的瞬间',
                startTime: new Date('2025-12-10').toISOString(),
                endTime: new Date('2025-12-25').toISOString(),
                works: submissionWorks.slice(1)
              }
            ];
            
            setCurrentActivities(mockActivities);
            setSelectedActivityId(mockActivities[0].id);
            localStorage.setItem('votingActivities', JSON.stringify(mockActivities));
          }
        };
        
        loadActivities();
        
        // 监听storage变化，实时更新数据
        const handleStorageChange = () => {
          loadActivities();
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
      }, [selectedActivityId]);

      // 获取用户在特定活动中的投票记录
      const getUserVotes = (activityId: string) => {
        if (!user) return [];
        const key = `votes_${user.id}_${activityId}`;
        const votes = localStorage.getItem(key);
        return votes ? JSON.parse(votes) : [];
      };
      
      // 检查是否可以投票
      const canVote = (activity: VotingActivity) => {
        const now = new Date();
        const startTime = new Date(activity.startTime);
        const endTime = new Date(activity.endTime);
        
        // 检查活动时间
        if (now < startTime || now > endTime) {
          return false;
        }
        
        // 检查用户权限
        if (!isAuthenticated) {
          return false;
        }
        
        return true;
      };
      
      // 获取用户在特定活动中的剩余投票数
      const getRemainingVotes = (activity: VotingActivity) => {
        if (!user) return 0;
        
        const userVotes = getUserVotes(activity.id);
        const maxVotes = isAdmin() ? 10 : 1;
        
        return maxVotes - userVotes.length;
      };

      // 处理投票
      const handleVote = (activityId: string, workId: number) => {
        if (!isAuthenticated) {
            toast.error("请先登录再投票");
            navigate('/login');
            return;
        }
        
        // 找到对应的活动
        const activity = currentActivities.find(a => a.id === activityId);
        if (!activity) return;
        
        // 检查活动是否在进行中
        if (!canVote(activity)) {
          toast.error("投票已结束或尚未开始");
          return;
        }
        
        if (!user) return;
        
        // 获取用户投票记录
        const userVotes = getUserVotes(activityId);
        const maxVotes = isAdmin() ? 10 : 1;
        
        // 检查是否超过投票上限
        if (userVotes.length >= maxVotes) {
          toast.error(`您已达到此活动投票上限（${maxVotes}票）`);
          return;
        }
        
        // 检查是否已经投过这张作品
        if (userVotes.includes(workId)) {
          toast.error("您已经为这张作品投过票了");
          return;
        }
        
        // 更新活动数据
        const savedActivities = localStorage.getItem('votingActivities');
        if (savedActivities) {
          const activities: VotingActivity[] = JSON.parse(savedActivities);
          const updatedActivities = activities.map(activity => {
            if (activity.id === activityId) {
              return {
                ...activity,
                works: activity.works.map(work => 
                  work.id === workId 
                    ? { ...work, votes: work.votes + 1 } 
                    : work
                )
              };
            }
            return activity;
          });
          
          localStorage.setItem('votingActivities', JSON.stringify(updatedActivities));
          
          // 更新用户投票记录
          const newVotes = [...userVotes, workId];
          const key = `votes_${user.id}_${activityId}`;
          localStorage.setItem(key, JSON.stringify(newVotes));
          
          // 刷新活动数据
          const now = new Date();
          const current = updatedActivities.filter(activity => {
            const startTime = new Date(activity.startTime);
            const endTime = new Date(activity.endTime);
            return now >= startTime && now <= endTime;
          });
          
          setCurrentActivities(current);
          
          toast.success("投票成功！");
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
      
      // 检查作品是否已被用户投票
      const hasUserVoted = (activityId: string, workId: number) => {
        if (!user) return false;
        const userVotes = getUserVotes(activityId);
        return userVotes.includes(workId);
      };

      // 获取当前选中的活动
      const selectedActivity = currentActivities.find(a => a.id === selectedActivityId);

      return (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              {/* 活动选择器 */}
              {currentActivities.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      <Heart className="mr-2 text-orange-500" size={20} />
                      照片评选活动
                    </h2>
                    {(pastActivities.length > 0) && (
                      <button
                        onClick={() => setShowPastActivities(!showPastActivities)}
                        className="text-orange-500 hover:text-orange-600 text-sm flex items-center"
                      >
                        {showPastActivities ? '隐藏' : '查看'}往期活动
                      </button>
                    )}
                  </div>
                  
                  {/* 活动选项卡 */}
                  <div className="flex overflow-x-auto mb-6 pb-2 space-x-2">
                    {currentActivities.map(activity => (
                      <button
                        key={activity.id}
                        onClick={() => setSelectedActivityId(activity.id)}
                        className={`px-4 py-2 whitespace-nowrap rounded-lg transition-colors ${
                          selectedActivityId === activity.id 
                            ? 'bg-orange-500 text-white font-medium' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {activity.title}
                      </button>
                    ))}
                  </div>
                  
                  {/* 当前选中的活动内容 */}
                  {selectedActivity && (
                    <>
                      <div className="mb-6">
                        <p className="text-gray-600 mb-2">{selectedActivity.description}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                          <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                            投票进行中
                          </span>
                          <span>
                            {formatDate(selectedActivity.startTime)} - {formatDate(selectedActivity.endTime)}
                          </span>
                          {isAuthenticated && user && (
                            <span>
                              剩余票数：{getRemainingVotes(selectedActivity)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* 当前活动作品列表（按票数排序） */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {selectedActivity.works
                          .sort((a, b) => b.votes - a.votes)
                          .map(work => (
                            <div
                              key={work.id}
                              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow relative"
                            >
                              {/* 排名标签 */}
                              <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                                #{selectedActivity.works.findIndex(w => w.id === work.id) + 1}
                              </div>
                              <div className="h-48 bg-gray-200 overflow-hidden">
                                   <img
                                        src={work.imageUrl}
                                        alt={work.title}
                                        loading="lazy" // 懒加载投票作品图片
                                       className="w-full h-full object-cover cursor-pointer"
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         setSelectedImage(work.imageUrl);
                                       }} />
                              </div>
                              <div className="p-4">
                                  <h3 className="font-semibold text-gray-800">{work.title}</h3>
                                  <p className="text-sm text-gray-600 mb-3">作者: {work.author}</p>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-500">
                                      <Heart size={14} className="inline mr-1 text-red-500 fill-red-500" />
                                      {work.votes} 票
                                    </span>
                                  </div>
                                  <button
                                      onClick={() => handleVote(selectedActivity.id, work.id)}
                                      disabled={!canVote(selectedActivity) || 
                                               getRemainingVotes(selectedActivity) <= 0 || 
                                               hasUserVoted(selectedActivity.id, work.id)}
                                      className={`flex items-center justify-center w-full ${
                                          !canVote(selectedActivity)
                                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                              : hasUserVoted(selectedActivity.id, work.id)
                                                  ? 'bg-green-500 text-white'
                                                  : 'bg-orange-50 hover:bg-orange-100 text-orange-600'
                                      } font-medium py-1.5 px-3 rounded-md transition-colors`}
                                  >
                                      <Heart size={16} className={`mr-1 ${hasUserVoted(selectedActivity.id, work.id) ? 'fill-white' : ''}`} />
                                      {!canVote(selectedActivity) 
                                        ? '投票已结束' 
                                        : hasUserVoted(selectedActivity.id, work.id) 
                                          ? '已投票' 
                                          : '投票'}
                                  </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {currentActivities.length === 0 && (
                <div className="text-center py-12">
                  <div className="mb-4 text-4xl">📷</div>
                  <h3 className="text-lg font-medium text-gray-800">暂无进行中的投票活动</h3>
                  <p className="text-gray-500 mt-2">敬请期待下一期活动</p>
                </div>
              )}
              
              {/* 往期活动 */}
              {showPastActivities && pastActivities.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">往期活动</h3>
                  <div className="space-y-4">
                    {pastActivities.map(activity => (
                      <div key={activity.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-800">{activity.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <div className="text-sm text-gray-500 mt-2">
                          活动时间：{formatDate(activity.startTime)} - {formatDate(activity.endTime)}
                        </div>
                        <div className="mt-3">
                          <div className="text-sm text-gray-500 mb-2">获奖作品：</div>
                          <div className="flex space-x-3 overflow-x-auto pb-2">
                            {activity.works
                              .sort((a, b) => b.votes - a.votes)
                              .slice(0, 3)
                              .map(work => (
                                <div key={work.id} className="flex-shrink-0 w-24 text-center">
                                  <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden mb-1">
                                    <img
                                      src={work.imageUrl}
                                      alt={work.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="text-xs font-medium text-gray-700">{work.title}</div>
                                  <div className="text-xs text-gray-500">{work.votes}票</div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
      );
  };

   const FeaturedWorks: React.FC<{setSelectedImage: (src: string) => void}> = ({setSelectedImage}) => {
       const [featuredWorks, setFeaturedWorks] = useState<Array<{
           id: number;
           title: string;
           author: string;
           description: string;
          imageUrl: string;
          likes: number;
          comments: Array<{
              id: number;
              author: string;
              content: string;
              time: string;
              replies: Array<{
                id: number;
                author: string;
                content: string;
                time: string;
              }>;
          }>;
      }>>([]);
      
      const [newComment, setNewComment] = useState<string>("");
      const [replyingTo, setReplyingTo] = useState<{ workId: number; commentId: number } | null>(null);
      const [replyContent, setReplyContent] = useState<string>("");
      const [isCommentEmojiPickerOpen, setIsCommentEmojiPickerOpen] = useState(false);
      const [isReplyEmojiPickerOpen, setIsReplyEmojiPickerOpen] = useState<{ workId: number; commentId: number } | null>(null);
      
       const { isAuthenticated, user, isAdmin } = useContext(AuthContext);
      const commentInputRef = useRef<HTMLInputElement>(null);
      const replyInputRef = useRef<HTMLInputElement>(null);
      
      // 插入emoji到评论输入框
      const insertCommentEmoji = (emoji: string) => {
        if (commentInputRef.current) {
          const input = commentInputRef.current;
          const start = input.selectionStart || 0;
          const end = input.selectionEnd || 0;
          const newValue = newComment.slice(0, start) + emoji + newComment.slice(end);
          setNewComment(newValue);
          
          // 恢复焦点并设置光标位置
          setTimeout(() => {
            input.focus();
            input.selectionStart = input.selectionEnd = start + emoji.length;
          }, 0);
        }
      };
      
      // 插入emoji到回复输入框
      const insertReplyEmoji = (emoji: string) => {
        if (replyInputRef.current) {
          const input = replyInputRef.current;
          const start = input.selectionStart || 0;
          const end = input.selectionEnd || 0;
          const newValue = replyContent.slice(0, start) + emoji + replyContent.slice(end);
          setReplyContent(newValue);
          
          // 恢复焦点并设置光标位置
          setTimeout(() => {
            input.focus();
            input.selectionStart = input.selectionEnd = start + emoji.length;
          }, 0);
        }
      };
      
      // 切换回复的emoji选择器
      const toggleReplyEmojiPicker = (workId: number, commentId: number) => {
        if (isReplyEmojiPickerOpen && isReplyEmojiPickerOpen.workId === workId && isReplyEmojiPickerOpen.commentId === commentId) {
          setIsReplyEmojiPickerOpen(null);
        } else {
          setIsReplyEmojiPickerOpen({ workId, commentId });
          setIsCommentEmojiPickerOpen(false);
        }
      };

      // 从localStorage加载数据
      useEffect(() => {
          const savedFeaturedWorks = localStorage.getItem('featuredWorks');
          if (savedFeaturedWorks) {
              setFeaturedWorks(JSON.parse(savedFeaturedWorks));
          } else {
              // 如果没有保存的数据，使用默认数据
              setFeaturedWorks([]);
          }
      }, []);

      // 点赞功能
      const handleLike = (id: number) => {
          const updatedWorks = featuredWorks.map(work => {
              if (work.id === id) {
                  return { ...work, likes: work.likes + 1 };
              }
              return work;
          });
          setFeaturedWorks(updatedWorks);
          localStorage.setItem('featuredWorks', JSON.stringify(updatedWorks));
      };
      
      // 添加评论
      const handleAddComment = (workId: number) => {
          if (!isAuthenticated) {
              toast.error("请先登录再评论");
              return;
          }
          
          if (!newComment.trim()) {
              return;
          }
          
          const now = new Date();
          const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
          
          const updatedWorks = featuredWorks.map(work => {
              if (work.id === workId) {
                  return {
                      ...work,
                      comments: [
                          ...work.comments,
                          {
                              id: Date.now(),
                              author: user?.username || "匿名用户",
                              content: newComment,
                              time: timeString,
                              replies: []
                          }
                      ]
                  };
              }
              return work;
          });
          
          setFeaturedWorks(updatedWorks);
          localStorage.setItem('featuredWorks', JSON.stringify(updatedWorks));
          setNewComment("");
          toast.success("评论添加成功");
      };
      
      // 添加回复
      const handleAddReply = (workId: number, commentId: number) => {
          if (!isAuthenticated) {
              toast.error("请先登录再回复");
              return;
          }
          
          if (!replyContent.trim()) {
              return;
          }
          
          const now = new Date();
          const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
          
          const updatedWorks = featuredWorks.map(work => {
              if (work.id === workId) {
                  return {
                      ...work,
                      comments: work.comments.map(comment => {
                          if (comment.id === commentId) {
                              return {
                                  ...comment,
                                  replies: [
                                      ...comment.replies,
                                      {
                                          id: Date.now(),
                                          author: user?.username || "匿名用户",
                                          content: replyContent,
                                          time: timeString
                                      }
                                  ]
                              };
                          }
                          return comment;
                      })
                  };
              }
              return work;
          });
          
          setFeaturedWorks(updatedWorks);
          localStorage.setItem('featuredWorks', JSON.stringify(updatedWorks));
          setReplyContent("");
          setReplyingTo(null);
          toast.success("回复添加成功");
      };

      // 删除回复（管理员功能）
      const handleDeleteReply = (workId: number, commentId: number, replyId: number) => {
        if (isAdmin() && window.confirm("确定要删除这条回复吗？")) {
          const updatedWorks = featuredWorks.map(work => {
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
          
          setFeaturedWorks(updatedWorks);
          localStorage.setItem('featuredWorks', JSON.stringify(updatedWorks));
          toast.success("回复已删除");
        }
      };

      return (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 overflow-hidden">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Trophy className="mr-2 text-orange-500" size={20} />优秀作品展示
              </h2>
              
              {featuredWorks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                      <div className="mb-4 inline-block text-4xl">📷</div>
                      <p>暂无优秀作品展示</p>
                  </div>
              ) : (
                  <div className="space-y-8">
                      {featuredWorks.map(work => (
                          <div 
                              key={work.id} 
                              className="grid grid-cols-1 md:grid-cols-2 gap-6 group"
                          >
                               <div className="h-64 md:h-80 bg-gray-100 overflow-hidden rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 cursor-pointer"
                                    onClick={() => setSelectedImage(work.imageUrl)}>
                                   <img
                                        src={work.imageUrl}
                                        alt={work.title}
                                        loading="lazy" // 懒加载优秀作品图片
                                       className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                   />
                               </div>
                              <div className="flex flex-col">
                                  <div className="flex justify-between items-start mb-3">
                                      <h3 className="text-xl font-bold text-gray-800">{work.title}</h3>
                                      <span
                                          className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full"
                                      >
                                          作者: {work.author}
                                      </span>
                                  </div>
                                  <p className="text-gray-600 mb-4 line-clamp-3">{work.description}</p>
                                  <div className="mt-auto">
                                      <button 
                                          onClick={() => handleLike(work.id)}
                                          className="flex items-center text-orange-500 hover:text-orange-600 mb-4 transition-colors"
                                      >
                                          <Heart size={18} className="mr-1 fill-orange-500" />
                                          <span className="font-medium">{work.likes} 喜欢</span>
                                      </button>
                                      <div className="border-t border-gray-100 pt-4">
                                          <h4 className="font-medium text-gray-700 mb-3">留言 ({work.comments.length})</h4>
                                          
                                           {/* 评论输入框 */}
                                           <div className="mb-4">
                                               <div className="relative">
                                                 <div className="flex gap-2">
                                                     <input
                                                         ref={commentInputRef}
                                                         type="text"
                                                         value={newComment}
                                                         onChange={e => setNewComment(e.target.value)}
                                                         placeholder="写下你的评论..."
                                                         className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" 
                                                       />
                                                     <div className="flex gap-1">
                                                       <button
                                                         type="button"
                                                         onClick={() => setIsCommentEmojiPickerOpen(!isCommentEmojiPickerOpen)}
                                                         className="bg-gray-100 text-gray-600 font-medium py-2 px-2 rounded-md transition-colors text-xs"
                                                       >
                                                         <span className="text-xl">😀</span>
                                                       </button>
                                                       <button
                                                           onClick={() => handleAddComment(work.id)}
                                                           className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-3 rounded-md transition-colors"
                                                         >
                                                           <Send size={16} />
                                                       </button>
                                                     </div>
                                                 </div>
                                                 {isCommentEmojiPickerOpen && (
                                                   <div className="absolute -bottom-full left-0 mb-2">
                                                     <EmojiPicker
                                                       isOpen={isCommentEmojiPickerOpen}
                                                       onClose={() => setIsCommentEmojiPickerOpen(false)}
                                                       onSelect={(emoji) => {
                                                         insertCommentEmoji(emoji);
                                                       }}
                                                       position="bottom"
                                                     />
                                                   </div>
                                                 )}
                                               </div>
                                           </div>
                                          
                                          {/* 评论列表 */}
                                          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                              {work.comments.map(comment => (
                                                  <div 
                                                      key={comment.id} 
                                                      className="text-sm bg-gray-50 p-3 rounded-lg shadow-sm"
                                                  >
                                                      <div className="flex justify-between items-center mb-1">
                                                          <span className="font-medium text-gray-800">{comment.author}</span>
                                                          <span className="text-gray-500 text-xs">{comment.time}</span>
                                                      </div>
                                                      <p className="text-gray-700">{comment.content}</p>
                                                      
                                                      {/* 回复按钮 */}
                                                      <button 
                                                        onClick={() => setReplyingTo({ workId: work.id, commentId: comment.id })}
                                                        className="text-orange-500 hover:text-orange-600 text-xs flex items-center mt-1"
                                                      >
                                                        <Reply size={12} className="mr-1" /> 回复
                                                      </button>
                                                      
                                                       {/* 回复输入框 */}
                                                       {replyingTo && replyingTo.workId === work.id && replyingTo.commentId === comment.id && (
                                                         <div className="mt-2 relative">
                                                           <div className="flex gap-2">
                                                             <input
                                                               ref={replyInputRef}
                                                               type="text"
                                                               value={replyContent}
                                                               onChange={e => setReplyContent(e.target.value)}
                                                               placeholder="写下你的回复..."
                                                               className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs" 
                                                             />
                                                             <div className="flex gap-1">
                                                               <button
                                                                 type="button"
                                                                 onClick={() => toggleReplyEmojiPicker(work.id, comment.id)}
                                                                 className="bg-gray-100 text-gray-600 font-medium py-1.5 px-1 rounded-md transition-colors text-xs"
                                                               >
                                                                 <span className="text-xl">😀</span>
                                                               </button>
                                                               <button
                                                                 onClick={() => handleAddReply(work.id, comment.id)}
                                                                 className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-1.5 px-2 rounded-md transition-colors text-xs"
                                                               >
                                                                 发送
                                                               </button>
                                                             </div>
                                                           </div>
                                                           {isReplyEmojiPickerOpen && isReplyEmojiPickerOpen.workId === work.id && isReplyEmojiPickerOpen.commentId === comment.id && (
                                                             <div className="absolute -bottom-full left-0 mb-2">
                                                               <EmojiPicker
                                                                 isOpen={true}
                                                                 onClose={() => setIsReplyEmojiPickerOpen(null)}
                                                                 onSelect={(emoji) => {
                                                                   insertReplyEmoji(emoji);
                                                                 }}
                                                                 position="bottom"
                                                               />
                                                             </div>
                                                           )}
                                                         </div>
                                                       )}
                                                      
                                                       {/* 回复列表 */}
                                                      {comment.replies && comment.replies.length > 0 && (
                                                        <div className="mt-2 space-y-2 pl-4 border-l-2 border-gray-100">
                                                          {comment.replies.map(reply => (
                                                            <div key={reply.id} className="bg-white p-2 rounded-md">
                                                              <div className="flex justify-between items-center mb-1">
                                                                <span className="font-medium text-gray-800 text-xs">{reply.author}</span>
                                                                <div className="flex items-center gap-2">
                                                                  <span className="text-gray-500 text-xs">{reply.time}</span>
                                                                  {isAdmin() && (
                                                                    <button 
                                                                      onClick={() => handleDeleteReply(work.id, comment.id, reply.id)}
                                                                      className="text-red-500 hover:text-red-600 text-xs"
                                                                    >
                                                                      删除
                                                                    </button>
                                                                  )}
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
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      );
  };

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
        likedBy: string[]; // 用户ID数组
        replies: ReplyType[];
        type?: 'normal' | 'featured_comment' | 'knowledge_comment'; // 留言类型
        referenceId?: string | number; // 关联的作品ID或知识ID
        isPinned?: boolean; // 是否置顶
    }
   
    const MessageBoard = () => {
        const [messages, setMessages] = useState<Message[]>([]);
        const [newMessage, setNewMessage] = useState("");
        const [replyingTo, setReplyingTo] = useState<number | null>(null);
        const [replyContent, setReplyContent] = useState("");
         const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
         const { isAdmin } = useContext(AuthContext);
        const [replyingEmojiPickerOpen, setReplyingEmojiPickerOpen] = useState<number | null>(null);
        
        const { isAuthenticated, user } = useContext(AuthContext);
        const navigate = useNavigate();
        const messageInputRef = useRef<HTMLInputElement>(null);
        const replyInputRef = useRef<HTMLInputElement>(null);
        
        // 插入emoji到输入框
        const insertEmoji = (emoji: string, type: 'message' | 'reply') => {
            if (type === 'message' && messageInputRef.current) {
                const input = messageInputRef.current;
                const start = input.selectionStart || 0;
                const end = input.selectionEnd || 0;
                const newValue = newMessage.slice(0, start) + emoji + newMessage.slice(end);
                setNewMessage(newValue);
                
                // 恢复焦点并设置光标位置
                setTimeout(() => {
                    input.focus();
                    input.selectionStart = input.selectionEnd = start + emoji.length;
                }, 0);
            } else if (type === 'reply' && replyInputRef.current) {
                const input = replyInputRef.current;
                const start = input.selectionStart || 0;
                const end = input.selectionEnd || 0;
                const newValue = replyContent.slice(0, start) + emoji + replyContent.slice(end);
                setReplyContent(newValue);
                
                // 恢复焦点并设置光标位置
                setTimeout(() => {
                    input.focus();
                    input.selectionStart = input.selectionEnd = start + emoji.length;
                }, 0);
            }
        };
        
        // 切换回复的emoji选择器
        const toggleReplyEmojiPicker = (messageId: number) => {
            if (replyingEmojiPickerOpen === messageId) {
                setReplyingEmojiPickerOpen(null);
            } else {
                setReplyingEmojiPickerOpen(messageId);
                setIsEmojiPickerOpen(false);
            }
        };
       
       // 从localStorage加载留言数据
       useEffect(() => {
           const savedMessages = localStorage.getItem('messages');
           if (savedMessages) {
               try {
                   setMessages(JSON.parse(savedMessages));
               } catch (error) {
                   console.error('Failed to parse saved messages:', error);
                   // 设置默认留言数据
                   setMessages([{
                       id: 1,
                       author: "小明",
                       content: "社团活动很精彩！",
                       time: "2023-11-15 09:30",
                       likes: 5,
                       likedBy: [],
                       replies: []
                   }, {
                       id: 2,
                       author: "小红",
                       content: "希望能学习更多摄影技巧",
                       time: "2023-11-14 16:45",
                       likes: 3,
                       likedBy: [],
                       replies: []
                   }, {
                       id: 3,
                       author: "小华",
                       content: "下一次活动是什么时候？",
                       time: "2023-11-13 14:20",
                       likes: 2,
                       likedBy: [],
                       replies: []
                   }]);
               }
      } else {
        // 初始化默认留言数据，包含不同类型的留言
        const defaultMessages = [{
            id: 1,
            author: "小明",
            content: "社团活动很精彩！这是一条普通留言。",
            time: "2025-12-12 09:30",
            likes: 5,
            likedBy: [],
            replies: [],
            type: 'normal'
        }, {
            id: 2,
            author: "小红",
            content: "校园秋景那组照片拍得太美了，构图和光线处理都很专业！",
            time: "2025-12-11 16:45",
            likes: 3,
            likedBy: [],
            replies: [],
            type: 'featured_comment',
            referenceId: 1
        }, {
            id: 3,
            author: "小华",
            content: "学习了构图技巧后，我的照片有了很大进步，三分法确实很实用！",
            time: "2025-12-10 14:20",
            likes: 2,
            likedBy: [],
            replies: [],
            type: 'knowledge_comment',
            referenceId: "composition"
        }];
        setMessages(defaultMessages);
        localStorage.setItem('messages', JSON.stringify(defaultMessages));
      }
       }, []);
       
       // 保存留言数据到localStorage
       const saveMessages = (updatedMessages: Message[]) => {
           localStorage.setItem('messages', JSON.stringify(updatedMessages));
       };
       
       // 处理留言提交
       const handleSubmit = (e: React.FormEvent) => {
           e.preventDefault();
           
           if (!isAuthenticated) {
               toast.error("请先登录再留言");
               navigate('/login');
               return;
           }
           
           if (!newMessage.trim()) {
               return;
           }
           
           const now = new Date();
           const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
           
            const newMessageObj: Message = {
                id: Date.now(),
                author: user?.username || "匿名用户",
                content: newMessage,
                time: timeString,
                likes: 0,
                likedBy: [],
                replies: [],
                type: 'normal' // 默认普通留言
            };
           
           const updatedMessages = [...messages, newMessageObj];
           setMessages(updatedMessages);
           saveMessages(updatedMessages);
           
           setNewMessage("");
           toast.success("留言发布成功！");
       };
       
        // 处理回复提交
        const handleReply = (messageId: number) => {
            if (!isAuthenticated) {
                toast.error("请先登录再回复");
                navigate('/login');
                return;
            }
            
            if (!replyContent.trim()) {
                return;
            }
            
            const now = new Date();
            const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
            
            const newReply: ReplyType = {
                 id: Date.now(),
                 author: user?.username || "匿名用户",
                 content: replyContent,
                 time: timeString
             };
           
           const updatedMessages = messages.map(message => {
               if (message.id === messageId) {
                   return {
                       ...message,
                       replies: [...message.replies, newReply]
                   };
               }
               return message;
           });
           
           setMessages(updatedMessages);
           saveMessages(updatedMessages);
           
           setReplyContent("");
           setReplyingTo(null);
           toast.success("回复发布成功！");
       };
       
       // 处理点赞功能
       const handleLike = (messageId: number) => {
           if (!isAuthenticated || !user) {
               toast.error("请先登录再点赞");
               navigate('/login');
               return;
           }
           
           const updatedMessages = messages.map(message => {
               if (message.id === messageId) {
                   // 检查用户是否已经点赞
                   const userIndex = message.likedBy.indexOf(user.id);
                   if (userIndex > -1) {
                       // 取消点赞
                       return {
                           ...message,
                           likes: message.likes - 1,
                           likedBy: message.likedBy.filter(id => id !== user.id)
                       };
                   } else {
                       // 添加点赞
                       return {
                           ...message,
                           likes: message.likes + 1,
                           likedBy: [...message.likedBy, user.id]
                       };
                   }
               }
               return message;
           });
           
           setMessages(updatedMessages);
           saveMessages(updatedMessages);
        };
       
        // 删除回复（管理员功能）
        const handleDeleteReply = (messageId: number, replyId: number) => {
          if (isAdmin() && window.confirm("确定要删除这条回复吗？")) {
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
            saveMessages(updatedMessages);
            toast.success("回复已删除");
          }
        };
        
        // 删除留言（管理员功能）
        const handleDeleteMessage = (messageId: number) => {
          if (isAdmin() && window.confirm("确定要删除这条留言吗？此操作不可撤销！")) {
            const updatedMessages = messages.filter(msg => msg.id !== messageId);
            setMessages(updatedMessages);
            saveMessages(updatedMessages);
            toast.success("留言已删除");
          }
        };
       
       return (
           <div className="bg-white rounded-xl shadow-md p-6 mb-8">
               <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                   <MessageSquare className="mr-2 text-orange-500" size={20} />留言区
               </h2>
               
               {/* 留言输入框 */}
                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="relative">
                        <div className="flex gap-2">
                            <input
                                ref={messageInputRef}
                                type="text"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="写下你的留言..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all" 
                              />
                            <div className="flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                                    className="bg-gray-100 text-gray-600 font-medium py-2 px-3 rounded-md transition-colors"
                                >
                                    <span className="text-xl">😀</span>
                                </button>
                                 <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-3 rounded-md transition-colors transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                        {isEmojiPickerOpen && (
                            <div className="absolute -bottom-full left-0 mb-2">
                                <EmojiPicker
                                    isOpen={isEmojiPickerOpen}
                                    onClose={() => setIsEmojiPickerOpen(false)}
                                    onSelect={(emoji) => {
                                        insertEmoji(emoji, 'message');
                                    }}
                                    position="bottom"
                                />
                            </div>
                        )}
                    </div>
                </form>
               
                 {/* 留言列表 */}
                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            暂无留言，快来发布第一条留言吧！
                        </div>
                    ) : (
                         // 先按置顶状态排序，再按时间排序
                         [...messages]
                           .sort((a, b) => {
                             if (a.isPinned && !b.isPinned) return -1;
                             if (!a.isPinned && b.isPinned) return 1;
                             return new Date(b.time).getTime() - new Date(a.time).getTime();
                           })
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
                                   {message.type && message.type !== 'normal' && (
                                     <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                       message.type === 'featured_comment' 
                                         ? 'bg-blue-100 text-blue-600' 
                                         : 'bg-green-100 text-green-600'
                                     }`}>
                                       {message.type === 'featured_comment' ? '优秀作品评论' : '学习心得'}
                                     </span>
                                   )}
                                 </div>
                                 <div className="flex items-center gap-3">
                                   <span className="text-xs text-gray-500">{message.time}</span>
                                   <button 
                                     onClick={() => handleLike(message.id)}
                                     className={`flex items-center text-xs ${
                                       user && message.likedBy.includes(user.id) 
                                         ? 'text-red-500' 
                                         : 'text-gray-500 hover:text-red-500'
                                     } transition-colors`}
                                   >
                                     <Heart 
                                       size={14} 
                                       className={user && message.likedBy.includes(user.id) ? 'fill-red-500' : ''} 
                                     />
                                     <span className="ml-1">{message.likes}</span>
                                   </button>
                                   {isAdmin() && (
                                     <button 
                                       onClick={() => handleDeleteMessage(message.id)}
                                       className="text-red-500 hover:text-red-600 text-xs"
                                     >
                                       删除
                                     </button>
                                   )}
                                 </div>
                               </div>
                                <p className="text-gray-700 mb-3">{message.content}</p>
                                
                                {/* 回复按钮 */}
                                <button 
                                    onClick={() => setReplyingTo(replyingTo === message.id ? null : message.id)}
                                    className="text-orange-500 hover:text-orange-600 text-xs flex items-center mb-2 transition-colors"
                                >
                                    <Reply size={12} className="mr-1" /> {replyingTo === message.id ? '取消回复' : '回复'}
                                </button>
                                
                                {/* 回复输入框 */}
                                {replyingTo === message.id && (
                                    <div className="mb-3">
                                        <div className="relative">
                                            <div className="flex gap-2">
                                                <input
                                                    ref={replyInputRef}
                                                    type="text"
                                                    value={replyContent}
                                                    onChange={e => setReplyContent(e.target.value)}
                                                    placeholder={`回复 @${message.author}...`}
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" 
                                                />
                                                <div className="flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleReplyEmojiPicker(message.id)}
                                                        className="bg-gray-100 text-gray-600 font-medium py-1.5 px-2 rounded-md transition-colors text-xs flex items-center"
                                                    >
                                                        <span className="text-xl">😀</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleReply(message.id)}
                                                        className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-1.5 px-2 rounded-md transition-colors text-xs"
                                                    >
                                                        发送
                                                    </button>
                                                </div>
                                            </div>
                                            {replyingEmojiPickerOpen === message.id && (
                                                <div className="absolute -bottom-full left-0 mb-2">
                                                    <EmojiPicker
                                                        isOpen={replyingEmojiPickerOpen === message.id}
                                                        onClose={() => setReplyingEmojiPickerOpen(null)}
                                                        onSelect={(emoji) => {
                                                            insertEmoji(emoji, 'reply');
                                                        }}
                                                        position="bottom"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {/* 回复列表 */}
                                {message.replies.length > 0 && (
                                    <div className="mt-2 space-y-2 pl-4 border-l-2 border-gray-200">
                                        {message.replies.map(reply => (
                                            <div key={reply.id} className="bg-white p-2 rounded-md">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-medium text-gray-800 text-xs">{reply.author}</span>
                                                    <span className="text-gray-500 text-xs">{reply.time}</span>
                                                </div>
                                                <p className="text-gray-700 text-xs">{reply.content}</p>
                                             <div className="flex justify-end mt-1">
                                              {isAdmin() && (
                                                <button 
                                                  onClick={() => handleDeleteReply(message.id, reply.id)}
                                                  className="text-red-500 hover:text-red-600 text-xs"
                                                >
                                                  删除
                                                </button>
                                              )}
                                            </div>
                                             </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
           </div>
       );
   };

  const AuthButtons = () => {
      const {
          isAuthenticated,
          user,
          logout,
          isAdmin
      } = useContext(AuthContext);
      const navigate = useNavigate();

      const handleAdminAccess = () => {
          if (isAuthenticated && isAdmin()) {
              navigate('/admin');
          } else {
              alert("请使用管理员账号登录以访问管理页面");
              navigate('/login');
          }
      };

      return (
          <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                  <>
                      {isAdmin() && (
                          <button
                              onClick={handleAdminAccess}
                              className="text-sm bg-orange-50 hover:bg-orange-100 text-orange-600 font-medium py-1.5 px-3 rounded-md transition-colors"
                          >
                              管理后台
                          </button>
                      )}
                      <div className="flex items-center">
                          <User size={16} className="mr-1 text-gray-600" />
                          <span className="text-sm font-medium">{user?.username}</span>
                      </div>
                      <button
                          onClick={logout}
                          className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
                      >
                          退出
                      </button>
                  </>
              ) : (
                  <button
                      onClick={() => navigate('/login')}
                      className="flex items-center text-sm bg-orange-500 hover:bg-orange-600 text-white font-medium py-1.5 px-3 rounded-md transition-colors"
                  >
                      <LogIn size={16} className="mr-1" />登录/注册
                  </button>
              )}
          </div>
      );
  };

  export default function Home() {
       const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
       const [selectedImage, setSelectedImage] = useState<string | null>(null);
       
       // 监听来自其他组件的图片点击事件
       useEffect(() => {
         const handleOpenImageViewer = (event: Event) => {
           const customEvent = event as CustomEvent;
           if (customEvent.detail && customEvent.detail.src) {
             setSelectedImage(customEvent.detail.src);
           }
         };
         
         window.addEventListener('openImageViewer', handleOpenImageViewer);
         return () => {
           window.removeEventListener('openImageViewer', handleOpenImageViewer);
         };
       }, []);

       return (
          <div className="min-h-screen bg-gray-50 flex flex-col">
              <header className="bg-white shadow-sm sticky top-0 z-10">
                  <div className="container mx-auto px-4">
                      <div className="flex justify-between items-center h-16">
                          <SchoolLogo />
                          
                          <nav className="hidden md:flex items-center space-x-6">
                              {navLinks.map(link => {
                                // 定义导航链接对应的页面元素ID
                                const getTargetId = () => {
                                  switch(link.id) {
                                    case 1: return 'hero';
                                    case 2: return 'photography-knowledge';
                                    case 3: return 'submission-form';
                                    case 4: return 'featured-works';
                                    case 5: return 'message-board';
                                    default: return '';
                                  }
                                };
                                
                                // 处理导航点击，平滑滚动到对应部分
                                const handleNavClick = (e: React.MouseEvent) => {
                                  e.preventDefault();
                                  const targetId = getTargetId();
                                  if (targetId) {
                                    const element = document.getElementById(targetId);
                                    if (element) {
                                      element.scrollIntoView({ behavior: 'smooth' });
                                    }
                                  }
                                  // 关闭移动菜单
                                  setMobileMenuOpen(false);
                                };
                                
                                return (
                                  <button
                                      key={link.id}
                                      onClick={handleNavClick}
                                      className="flex items-center text-gray-600 hover:text-orange-500 transition-colors"
                                  >
                                      {link.icon}
                                      <span className="ml-1">{link.title}</span>
                                  </button>
                                );
                              })}
                              <AuthButtons />
                          </nav>
                          
                          <button
                              className="md:hidden text-gray-500 hover:text-gray-700 transition-colors"
                              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                          >
                              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                          </button>
                      </div>
                  </div>
                  
                  {mobileMenuOpen && (
                      <div className="md:hidden bg-white border-t border-gray-100">
                          <div className="container mx-auto px-4 py-2 space-y-1">
                               {navLinks.map(link => {
                                 // 定义导航链接对应的页面元素ID
                                 const getTargetId = () => {
                                   switch(link.id) {
                                     case 1: return 'hero';
                                     case 2: return 'photography-knowledge';
                                     case 3: return 'submission-form';
                                     case 4: return 'featured-works';
                                     case 5: return 'message-board';
                                     default: return '';
                                   }
                                 };
                                 
                                 // 处理导航点击，平滑滚动到对应部分
                                 const handleNavClick = (e: React.MouseEvent) => {
                                   e.preventDefault();
                                   const targetId = getTargetId();
                                   if (targetId) {
                                     const element = document.getElementById(targetId);
                                     if (element) {
                                       element.scrollIntoView({ behavior: 'smooth' });
                                     }
                                   }
                                   // 关闭移动菜单
                                   setMobileMenuOpen(false);
                                 };
                                 
                                 return (
                                   <button
                                       key={link.id}
                                       onClick={handleNavClick}
                                       className="flex items-center px-3 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-500 rounded-md transition-colors"
                                   >
                                       {link.icon}
                                       <span className="ml-2">{link.title}</span>
                                   </button>
                                 );
                               })}
                              <div className="px-3 py-2">
                                  <AuthButtons />
                              </div>
                          </div>
                      </div>
                  )}
               </header>
               
               {/* 图片预览组件 */}
               <ImageViewer 
                 src={selectedImage} 
                 onClose={() => setSelectedImage(null)} 
               />
              
              <main className="flex-1 container mx-auto px-4 py-8">
                   {/* 英雄区域 */}
                   <div
                       id="hero"
                       className="relative h-64 md:h-80 bg-gradient-to-r from-orange-500 to-orange-300 rounded-xl overflow-hidden mb-8 shadow-lg"
                   >
                       <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 z-10">
                           <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">欢迎来到摄影与舞台社</h1>
                           <p className="text-white text-opacity-90 mb-4 max-w-lg">用镜头记录美好瞬间，用影像讲述精彩故事</p>
                            <a
                                href="http://www.hz9z.cn/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-fit bg-white text-orange-500 font-medium py-2 px-4 rounded-md hover:bg-orange-50 transition-colors flex items-center transform hover:scale-105"
                            >
                                了解更多 <ChevronRight size={16} className="ml-1" />
                            </a>
                       </div>
                       <div
                           className="absolute right-0 bottom-0 w-full md:w-1/2 h-full bg-opacity-20 overflow-hidden"
                       >
                           <img
                                src="https://lf-code-agent.coze.cn/obj/x-ai-cn/attachment/4443541369000812/鸟瞰图_20251211104333.jpg"
                                alt="学校鸟瞰图"
                                className="w-full h-full object-cover opacity-20"
                                loading="eager" // 首页英雄区图片立即加载
                           />
                       </div>
                   </div>
                  
                   {/* 内容区域 */}
                   <div id="photography-knowledge">
                     <PhotographyKnowledge setSelectedImage={setSelectedImage} />
                   </div>
                   <div id="submission-form">
                     <SubmissionForm />
                   </div>
                   <div id="voting-system">
                     <VotingSystem setSelectedImage={setSelectedImage} />
                   </div>
                   <div id="featured-works">
                     <FeaturedWorks setSelectedImage={setSelectedImage} />
                   </div>
                   <div id="message-board">
                     <MessageBoard />
                   </div>
              </main>
              
              <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
                  <div className="container mx-auto px-4">
                      <div className="flex flex-col md:flex-row justify-between items-center">
                          <div className="mb-4 md:mb-0">
                              <div className="text-sm text-gray-500">© {new Date().getFullYear()} 杭州第九中学树范学校摄影与舞台社</div>
                          </div>
                          <div className="flex space-x-4">
                              <a
                                  href="#"
                                  className="text-gray-400 hover:text-orange-500 transition-colors"
                              >
                                  <span className="sr-only">Instagram</span>
                                  <svg
                                      className="h-6 w-6"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                      aria-hidden="true"
                                  >
                                      <path
                                          fillRule="evenodd"
                                          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                                          clipRule="evenodd"
                                      />
                                  </svg>
                              </a>
                              <a
                                  href="#"
                                  className="text-gray-400 hover:text-orange-500 transition-colors"
                              >
                                  <span className="sr-only">WeChat</span>
                                  <svg
                                      className="h-6 w-6"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                      aria-hidden="true"
                                  >
                                      <path
                                          fillRule="evenodd"
                                          d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"
                                          clipRule="evenodd"
                                      />
                                  </svg>
                              </a>
                          </div>
                      </div>
                  </div>
              </footer>
          </div>
      );
  }