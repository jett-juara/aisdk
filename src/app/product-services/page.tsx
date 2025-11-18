"use client"

import { useRouter } from 'next/navigation'
import { ProductServicesHero } from '@/components/product-services/hero';

export default function ProductServicesPage() {
  const router = useRouter()

  return (
    <ProductServicesHero onSelect={(section) => {
      if (section === 'product') router.push('/product-services/product')
      else router.push('/product-services/services')
    }} />
  );
}
