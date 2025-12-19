import React, { useState, useEffect, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, RotateCw, ArrowLeft, ArrowRight, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageViewerProps {
  src: string | null;
  alt?: string;
  onClose: () => void;
  images?: string[]; // 可选的图片数组，用于支持多张图片浏览
  currentIndex?: number; // 当前图片在数组中的索引
  onIndexChange?: (index: number) => void; // 索引变化时的回调函数
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  src,
  alt = 'Preview image',
  onClose,
  images = [],
  currentIndex = 0,
  onIndexChange
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  // 使用当前 src 或 images 数组中的第一张图片作为初始显示
  const currentImage = src || (images.length > 0 ? images[currentIndex] : null);

  // 当图片源改变时，重置缩放、旋转和位置
  useEffect(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [currentImage]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentImage) return;

      // ESC键关闭预览
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // 左右箭头键切换图片
      if (images.length > 1) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const newIndex = (currentIndex - 1 + images.length) % images.length;
          if (onIndexChange) onIndexChange(newIndex);
          return;
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          const newIndex = (currentIndex + 1) % images.length;
          if (onIndexChange) onIndexChange(newIndex);
          return;
        }
      }

      // + 和 - 键控制缩放
      if (e.key === '+') {
        e.preventDefault();
        handleZoomIn();
        return;
      }
      if (e.key === '-') {
        e.preventDefault();
        handleZoomOut();
        return;
      }

      // 上箭头和下箭头键控制向上/向下移动
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setPosition(prev => ({ ...prev, y: prev.y + 20 }));
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setPosition(prev => ({ ...prev, y: prev.y - 20 }));
        return;
      }

      // R 键重置
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleReset();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentImage, currentIndex, images.length, onClose, onIndexChange]);

  // 拖动图片
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return; // 只有在缩放后才能拖动
    setIsDragging(true);
    setStartPosition({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - startPosition.x,
      y: e.clientY - startPosition.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 缩放功能
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 5)); // 最大放大5倍
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.2)); // 最小缩小到0.2倍
  };

  // 旋转功能
  const handleRotateLeft = () => {
    setRotation(prev => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // 重置功能
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // 切换到适应窗口大小
  const handleFitToScreen = () => {
    if (imageRef.current) {
      const containerWidth = window.innerWidth * 0.8;
      const containerHeight = window.innerHeight * 0.8;
      const imageWidth = imageRef.current.naturalWidth;
      const imageHeight = imageRef.current.naturalHeight;

      // 计算缩放比例，使图片适应容器
      const scaleX = containerWidth / imageWidth;
      const scaleY = containerHeight / imageHeight;
      const newScale = Math.min(scaleX, scaleY);
      
      setScale(newScale);
      setPosition({ x: 0, y: 0 });
    }
  };

  // 切换到原始大小
  const handleOriginalSize = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // 上一张/下一张图片
  const handlePrevImage = () => {
    if (images.length > 1 && onIndexChange) {
      const newIndex = (currentIndex - 1 + images.length) % images.length;
      onIndexChange(newIndex);
    }
  };

  const handleNextImage = () => {
    if (images.length > 1 && onIndexChange) {
      const newIndex = (currentIndex + 1) % images.length;
      onIndexChange(newIndex);
    }
  };

  // 点击遮罩层关闭预览
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!currentImage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
        onClick={handleOverlayClick}
        onMouseMove={handleMouseMove}onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* 导航按钮 - 多张图片时显示 */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
              aria-label="Previous image"
            >
              <ArrowLeft size={24} />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
              aria-label="Next image"
            >
              <ArrowRight size={24} />
            </button>
          </>
        )}

        {/* 图片信息 - 多张图片时显示当前索引 */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm z-10">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* 图片容器 */}
        <div className="relative w-full h-full flex items-center justify-center">
          <motion.img
            ref={imageRef}
            src={currentImage}
            alt={alt}
            className="max-w-full max-h-full object-contain cursor-move"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease',
              userSelect: 'none',
            }}
            onMouseDown={handleMouseDown}
            loading="lazy" // 懒加载图片以提高性能
          />
        </div>

        {/* 工具栏 */}
        <div className="absolute bottom-4 left-4 right-4 bg-black/50 rounded-lg p-2 flex flex-wrap gap-2 justify-center items-center z-10">
          <button
            onClick={handleZoomIn}
            className="p-2 text-white hover:bg-white/20 rounded-md transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-white hover:bg-white/20 rounded-md transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut size={20} />
          </button>
          <div className="h-6 w-px bg-white/30 mx-1"></div>
          <button
            onClick={handleRotateLeft}
            className="p-2 text-white hover:bg-white/20 rounded-md transition-colors"
            aria-label="Rotate left"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={handleRotateRight}
            className="p-2 text-white hover:bg-white/20 rounded-md transition-colors"
            aria-label="Rotate right"
          >
            <RotateCw size={20} />
          </button>
          <div className="h-6 w-px bg-white/30 mx-1"></div>
          <button
            onClick={handleFitToScreen}
            className="p-2 text-white hover:bg-white/20 rounded-md transition-colors"
            aria-label="Fit to screen"
          >
            <Maximize2 size={20} />
          </button>
          <button
            onClick={handleOriginalSize}
            className="p-2 text-white hover:bg-white/20 rounded-md transition-colors"
            aria-label="Original size"
          >
            <Minimize2 size={20} />
          </button>
          <div className="h-6 w-px bg-white/30 mx-1"></div>
          <button
            onClick={handleReset}
            className="p-2 text-white hover:bg-white/20 rounded-md transition-colors"
            aria-label="Reset"
          >
            <span className="text-sm">重置</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageViewer;