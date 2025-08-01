'use client';

import { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
}

export default function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        <div className="flex-shrink-0">
          <i className={`ri-arrow-down-s-line text-xl text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}></i>
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-4 pt-0 text-gray-700 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}