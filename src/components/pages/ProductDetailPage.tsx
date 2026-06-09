import { useState, useEffect } from 'react';
import { LiquidButton } from '../ui/LiquidButton';
import {
  Minus,
  Plus,
  Star,
  Truck,
  ShieldCheck,
  ChevronDown } from
'lucide-react';
import { clsx } from 'clsx';
import { getProductByHandle } from '../../lib/shopify';

interface ProductDetailPageProps {
  productHandle: string;
}

interface ShopifyProduct {
  id: string;
  title: string;
  descriptionHtml: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{ node: { url: string; altText: string | null } }>;
  };
}

export const ProductDetailPage = ({ productHandle }: ProductDetailPageProps) => {
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productHandle) return;
      try {
        const fetchedProduct = await getProductByHandle(productHandle);
        setProduct(fetchedProduct);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        // Optionally, set an error state to show in the UI
      }
    };

    fetchProduct();
  }, [productHandle]);

  if (!product) {
    return (
      <div className="pt-32 pb-24 text-center">
        <p>Načítavam produkt...</p>
      </div>
    );
  }

  const mainImage = product.images.edges[0]?.node;
  const galleryImages = product.images.edges.slice(1, 3); // Get next two images for gallery

  return (
    <div className="pt-32 pb-24">
      <div className="gm-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-gm-bg-soft rounded-gm-lg overflow-hidden sticky top-[100px]">
              {mainImage && 
                <img
                  src={mainImage.url}
                  alt={mainImage.altText || product.title}
                  className="w-full h-full object-cover" />
              }
            </div>
            <div className="grid grid-cols-2 gap-4">
              {galleryImages.map((imageEdge, index) => (
                <div key={index} className="aspect-square bg-gm-bg-soft rounded-gm-md overflow-hidden">
                  <img
                    src={imageEdge.node.url}
                    alt={imageEdge.node.altText || `${product.title} - view ${index + 2}`}
                    className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            <div className="sticky top-[100px]">
              {/* Breadcrumbs (can be made dynamic later) */}
              <nav className="text-xs text-gm-text-muted mb-6 flex items-center space-x-2">
                 <a href="#" className="hover:text-gm-text">Domov</a>
                 <span>/</span>
                 <a href="#" className="hover:text-gm-text">Produkty</a>
                 <span>/</span>
                 <span className="text-gm-text">{product.title}</span>
              </nav>

              <h1 className="text-3xl md:text-4xl font-heading text-gm-text mb-2">
                {product.title}
              </h1>

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-2xl font-medium text-gm-text">
                  {`${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)} ${product.priceRange.minVariantPrice.currencyCode}`}
                </span>
                {/* Star rating is static for now */}
                <div className="flex items-center text-gm-primary">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current opacity-50" />
                  <span className="text-sm text-gm-text-muted ml-2">(128 hodnotení)</span>
                </div>
              </div>

              {/* Use the HTML description from Shopify */}
              <div 
                className="text-gm-text-muted font-light leading-relaxed mb-8 prose" 
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} 
              />

              {/* Add to Cart Block */}
              <div className="flex space-x-4 mb-8">
                <div className="flex items-center border border-gm-border rounded-gm-md px-4 py-3 bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-gm-text-muted hover:text-gm-text">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-gm-text-muted hover:text-gm-text">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <LiquidButton className="flex-1 text-lg">Do košíka</LiquidButton>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 py-6 border-y border-gm-border mb-8">
                <div className="flex items-center text-sm text-gm-text">
                  <Truck className="w-5 h-5 mr-3 text-gm-primary" />
                  <span>Doprava zadarmo nad 50 €</span>
                </div>
                <div className="flex items-center text-sm text-gm-text">
                  <ShieldCheck className="w-5 h-5 mr-3 text-gm-primary" />
                  <span>100% prírodné zloženie</span>
                </div>
              </div>

               {/* Accordion - For now, it only shows the description */}
               <div className="space-y-4">
                <div className="border-b border-gm-border pb-4">
                    <button
                    className="flex justify-between items-center w-full text-left uppercase tracking-wider text-sm font-medium text-gm-text"
                    onClick={() => setActiveTab(activeTab === 'description' ? '' : 'description')}>
                      Popis
                      <ChevronDown
                      className={clsx(
                        'w-4 h-4 transition-transform',
                        activeTab === 'description' && 'rotate-180'
                      )} />
                    </button>
                    {activeTab === 'description' &&
                  <div 
                    className="mt-4 text-sm text-gm-text-muted font-light leading-relaxed animate-fade-in prose"
                    dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                  />
                  }
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};