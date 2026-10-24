'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Target, Sparkles, ShoppingBag } from 'lucide-react';
import { clsx } from 'clsx';
import { AIRecommendation } from '@/app/components/account/AIRecommendation';
import { OrderHistory } from '@/app/components/account/OrderHistory';
import { Button } from '@/app/components/ds/Button';
import { Checkbox } from '@/app/components/ds/Checkbox';
import { GlassPanel } from '@/app/components/ds/GlassPanel';
import { Input } from '@/app/components/ds/Input';
import { Tabs } from '@/app/components/ds/Tabs';
import { useToast } from '@/app/components/ds/Toast';
import { useAuth } from '@/app/components/providers/AuthProvider';
import {
  FITNESS_GOAL_OPTIONS,
  type FitnessGoal,
  type UserProfile,
} from '@/app/lib/user-profile';

type AccountTab = 'overview' | 'goals' | 'recommendations' | 'orders';

export function ProfilePageClient() {
  const router = useRouter();
  const { user, loading, idToken, signOut, refreshToken } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AccountTab>('overview');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [fitnessGoals, setFitnessGoals] = useState<FitnessGoal[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace('/ucet/prihlasenie');
      return;
    }

    let active = true;

    (async () => {
      try {
        const token = idToken ?? (await refreshToken());
        if (!token || !active) {
          return;
        }

        const response = await fetch('/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Nepodarilo sa načítať profil.');
        }

        const data = await response.json();
        if (!active) {
          return;
        }

        const nextProfile = data.profile as UserProfile;
        setProfile(nextProfile);
        setDisplayName(nextProfile.displayName);
        setFitnessGoals(nextProfile.fitnessGoals);
        setAllergies(nextProfile.allergies);
      } catch (error) {
        if (!active) {
          return;
        }
        console.error(error);
        toast({ title: 'Nepodarilo sa načítať profil.', variant: 'error' });
      }
    })();

    return () => {
      active = false;
    };
  }, [loading, user, router, idToken, refreshToken, toast]);

  const toggleGoal = (goal: FitnessGoal) => {
    setFitnessGoals((current) =>
      current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal],
    );
  };

  const addAllergy = () => {
    const value = allergyInput.trim();
    if (!value || allergies.includes(value)) {
      return;
    }
    setAllergies((current) => [...current, value]);
    setAllergyInput('');
  };

  const removeAllergy = (value: string) => {
    setAllergies((current) => current.filter((item) => item !== value));
  };

  const saveProfile = async () => {
    const token = idToken ?? (await refreshToken());
    if (!token) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName,
          fitnessGoals,
          allergies,
        }),
      });

      if (!response.ok) {
        throw new Error('Uloženie zlyhalo.');
      }

      const data = await response.json();
      setProfile(data.profile);
      toast({ title: 'Profil bol uložený.', variant: 'success' });
    } catch {
      toast({ title: 'Profil sa nepodarilo uložiť.', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading || !user || !profile) {
    return (
      <div className="py-24 text-center text-gm-text-muted">
        Načítavame váš účet...
      </div>
    );
  }

  const sidebarItems: Array<{ id: AccountTab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Prehľad', icon: <User className="w-5 h-5 mr-3" /> },
    { id: 'goals', label: 'Fitness ciele', icon: <Target className="w-5 h-5 mr-3" /> },
    {
      id: 'recommendations',
      label: 'Odporúčania',
      icon: <Sparkles className="w-5 h-5 mr-3" />,
    },
    {
      id: 'orders',
      label: 'Moje objednávky',
      icon: <ShoppingBag className="w-5 h-5 mr-3" />,
    },
  ];

  const overviewContent = (
    <GlassPanel intensity="light" className="p-8">
      <h2 className="text-2xl font-heading text-gm-text mb-4">
        Dobrý deň, {profile.displayName}
      </h2>
      <p className="text-gm-text-muted mb-6">
        Spravujte svoje fitness ciele a získajte personalizované odporúčania doplnkov.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white/80 p-6 rounded-gm-md border border-gm-border">
          <p className="text-sm text-gm-text-muted mb-1">Fitness ciele</p>
          <p className="text-2xl font-heading text-gm-text">{fitnessGoals.length}</p>
        </div>
        <div className="bg-white/80 p-6 rounded-gm-md border border-gm-border">
          <p className="text-sm text-gm-text-muted mb-1">Alergie</p>
          <p className="text-2xl font-heading text-gm-text">{allergies.length}</p>
        </div>
      </div>
    </GlassPanel>
  );

  const goalsContent = (
    <GlassPanel intensity="light" className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-heading text-gm-text mb-2">Fitness ciele</h2>
        <p className="text-gm-text-muted mb-6">
          Vyberte ciele, ktoré vás momentálne zaujímajú. Na ich základe vám odporučíme doplnky.
        </p>
        <Input
          label="Zobrazované meno"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FITNESS_GOAL_OPTIONS.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            checked={fitnessGoals.includes(option.value)}
            onChange={() => toggleGoal(option.value)}
          />
        ))}
      </div>

      <div>
        <h3 className="text-lg font-heading text-gm-text mb-3">Alergie a intolerancie</h3>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Input
            label="Pridať alergiu"
            value={allergyInput}
            onChange={(event) => setAllergyInput(event.target.value)}
            containerClassName="flex-1"
          />
          <Button type="button" variant="outline" onClick={addAllergy} className="sm:self-end">
            Pridať
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {allergies.map((allergy) => (
            <button
              key={allergy}
              type="button"
              onClick={() => removeAllergy(allergy)}
              className="px-3 py-1.5 rounded-full bg-gm-bg-soft text-sm text-gm-text hover:bg-gm-accent transition-colors"
            >
              {allergy} ×
            </button>
          ))}
        </div>
      </div>

      <Button type="button" onClick={saveProfile} disabled={saving}>
        {saving ? 'Ukladáme...' : 'Uložiť profil'}
      </Button>
    </GlassPanel>
  );

  const recommendationsContent = <AIRecommendation />;
  const ordersContent = <OrderHistory />;

  const tabContent =
    activeTab === 'overview'
      ? overviewContent
      : activeTab === 'goals'
        ? goalsContent
        : activeTab === 'orders'
          ? ordersContent
          : recommendationsContent;

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-heading text-gm-text mb-2">Môj účet</h1>
        <p className="text-gm-text-muted">Vitajte späť, radi vás opäť vidíme.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-col space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={clsx(
                  'flex items-center px-4 py-3 rounded-gm-md transition-colors text-left',
                  activeTab === item.id
                    ? 'bg-gm-bg-soft text-gm-primary font-medium'
                    : 'text-gm-text hover:bg-gm-bg-soft/50',
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center px-4 py-3 rounded-gm-md transition-colors text-left text-red-500 hover:bg-red-50 mt-4"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Odhlásiť sa
            </button>
          </nav>
        </aside>

        <main className="flex-1">
          <Tabs
            value={activeTab}
            onChange={(id) => setActiveTab(id as AccountTab)}
            items={[
              { id: 'overview', label: 'Prehľad', content: overviewContent },
              { id: 'goals', label: 'Fitness ciele', content: goalsContent },
              { id: 'recommendations', label: 'Odporúčania', content: recommendationsContent },
              { id: 'orders', label: 'Moje objednávky', content: ordersContent },
            ]}
            className="hidden"
          />
          {tabContent}
        </main>
      </div>
    </div>
  );
}
