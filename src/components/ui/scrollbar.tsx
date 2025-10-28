'use client'
    
import React, { useEffect, useRef } from 'react';
import { useManaColor } from '@/lib/contexts/ManaColorContext';
import { getColorInfo } from '@/types/colors';
import '@/styles/scrollbar.css';

export const ManaScrollbar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedMana } = useManaColor();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.style.setProperty('--scroll-thumb-color', getColorInfo(selectedMana).color);
  }, [selectedMana]);

  return (
    <div className="mana-scroll-wrapper" ref={scrollRef}> 
      <div className="mana-scroll-content">
        {children}
      </div>
    </div>
  );
};