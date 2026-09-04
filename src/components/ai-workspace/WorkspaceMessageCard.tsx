import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy,
  Check,
  Download,
  Share2,
  FileText,
  FileSpreadsheet,
  Presentation,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
  Sparkles,
  Eye,
  FileCode,
  FileCheck,
} from 'lucide-react';
import { ChatMessage, GeneratedFilePayload } from '../../types';
import { triggerDownload } from '../../lib/fileGenerators';

interface WorkspaceMessageCardProps {
  message: ChatMessage;
  onExportFormat: (message: ChatMessage, format: 'pdf' | 'docx' | 'xlsx' | 'pptx') => void;
  onPreviewFile?: (file: GeneratedFilePayload) => void;
  onRegenerate: () => void;
  onBookmarkToggle: (messageId: string) => void;
  isStreaming?: boolean;
  voiceURI?: string;
  fontSize?: 'small' | 'medium' | 'large';
}

export const WorkspaceMessageCard: React.FC<WorkspaceMessageCardProps> = ({
  message,
  onExportFormat,
  onPreviewFile,
  onRegenerate,
  onBookmarkToggle,
  isStreaming = false,
  voiceURI,
  fontSize = 'medium',
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const isUser = message.sender === 'user';

  // Detect Arabic RTL
  const isArabic =
    message.language === 'Arabic' ||
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(message.text);

  const handleCopy = () => {
    const clean = message.text.replace(/\[INSIGHTS:.*?\]/g, '').trim();
    navigator.clipboard.writeText(clean);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async () => {
    const clean = message.text.replace(/\[INSIGHTS:.*?\]/g, '').trim();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EasiaLearn AI Tutor Response',
          text: clean.slice(0, 500) + '...',
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(clean);
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
  };

  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = message.text
      .replace(/\[INSIGHTS:.*?\]/g, '')
      .replace(/[#*`_~[\]()|]/g, ' ')
      .slice(0, 1200);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    if (voiceURI) {
      const allVoices = window.speechSynthesis.getVoices();
      const match = allVoices.find((v) => v.voiceURI === voiceURI);
      if (match) utterance.voice = match;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Strip insights metadata before rendering markdown
  const cleanedText = message.text.replace(/\[INSIGHTS:.*?\]/g, '').trim();

  // Typography scale based on setting
  const textSizeClass =
    fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm';

  // USER MESSAGE (Blue bubble, right aligned)
  if (isUser) {
    return (
      <div className="flex justify-end mb-4 sm:mb-6 animate-in fade-in duration-150">
        <div className="max-w-[85%] sm:max-w-xl bg-[#2952CC] text-white rounded-[22px] rounded-tr-xs px-5 py-3.5 shadow-sm space-y-2">
          {/* Uploaded media preview */}
          {message.imageUrl && (
            <div className="rounded-xl overflow-hidden max-h-60 bg-white/10 border border-white/20">
              <img
                src={message.imageUrl}
                alt="Uploaded media"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Uploaded document attachment chip */}
          {message.fileName && (
            <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-xs border border-white/20">
              <FileText className="w-4 h-4 text-[#BFDBFE]" />
              <span className="truncate">{message.fileName}</span>
              {message.fileSize && <span className="opacity-75">({message.fileSize})</span>}
            </div>
          )}

          {/* User message text */}
          <div
            dir={isArabic ? 'rtl' : 'ltr'}
            className={`${textSizeClass} leading-relaxed whitespace-pre-wrap font-medium`}
          >
            {message.text}
          </div>

          <div className="text-[10px] text-white/70 text-right pt-0.5 font-mono">
            {message.timestamp}
          </div>
        </div>
      </div>
    );
  }

  // ASSISTANT MESSAGE (White rounded card, left aligned)
  return (
    <div className="flex justify-start mb-6 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-white border border-[#E5E7EB] rounded-[22px] rounded-tl-xs p-5 sm:p-6 shadow-xs text-[#111111] space-y-4 hover:shadow-sm transition-all">
        {/* Assistant Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#2952CC] to-[#4F7DF3] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-[#111111]">
                  EasiaLearn AI Tutor
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAF2FF] text-[#2952CC]">
                  Pro
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-[#94A3B8] flex items-center gap-2 font-mono">
            {message.timestamp}
          </div>
        </div>

        {/* Markdown & Structured Content */}
        <div
          dir={isArabic ? 'rtl' : 'ltr'}
          className={`prose prose-slate max-w-none ${textSizeClass} leading-relaxed text-[#111111]`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-lg sm:text-xl font-black text-[#111111] mt-4 mb-2 pb-1 border-b border-[#E5E7EB]">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-base sm:text-lg font-bold text-[#111111] mt-4 mb-2">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm sm:text-base font-bold text-[#111111] mt-3 mb-1.5 text-[#2952CC]">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="my-2 text-[#111111] leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-5 my-2.5 space-y-1 text-[#111111]">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-5 my-2.5 space-y-1 text-[#111111]">{children}</ol>
              ),
              li: ({ children }) => <li className="text-[#111111]">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-[#2952CC] pl-3.5 my-3 italic bg-[#F8FAFC] py-2 rounded-r-xl text-[#334155]">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
                  <table className="min-w-full divide-y divide-[#E5E7EB] text-xs sm:text-sm">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-[#F8FAFC] text-[#111111] font-bold text-xs">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="px-3.5 py-2.5 text-left border-r border-[#E5E7EB] last:border-r-0 font-bold">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-3.5 py-2 border-t border-r border-[#E5E7EB] last:border-r-0 text-[#111111]">
                  {children}
                </td>
              ),
              code: ({ children, className }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code className="bg-[#F1F5F9] text-[#2952CC] font-mono text-xs px-1.5 py-0.5 rounded border border-[#E2E8F0]">
                      {children}
                    </code>
                  );
                }
                const codeString = String(children).replace(/\n$/, '');
                return (
                  <div className="relative group my-3 rounded-xl overflow-hidden border border-[#E5E7EB] bg-[#0F172A]">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-[#1E293B] text-slate-300 text-[11px] font-mono">
                      <span>{className?.replace('language-', '') || 'code'}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(codeString);
                          setCopiedCodeIndex(1);
                          setTimeout(() => setCopiedCodeIndex(null), 2000);
                        }}
                        className="flex items-center gap-1 hover:text-white transition-colors"
                      >
                        {copiedCodeIndex === 1 ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3.5 text-slate-100 text-xs font-mono overflow-x-auto">
                      <code>{children}</code>
                    </pre>
                  </div>
                );
              },
            }}
          >
            {cleanedText}
          </ReactMarkdown>

          {/* Streaming Cursor Animation */}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-[#2952CC] animate-pulse align-middle" />
          )}
        </div>

        {/* Generated File Payload (Visible only when user explicitly requested document creation) */}
        {message.generatedFile && (
          <div className="mt-4 p-4 rounded-2xl bg-[#F0FDF4] border border-[#86EFAC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E] text-white flex items-center justify-center shrink-0 shadow-xs">
                {message.generatedFile.fileType === 'pdf' ? (
                  <FileText className="w-5 h-5" />
                ) : message.generatedFile.fileType === 'xlsx' ? (
                  <FileSpreadsheet className="w-5 h-5" />
                ) : message.generatedFile.fileType === 'pptx' ? (
                  <Presentation className="w-5 h-5" />
                ) : (
                  <FileCheck className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm text-[#166534]">
                    {message.generatedFile.fileName}
                  </span>
                  <span className="text-[10px] uppercase font-bold bg-[#DCFCE7] text-[#166534] px-2 py-0.5 rounded-full">
                    {message.generatedFile.fileType}
                  </span>
                </div>
                <div className="text-[11px] text-[#15803d] font-mono mt-0.5">
                  {message.generatedFile.size} • Ready for download
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() =>
                  triggerDownload(
                    message.generatedFile!.downloadUrl,
                    message.generatedFile!.fileName
                  )
                }
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#16A34A] hover:bg-[#15803d] text-white transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
              {onPreviewFile && (
                <button
                  onClick={() => onPreviewFile(message.generatedFile!)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#86EFAC] text-[#166534] hover:bg-[#F0FDF4] transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Message Toolbar */}
        <div className="pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B]">
          {/* Base Toolbar: Copy, Bookmark, Read Aloud, Share, Regenerate */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[#F1F5F9] hover:text-[#111111] transition-colors"
              title="Copy answer"
            >
              {isCopied ? (
                <Check className="w-3.5 h-3.5 text-[#22C55E]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={() => onBookmarkToggle(message.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${
                message.bookmarked
                  ? 'bg-amber-50 text-[#F59E0B] font-semibold'
                  : 'hover:bg-[#F1F5F9] hover:text-[#111111]'
              }`}
              title="Bookmark answer"
            >
              {message.bookmarked ? (
                <BookmarkCheck className="w-3.5 h-3.5" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
              <span>{message.bookmarked ? 'Saved' : 'Bookmark'}</span>
            </button>

            <button
              onClick={toggleSpeech}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${
                isSpeaking
                  ? 'bg-[#EAF2FF] text-[#2952CC] font-bold'
                  : 'hover:bg-[#F1F5F9] hover:text-[#111111]'
              }`}
              title="Read aloud"
            >
              {isSpeaking ? (
                <VolumeX className="w-3.5 h-3.5 animate-pulse" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
              <span>{isSpeaking ? 'Stop' : 'Read Aloud'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[#F1F5F9] hover:text-[#111111] transition-colors"
              title="Share answer"
            >
              {isShared ? (
                <Check className="w-3.5 h-3.5 text-[#22C55E]" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>{isShared ? 'Shared' : 'Share'}</span>
            </button>

            <button
              onClick={onRegenerate}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[#F1F5F9] hover:text-[#111111] transition-colors"
              title="Regenerate response"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>

          {/* Export buttons appear ONLY when a document is generated! */}
          {message.generatedFile && (
            <div className="flex items-center gap-1.5 bg-[#F8FAFC] px-2 py-1 rounded-xl border border-[#E5E7EB]">
              <span className="text-[10px] font-bold uppercase text-[#64748B] mr-1">Export:</span>
              <button
                onClick={() => onExportFormat(message, 'pdf')}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold hover:bg-white hover:text-[#2952CC] transition-colors"
                title="Download as PDF"
              >
                <FileText className="w-3.5 h-3.5 text-[#EF4444]" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => onExportFormat(message, 'xlsx')}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold hover:bg-white hover:text-[#2952CC] transition-colors"
                title="Download as Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => onExportFormat(message, 'docx')}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold hover:bg-white hover:text-[#2952CC] transition-colors"
                title="Download as Word"
              >
                <FileText className="w-3.5 h-3.5 text-[#2952CC]" />
                <span>Word</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
