import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EmptyProps {
  message?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

// 增强版的空状态组件
export function Empty({ 
  message = "暂无数据", 
  icon, 
  onClick,
  className 
}: EmptyProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      toast('即将上线');
    }
  };
  
  return (
    <div 
      className={cn("flex h-full flex-col items-center justify-center py-12 text-gray-500 cursor-pointer", className)} 
      onClick={handleClick}
    >
      {icon || <div className="mb-4 text-5xl">📷</div>}
      <div className="text-center">
        <p className="text-lg font-medium text-gray-800 mb-2">{message}</p>
        <p className="text-sm">点击了解更多</p>
      </div>
    </div>
  );
}