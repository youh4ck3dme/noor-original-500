import React, { useState, useEffect } from 'react';
import { ProductCard } from '../commerce/ProductCard';
import { Filter, ChevronDown } from 'lucide-react';
import { getProductsInCollection } from '../../lib/shopify';

interface CollectionPageProps {
  collectionHandle: string;
  onProductClick: (handle: string) => void; // Add this prop
}

interface FormattedProduct {
  title: string;
  price: string;
  image: string;
  hoverImage?: string;
  badge?: string;
  handle: string;
}

export const CollectionPage = ({ collectionHandle, onProductClick }: CollectionPageProps) => {
  const [products, setProducts] = useState<FormattedProduct[]>([]);
  const [collectionInfo, setCollectionInfo] = useState({ title: '', description: '' });

  useEffect(() => {
    const fetchCollectionData = async () => {
      const productsFromShopify = await getProductsInCollection(collectionHandle);
      
      setCollectionInfo({
        title: collectionHandle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `Objavte naše produkty v kategórii ${collectionHandle}.`
      });

      const formatted = productsFromShopify.map((product: any) => ({
        title: product.title,
        price: `Od ${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)} €`,
        image: product.images.edges[0]?.node.url,
        hoverImage: product.images.edges[1]?.node.url,
        handle: product.handle,
      }));

      setProducts(formatted);
    };

    fetchCollectionData();
  }, [collectionHandle]);

  return (
    <div className="pt-32 pb-24">
      {/* Collection Hero */}
      <div className="gm-container mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-heading text-gm-text mb-4">
          {collectionInfo.title}
        </h1>
        <p className="text-gm-text-muted text-lg font-light">
          {collectionInfo.description}
        </p>
      </div>

      {/* Toolbar */}
      <div className="sticky top-[80px] z-40 bg-gm-bg/90 backdrop-blur-md border-y border-gm-border py-4 mb-12">
        <div className="gm-container flex items-center justify-between">
          <button className="flex items-center text-sm font-medium text-gm-text hover:text-gm-primary transition-colors">
            <Filter className="w-4 h-4 mr-2" /> Filtrovať
          </button>

          <div className="text-sm text-gm-text-muted hidden md:block">
            Zobrazených {products.length} produktov
          </div>

          <button className="flex items-center text-sm font-medium text-gm-text hover:text-gm-primary transition-colors">
            Zoradiť podľa: Odporúčané <ChevronDown className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="gm-container">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {products.map((product, idx) => (
            <div key={idx} onClick={() => onProductClick(product.handle)}>
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>
    </div>);

};