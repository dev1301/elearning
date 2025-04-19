import mongoose from "mongoose";
import { User } from "./models/user.model.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const sampleUsers = [
  // Admin User
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "Admin@123",
    role: "instructor",
    photoUrl: "https://randomuser.me/api/portraits/men/1.jpg"
  },
  // Instructors
  {
    name: "John Smith",
    email: "john.smith@example.com",
    password: "Instructor@123",
    role: "instructor",
    photoUrl: "https://randomuser.me/api/portraits/men/2.jpg"
  },
  {
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    password: "Instructor@123",
    role: "instructor",
    photoUrl: "https://randomuser.me/api/portraits/women/1.jpg"
  },
  // Students
  {
    name: "Michael Brown",
    email: "michael.b@example.com",
    password: "Student@123",
    role: "student",
    photoUrl: "https://randomuser.me/api/portraits/men/3.jpg"
  },
  {
    name: "Emily Davis",
    email: "emily.d@example.com",
    password: "Student@123",
    role: "student",
    photoUrl: "https://randomuser.me/api/portraits/women/2.jpg"
  },
  {
    name: "David Wilson",
    email: "david.w@example.com",
    password: "Student@123",
    role: "student",
    photoUrl: "https://randomuser.me/api/portraits/men/4.jpg"
  },
  {
    name: "Lisa Anderson",
    email: "lisa.a@example.com",
    password: "Student@123",
    role: "student",
    photoUrl: "https://randomuser.me/api/portraits/women/3.jpg"
  }
];

const seedAuthDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing users
    await User.deleteMany({});
    console.log("Cleared existing users");

    // Create sample users
    const users = await Promise.all(
      sampleUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return User.create({
          ...user,
          password: hashedPassword
        });
      })
    );
    console.log("Created sample users");

    // Print login credentials
    console.log("\nLogin Credentials:");
    console.log("=================");
    sampleUsers.forEach(user => {
      console.log(`\nEmail: ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log(`Role: ${user.role}`);
      console.log("-----------------");
    });

    console.log("\nDatabase seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedAuthDatabase(); 