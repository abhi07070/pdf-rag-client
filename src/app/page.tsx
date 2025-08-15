import ChatComponent from '../components/chat';
import FileUpload from '../components/file-upload';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="flex min-h-screen">
        {/* Sidebar - File Upload */}
        <div className="w-full lg:w-[400px] xl:w-[450px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-r border-slate-200 dark:border-slate-700 shadow-xl">
          <div className="sticky top-0 h-screen overflow-y-auto">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-700 p-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PDF Chat AI
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Upload PDFs and chat with your documents using AI
                </p>
              </div>
            </div>

            {/* File Upload Content */}
            <div className="p-0">
              <FileUpload />
            </div>
          </div>
        </div>

        {/* Main Content - Chat */}
        <div className="flex-1 min-h-screen">
          <ChatComponent />
        </div>
      </div>
    </div>
  );
}