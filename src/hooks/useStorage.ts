import { useState, useEffect } from 'react';
import { safeLocalStorageGet, safeLocalStorageSet } from '@/lib/utils';

// 自定义Hook：用于管理localStorage中的状态
export function useStorage<T>(key: string, defaultValue: T) {
  // 初始化状态，从localStorage读取或使用默认值
  const [value, setValue] = useState<T>(() => {
    return safeLocalStorageGet(key, defaultValue);
  });

  // 当值变化时，同步更新到localStorage
  useEffect(() => {
    safeLocalStorageSet(key, value);
  }, [key, value]);

  // 当localStorage中的值被外部修改时（如在不同标签页中），更新本地状态
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Failed to parse storage change:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [value, setValue] as const;
}