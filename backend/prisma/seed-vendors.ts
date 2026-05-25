import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORY_NAMES = ['مطعم', 'بقالة', 'سياحة', 'تعليم'] as const;
type CategoryName = (typeof CATEGORY_NAMES)[number];

interface VendorSeed {
  name: string;
  type: CategoryName;
  location: string | null;
  discount: string;
  imageUrl: string;
  mapsUrl: string;
}

const VENDORS: VendorSeed[] = [
  // ==================== RESTAURANTS - CYBERJAYA ====================
  { name: 'Rakan', type: 'مطعم', location: 'سايبرجايا', discount: '15%', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rakan+Cyberjaya+Malaysia' },
  { name: 'Al-Dar Lounge', type: 'مطعم', location: 'سايبرجايا', discount: '10%', imageUrl: 'discounted_places/Aldar Lounge.jpg', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Aldar+Lounge+Cyberjaya+Malaysia' },
  { name: 'Namo', type: 'مطعم', location: 'سايبرجايا', discount: '15%', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Namo+Cyberjaya+Malaysia' },
  { name: 'Bab Al-Mandab', type: 'مطعم', location: 'سايبرجايا', discount: '10%', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Bab+Al+Mandab+Cyberjaya+Malaysia' },
  { name: 'Restaurant Shawarma Mansour', type: 'مطعم', location: 'سايبرجايا', discount: '5%', imageUrl: 'discounted_places/Restaurant Shawarma Mansour.webp', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Restaurant+Shawarma+Mansour+Cyberjaya+Malaysia' },
  // ==================== RESTAURANTS - SERDANG ====================
  { name: 'Land of Two Gardens', type: 'مطعم', location: 'سيردانج', discount: '10%', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Land+of+Two+Gardens+Serdang+Malaysia' },
  { name: 'Baba Sandwetch', type: 'مطعم', location: 'سيردانج', discount: '10%', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Baba+Sandwetch+Serdang+Malaysia' },
  { name: 'Malofa Burger', type: 'مطعم', location: 'سيردانج', discount: '15%', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Malofa+Burger+Serdang+Malaysia' },
  { name: 'Al-Mokha Restaurant', type: 'مطعم', location: 'سيردانج', discount: '5%', imageUrl: 'discounted_places/Al-Mokha Restaurant.jpg', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Al+Mokha+Restaurant+Serdang+Malaysia' },
  // ==================== RESTAURANTS - OTHER CITIES ====================
  { name: 'Yathrim Malaka', type: 'مطعم', location: 'مالاكا', discount: '25%', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Yathrim+Malaka+Malaysia' },
  { name: 'Almajlis Johor', type: 'مطعم', location: 'جوهور', discount: '15%', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Almajlis+Johor+Malaysia' },
  { name: 'Taj Hadramot', type: 'مطعم', location: 'غومباك', discount: '10%', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Taj+Hadramot+Gombak+Malaysia' },
  { name: 'Hadramot Restaurant', type: 'مطعم', location: 'قدح', discount: '10%', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hadramot+Restaurant+Kedah+Malaysia' },
  // ==================== RESTAURANTS - KUALA LUMPUR ====================
  { name: 'Al-Sultan Restaurant - Bukit Bintang', type: 'مطعم', location: 'كوالالمبور', discount: '10%', imageUrl: 'discounted_places/Al - Sultan Restaurant - Bukit Bintang.jpg', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Al+Sultan+Restaurant+Bukit+Bintang+KL+Malaysia' },
  { name: 'Al-Sultan Restaurant - TTDI', type: 'مطعم', location: 'كوالالمبور', discount: '10%', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Al+Sultan+Restaurant+TTDI+KL+Malaysia' },
  { name: 'Al-Sultan Restaurant - Glenmarie', type: 'مطعم', location: 'كوالالمبور', discount: '10%', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Al+Sultan+Restaurant+Glenmarie+Malaysia' },
  { name: 'Royal Hadramot', type: 'مطعم', location: 'كوالالمبور', discount: '30%', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Royal+Hadramot+KL+Malaysia' },
  // ==================== MARTS ====================
  { name: 'Yemeni Corner', type: 'بقالة', location: 'سايبرجايا', discount: '10%', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Yemeni+Corner+Cyberjaya+Malaysia' },
  { name: 'Makkah City', type: 'بقالة', location: 'سايبرجايا', discount: 'حتى 50%', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Makkah+City+Cyberjaya+Malaysia' },
  { name: 'Al-Kahir', type: 'بقالة', location: 'كاجانج', discount: '10%', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Al+Kahir+Kajang+Malaysia' },
  { name: 'Al-Faisal for Oud', type: 'بقالة', location: 'أونلاين', discount: '15%', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Al+Faisal+Oud+Malaysia' },
  // ==================== EDUCATION ====================
  { name: 'Creativity House', type: 'تعليم', location: 'أونلاين', discount: '25%', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Creativity+House+Malaysia' },
  // ==================== TRAVEL ====================
  { name: 'Jusor', type: 'سياحة', location: null, discount: '20%', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Jusor+Malaysia' },
  { name: 'Sunway Lagoon Themepark', type: 'سياحة', location: null, discount: '180 RM', imageUrl: 'discounted_places/Sunway Lagoon.jpg', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sunway+Lagoon+Malaysia' },
  { name: 'Sunway Lagoon Night Park', type: 'سياحة', location: null, discount: '70 RM', imageUrl: 'discounted_places/Sunway Lagoon.jpg', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sunway+Lagoon+Night+Park+Malaysia' },
  { name: 'I-City All Day Happiness Pass', type: 'سياحة', location: null, discount: '170 RM', imageUrl: 'discounted_places/i-city theme park.jpg', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=I-City+Theme+Park+Shah+Alam+Malaysia' },
  { name: 'KL Tower Observation Deck', type: 'سياحة', location: null, discount: '70 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=KL+Tower+Observation+Deck+Malaysia' },
  { name: 'Genting Skytropolis Indoor Themepark', type: 'سياحة', location: null, discount: '90 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Genting+Skytropolis+Indoor+Themepark+Malaysia' },
  { name: 'Genting Skyworlds Outdoor Themepark', type: 'سياحة', location: null, discount: '150 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Genting+Skyworlds+Outdoor+Themepark+Malaysia' },
  { name: 'Melaka River Cruise', type: 'سياحة', location: null, discount: '50 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Melaka+River+Cruise+Malaysia' },
  { name: 'Golden Eagle Cruise at Langkawi', type: 'سياحة', location: null, discount: '100 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Golden+Eagle+Cruise+Langkawi+Malaysia' },
  { name: 'ESCAPE Penang', type: 'سياحة', location: null, discount: '190 RM', imageUrl: 'discounted_places/Escape Penang.webp', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Escape+Penang+Malaysia' },
  { name: 'PETRONAS Twin Towers', type: 'سياحة', location: null, discount: '52 RM', imageUrl: 'discounted_places/Petronas Twin Towers.webp', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Petronas+Twin+Towers+KL+Malaysia' },
  { name: 'Berjaya Times Square Themepark', type: 'سياحة', location: null, discount: '80 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Berjaya+Times+Square+Themepark+KL+Malaysia' },
  { name: 'Aquaria KLCC', type: 'سياحة', location: null, discount: '80 RM', imageUrl: 'discounted_places/Aquaria KLCC.jpg', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Aquaria+KLCC+Malaysia' },
  { name: 'Adventure Waterpark Desaru', type: 'سياحة', location: null, discount: '80 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Adventure+Waterpark+Desaru+Malaysia' },
  { name: 'Langkawi Adventure & Xtreme Park (10 in 1)', type: 'سياحة', location: null, discount: '130 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Langkawi+Adventure+Xtreme+Park+Malaysia' },
  { name: 'Tropical Fruit Farm Penang', type: 'سياحة', location: null, discount: '50 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Tropical+Fruit+Farm+Penang+Malaysia' },
  { name: 'Penang Hill Train Upper Station', type: 'سياحة', location: null, discount: '40 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Penang+Hill+Train+Malaysia' },
  { name: 'Penang 3D Trick Art Museum', type: 'سياحة', location: null, discount: '20 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Penang+3D+Trick+Art+Museum+Malaysia' },
  { name: 'The Habitat Penang Hill', type: 'سياحة', location: null, discount: '50 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=The+Habitat+Penang+Hill+Malaysia' },
  { name: 'Wetland Studios Putrajaya', type: 'سياحة', location: null, discount: '46 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Wetland+Studios+Putrajaya+Malaysia' },
  { name: 'Lost World of Tambun Theme Park', type: 'سياحة', location: null, discount: '95 RM', imageUrl: 'discounted_places/Lost World of Tambun.jpg', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Lost+World+of+Tambun+Malaysia' },
  { name: 'Snorkeling at Pulau Giam Pangkor', type: 'سياحة', location: null, discount: '120 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pulau+Giam+Pangkor+Malaysia' },
  { name: 'Lost World of Tambun Night Park', type: 'سياحة', location: null, discount: '75 RM', imageUrl: 'discounted_places/Lost World of Tambun.jpg', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Lost+World+of+Tambun+Night+Park+Malaysia' },
  { name: 'Island Hopping at Kota Kinabalu Sabah', type: 'سياحة', location: null, discount: '250 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Island+Hopping+Kota+Kinabalu+Sabah+Malaysia' },
  { name: 'A Famosa Safari Wonderland Park', type: 'سياحة', location: null, discount: '70 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=A+Famosa+Safari+Wonderland+Park+Malaysia' },
  { name: 'SKYTREX Adventure Melaka', type: 'سياحة', location: null, discount: '70 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=SKYTREX+Adventure+Melaka+Malaysia' },
  { name: 'Melaka Wonderland Waterpark', type: 'سياحة', location: null, discount: '50 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Melaka+Wonderland+Waterpark+Malaysia' },
  { name: 'Menara Taming Sari - Melaka (Night)', type: 'سياحة', location: null, discount: '25 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Menara+Taming+Sari+Melaka+Malaysia' },
  { name: 'Menara Taming Sari - Melaka (Morning)', type: 'سياحة', location: null, discount: '20 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Menara+Taming+Sari+Melaka+Malaysia' },
  { name: 'Melaka Upside Down House Gallery', type: 'سياحة', location: null, discount: '18 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Melaka+Upside+Down+House+Gallery+Malaysia' },
  { name: 'FJ ATV Park Janda Baik (Short Ride)', type: 'سياحة', location: null, discount: '190 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=FJ+ATV+Park+Janda+Baik+Malaysia' },
  { name: 'FJ ATV Park Janda Baik (Long Ride)', type: 'سياحة', location: null, discount: '280 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=FJ+ATV+Park+Janda+Baik+Malaysia' },
  { name: 'Tandem Paragliding at Bukit Jugra Selangor', type: 'سياحة', location: null, discount: '280 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Tandem+Paragliding+Bukit+Jugra+Selangor+Malaysia' },
  { name: 'Wet World Park Shah Alam', type: 'سياحة', location: null, discount: '35 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Wet+World+Park+Shah+Alam+Malaysia' },
  { name: 'Zoo Negara', type: 'سياحة', location: null, discount: '75 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Zoo+Negara+Malaysia' },
  { name: 'Skyline Luge Gamuda Gardens', type: 'سياحة', location: null, discount: '80 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Skyline+Luge+Gamuda+Gardens+Malaysia' },
  { name: 'ESCAPE Petaling Jaya', type: 'سياحة', location: null, discount: '110 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=ESCAPE+Petaling+Jaya+Malaysia' },
  { name: 'SplashMania Waterpark Gamuda Cove', type: 'سياحة', location: null, discount: '110 RM', imageUrl: '', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=SplashMania+Waterpark+Gamuda+Cove+Malaysia' },
];

async function main() {
  console.log('Seeding vendor categories and vendors...');

  await prisma.$transaction(async (tx) => {
    // Upsert categories
    const categoryMap = new Map<CategoryName, string>();

    const categoryDefaults: Record<CategoryName, string> = {
      'مطعم': 'utensils',
      'بقالة': 'shopping-cart',
      'سياحة': 'globe',
      'تعليم': 'graduation-cap',
    };

    for (const name of CATEGORY_NAMES) {
      const category = await tx.vendorCategory.upsert({
        where: { name },
        update: {},
        create: { name, icon: categoryDefaults[name] },
      });
      categoryMap.set(name, category.id);
      console.log(`Category: ${name} → ${category.id}`);
    }

    // Upsert vendors
    for (const v of VENDORS) {
      const categoryId = categoryMap.get(v.type)!;
      await tx.vendor.upsert({
        where: { name_categoryId: { name: v.name, categoryId } },
        update: {},
        create: {
          name: v.name,
          categoryId,
          location: v.location,
          discount: v.discount,
          imageUrl: v.imageUrl || null,
          mapsUrl: v.mapsUrl || null,
        },
      });
      console.log(`Vendor: ${v.name}`);
    }
  });

  console.log(`Done. Seeded ${CATEGORY_NAMES.length} categories and ${VENDORS.length} vendors.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
