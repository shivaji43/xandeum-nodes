import { ChatBot } from '@/components/ChatBot';

export default function ChatPage() {
  return (
    <div className="h-full p-4 md:p-6 flex flex-col">
       <div className="flex-1 max-w-4xl w-full mx-auto">
          <ChatBot />
       </div>
    </div>
  );
}
