"use client"

import { useRouter } from 'next/navigation'
import { ProductServicesHero } from '@/components/product-services';

export default function ProductServicesPage() {
  const router = useRouter()

  return (
    <ProductServicesHero onSelect={(section: "product" | "services") => {
      if (section === 'product') router.push('/product-services/product')
      else router.push('/product-services/services')
    }} />
  );
}
