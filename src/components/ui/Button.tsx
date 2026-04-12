'use client';

import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: Props) {
  const base =
    'inline-flex items-center justify-center rounded-md border font-medium transition disabled:opacity-60 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-teal-500 text-black border-teal-400 hover:bg-teal-400',
    secondary: 'bg-[#21262d] text-[#e6edf3] border-[#30363d] hover:bg-[#30363d]',
    ghost: 'bg-transparent text-[#e6edf3] border-[#30363d] hover:bg-[#21262d]',
    danger: 'bg-red-600 text-white border-red-500 hover:bg-red-500'
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm' };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
}
