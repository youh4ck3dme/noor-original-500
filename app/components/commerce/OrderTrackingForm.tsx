'use client';

import React, { useState } from 'react';
import { Button } from '@/app/components/ds/Button';
import { Input } from '@/app/components/ds/Input';
import { Steps } from '@/app/components/ds/Steps';
import { useToast } from '@/app/components/ds/Toast';

export function OrderTrackingForm() {
  const { toast } = useToast();
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [tracked, setTracked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !email.trim()) return;
    setTracked(true);
    toast({ title: 'Objednávka nájdená', variant: 'info' });
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Číslo objednávky"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          required
        />
        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" fullWidth>
          Sledovať objednávku
        </Button>
      </form>

      {tracked && (
        <Steps
          current={1}
          steps={[
            { label: 'Prijatá' },
            { label: 'Spracováva sa' },
            { label: 'Odoslaná' },
            { label: 'Doručená' },
          ]}
        />
      )}
    </div>
  );
}
