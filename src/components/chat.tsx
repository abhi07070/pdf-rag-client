'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Send, Bot, User, FileText, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Doc {
    pageContent?: string;
    metadata?: {
        loc?: {
            pageNumber?: number;
        };
        source?: string;
    };
}

interface IMessage {
    role: 'assistant' | 'user';
    content?: string;
    documents?: Doc[];
}

const ChatComponent: React.FC = () => {
    const [message, setMessage] = React.useState<string>('');
    const [messages, setMessages] = React.useState<IMessage[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendChatMessage = async () => {
        if (!message.trim()) return;

        const userMessage = message;
        setMessage('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const res = await fetch(`http://localhost:8000/chat?message=${encodeURIComponent(userMessage)}`);
            const data = await res.json();

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: data?.message,
                    documents: data?.docs,
                },
            ]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error while processing your request. Please try again.',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendChatMessage();
        }
    };

    const formatContent = (content: string) => {
        return (
            <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                    components={{
                        code(props) {
                            const { children, className, ...rest } = props;
                            const match = /language-(\w+)/.exec(className || '');
                            const isInline = !match;

                            return !isInline && match ? (
                                <SyntaxHighlighter
                                    style={oneDark}
                                    language={match[1]}
                                    PreTag="div"
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            ) : (
                                <code
                                    className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm"
                                    {...rest}
                                >
                                    {children}
                                </code>
                            );
                        },
                        p({ children }) {
                            return <p className="mb-3 last:mb-0">{children}</p>;
                        },
                        h1({ children }) {
                            return <h1 className="text-xl font-bold mb-3">{children}</h1>;
                        },
                        h2({ children }) {
                            return <h2 className="text-lg font-semibold mb-2">{children}</h2>;
                        },
                        h3({ children }) {
                            return <h3 className="text-base font-semibold mb-2">{children}</h3>;
                        },
                        ul({ children }) {
                            return <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>;
                        },
                        ol({ children }) {
                            return <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>;
                        },
                        li({ children }) {
                            return <li className="text-sm">{children}</li>;
                        },
                        blockquote({ children }) {
                            return <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 italic mb-3">{children}</blockquote>;
                        },
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            {/* Header */}
            <div className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="p-4">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                        PDF Chat Assistant
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Ask questions about your uploaded PDF documents
                    </p>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6 max-w-4xl mx-auto">
                    {messages.length === 0 ? (
                        <div className="text-center py-12">
                            <Bot className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">
                                Welcome to PDF Chat!
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                Upload a PDF document and start asking questions about its content.
                            </p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                )}

                                <div className={`max-w-[70%] ${msg.role === 'user' ? 'order-2' : ''}`}>
                                    <Card className={`p-4 ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                        }`}>
                                        <div className="space-y-3">
                                            {msg.content && (
                                                <div className={`${msg.role === 'user' ? 'text-white' : 'text-slate-800 dark:text-slate-200'
                                                    }`}>
                                                    {msg.role === 'user' ? (
                                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                                    ) : (
                                                        formatContent(msg.content)
                                                    )}
                                                </div>
                                            )}

                                            {msg.documents && msg.documents.length > 0 && (
                                                <div className="space-y-3">
                                                    <Separator className="dark:bg-slate-600" />
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                                Source Documents
                                                            </span>
                                                        </div>
                                                        {msg.documents.map((doc, docIndex) => (
                                                            <Card key={docIndex} className="p-3 bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            Page {doc.metadata?.loc?.pageNumber || 'Unknown'}
                                                                        </Badge>
                                                                        {doc.metadata?.source && (
                                                                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                                                                                {doc.metadata.source.split('/').pop() || doc.metadata.source}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {doc.pageContent && (
                                                                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                                                                            {doc.pageContent}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-slate-600 dark:bg-slate-300 flex items-center justify-center flex-shrink-0 order-3">
                                        <User className="w-5 h-5 text-white dark:text-slate-800" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}

                    {isLoading && (
                        <div className="flex gap-4 justify-start">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                    <span className="text-slate-600 dark:text-slate-400">Thinking...</span>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
                <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input */}
            <div className="border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask a question about your PDF..."
                                className="pr-12 h-12 text-base border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                                disabled={isLoading}
                            />
                        </div>
                        <Button
                            onClick={handleSendChatMessage}
                            disabled={!message.trim() || isLoading}
                            size="lg"
                            className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatComponent;