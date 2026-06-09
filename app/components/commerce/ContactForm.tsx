'use client';

import React, { useState } from 'react';
import { Button } from '@/app/components/ds/Button';
import { Input } from '@/app/components/ds/Input';
import { Textarea } from '@/app/components/ds/Textarea';
import { useToast } from '@/app/components/ds/Toast';

export function ContactForm() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    await new Promise((r) => setTimeout(r, 600));
    toast({
      title: 'Správa odoslaná',
      description: 'Ďakujeme, ozveme sa vám čo najskôr.',
      variant: 'success',
    });
    setName('');
    setEmail('');
    setMessage('');
    setPending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-5">
      <Input
        label="Meno"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        label="E-mail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Textarea
        label="Správa"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        required
      />
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? 'Odosielam…' : 'Odoslať správu'}
      </Button>
    </form>
  );
}
