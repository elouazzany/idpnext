import React, { useState, useRef } from 'react';
import { X, Check, AlertCircle, FileJson } from 'lucide-react';
import Editor, { OnMount } from '@monaco-editor/react';

interface Props {
    initialValue: any;
    onClose: () => void;
    onSave: (value: any) => void;
    language?: 'json' | 'yaml' | 'proto' | 'markdown';
    title?: string;
}

export const CodeEditorModal: React.FC<Props> = ({
    initialValue,
    onClose,
    onSave,
    language = 'json',
    title = 'Edit Code'
}) => {
    const [error, setError] = useState<string | null>(null);
    const editorRef = useRef<any>(null);

    // Initialize value string based on input type and language
    const [value] = useState(() => {
        if (typeof initialValue === 'string') return initialValue;
        if (language === 'json') {
            try {
                return JSON.stringify(initialValue, null, 2);
            } catch (e) {
                return '{}';
            }
        }
        return String(initialValue);
    });

    const handleEditorDidMount: OnMount = (editor) => {
        editorRef.current = editor;
        editor.focus(); // Ensure focus on mount
    };

    const handleFormat = () => {
        if (editorRef.current) {
            editorRef.current.getAction('editor.action.formatDocument').run();
        }
    };

    const handleSave = () => {
        try {
            if (!editorRef.current) return;
            const currentValue = editorRef.current.getValue();

            if (language === 'json') {
                const parsed = JSON.parse(currentValue);
                onSave(parsed);
            } else {
                // For other languages, save as raw string
                onSave(currentValue);
            }
            onClose();
        } catch (e) {
            setError((e as Error).message);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
            onKeyDown={(e) => e.stopPropagation()} // Stop keyboard events from bubbling to parents
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col h-[85vh] animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <FileJson className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded uppercase">
                            {language}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 relative bg-[#fffffe]">
                    <Editor
                        height="100%"
                        defaultLanguage={language}
                        defaultValue={value}
                        onMount={handleEditorDidMount}
                        options={{
                            tabSize: 2,
                            formatOnPaste: true,
                            formatOnType: false,
                            quickSuggestions: false,
                            suggestOnTriggerCharacters: false,
                            snippetSuggestions: 'none',
                            wordBasedSuggestions: false,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            renderValidationDecorations: 'off',
                            autoClosingBrackets: 'never',
                            autoClosingQuotes: 'never',
                            contextmenu: false,
                        }}
                        onChange={() => setError(null)}
                    />
                    {error && (
                        <div className="absolute bottom-4 left-4 right-4 bg-red-50 text-red-600 px-4 py-3 rounded-md text-sm flex items-center gap-2 border border-red-100 z-10">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{error}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <button
                        onClick={handleFormat}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        Format
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors"
                        >
                            <Check className="w-4 h-4" />
                            Apply Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
