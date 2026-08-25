import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, Plus, Trash2, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { supabase, hasSupabase } from '@/lib/supabaseClient'

type Message = { role: 'user' | 'assistant'; content: string }
type Conversation = { id: string; title: string; messages: Message[] }

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    title: 'React Hooks Explanation',
    messages: [
      { role: 'user', content: 'Explain useEffect in React.' },
      { role: 'assistant', content: 'useEffect is a React Hook that lets you synchronize a component with an external system. It takes two arguments: a setup function and a list of dependencies...' }
    ]
  }
]

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS)
  const [activeId, setActiveId] = useState<string>('1')
  const [input, setInput] = useState('')

  // Load from Supabase on mount
  useEffect(() => {
    if (!hasSupabase) return;
    const fetchConversations = async () => {
      const { data: convos } = await supabase.from('conversations').select('*').order('created_at', { ascending: false });
      if (convos && convos.length > 0) {
        // Load messages for all convos
        const { data: msgs } = await supabase.from('messages').select('*').order('created_at', { ascending: true });

        const formattedConvos: Conversation[] = convos.map((c: any) => ({
          id: c.id,
          title: c.title,
          messages: (msgs || []).filter((m: any) => m.conversation_id === c.id).map((m: any) => ({ role: m.role, content: m.content }))
        }));

        setConversations(formattedConvos);
        setActiveId(formattedConvos[0].id);
      } else {
        const tempId = hasSupabase ? crypto.randomUUID() : Date.now().toString();
        setConversations([{ id: tempId, title: 'New Conversation', messages: [] }]);
        setActiveId(tempId);
      }
    };
    fetchConversations();
  }, []);

  const [isOptimized, setIsOptimized] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const endOfMessagesRef = useRef<HTMLDivElement>(null)

  const activeConv = conversations.find(c => c.id === activeId)

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv?.messages, isTyping])

  const handleNewChat = async () => {
    // Check if there's already an empty conversation
    const emptyConv = conversations.find(c => c.messages.length === 0);
    if (emptyConv) {
      setActiveId(emptyConv.id);
      return; // Stay on the empty chat, do not create a new one
    }

    const newId = hasSupabase ? crypto.randomUUID() : Date.now().toString()
    const newConvo = { id: newId, title: 'New Conversation', messages: [] };

    // We no longer immediately insert into Supabase to prevent empty records.
    // It will be saved on the first message sent.

    setConversations([newConvo, ...conversations])
    setActiveId(newId)
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasSupabase) {
      await supabase.from('conversations').delete().eq('id', id);
    }
    const updated = conversations.filter(c => c.id !== id)

    if (updated.length === 0) {
      const newId = hasSupabase ? crypto.randomUUID() : Date.now().toString()
      const newConvo = { id: newId, title: 'New Conversation', messages: [] };
      setConversations([newConvo]);
      setActiveId(newId);
    } else {
      setConversations(updated)
      if (activeId === id) {
        setActiveId(updated[0]?.id || '')
      }
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !activeId) return

    const newMessage: Message = { role: 'user', content: input }
    let currentTitle = activeConv?.title || 'New Conversation'

    // Auto-name conversation on first message
    if (activeConv?.messages.length === 0) {
      const words = input.split(' ').slice(0, 4).join(' ')
      currentTitle = words.length > 20 ? words.substring(0, 20) + '...' : words
    }

    const updatedConv = {
      ...activeConv!,
      title: currentTitle,
      messages: [...activeConv!.messages, newMessage]
    }

    if (hasSupabase) {
      try {
        if (activeConv?.messages.length === 0) {
          await supabase.from('conversations').upsert([{ id: activeId, title: currentTitle }]);
        }
        await supabase.from('messages').insert([{ conversation_id: activeId, role: 'user', content: input }]);
      } catch (e) {
        console.error("Supabase insert error:", e)
      }
    }

    setConversations(conversations.map(c => c.id === activeId ? updatedConv : c))
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, isOptimized, model: 'llama3' })
      })

      if (!res.ok) throw new Error('API request failed')
      const data = await res.json()

      const botMessage: Message = {
        role: 'assistant',
        content: data.response
      }
      if (hasSupabase) {
        try {
          await supabase.from('messages').insert([{ conversation_id: activeId, role: 'assistant', content: data.response }]);
        } catch (e) {
          console.error("Supabase insert error:", e)
        }
      }
      setConversations(prev => prev.map(c =>
        c.id === activeId ? { ...c, messages: [...c.messages, botMessage] } : c
      ))
    } catch (error) {
      console.error(error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Error: Failed to fetch response from backend.'
      }
      setConversations(prev => prev.map(c =>
        c.id === activeId ? { ...c, messages: [...c.messages, errorMessage] } : c
      ))
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950/50 shadow-2xl relative animate-in fade-in duration-500">

      {/* Top Banner */}
      <div className="relative h-24 bg-[#111118] shrink-0 border-b border-zinc-800/80">
        <div
          className="absolute inset-0 z-0 opacity-30 mix-blend-screen"
          style={{
            backgroundImage: "url('/assets/pokemon/img9.png')", // Charizard
            backgroundSize: "cover",
            backgroundPosition: "center 20%",
            maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)"
          }}
        />
        <div className="relative z-10 px-6 py-4 flex flex-col h-full justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-zinc-400 hover:text-zinc-100 p-0 h-auto w-auto hover:bg-transparent">
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-2xl font-retro text-zinc-100 uppercase tracking-wider drop-shadow-md m-0 mt-1">CHAT</h2>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="font-retro text-[9px] text-zinc-500 tracking-wider">MSGS</span>
                <span className="font-retro text-sm text-pokemon-yellow">{activeConv?.messages.length || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-retro text-[9px] text-zinc-500 tracking-wider">ORIG</span>
                <span className="font-retro text-sm text-pokemon-red">40</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-retro text-[9px] text-zinc-500 tracking-wider">SENT</span>
                <span className="font-retro text-sm text-[#4488ff]">40</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-retro text-[9px] text-zinc-500 tracking-wider">SAVED</span>
                <span className="font-retro text-sm text-pokemon-green">0</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-retro text-[9px] text-zinc-500 tracking-wider">OPTIMIZE</span>
              <button
                onClick={() => setIsOptimized(!isOptimized)}
                className={`w-10 h-5 rounded-full relative transition-colors ${isOptimized ? 'bg-pokemon-yellow' : 'bg-zinc-700'}`}
              >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isOptimized ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Sidebar (Conversations) */}
        <div className={`${isSidebarOpen ? 'w-52 border-r' : 'w-0 border-r-0'} border-zinc-800/50 bg-[#15151e]/80 backdrop-blur flex flex-col shrink-0 overflow-hidden transition-all duration-300 ease-in-out`}>
          <div className="p-4 border-b border-zinc-800/50">
            <Button onClick={handleNewChat} className="w-full justify-start bg-pokemon-red/20 hover:bg-pokemon-red/30 text-pokemon-red border border-pokemon-red/30 font-retro text-[9px] tracking-wider py-5 rounded-xl">
              <Plus className="w-3.5 h-3.5 mr-2" />
              NEW CHAT
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${activeId === conv.id ? 'bg-zinc-800/80 shadow-md border border-zinc-700/50' : 'hover:bg-zinc-800/30 border border-transparent'}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${activeId === conv.id ? 'text-pokemon-yellow' : 'text-zinc-600'}`} />
                  <span className={`text-xs truncate font-mono ${activeId === conv.id ? 'text-zinc-200' : 'text-zinc-500'}`}>{conv.title}</span>
                </div>
                <button onClick={(e) => handleDelete(conv.id, e)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-pokemon-red transition-opacity">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-[#111118]/95 backdrop-blur">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!activeConv || activeConv.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 opacity-50">
                <img src="/assets/pokemon/img1.jpg" alt="Pikachu" className="w-16 h-16 rounded-full mb-6 filter grayscale opacity-50" />
                <h2 className="text-xl font-retro text-zinc-400 mb-4 tracking-wider">READY FOR BATTLE</h2>
                <p className="text-xs font-mono text-center max-w-sm">Type a message below. Your local Llama 3 is waiting.</p>
              </div>
            ) : (
              activeConv.messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-lg border-2 ${msg.role === 'user' ? 'bg-zinc-800 border-zinc-700' : 'bg-[#2a2a35] border-[#4488ff]/50'}`}>
                    {msg.role === 'user' ? <img src="/assets/pokemon/img13.jpg" alt="Trainer" className="w-full h-full object-cover" /> : <img src="/assets/pokemon/img1.jpg" alt="Bot" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex flex-col gap-1 max-w-[80%]">
                    <span className={`font-retro text-[8px] tracking-wider ${msg.role === 'user' ? 'text-right text-zinc-500' : 'text-left text-[#88aaff]'}`}>
                      {msg.role === 'user' ? 'TRAINER' : 'MODEL'}
                    </span>
                    <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-md font-sans ${msg.role === 'user' ? 'bg-zinc-800/80 text-zinc-200 rounded-tr-sm' : 'bg-[#15151e] border border-zinc-800 text-zinc-300 rounded-tl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex gap-4 max-w-4xl mx-auto">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-lg border-2 bg-[#2a2a35] border-[#4488ff]/50">
                  <img src="/assets/pokemon/img1.jpg" alt="Bot" className="w-full h-full object-cover opacity-70" />
                </div>
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <span className="font-retro text-[8px] tracking-wider text-left text-[#88aaff]">MODEL</span>
                  <div className="px-5 py-4 rounded-2xl bg-[#15151e] border border-zinc-800 rounded-tl-sm flex items-center gap-1.5 shadow-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-[#15151e] border-t border-zinc-800/50">
            <div className="max-w-4xl mx-auto relative group">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="What does a Trainer say? Type your message..."
                className="min-h-[70px] max-h-[200px] resize-y bg-[#111118] border-zinc-700/50 rounded-xl pr-20 focus-visible:ring-1 focus-visible:ring-[#88aaff] focus-visible:border-[#88aaff] font-sans text-sm p-5 text-zinc-200 placeholder:text-zinc-600 shadow-inner"
              />
              <div className="absolute right-4 bottom-4 flex items-center gap-3">
                <Button
                  size="icon"
                  disabled={!input.trim() || isTyping || !activeId}
                  onClick={handleSend}
                  className="w-10 h-10 rounded-full bg-[#4488ff]/20 hover:bg-[#4488ff]/40 text-[#88aaff] border border-[#4488ff]/30 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(68,136,255,0.1)]"
                >
                  <Send className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
            <div className="text-center mt-4 text-[9px] text-zinc-500 font-retro tracking-widest uppercase flex gap-6 justify-center">
              <span>ENTER to send</span>
              <span>SHIFT+ENTER for newline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
