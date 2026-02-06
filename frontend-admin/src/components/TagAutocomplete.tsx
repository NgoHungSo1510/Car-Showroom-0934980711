import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsAPI } from '../services/api';

interface TagSuggestion {
    name: string;
    count: number;
}

interface TagAutocompleteProps {
    selectedTags: string[];
    onAddTag: (tag: string) => void;
    onRemoveTag: (tag: string) => void;
}

const TagAutocomplete: React.FC<TagAutocompleteProps> = ({
    selectedTags,
    onAddTag,
    onRemoveTag,
}) => {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch all existing tags
    const { data: tagsData } = useQuery({
        queryKey: ['all-tags'],
        queryFn: async () => {
            const response = await postsAPI.getAllTags();
            return response.data.data as TagSuggestion[];
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    const allTags = tagsData || [];

    // Filter suggestions based on input
    const filteredSuggestions = allTags
        .filter(
            (tag) =>
                tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
                !selectedTags.includes(tag.name)
        )
        .slice(0, 10);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                !inputRef.current?.contains(e.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddTag = (tag: string) => {
        const trimmedTag = tag.trim();
        if (trimmedTag && !selectedTags.includes(trimmedTag)) {
            onAddTag(trimmedTag);
        }
        setInputValue('');
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputValue.trim()) {
                handleAddTag(inputValue);
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-300">
                Tags
            </label>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => onRemoveTag(tag)}
                                className="hover:text-primary/70 transition-colors"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Input with Suggestions */}
            <div className="relative">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onKeyDown={handleKeyDown}
                            placeholder="Nhập tag hoặc chọn từ gợi ý..."
                            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary"
                        />
                        {inputValue && (
                            <button
                                type="button"
                                onClick={() => setInputValue('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                ×
                            </button>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => handleAddTag(inputValue)}
                        disabled={!inputValue.trim()}
                        className="px-4 py-2 bg-primary hover:bg-accent-blue text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        + Thêm
                    </button>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && (filteredSuggestions.length > 0 || (inputValue && allTags.length > 0)) && (
                    <div
                        ref={dropdownRef}
                        className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-xl max-h-60 overflow-y-auto"
                    >
                        {/* Quick add input as new tag */}
                        {inputValue.trim() && !allTags.some(t => t.name.toLowerCase() === inputValue.toLowerCase()) && (
                            <button
                                type="button"
                                onClick={() => handleAddTag(inputValue)}
                                className="w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 text-sm border-b border-slate-100 dark:border-border-dark"
                            >
                                <span className="text-primary font-medium">+ Tạo tag mới:</span>
                                <span className="text-slate-700 dark:text-white font-bold">"{inputValue}"</span>
                            </button>
                        )}

                        {/* Existing tags */}
                        {filteredSuggestions.length > 0 && (
                            <div className="py-1">
                                <p className="px-4 py-1 text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">
                                    Gợi ý từ bài viết khác
                                </p>
                                {filteredSuggestions.map((tag) => (
                                    <button
                                        key={tag.name}
                                        type="button"
                                        onClick={() => handleAddTag(tag.name)}
                                        className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-between text-sm"
                                    >
                                        <span className="text-slate-700 dark:text-white">{tag.name}</span>
                                        <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                            {tag.count} bài
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Show popular tags when input is empty */}
                        {!inputValue && allTags.length > 0 && (
                            <div className="py-1">
                                <p className="px-4 py-1 text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">
                                    Tags phổ biến
                                </p>
                                {allTags
                                    .filter((t) => !selectedTags.includes(t.name))
                                    .slice(0, 8)
                                    .map((tag) => (
                                        <button
                                            key={tag.name}
                                            type="button"
                                            onClick={() => handleAddTag(tag.name)}
                                            className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-between text-sm"
                                        >
                                            <span className="text-slate-700 dark:text-white">{tag.name}</span>
                                            <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                                {tag.count} bài
                                            </span>
                                        </button>
                                    ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
                💡 Gợi ý: Click vào ô input để xem tags phổ biến, hoặc gõ để tìm kiếm
            </p>
        </div>
    );
};

export default TagAutocomplete;
