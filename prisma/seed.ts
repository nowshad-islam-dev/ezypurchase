import bcrypt from 'bcrypt';
import { prisma } from '../src/lib/prisma';

async function main() {
  await prisma.cart.create({
    data: {
      cartItems: {
        create: {
          product: {
            create: {
              name: 'Samsung galaxy A30',
              slug: 'samsung-galaxy-a30',
              price: '300',
              stock: 5,
              category: {
                create: {
                  name: 'Mobile',
                  slug: 'mobile',
                },
              },
            },
          },
          quantity: 2,
        },
      },
      user: {
        create: {
          email: 'jane@example.com',
          name: 'Jane Doe',
          password: await bcrypt.hash('password123', 10),
        },
      },
    },
  });
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
