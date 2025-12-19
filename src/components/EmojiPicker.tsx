import React, { useState, useEffect, useRef } from 'react';
import { X, Smile } from 'lucide-react';

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

// 定义常用emoji集合
const emojiCategories = [
  {
    name: '常用表情',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎']
  },
  {
    name: '手势符号',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦵', '🦿', '🦶', '👂', '🦻', '👃']
  },
  {
    name: '动物植物',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇']
  },
  {
    name: '食物饮料',
    emojis: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠']
  },
  {
    name: '旅行地点',
    emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟']
  },
  {
    name: '活动',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🥅', '⛳', '🪃', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🥌']
  }
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  position = 'bottom' 
}) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭emoji选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={pickerRef}
      className={`absolute z-50 bg-white rounded-xl shadow-lg border border-gray-200 w-72 transition-all duration-200 ease-in-out transform ${
        position === 'bottom' ? 'opacity-100 translate-y-2' : 'opacity-100 -translate-y-2'
      }`}
    >
      {/* 头部 */}
      <div className="p-2 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          <Smile size={16} className="mr-1 text-orange-500" />
          表情选择器
        </h3>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* 分类标签 */}
      <div className="overflow-x-auto scrollbar-hide p-2 flex space-x-1 bg-gray-50">
        {emojiCategories.map((category, index) => (
          <button
            key={index}
            onClick={() => setActiveCategory(index)}
            className={`px-3 py-1.5 text-xs whitespace-nowrap rounded-full transition-colors ${
              activeCategory === index 
                ? 'bg-orange-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* 表情列表 */}
      <div className="p-2 max-h-64 overflow-y-auto">
        <div className="grid grid-cols-8 gap-1">
          {emojiCategories[activeCategory].emojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => onSelect(emoji)}
              className="text-2xl p-1 rounded-md hover:bg-orange-100 transition-colors"
              title={emoji}
              aria-label={`表情 ${index + 1}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmojiPicker;