import { PrismaClient, Permission, Resource } from '@prisma/client';
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
  is_superuser?: boolean;
}

// Interface for group data
interface GroupData {
  name: string;
  permissions: {
    resource: Resource;
    permission: Permission;
  }[];
}

// Array of dummy users to create
const dummyUsers: UserData[] = [
  {
    npp: "12345",
    name: "John Doe",
    email: "john.doe@example.com",
    password: "password123",
    photo: "https://randomuser.me/api/portraits/men/1.jpg",
    is_superuser: true // Admin user
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

// Define default groups with their permissions
const defaultGroups: GroupData[] = [
  {
    name: "Administrators",
    permissions: [
      // Full access to users
      { resource: "USER", permission: "CREATE" },
      { resource: "USER", permission: "READ" },
      { resource: "USER", permission: "UPDATE" },
      { resource: "USER", permission: "DELETE" },
      // Full access to projects
      { resource: "PROJECT", permission: "CREATE" },
      { resource: "PROJECT", permission: "READ" },
      { resource: "PROJECT", permission: "UPDATE" },
      { resource: "PROJECT", permission: "DELETE" },
    ]
  },
  {
    name: "Managers",
    permissions: [
      // Full access to projects
      { resource: "PROJECT", permission: "CREATE" },
      { resource: "PROJECT", permission: "READ" },
      { resource: "PROJECT", permission: "UPDATE" },
      { resource: "PROJECT", permission: "DELETE" },
      // Read-only access to users
      { resource: "USER", permission: "READ" },
    ]
  },
  {
    name: "Staff",
    permissions: [
      // Read-only access to projects
      { resource: "PROJECT", permission: "READ" },
      // No access to users
    ]
  }
];

// User-to-group assignments (by index)
const userGroupAssignments = [
  { userIndex: 0, groupName: "Administrators" }, // John Doe -> Administrators
  { userIndex: 1, groupName: "Managers" },       // Jane Smith -> Managers
  { userIndex: 2, groupName: "Managers" },       // Bob Johnson -> Managers
  { userIndex: 3, groupName: "Staff" },          // Alice Williams -> Staff
  { userIndex: 4, groupName: "Staff" }           // David Brown -> Staff
];

// Direct user permissions (in addition to group permissions)
const userDirectPermissions = [
  { 
    userIndex: 3, // Alice Williams gets special project creation permission
    permissions: [
      { resource: Resource.PROJECT, permission: Permission.CREATE }
    ]
  }
];

/**
 * Create a single user in the database
 */
async function createUser(userData: UserData): Promise<string | null> {
  try {
    // Check if user already exists
    const existingUser = await prisma.personnels.findUnique({
      where: { npp: userData.npp }
    });

    if (existingUser) {
      console.log(`⚠️  User with NPP ${userData.npp} already exists, skipping...`);
      return existingUser.id;
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
        photo: userData.photo,
        is_superuser: userData.is_superuser || false
      }
    });

    console.log(`✅ Created user: ${userData.name} (${userData.npp}) with ID: ${newUser.id}`);
    return newUser.id;
  } catch (error) {
    console.error(`❌ Failed to create user ${userData.name} (${userData.npp}):`, error);
    return null;
  }
}

/**
 * Create a group with permissions
 */
async function createGroup(groupData: GroupData): Promise<string | null> {
  try {
    // Check if group already exists
    const existingGroup = await prisma.groups.findUnique({
      where: { name: groupData.name }
    });

    if (existingGroup) {
      console.log(`⚠️  Group ${groupData.name} already exists, skipping...`);
      return existingGroup.id;
    }

    // Create the group
    const newGroup = await prisma.groups.create({
      data: {
        name: groupData.name,
      }
    });

    console.log(`✅ Created group: ${groupData.name} with ID: ${newGroup.id}`);

    // Add permissions to the group
    if (groupData.permissions && groupData.permissions.length > 0) {
      for (const perm of groupData.permissions) {
        await prisma.groupPermissions.create({
          data: {
            group_id: newGroup.id,
            resource: perm.resource,
            permission: perm.permission
          }
        });
      }
      console.log(`✅ Added ${groupData.permissions.length} permissions to group: ${groupData.name}`);
    }

    return newGroup.id;
  } catch (error) {
    console.error(`❌ Failed to create group ${groupData.name}:`, error);
    return null;
  }
}

/**
 * Assign a user to a group
 */
async function assignUserToGroup(userId: string, groupId: string): Promise<boolean> {
  try {
    // Check if assignment already exists
    const existingAssignment = await prisma.personnelGroups.findFirst({
      where: {
        personnel_id: userId,
        group_id: groupId
      }
    });

    if (existingAssignment) {
      console.log(`⚠️  User ${userId} is already in group ${groupId}, skipping...`);
      return false;
    }

    // Create the assignment
    await prisma.personnelGroups.create({
      data: {
        personnel_id: userId,
        group_id: groupId
      }
    });

    console.log(`✅ Assigned user ${userId} to group ${groupId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to assign user ${userId} to group ${groupId}:`, error);
    return false;
  }
}

/**
 * Add direct permission to user
 */
async function addUserPermission(
  userId: string, 
  resource: Resource, 
  permission: Permission
): Promise<boolean> {
  try {
    // Check if permission already exists
    const existingPermission = await prisma.personnelPermissions.findFirst({
      where: {
        personnel_id: userId,
        resource,
        permission
      }
    });

    if (existingPermission) {
      console.log(`⚠️  User ${userId} already has permission ${permission} on ${resource}, skipping...`);
      return false;
    }

    // Create the permission
    await prisma.personnelPermissions.create({
      data: {
        personnel_id: userId,
        resource,
        permission
      }
    });

    console.log(`✅ Added permission ${permission} on ${resource} to user ${userId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to add permission ${permission} on ${resource} to user ${userId}:`, error);
    return false;
  }
}

/**
 * Create all dummy users, groups, and permissions
 */
async function createDummyData(): Promise<void> {
  console.log('🚀 Creating dummy users, groups, and permissions...');
  
  try {
    // Step 1: Create groups first
    const groupIds: Record<string, string> = {};
    for (const groupData of defaultGroups) {
      const groupId = await createGroup(groupData);
      if (groupId) {
        groupIds[groupData.name] = groupId;
      }
    }
    
    // Step 2: Create users
    const userIds: string[] = [];
    for (const userData of dummyUsers) {
      const userId = await createUser(userData);
      if (userId) {
        userIds.push(userId);
      }
    }
    
    // Step 3: Assign users to groups
    for (const assignment of userGroupAssignments) {
      const userId = userIds[assignment.userIndex];
      const groupId = groupIds[assignment.groupName];
      
      if (userId && groupId) {
        await assignUserToGroup(userId, groupId);
      } else {
        console.log(`⚠️  Could not assign user ${assignment.userIndex} to group ${assignment.groupName} - missing ID`);
      }
    }
    
    // Step 4: Add direct permissions to users
    for (const directPerm of userDirectPermissions) {
      const userId = userIds[directPerm.userIndex];
      
      if (userId) {
        for (const perm of directPerm.permissions) {
          await addUserPermission(userId, perm.resource, perm.permission);
        }
      } else {
        console.log(`⚠️  Could not add permissions to user index ${directPerm.userIndex} - user not found`);
      }
    }
    
    console.log('✅ All dummy data created successfully!');
  } catch (error) {
    console.error('❌ Error creating dummy data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the script
createDummyData()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
