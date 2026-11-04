'use client';

import React from 'react';

interface SectionDividerProps {
  number: string;
  label: string;
  tag?: string;
  className?: string;
}

export default function SectionDivider({
  number,
  label,
  tag = 'MUZAFFARPUR, IN • UTC+05:30',
  className = '',
}: SectionDividerProps) {
  return (
    <div className={`section-editorial-divider ${className}`} aria-hidden="true">
      <div className="divider-inner">
        <div className="divider-left">
          <span className="crosshair-mark">+</span>
          <span className="divider-num">{number}</span>
          <span className="divider-slash">//</span>
          <span className="divider-title">{label}</span>
        </div>
        <div className="divider-rule">
          <div className="rule-line" />
        </div>
        <div className="divider-right">
          <span className="divider-tag">{tag}</span>
          <span className="crosshair-mark">+</span>
        </div>
      </div>
    </div>
  );
}

