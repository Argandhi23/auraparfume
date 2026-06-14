import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const AURA_IMAGE_URL = "https://xtjkuouycmjrhgsslyqj.supabase.co/storage/v1/object/public/uploads/products/aura-bottle.png";

async function main() {
  console.log("Starting seed process...");

  // Clean the database
  console.log("Cleaning database...");
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productSize.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.admin.deleteMany({});

  // Seed Admin
  console.log("Seeding admin...");
  const hashedPassword = await bcrypt.hash("adminparfume123", 10);
  const admin = await prisma.admin.create({
    data: {
      username: "admin",
      password: hashedPassword,
    },
  });
  console.log(`Admin created: ${admin.username}`);

  // Seed Products according to new pricelist
  console.log("Seeding products...");
  const products = [
    {
      name: "Velour Noir",
      slug: "velour-noir",
      description: "Perpaduan sensual yang mendalam antara black tea hangat, aroma wood kering, dan sentuhan vanila yang misterius. Aroma yang meninggalkan kesan karismatik dan elegan di kegelapan malam.",
      price: 25000,
      stock: 45,
      sizes: [
        { size: "18ml", priceAdd: 0 },
        { size: "35ml", priceAdd: 20000 },
      ],
      images: [AURA_IMAGE_URL],
    },
    {
      name: "Blanc Sillage",
      slug: "blanc-sillage",
      description: "Kesegaran linen putih bersih berpadu dengan kehangatan melati pagi yang lembut dan white musk yang clean. Wewangian yang memancarkan aura kemurnian dan kenyamanan sepanjang hari.",
      price: 25000,
      stock: 35,
      sizes: [
        { size: "18ml", priceAdd: 0 },
        { size: "35ml", priceAdd: 20000 },
      ],
      images: [AURA_IMAGE_URL],
    },
    {
      name: "Lumière Douce",
      slug: "lumiere-douce",
      description: "Sinar kelembutan citrus Italia bergamot yang ceria menyatu sempurna dengan cedarwood manis dan amber yang hangat. Menghadirkan ketenangan jiwa dan keanggunan sejati.",
      price: 25000,
      stock: 40,
      sizes: [
        { size: "18ml", priceAdd: 0 },
        { size: "35ml", priceAdd: 20000 },
      ],
      images: [AURA_IMAGE_URL],
    },
    {
      name: "Éclat Céleste",
      slug: "eclat-celeste",
      description: "Wewangian surgawi yang memadukan kesegaran udara pegunungan dengan kelembutan kelopak mawar liar dan sentuhan cedar yang menenangkan. Sangat mewah dan memikat.",
      price: 25000,
      stock: 30,
      sizes: [
        { size: "18ml", priceAdd: 0 },
        { size: "35ml", priceAdd: 20000 },
      ],
      images: [AURA_IMAGE_URL],
    },
    {
      name: "Ambre Rêve",
      slug: "ambre-reve",
      description: "Mimpi hangat dari paduan resin amber eksotis yang kaya dengan madu keemasan dan aroma rempah cengkeh yang manis. Kehangatan yang memeluk setiap indra.",
      price: 30000,
      stock: 25,
      sizes: [
        { size: "18ml", priceAdd: 0 },
        { size: "35ml", priceAdd: 20000 },
      ],
      images: [AURA_IMAGE_URL],
    },
    {
      name: "Verveine Vert",
      slug: "verveine-vert",
      description: "Energi segar dari lemon verbena hijau yang baru dipetik, dipadukan dengan kesegaran mint liar dan vetiver yang menenangkan. Sangat sporty dan membangkitkan semangat.",
      price: 20000,
      stock: 50,
      sizes: [
        { size: "20ml", priceAdd: 0 },
      ],
      images: [AURA_IMAGE_URL],
    },
  ];

  for (const p of products) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        stock: p.stock,
        imageUrl: p.images[0],
        sizes: {
          create: p.sizes.map((s) => ({ size: s.size, priceAdd: s.priceAdd })),
        },
        images: {
          create: p.images.map((img) => ({ url: img })),
        },
      },
    });
    console.log(`Product created: ${product.name}`);
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
