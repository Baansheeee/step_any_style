import { prisma } from './prisma';

const pakistanShippingData = [
  {
    region: 'Punjab',
    shippingCost: 300,
    cities: [
      'Lahore',
      'Rawalpindi',
      'Faisalabad',
      'Multan',
      'Gujranwala',
      'Sialkot',
      'Bahawalpur',
      'Sargodha',
      'Rahim Yar Khan',
      'Dera Ghazi Khan',
    ],
  },
  {
    region: 'Sindh',
    shippingCost: 350,
    cities: [
      'Karachi',
      'Hyderabad',
      'Sukkur',
      'Larkana',
      'Nawabshah',
      'Mirpur Khas',
      'Jacobabad',
      'Shikarpur',
    ],
  },
  {
    region: 'Khyber Pakhtunkhwa',
    shippingCost: 300,
    cities: [
      'Peshawar',
      'Mardan',
      'Abbottabad',
      'Swat',
      'Kohat',
      'Dera Ismail Khan',
      'Mansehra',
    ],
  },
  {
    region: 'Balochistan',
    shippingCost: 350,
    cities: [
      'Quetta',
      'Gwadar',
      'Turbat',
      'Khuzdar',
      'Chaman',
      'Sibi',
    ],
  },
  {
    region: 'Gilgit-Baltistan',
    shippingCost: 350,
    cities: ['Gilgit', 'Skardu', 'Hunza', 'Chilas'],
  },
  {
    region: 'Azad Jammu and Kashmir',
    shippingCost: 350,
    cities: ['Muzaffarabad', 'Mirpur', 'Kotli', 'Bhimber'],
  },
  {
    region: 'Islamabad Capital Territory',
    shippingCost: 300,
    cities: ['Islamabad'],
  },
];

export async function seedPakistanShipping() {
  try {
    console.log('🌍 Seeding Pakistan shipping regions...');

    for (const { region, shippingCost, cities } of pakistanShippingData) {
      // Create or get region
      let shippingRegion = await prisma.shippingRegion.findUnique({
        where: { name: region },
      });

      if (!shippingRegion) {
        shippingRegion = await prisma.shippingRegion.create({
          data: { 
            name: region,
            shippingCost: shippingCost
          },
        });
        console.log(`✅ Created region: ${region} (Common Cost: Rs. ${shippingCost})`);
      } else {
        // Update existing region cost
        await prisma.shippingRegion.update({
          where: { id: shippingRegion.id },
          data: { shippingCost }
        });
        console.log(`⏭️  Updated existing region: ${region} cost to Rs. ${shippingCost}`);
      }

      // Create cities
      for (const city of cities) {
        const existing = await prisma.shippingCity.findFirst({
          where: {
            name: city,
            regionId: shippingRegion.id,
          },
        });

        if (!existing) {
          await prisma.shippingCity.create({
            data: {
              name: city,
              regionId: shippingRegion.id,
            },
          });
          console.log(`  ✅ Added city: ${city}`);
        }
      }
    }

    console.log('✨ Pakistan shipping regions seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding shipping regions:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedPakistanShipping()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
