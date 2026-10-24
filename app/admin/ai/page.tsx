'use client';

import { GlassPanel } from '@/app/components/ds/GlassPanel';
import { SectionHeading } from '@/app/components/ds/SectionHeading';
import { AICommandBar } from '@/app/components/ds/AICommandBar';

export default function AdminAIPage() {
  return (
    <div className="space-y-8">
      <GlassPanel intensity="light" className="p-8">
        <SectionHeading
          title="Agentic AI Command Center"
          subtitle="Ovládajte AI agentov pre automatizáciu a optimalizáciu"
          alignment="left"
        />
        
        <div className="bg-white rounded-gm-lg border border-gm-border p-8">
          <AICommandBar
            placeholder="Zadajte príkaz pre AI agentov..."
            onCommand={async (command) => {
              // Handle AI commands
              console.log('AI Command:', command);
              return {
                message: `Spracúvam príkaz: ${command}`,
                type: 'text',
              };
            }}
          />
        </div>
        
        <div className="mt-8 bg-white rounded-gm-lg border border-gm-border p-8 text-center text-gm-text-muted">
          <p>AI Agent Dashboard bude dostupný čoskoro.</p>
          <p className="text-sm mt-2 text-gm-text-muted/70">
            Integrovane s Mistral AI pre automatizované úlohy.
          </p>
        </div>
      </GlassPanel>
    </div>
  );
}
