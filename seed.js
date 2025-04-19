import mongoose from "mongoose";
import { User } from "./models/user.model.js";
import { Course } from "./models/course.model.js";
import { Lecture } from "./models/lecture.model.js";
import { CourseProgress } from "./models/courseProgress.js";
import { CoursePurchase } from "./models/coursePurchase.model.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const sampleUsers = [
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    role: "instructor",
    photoUrl: "https://randomuser.me/api/portraits/men/1.jpg"
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    role: "instructor",
    photoUrl: "https://randomuser.me/api/portraits/women/1.jpg"
  },
  {
    name: "Student One",
    email: "student1@example.com",
    password: "password123",
    role: "student",
    photoUrl: "https://randomuser.me/api/portraits/men/2.jpg"
  },
  {
    name: "Student Two",
    email: "student2@example.com",
    password: "password123",
    role: "student",
    photoUrl: "https://randomuser.me/api/portraits/women/2.jpg"
  }
];

const sampleCourses = [
  {
    courseTitle: "Introduction to Web Development",
    subTitle: "Learn the basics of HTML, CSS, and JavaScript",
    description: "A comprehensive course covering the fundamentals of web development. Perfect for beginners who want to start their journey in web development.",
    category: "Web Development",
    courseLevel: "Beginner",
    coursePrice: 49.99,
    courseThumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3",
    isPublished: true
  },
  {
    courseTitle: "Advanced JavaScript",
    subTitle: "Master modern JavaScript concepts and frameworks",
    description: "Deep dive into advanced JavaScript concepts and popular frameworks like React and Node.js.",
    category: "Web Development",
    courseLevel: "Advance",
    coursePrice: 79.99,
    courseThumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3",
    isPublished: true
  },
  {
    courseTitle: "Python for Data Science",
    subTitle: "Learn Python programming for data analysis",
    description: "Comprehensive course on using Python for data science and analysis with popular libraries like NumPy and Pandas.",
    category: "Data Science",
    courseLevel: "Medium",
    coursePrice: 59.99,
    courseThumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-4.0.3",
    isPublished: true
  },
  {
    courseTitle: "Mobile App Development with React Native",
    subTitle: "Build cross-platform mobile apps",
    description: "Learn to build beautiful mobile applications for both iOS and Android using React Native.",
    category: "Mobile Development",
    courseLevel: "Medium",
    coursePrice: 69.99,
    courseThumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3",
    isPublished: true
  }
];

const sampleLectures = [
  {
    title: "Introduction to the Course",
    description: "Welcome to the course! Let's get started with the basics.",
    isPreviewFree: true
  },
  {
    title: "Getting Started",
    description: "Setting up your development environment and first steps.",
    isPreviewFree: false
  },
  {
    title: "Core Concepts",
    description: "Understanding the fundamental concepts of the subject.",
    isPreviewFree: false
  },
  {
    title: "Advanced Topics",
    description: "Diving deeper into more complex concepts and techniques.",
    isPreviewFree: false
  },
  {
    title: "Project Work",
    description: "Applying what you've learned in a real-world project.",
    isPreviewFree: false
  }
];

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lecture.deleteMany({});
    await CourseProgress.deleteMany({});
    await CoursePurchase.deleteMany({});
    console.log("Cleared existing data");

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

    // Create sample courses
    const courses = await Promise.all(
      sampleCourses.map((course, index) => {
        return Course.create({
          ...course,
          creator: users[index % 2]._id // Assign to instructors
        });
      })
    );
    console.log("Created sample courses");

    // Create sample lectures and associate with courses
    for (const course of courses) {
      const lectures = await Promise.all(
        sampleLectures.map(lecture => Lecture.create({
          lectureTitle: lecture.title,
          description: lecture.description,
          isPreviewFree: lecture.isPreviewFree,
          courseId: course._id
        }))
      );

      course.lectures = lectures.map(lecture => lecture._id);
      await course.save();
    }
    console.log("Created sample lectures");

    // Create course progress for students
    const students = users.filter(user => user.role === 'student');
    for (const student of students) {
      for (const course of courses) {
        await CourseProgress.create({
          userId: student._id,
          courseId: course._id,
          completed: false,
          lectureProgress: course.lectures.map(lectureId => ({
            lectureId,
            viewed: false
          }))
        });
      }
    }
    console.log("Created course progress records");

    // Create some course purchases
    for (const student of students) {
      const randomCourse = courses[Math.floor(Math.random() * courses.length)];
      await CoursePurchase.create({
        courseId: randomCourse._id,
        userId: student._id,
        amount: randomCourse.coursePrice,
        status: 'completed',
        paymentId: `pay_${Math.random().toString(36).substr(2, 9)}`
      });
    }
    console.log("Created course purchases");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase(); 