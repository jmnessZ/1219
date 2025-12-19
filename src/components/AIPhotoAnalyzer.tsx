import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, AlertTriangle, Brain, Camera, Sun, Layout, Palette, Settings, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface AnalysisResult {
  composition: {
    score: number;
    suggestions: string[];
  };
  lighting: {
    score: number;
    suggestions: string[];
  };
  exposure: {
    score: number;
    suggestions: string[];
  };
  color: {
    score: number;
    suggestions: string[];
  };
  overallScore: number;
  overallSuggestions: string[];
}

const AIPhotoAnalyzer: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
          toast.error('请上传图片文件');
          return;
        }
        
        // 检查文件大小
        if (file.size > 30 * 1024 * 1024) {
          toast.error('图片大小不能超过30MB');
          return;
        }
      
      setImage(file);
      
      // 创建预览URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setPreviewUrl(event.target.result);
        }
      };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('图片上传处理错误:', error);
      toast.error('图片上传过程中出现错误，请重试');
    }
  };

  // 模拟AI分析过程
  const analyzePhoto = () => {
    if (!image) {
      toast.error('请先上传一张照片');
      return;
    }
    
    setIsAnalyzing(true);
    
    // 模拟API调用延迟
    setTimeout(() => {
      // 生成随机但合理的分析结果
      const result: AnalysisResult = generateAnalysisResult();
      setAnalysisResult(result);
      setIsAnalyzing(false);
    }, 2000);
  };

  // 生成模拟的分析结果
  const generateAnalysisResult = (): AnalysisResult => {
    // 随机生成各项评分(60-95之间)
    const compositionScore = Math.floor(Math.random() * 35) + 60;
    const lightingScore = Math.floor(Math.random() * 35) + 60;
    const exposureScore = Math.floor(Math.random() * 35) + 60;
    const colorScore = Math.floor(Math.random() * 35) + 60;
    
    // 计算总体评分
    const overallScore = Math.round((compositionScore + lightingScore + exposureScore + colorScore) / 4);
    
    // 根据不同评分提供不同的建议
    return {
      composition: {
        score: compositionScore,
        suggestions: getCompositionSuggestions(compositionScore)
      },
      lighting: {
        score: lightingScore,
        suggestions: getLightingSuggestions(lightingScore)
      },
      exposure: {
        score: exposureScore,
        suggestions: getExposureSuggestions(exposureScore)
      },
      color: {
        score: colorScore,
        suggestions: getColorSuggestions(colorScore)
      },
      overallScore,
      overallSuggestions: getOverallSuggestions(overallScore)
    };
  };

  // 获取构图建议
  const getCompositionSuggestions = (score: number): string[] => {
    if (score >= 90) {
      return [
        "构图非常出色，主体突出且画面平衡",
        "利用了三分法或黄金分割，视觉效果优秀",
        "前景和背景的层次感处理得当"
      ];
    } else if (score >= 80) {
      return [
        "构图良好，但可以尝试将主体放在三分线交点上",
        "适当增加一些前景元素，增强画面深度感",
        "考虑调整视角，让画面更加生动"
      ];
    } else if (score >= 70) {
      return [
        "构图基本合理，可以尝试使用引导线引导观众视线",
        "主体位置可以稍作调整，避免画面过于居中",
        "注意画面的水平和垂直平衡"
      ];
    } else {
      return [
        "建议学习基本构图法则，如三分法、黄金分割等",
        "主体不够突出，考虑简化背景或调整角度",
        "注意画面的留白和呼吸空间"
      ];
    }
  };

  // 获取光线建议
  const getLightingSuggestions = (score: number): string[] => {
    if (score >= 90) {
      return [
        "光线控制非常专业，主体受光均匀",
        "光影对比恰到好处，增强了画面立体感",
        "光线方向选择理想，突出了主体特征"
      ];
    } else if (score >= 80) {
      return [
        "光线处理良好，可以尝试调整光源角度减少阴影",
        "在逆光条件下，可以考虑使用反光板补光",
        "注意避免强光下的过度曝光"
      ];
    } else if (score >= 70) {
      return [
        "光线较为平淡，可以尝试侧光拍摄增加立体感",
        "注意避免背景过亮导致主体曝光不足",
        "考虑黄金时段拍摄，利用柔和的自然光"
      ];
    } else {
      return [
        "光线处理需要改进，考虑调整拍摄时间或位置",
        "主体和背景的光比过大，建议使用补光设备",
        "注意避免直接顶光拍摄导致的不良阴影"
      ];
    }
  };

  // 获取曝光建议
  const getExposureSuggestions = (score: number): string[] => {
    if (score >= 90) {
      return [
        "曝光控制非常精准，高光和阴影细节保留完整",
        "直方图分布均匀，没有过曝或欠曝区域",
        "在复杂光线下仍能保持正确曝光"
      ];
    } else if (score >= 80) {
      return [
        "曝光基本准确，高光部分可以稍微降低一些",
        "考虑使用曝光补偿微调画面亮度",
        "在高对比度场景下，可以尝试包围曝光"
      ];
    } else if (score >= 70) {
      return [
        "曝光存在一些偏差，建议使用点测光模式针对主体测光",
        "注意避免背景过亮导致主体曝光不足",
        "可以尝试使用曝光锁定功能确保关键区域曝光准确"
      ];
    } else {
      return [
        "曝光不准确，需要学习曝光三要素的平衡",
        "注意观察直方图，避免高光过曝或暗部欠曝",
        "在复杂光线下，考虑使用手动曝光模式"
      ];
    }
  };

  // 获取色彩建议
  const getColorSuggestions = (score: number): string[] => {
    if (score >= 90) {
      return [
        "色彩表现非常出色，色调统一且自然",
        "白平衡准确，没有色偏现象",
        "色彩对比和饱和度控制得当，视觉效果舒适"
      ];
    } else if (score >= 80) {
      return [
        "色彩表现良好，可以稍微调整白平衡使肤色更自然",
        "考虑降低某些高饱和色彩的饱和度，避免视觉疲劳",
        "在后期处理中可以尝试轻微的色彩分级"
      ];
    } else if (score >= 70) {
      return [
        "色彩有些平淡，可以适当增加对比度",
        "存在轻微色偏，建议校准相机白平衡",
        "考虑色彩搭配，使用互补色增强视觉效果"
      ];
    } else {
      return [
        "色彩表现需要改进，建议学习色彩理论基础",
        "明显的白平衡偏差，需要重新调整",
        "饱和度控制不当，部分颜色过于刺眼"
      ];
    }
  };

  // 获取总体建议
  const getOverallSuggestions = (score: number): string[] => {
    if (score >= 90) {
      return ["这是一张非常出色的照片，各方面表现都很专业！"];
    } else if (score >= 80) {
      return ["照片整体表现良好，稍作调整即可更加出色。"];
    } else if (score >= 70) {
      return ["照片有一定基础，但仍有提升空间，可以参考各项具体建议进行改进。"];
    } else {
      return ["建议从基础开始，学习构图、光线和曝光的基础知识，并多加练习。"];
    }
  };

  // 获取评分对应的等级和颜色
  const getScoreLevel = (score: number) => {
    if (score >= 90) return { level: '优秀', color: 'text-green-600' };
    if (score >= 80) return { level: '良好', color: 'text-blue-600' };
    if (score >= 70) return { level: '一般', color: 'text-orange-600' };
    return { level: '需要改进', color: 'text-red-600' };
  };

  // 重置分析
  const resetAnalysis = () => {
    setImage(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <Brain className="mr-2 text-orange-500" size={20} />
        AI智能照片分析
      </h2>
      
      {/* 上传和预览区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors"
             onClick={() => fileInputRef.current?.click()}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          
          {!previewUrl ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                <Upload size={32} className="text-orange-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">上传照片进行分析</h3>
                 <p className="text-gray-500 text-sm">
                   支持JPG、PNG等常见图片格式，大小不超过30MB
                 </p>
            </div>
          ) : (
            <div className="relative w-full max-w-md">
                <img 
                  src={previewUrl} 
                  alt="上传的照片" 
                  className="w-full h-auto rounded-lg shadow-sm cursor-pointer"
                  loading="eager" // 上传的照片立即加载
                  onClick={() => {
                    const event = new CustomEvent('openImageViewer', { detail: { src: previewUrl } });
                    window.dispatchEvent(event);
                  }}
               />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  resetAnalysis();
                }}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 rounded-full p-1 backdrop-blur-sm transition-all"
                aria-label="移除照片"
              >
               <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </button>
            </div>
          )}
        </div>
        
        <div className="flex flex-col justify-center">
          <h3 className="text-lg font-medium text-gray-800 mb-4">照片分析说明</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <CheckCircle size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600">AI将从构图、光线、曝光和色彩四个维度进行分析</span>
            </li>
            <li className="flex items-start">
              <CheckCircle size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600">每个维度都会给出具体的评分和针对性建议</span>
            </li>
            <li className="flex items-start">
              <CheckCircle size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600">分析结果仅供参考，帮助您提升摄影技巧</span>
            </li>
            <li className="flex items-start">
              <AlertTriangle size={18} className="text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600">分析过程需要2-3秒时间，请耐心等待</span>
            </li>
          </ul>
          
          <button
            onClick={analyzePhoto}
            disabled={!previewUrl || isAnalyzing}
            className={`mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-md transition-all transform hover:scale-[1.01] flex items-center justify-center ${
              !previewUrl || isAnalyzing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                分析中...
              </>
            ) : (
              <>
                <Brain size={18} className="mr-2" />
                开始AI分析
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* 分析结果展示 */}
      {analysisResult && (
        <div className="bg-orange-50 rounded-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2 md:mb-0">分析结果</h3>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-orange-500 mr-2">{analysisResult.overallScore}</div>
              <div className={`text-lg font-medium ${getScoreLevel(analysisResult.overallScore).color}`}>
                {getScoreLevel(analysisResult.overallScore).level}
              </div>
            </div>
          </div>
          
          {/* 总体建议 */}
          <div className="mb-8">
            <div className="text-sm text-gray-500 mb-2">总体评价</div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              {analysisResult.overallSuggestions.map((suggestion, index) => (
                <p key={index} className="text-gray-700">{suggestion}</p>
              ))}
            </div>
          </div>
          
          {/* 各维度详细分析 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 构图分析 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Layout size={16} className="text-blue-500 mr-2" />
                  <span className="font-medium text-gray-700">构图分析</span>
                </div>
                <div className={`text-sm font-medium ${getScoreLevel(analysisResult.composition.score).color}`}>
                  {analysisResult.composition.score}分
                </div>
              </div>
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <ul className="space-y-2">
                  {analysisResult.composition.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* 光线分析 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Sun size={16} className="text-yellow-500 mr-2" />
                  <span className="font-medium text-gray-700">光线分析</span>
                </div>
                <div className={`text-sm font-medium ${getScoreLevel(analysisResult.lighting.score).color}`}>
                  {analysisResult.lighting.score}分
                </div>
              </div>
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <ul className="space-y-2">
                  {analysisResult.lighting.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 mr-2"></span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* 曝光分析 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Camera size={16} className="text-green-500 mr-2" />
                  <span className="font-medium text-gray-700">曝光分析</span>
                </div>
                <div className={`text-sm font-medium ${getScoreLevel(analysisResult.exposure.score).color}`}>
                  {analysisResult.exposure.score}分
                </div>
              </div>
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <ul className="space-y-2">
                  {analysisResult.exposure.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 mr-2"></span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* 色彩分析 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Palette size={16} className="text-purple-500 mr-2" />
                  <span className="font-medium text-gray-700">色彩分析</span>
                </div>
                <div className={`text-sm font-medium ${getScoreLevel(analysisResult.color.score).color}`}>
                  {analysisResult.color.score}分
                </div>
              </div>
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <ul className="space-y-2">
                  {analysisResult.color.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
           {/* 操作按钮 */}
          <div className="mt-6">
            <button
              onClick={resetAnalysis}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-300 transition-colors"
            >
              重新分析
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPhotoAnalyzer;