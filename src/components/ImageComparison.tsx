import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Maximize, Minimize } from 'lucide-react';

interface ImageComparisonProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel: string;
  afterLabel: string;
  description?: string;
  loading?: "eager" | "lazy" | "auto";
}

const ImageComparison: React.FC<ImageComparisonProps> = ({
  beforeImage,
  afterImage,
  beforeLabel,
  afterLabel,
  description,
  loading = "lazy"
}) => {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 处理鼠标拖动
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, newPosition)));
  };

  // 处理触摸拖动
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, newPosition)));
  };

  // 处理全屏切换
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 清理事件监听器
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('mouseup', () => setIsDragging(false));
      document.addEventListener('touchend', () => setIsDragging(false));
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('mouseup', () => setIsDragging(false));
        document.removeEventListener('touchend', () => setIsDragging(false));
      };
    }
  }, [isDragging]);

  // 添加键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setPosition(prev => Math.max(0, prev - 5));
      } else if (e.key === 'ArrowRight') {
        setPosition(prev => Math.min(100, prev + 5));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-lg border ${
        isFullscreen 
          ? 'fixed top-0 left-0 w-full h-full z-50 bg-white flex flex-col p-4' 
          : 'max-h-[400px]'
      }`}
    >
      {/* 全屏控制按钮 */}
      {!isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-700 p-1 rounded-full z-10 transition-all backdrop-blur-sm"
          aria-label="全屏查看"
        >
          <Maximize size={20} />
        </button>
      )}
      
      {isFullscreen && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">{beforeLabel} vs {afterLabel}</h3>
          <button
            onClick={toggleFullscreen}
            className="bg-gray-800/10 hover:bg-gray-800/20 text-gray-800 p-2 rounded-full transition-all"
            aria-label="退出全屏"
          >
            <Minimize size={20} />
          </button>
        </div>
      )}
      
      <div 
        className="relative w-full h-full cursor-col-resize"
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        style={{ height: isFullscreen ? 'calc(100vh - 4rem)' : '300px' }}
      >
        {/* 左侧图片 - Before */}
        <div 
          className="absolute top-0 left-0 w-full h-full overflow-hidden"
          style={{ clipPath: `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)` }}
        >
            <img 
               src={beforeImage} 
               alt={beforeLabel}
               className="w-full h-full object-cover transition-opacity cursor-pointer"
               loading={loading}
               onClick={(e) => {
                 e.stopPropagation();
                 const event = new CustomEvent('openImageViewer', { detail: { src: beforeImage } });
                 window.dispatchEvent(event);
               }}
            />
          <div className="absolute bottom-0 left-0 bg-black/70 text-white px-3 py-1.5 rounded-tr-md text-sm font-medium">
            {beforeLabel}
          </div>
        </div>
        
        {/* 右侧图片 - After */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden">
            <img 
               src={afterImage} 
               alt={afterLabel}
               className="w-full h-full object-cover transition-opacity cursor-pointer"
               loading={loading}
               onClick={(e) => {
                 e.stopPropagation();
                 const event = new CustomEvent('openImageViewer', { detail: { src: afterImage } });
                 window.dispatchEvent(event);
               }}
            />
          <div className="absolute bottom-0 right-0 bg-black/70 text-white px-3 py-1.5 rounded-tl-md text-sm font-medium">
            {afterLabel}
          </div>
        </div>
        
        {/* 分隔滑块 */}
        <div 
          className="absolute top-0 bottom-0 w-px bg-white/80 shadow-md z-10 transition-transform"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 border-2 border-white shadow-lg flex items-center justify-center">
            <div className="flex items-center justify-center w-full h-full">
              <ArrowLeft size={16} className="text-gray-700 -ml-1" />
              <div className="w-px h-6 bg-gray-300 mx-0.5"></div>
              <ArrowRight size={16} className="text-gray-700 -mr-1" />
            </div>
          </div>
        </div>
        
        {/* 键盘控制提示 */}
        {!isDragging && (
          <div className="absolute top-4 left-4 bg-white/80 text-gray-700 px-3 py-1.5 rounded-full text-xs backdrop-blur-sm transition-opacity animate-pulse">
            <span className="mr-2">拖动滑块或使用 ← → 键</span>
            对比效果
          </div>
        )}
      </div>
      
      {/* 描述文字 */}
      {description && (
        <div className={`mt-3 p-3 bg-gray-50 rounded-md text-sm text-gray-700 ${isFullscreen ? 'mt-auto' : ''}`}>
          <p>{description}</p>
        </div>
      )}
    </div>
  );
};

export default ImageComparison;