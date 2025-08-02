'use client';

import { useState } from 'react';

interface FAQItemProps {
	question: string;
	answer: string;
}

export default function FAQItem({ question, answer }: FAQItemProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow ">
			<button className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-controls={`faq-answer-${question}`}>
				<span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-poppins pr-4">{question}</span>
				<div className="flex-shrink-0">
					<i className={`ri-arrow-down-s-line text-lg sm:text-xl text-indigo-600 dark:text-indigo-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
				</div>
			</button>
			{isOpen && (
				<div id={`faq-answer-${question}`} className="px-4 sm:px-6 pb-4 pt-0 text-sm sm:text-base text-gray-600 dark:text-gray-300 font-montserrat leading-relaxed">
					{answer}
				</div>
			)}
		</div>
	);
}
