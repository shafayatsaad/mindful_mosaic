"use client";

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import type { Message } from '@/lib/types';

// Initial messages with placeholder support counts
const initialMessagesData: Omit<Message, 'supports' | 'mosaicState'>[] = [
  { id: 1, text: "Remember to be kind to yourself today. You're doing great." },
  { id: 2, text: "Gratitude turns what we have into enough. What are you grateful for?" },
  { id: 3, text: "A small step forward is still a step. Keep going." },
  { id: 4, text: "Your feelings are valid. It's okay to not be okay." },
];


interface MessageContextType {
  messages: Message[];
  addMessage: (message: Omit<Message, 'supports' | 'id'>) => void;
  addSupport: (id: number) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Set initial messages with random supports only on the client
    const clientSideInitialMessages = initialMessagesData.map(msg => ({
      ...msg,
      supports: Math.floor(Math.random() * 25)
    }));
    setMessages(clientSideInitialMessages);
  }, []);

  const addMessage = useCallback((message: Omit<Message, 'supports' | 'id'>) => {
    const newMessage: Message = {
        ...message,
        id: Date.now(),
        supports: 0,
    }
    setMessages((prev) => [newMessage, ...prev]);
  }, []);

  const addSupport = useCallback((id: number) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, supports: msg.supports + 1 } : msg
      )
    );
  }, []);

  const value = useMemo(() => ({
    messages,
    addMessage,
    addSupport
  }), [messages, addMessage, addSupport]);

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
}
