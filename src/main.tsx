import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from 'sonner';
import App from "./App";
import "./index.css";

// 预加载关键图片资源
const preloadCriticalImages = () => {
  const criticalImages = [
    // 首页英雄区域图片
    "https://lf-code-agent.coze.cn/obj/x-ai-cn/attachment/4443541369000812/鸟瞰图_20251211104333.jpg",
    // 可以添加更多关键图片URL
  ];
  
  criticalImages.forEach((src) => {
    const img = new Image();
    img.src = src;
    img.className = "hidden"; // 隐藏预加载的图片
  });
};

// 页面加载时执行预加载
if (typeof window !== 'undefined') {
  window.addEventListener('load', preloadCriticalImages);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster />
    </BrowserRouter>
  </StrictMode>
);
