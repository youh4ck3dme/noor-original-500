'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Badge, Button, PriceTag, ProductCardSkeleton, Skeleton, Drawer, GlassPanel, SectionHeading } from '@/app/components/ds';
import { useToast } from '@/app/components/ds/Toast';
import { useAuth } from '@/app/components/providers/AuthProvider';
import { buildAuthHeaders } from '@/app/lib/admin-fetch';
import type { MetadataOptimizationResult } from '@/app/lib/product-optimization';
import type { ShopifyProductNode } from '@/app/lib/shopify';

type ProductStatus = 'Aktívne' | 'Návrh' | 'Archivované';

interface AdminProduct extends ShopifyProductNode {
  status: ProductStatus;
  variantId: string;
}

const statusBadgeVariant: Record<ProductStatus, 'default' | 'new' | 'sale' | 'soldOut'> = {
  Aktívne: 'sale',
  Návrh: 'new',
  Archivované: 'soldOut',
};

export default function AdminProductsPage() {
  const { toast } = useToast();
  const { idToken, refreshToken } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<MetadataOptimizationResult | null>(null);
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const authHeaders = await buildAuthHeaders(idToken, refreshToken);
        const response = await fetch('/api/admin/products', { headers: authHeaders });
        const data = await response.json();
        if (active) {
          if (response.ok && Array.isArray(data)) {
            setProducts(data);
          } else {
            console.error('Admin products API returned invalid data:', data);
            setProducts([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [idToken, refreshToken]);

  const handleAIOptimization = async (product: AdminProduct) => {
    setOptimizing(product.id);
    try {
      const authHeaders = await buildAuthHeaders(idToken, refreshToken);
      const response = await fetch('/api/ai/optimize-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          productId: product.id,
          productHandle: product.handle,
        }),
      });
      const result = await response.json();
      
      if (result.success) {
        setOptimizationResult(result.data);
      } else {
        console.error('AI Optimization failed:', result.error);
      }
    } catch (error) {
      console.error('AI Optimization failed:', error);
    } finally {
      setOptimizing(null);
    }
  };

  const handleSaveOptimization = async () => {
    if (!optimizationResult) return;

    setSaving(true);
    try {
      const authHeaders = await buildAuthHeaders(idToken, refreshToken);
      const response = await fetch('/api/admin/products/apply-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          productId: optimizationResult.productId,
          productHandle: optimizationResult.productHandle,
          applyPayload: optimizationResult.applyPayload,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const detail =
          result.userErrors?.map((e: { message: string }) => e.message).join(', ') ||
          result.error ||
          'Uloženie zlyhalo';
        toast({ title: detail, variant: 'error' });
        return;
      }

      toast({ title: 'Optimalizácia bola uložená do Shopify.', variant: 'success' });
      setOptimizationResult(null);
    } catch (error) {
      console.error('Failed to save optimization:', error);
      toast({ title: 'Nepodarilo sa uložiť optimalizáciu.', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton variant="text" className="w-64 h-8" />
          <Skeleton variant="text" className="w-48 h-8" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} className="w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <GlassPanel intensity="light" className="p-8">
      <SectionHeading
        title="Produkty"
        subtitle="Správa katalogu produktov"
        alignment="left"
      />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-gm-text-muted">Zoznam všetkých produktov zo Shopify</span>
          <Button variant="primary">Pridať produkt</Button>
        </div>

      <div className="bg-white rounded-gm-lg border border-gm-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gm-bg-soft">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gm-text-muted uppercase tracking-wider">
                Produkt
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gm-text-muted uppercase tracking-wider">
                Cena
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gm-text-muted uppercase tracking-wider">
                Stav
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gm-text-muted uppercase tracking-wider">
                Akcie
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gm-border">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gm-bg-soft/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    {product.images?.edges?.[0]?.node?.url ? (
                      <Image
                        src={product.images.edges[0].node.url}
                        alt={product.images.edges[0].node.altText || product.title}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-gm-md object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gm-border rounded-gm-md flex items-center justify-center">
                        <span className="text-xs text-gm-text-muted">Bez obrázka</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gm-text">{product.title}</p>
                      <p className="text-sm text-gm-text-muted">{product.handle}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <PriceTag
                    amount={parseFloat(product.priceRange.minVariantPrice.amount)}
                    currency={product.priceRange.minVariantPrice.currencyCode}
                    size="md"
                  />
                </td>
                <td className="px-6 py-4">
                  <Badge
                    label={product.status || 'Aktívne'}
                    status={statusBadgeVariant[product.status as ProductStatus] || 'default'}
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    variant="outline"
                    onClick={() => handleAIOptimization(product)}
                    disabled={optimizing === product.id}
                    className="px-4 py-2 text-xs"
                  >
                    {optimizing === product.id ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin w-3 h-3 border-2 border-gm-primary border-t-transparent rounded-full" />
                        Spracovávam...
                      </span>
                    ) : (
                      'AI Optimalizácia'
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12 text-gm-text-muted">
          Žiadne produkty nájdené
        </div>
      )}
      </div>
    </GlassPanel>

    {/* Optimization Results Drawer */}
    <Drawer
      open={!!optimizationResult}
      onClose={() => setOptimizationResult(null)}
      title={`AI Optimalizácia: ${optimizationResult?.productTitle || ''}`}
      side="right"
      className="w-full max-w-2xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOptimizationResult(null)}>
            Zrušiť
          </Button>
          <Button variant="primary" onClick={handleSaveOptimization} disabled={saving}>
            {saving ? 'Ukladáme...' : 'Uložiť zmeny'}
          </Button>
        </div>
      }
    >
      {optimizationResult && (
        <div className="space-y-6">
          {/* SEO Section */}
          <div className="bg-gm-bg-soft/50 rounded-gm-lg p-4">
            <h3 className="font-semibold text-gm-text mb-3">SEO Optimalizácia</h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-gm-md p-3 border border-gm-border">
                  <label className="text-xs text-gm-text-muted mb-1 block">Aktuálny Meta Title</label>
                  <p className="text-sm text-gm-text truncate">{optimizationResult.seo.metaTitle || 'Nie je nastavený'}</p>
                </div>
                <div className="bg-gm-primary/5 rounded-gm-md p-3 border border-gm-primary/20">
                  <label className="text-xs text-gm-primary mb-1 block">Navrhovaný Meta Title</label>
                  <p className="text-sm text-gm-text font-medium">{optimizationResult.seo.suggestedMetaTitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-gm-md p-3 border border-gm-border">
                  <label className="text-xs text-gm-text-muted mb-1 block">Aktuálny Meta Description</label>
                  <p className="text-sm text-gm-text truncate">{optimizationResult.seo.metaDescription || 'Nie je nastavený'}</p>
                </div>
                <div className="bg-gm-primary/5 rounded-gm-md p-3 border border-gm-primary/20">
                  <label className="text-xs text-gm-primary mb-1 block">Navrhovaný Meta Description</label>
                  <p className="text-sm text-gm-text font-medium">{optimizationResult.seo.suggestedMetaDescription}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Missing Meta Objects */}
          {optimizationResult.missingMetafields.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-gm-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-3">Chýbajúce metafields (PDP)</h3>
              <p className="text-xs text-yellow-600 mb-3">
                Nasledujúce metafields chýbajú a budú doplnené do Shopify:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {optimizationResult.missingMetafields.map((field) => {
                  const suggestion = optimizationResult.suggestions.find(
                    (s) => s.field.includes(field) || s.type === 'metafield'
                  );
                  return (
                    <div key={field} className="bg-white rounded-gm-sm p-2 border border-yellow-200">
                      <p className="text-xs font-medium text-yellow-700">{field}</p>
                      {suggestion && (
                        <p className="text-xs text-yellow-600 mt-1">{suggestion.suggestedValue}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggestions */}
          <div className="bg-gm-bg-soft/30 rounded-gm-lg p-4">
            <h3 className="font-semibold text-gm-text mb-3">Ostatné odporúčania</h3>
            <div className="space-y-2">
              {optimizationResult.suggestions
                .filter((s) => s.type !== 'metafield')
                .map((suggestion, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-gm-md p-3 border border-gm-border hover:border-gm-primary/30 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gm-text">{suggestion.field}</p>
                        <p className="text-xs text-gm-text-muted">{suggestion.reason}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gm-primary/10 text-gm-primary">
                        {suggestion.type}
                      </span>
                    </div>
                    <p className="text-sm text-gm-text mt-2 p-2 bg-gm-bg-soft rounded-gm-sm">
                      {suggestion.suggestedValue}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Benefits Section */}
          {optimizationResult.benefitsSection && (
            <div className="bg-green-50 border border-green-200 rounded-gm-lg p-4">
              <h3 className="font-semibold text-green-800 mb-3">Sekcia Výhody</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-gm-md p-3 border border-green-200">
                  <label className="text-xs text-green-600 mb-1 block">Aktuálne</label>
                  <p className="text-sm text-gm-text">{optimizationResult.benefitsSection.current || 'Nie je vyplnené'}</p>
                </div>
                <div className="bg-green-50 rounded-gm-md p-3 border border-green-300">
                  <label className="text-xs text-green-700 mb-1 block">Navrhované</label>
                  <p className="text-sm text-gm-text whitespace-pre-wrap">
                    {optimizationResult.benefitsSection.suggested}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
    </>
  );
}
