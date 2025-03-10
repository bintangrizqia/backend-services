import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

// Interface for user data
interface UserData {
  npp: string;
  name: string;
  email: string;
  password: string;
  photo?: string;
}

// Array of dummy users to create
const dummyUsers: UserData[] = [
  {
    npp: "12345",
    name: "John Doe",
    email: "john.doe@example.com",
    password: "password123",
    photo: "https://randomuser.me/api/portraits/men/1.jpg"
  },
  {
    npp: "12346",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    password: "password123",
    photo: "https://randomuser.me/api/portraits/women/1.jpg"
  },
  {
    npp: "12347",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    password: "password123",
    photo: "https://randomuser.me/api/portraits/men/2.jpg"
  },
  {
    npp: "12348",
    name: "Alice Williams",
    email: "alice.williams@example.com",
    password: "password123",
    photo: "https://randomuser.me/api/portraits/women/2.jpg"
  },
  {
    npp: "12349",
    name: "David Brown",
    email: "david.brown@example.com",
    password: "password123",
    photo: "https://randomuser.me/api/portraits/men/3.jpg"
  }
];

/**
 * Create a single user in the database
 */
async function createUser(userData: UserData): Promise<void> {
  try {
    // Check if user already exists
    const existingUser = await prisma.personnels.findUnique({
      where: { npp: userData.npp }
    });

    if (existingUser) {
      console.log(`⚠️  User with NPP ${userData.npp} already exists, skipping...`);
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create the user
    const newUser = await prisma.personnels.create({
      data: {
        npp: userData.npp,
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        photo: userData.photo
      }
    });

    console.log(`✅ Created user: ${userData.name} (${userData.npp}) with ID: ${newUser.id}`);
  } catch (error) {
    console.error(`❌ Failed to create user ${userData.name} (${userData.npp}):`, error);
  }
}

/**
 * Create all dummy users
 */
async function createDummyUsers(): Promise<void> {
  console.log('🚀 Creating dummy users...');
  
  try {
    for (const userData of dummyUsers) {
      await createUser(userData);
    }
    console.log('✅ All dummy users created successfully!');
  } catch (error) {
    console.error('❌ Error creating dummy users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the script
createDummyUsers()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
