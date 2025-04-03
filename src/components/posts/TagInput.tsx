'use client';

import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isComposing, setIsComposing] = useState(false); // 한글 입력 상태 추적

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 한글 입력 중이면 무시
    if (isComposing) return;

    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      // 중복 태그 방지
      if (!tags.includes(inputValue.trim())) {
        onChange([...tags, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)} // 한글 입력 시작
        onCompositionEnd={() => setIsComposing(false)} // 한글 입력 완료
        placeholder="태그를 입력하고 Enter를 누르세요"
      />
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => removeTag(tag)}
          >
            {tag}
            <X className="h-3 w-3 cursor-pointer" />
          </Badge>
        ))}
      </div>
    </div>
  );
}
