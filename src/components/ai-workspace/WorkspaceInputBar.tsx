import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  Send,
  Camera,
  Mic,
  MicOff,
  Paperclip,
  X,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  FileCode,
  Sparkles,
} from 'lucide-react';

interface WorkspaceInputBarProps {
  onSendMessage: (
    text: string,
    attachment?: { file: File; base64?: string; type: string; name: string }
  ) => void;
  isLoading: boolean;
}

export const WorkspaceInputBar: React.FC<WorkspaceInputBarProps> = ({
  onSendMessage,
  isLoading,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    name: string;
    type: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'csv' | 'image' | 'other';
    previewUrl?: string;
    size: string;
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const handleFileProcess = (file: File) => {
    let type: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'csv' | 'image' | 'other' = 'other';
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (
      file.type.startsWith('image/') ||
      ['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext || '')
    ) {
      type = 'image';
    } else if (file.type === 'application/pdf' || ext === 'pdf') {
      type = 'pdf';
    } else if (
      ['xlsx', 'xls'].includes(ext || '') ||
      file.type.includes('spreadsheet') ||
      file.type.includes('excel')
    ) {
      type = 'xlsx';
    } else if (ext === 'csv') {
      type = 'csv';
    } else if (['docx', 'doc'].includes(ext || '')) {
      type = 'docx';
    } else if (['pptx', 'ppt'].includes(ext || '')) {
      type = 'pptx';
    }

    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    let previewUrl: string | undefined = undefined;
    if (type === 'image') {
      previewUrl = URL.createObjectURL(file);
    }

    setSelectedFile({
      file,
      name: file.name,
      type,
      previewUrl,
      size: sizeStr,
    });
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please type your question.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    if ((!inputText.trim() && !selectedFile) || isLoading) return;

    const textToSend = inputText.trim();
    const fileToUpload = selectedFile?.file;
    const fileType = selectedFile?.type || 'other';
    const fileName = selectedFile?.name || 'attachment';

    setInputText('');
    setSelectedFile(null);

    if (fileToUpload) {
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => {
          onSendMessage(textToSend, {
            file: fileToUpload,
            base64: reader.result as string,
            type: fileType,
            name: fileName,
          });
        };
        reader.readAsDataURL(fileToUpload);
      } else {
        // Read text content if plain text or csv, or pass file handle
        onSendMessage(textToSend, {
          file: fileToUpload,
          type: fileType,
          name: fileName,
        });
      }
    } else {
      onSendMessage(textToSend);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Render attachment icon based on type
  const renderAttachmentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-[#EF4444]" />;
      case 'xlsx':
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4 text-[#10B981]" />;
      case 'docx':
        return <FileText className="w-4 h-4 text-[#2952CC]" />;
      case 'pptx':
        return <Presentation className="w-4 h-4 text-[#F97316]" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-[#8B5CF6]" />;
      default:
        return <Paperclip className="w-4 h-4 text-[#64748B]" />;
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-t border-[#E5E7EB] bg-white p-3 sm:p-4 sticky bottom-0 z-20 transition-all ${
        isDragging ? 'bg-[#EAF2FF]/60 border-[#2952CC]' : ''
      }`}
    >
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.csv,.png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={handleFileInputChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Drag overlay indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-[#EAF2FF]/95 border-2 border-dashed border-[#2952CC] rounded-[22px] flex items-center justify-center z-30 pointer-events-none">
          <div className="text-[#2952CC] font-bold text-xs sm:text-sm flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Drop file here (PDF, DOCX, XLSX, PPTX, CSV, PNG, JPG)</span>
          </div>
        </div>
      )}

      {/* Attachment Preview Chip (Icon, File name, Size, Remove) */}
      {selectedFile && (
        <div className="mb-2.5 flex items-center gap-2.5 bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-1.5 rounded-xl w-fit text-xs text-[#111111] shadow-2xs animate-in fade-in">
          {selectedFile.previewUrl ? (
            <img
              src={selectedFile.previewUrl}
              alt="attachment preview"
              className="w-5 h-5 object-cover rounded shadow-xs"
            />
          ) : (
            renderAttachmentIcon(selectedFile.type)
          )}
          <span className="font-semibold truncate max-w-xs">{selectedFile.name}</span>
          <span className="text-[#64748B] font-mono text-[10px]">({selectedFile.size})</span>
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="p-1 rounded-md hover:bg-slate-200 text-slate-500 transition-colors ml-1"
            title="Remove attachment"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input Form Box */}
      <div className="bg-[#F8FAFC] border border-[#CBD5E1] focus-within:border-[#2952CC] focus-within:ring-2 focus-within:ring-[#2952CC]/15 rounded-[22px] p-2 sm:p-2.5 transition-all shadow-xs">
        {/* Main Textarea */}
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything or upload a PDF, image or Excel file..."
          rows={1}
          className="w-full bg-transparent border-0 resize-none px-2 py-1 text-xs sm:text-sm text-[#111111] placeholder:text-[#94A3B8] focus:outline-hidden max-h-32 min-h-[42px]"
          style={{ height: 'auto' }}
        />

        {/* Input Bar Controls */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 mt-1">
          {/* Action Icons: Attachment, Camera, Microphone */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#2952CC] hover:bg-white transition-colors"
              title="Attach PDF, DOCX, XLSX, PPTX, CSV, PNG, JPG"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#2952CC] hover:bg-white transition-colors"
              title="Snap photo with camera"
            >
              <Camera className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2 rounded-xl transition-colors ${
                isRecording
                  ? 'bg-red-100 text-red-600 animate-pulse'
                  : 'text-[#64748B] hover:text-[#2952CC] hover:bg-white'
              }`}
              title={isRecording ? 'Listening... click to stop' : 'Voice dictation'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={(!inputText.trim() && !selectedFile) || isLoading}
            className={`flex items-center justify-center p-2.5 rounded-xl font-bold transition-all shadow-xs ${
              (inputText.trim() || selectedFile) && !isLoading
                ? 'bg-[#2952CC] text-white hover:bg-[#1f40a6] active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            title="Send prompt"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
