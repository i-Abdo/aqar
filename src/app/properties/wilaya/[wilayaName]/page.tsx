
import { Metadata, ResolvingMetadata } from 'next';
import PropertiesPage from '@/app/properties/page';
import { siteConfig } from '@/config/site';

type Props = {
  params: { wilayaName: string };
};

const wilayas = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار",
  "البليدة", "البويرة", "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر",
  "الجلفة", "جيجل", "سطيف", "سعيدة", "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة",
  "قسنطينة", "المدية", "مستغانم", "المسيلة", "معسكر", "ورقلة", "وهران", "البيض",
  "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", "تيسمسيلت", "الوادي", "خنشلة",
  "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت", "غرداية", "غليزان"
];

// Function to generate static paths for all wilayas
export async function generateStaticParams() {
  return wilayas.map((wilaya) => ({
    wilayaName: encodeURIComponent(wilaya),
  }));
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Decode the wilaya name from the URL
  const wilayaName = decodeURIComponent(params.wilayaName);

  // Find if the wilaya name is valid
  const isValidWilaya = wilayas.includes(wilayaName);

  if (!isValidWilaya) {
    return {
      title: 'الولاية غير موجودة',
      description: 'الصفحة التي تبحث عنها غير موجودة.',
    };
  }

  const title = `عقارات للبيع والكراء في ${wilayaName} - ${siteConfig.name}`;
  const description = `تصفح أفضل العقارات من شقق، بيوت، أراض، ومحلات للبيع أو الإيجار في ولاية ${wilayaName}. جد عقارك المثالي على منصة عقاري.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/properties/wilaya/${params.wilayaName}`,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: description,
        },
      ],
    },
    twitter: {
      title,
      description,
      images: [siteConfig.ogImage],
    },
  };
}


// This page will reuse the main properties page component.
// The filtering logic inside PropertiesPage will need to handle the initial state based on URL params.
// For now, we are just setting up the structure and metadata.
export default function WilayaPropertiesPage() {
  // The main PropertiesPage component is designed to be a client component
  // that fetches and filters data. We can simply render it here.
  // We will later enhance it to read the wilaya from the URL.
  return <PropertiesPage />;
}
