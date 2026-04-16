require('dotenv').config();
const sequelize = require('./database');
const { User, Job, Candidate, Application, Interview } = require('../models');

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced.');

    // Create users
    const admin = await User.create({
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'admin@ciglobalsolutions.com',
      password: 'password123',
      role: 'admin',
      department: 'Human Resources',
    });

    const recruiter = await User.create({
      firstName: 'Mike',
      lastName: 'Chen',
      email: 'recruiter@ciglobalsolutions.com',
      password: 'password123',
      role: 'recruiter',
      department: 'Talent Acquisition',
    });

    const hiringManager = await User.create({
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'manager@ciglobalsolutions.com',
      password: 'password123',
      role: 'hiring_manager',
      department: 'Engineering',
    });

    console.log('Users created.');

    // Create jobs
    const jobs = await Job.bulkCreate([
      {
        title: 'Senior Frontend Engineer',
        department: 'Engineering',
        location: 'San Francisco, CA (Hybrid)',
        type: 'full-time',
        experience: '5+ years',
        salaryMin: 150000,
        salaryMax: 200000,
        description: 'We are looking for a Senior Frontend Engineer to lead the development of our next-generation web platform. You will work closely with product designers and backend engineers to build performant, accessible, and delightful user experiences.',
        requirements: 'Expert-level React/TypeScript skills. Experience with state management (Redux, Zustand). Strong understanding of web performance optimization. Experience with design systems and component libraries.',
        responsibilities: 'Lead frontend architecture decisions. Mentor junior developers. Collaborate with design and product teams. Own technical roadmap for frontend platform.',
        skills: JSON.stringify(['React', 'TypeScript', 'Next.js', 'GraphQL', 'CSS-in-JS', 'Testing', 'Performance']),
        status: 'published',
        priority: 'high',
        publishedAt: new Date(),
        hiringManagerId: hiringManager.id,
        applicationCount: 0,
      },
      {
        title: 'Senior Data Engineer',
        department: 'Data',
        location: 'Remote',
        type: 'remote',
        experience: '4+ years',
        salaryMin: 140000,
        salaryMax: 190000,
        description: 'Join our data team to build and maintain scalable data pipelines and infrastructure. You will work with petabyte-scale datasets and cutting-edge technologies.',
        requirements: 'Strong Python and SQL skills. Experience with Spark, Airflow, or similar. Cloud experience (AWS/GCP). Understanding of data modeling and warehousing concepts.',
        responsibilities: 'Design and implement ETL pipelines. Optimize data warehouse performance. Collaborate with data scientists and analysts. Monitor data quality and reliability.',
        skills: JSON.stringify(['Python', 'Spark', 'SQL', 'Airflow', 'AWS', 'Data Modeling', 'Kafka']),
        status: 'published',
        priority: 'medium',
        publishedAt: new Date(),
        hiringManagerId: hiringManager.id,
        applicationCount: 0,
      },
      {
        title: 'Product Designer',
        department: 'Design',
        location: 'New York, NY',
        type: 'full-time',
        experience: '3+ years',
        salaryMin: 120000,
        salaryMax: 160000,
        description: 'We need a talented Product Designer to shape the user experience of our B2B SaaS platform. You will own the end-to-end design process from research to high-fidelity prototypes.',
        requirements: 'Strong portfolio showing B2B/SaaS design work. Proficiency in Figma. Experience with user research and usability testing. Understanding of design systems.',
        responsibilities: 'Conduct user research and usability studies. Create wireframes, prototypes, and high-fidelity designs. Collaborate with engineers on implementation. Contribute to and maintain the design system.',
        skills: JSON.stringify(['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Usability Testing']),
        status: 'published',
        priority: 'medium',
        publishedAt: new Date(),
        hiringManagerId: admin.id,
        applicationCount: 0,
      },
      {
        title: 'DevOps Engineer',
        department: 'Infrastructure',
        location: 'Austin, TX (Hybrid)',
        type: 'full-time',
        experience: '3+ years',
        salaryMin: 130000,
        salaryMax: 175000,
        description: 'Looking for a DevOps Engineer to improve our CI/CD pipelines, infrastructure automation, and cloud operations.',
        requirements: 'Experience with Kubernetes, Docker, Terraform. Strong Linux administration skills. CI/CD pipeline design (GitHub Actions, Jenkins). Monitoring and observability tools.',
        responsibilities: 'Manage Kubernetes clusters. Automate infrastructure with Terraform. Improve deployment pipelines. Implement monitoring and alerting.',
        skills: JSON.stringify(['Kubernetes', 'Docker', 'Terraform', 'AWS', 'CI/CD', 'Linux', 'Monitoring']),
        status: 'published',
        priority: 'high',
        publishedAt: new Date(),
        hiringManagerId: hiringManager.id,
        applicationCount: 0,
      },
      {
        title: 'Marketing Manager',
        department: 'Marketing',
        location: 'Chicago, IL',
        type: 'full-time',
        experience: '5+ years',
        salaryMin: 100000,
        salaryMax: 140000,
        description: 'We are seeking an experienced Marketing Manager to drive our go-to-market strategy and brand growth.',
        requirements: 'Proven track record in B2B marketing. Experience with marketing automation platforms. Strong analytical and communication skills.',
        responsibilities: 'Develop and execute marketing campaigns. Manage marketing budget. Analyze campaign performance. Lead a small marketing team.',
        skills: JSON.stringify(['Marketing Strategy', 'Content Marketing', 'SEO', 'Analytics', 'Team Leadership']),
        status: 'draft',
        priority: 'low',
        hiringManagerId: admin.id,
        applicationCount: 0,
      },
    ]);

    console.log('Jobs created.');

    // Create candidates
    const candidates = await Candidate.bulkCreate([
      {
        firstName: 'Alex',
        lastName: 'Thompson',
        email: 'alex.thompson@email.com',
        phone: '+1-555-0101',
        location: 'San Francisco, CA',
        currentTitle: 'Frontend Developer',
        currentCompany: 'TechCorp Inc.',
        experienceYears: 6,
        skills: JSON.stringify(['React', 'TypeScript', 'Next.js', 'GraphQL', 'Node.js', 'CSS']),
        resumeText: 'Experienced frontend developer with 6 years of experience building modern web applications. Expert in React, TypeScript, and Next.js. Led the redesign of a major e-commerce platform serving 2M+ users. Strong focus on performance optimization and accessibility. Built and maintained a component library used across 5 product teams.',
        source: 'linkedin',
        tags: JSON.stringify(['senior', 'frontend', 'react']),
      },
      {
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@email.com',
        phone: '+1-555-0102',
        location: 'Remote',
        currentTitle: 'Senior Data Engineer',
        currentCompany: 'DataFlow Systems',
        experienceYears: 5,
        skills: JSON.stringify(['Python', 'Spark', 'SQL', 'Airflow', 'AWS', 'Kafka', 'Snowflake']),
        resumeText: 'Senior Data Engineer with 5 years experience in building large-scale data pipelines. Expertise in Python, Spark, and AWS. Designed ETL processes handling 50TB+ daily. Reduced pipeline processing time by 60% through optimization. Experience with real-time streaming using Kafka.',
        source: 'referral',
        tags: JSON.stringify(['senior', 'data', 'python']),
      },
      {
        firstName: 'Jordan',
        lastName: 'Lee',
        email: 'jordan.lee@email.com',
        phone: '+1-555-0103',
        location: 'New York, NY',
        currentTitle: 'UX Designer',
        currentCompany: 'Creative Agency',
        experienceYears: 4,
        skills: JSON.stringify(['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Adobe Creative Suite']),
        resumeText: 'Product/UX Designer with 4 years of experience. Specializing in B2B SaaS products. Led the redesign of a healthcare SaaS platform, improving user satisfaction scores by 40%. Strong background in user research and data-driven design decisions.',
        source: 'website',
        tags: JSON.stringify(['mid-level', 'design', 'ux']),
      },
      {
        firstName: 'Marcus',
        lastName: 'Williams',
        email: 'marcus.williams@email.com',
        phone: '+1-555-0104',
        location: 'Austin, TX',
        currentTitle: 'Systems Engineer',
        currentCompany: 'CloudOps Ltd.',
        experienceYears: 4,
        skills: JSON.stringify(['Kubernetes', 'Docker', 'Terraform', 'AWS', 'Linux', 'Python', 'Go']),
        resumeText: 'DevOps/Systems Engineer with 4 years of experience managing cloud infrastructure. Certified AWS Solutions Architect. Managed Kubernetes clusters serving 500+ microservices. Automated infrastructure provisioning using Terraform, reducing deployment time by 70%.',
        source: 'job-board',
        tags: JSON.stringify(['mid-level', 'devops', 'kubernetes']),
      },
      {
        firstName: 'Sophie',
        lastName: 'Martinez',
        email: 'sophie.martinez@email.com',
        phone: '+1-555-0105',
        location: 'Chicago, IL',
        currentTitle: 'Junior Frontend Developer',
        currentCompany: 'WebStart Inc.',
        experienceYears: 2,
        skills: JSON.stringify(['React', 'JavaScript', 'HTML', 'CSS', 'Git']),
        resumeText: 'Junior Frontend Developer with 2 years of experience. Passionate about building accessible web applications. Contributed to open-source React projects. Eager to learn and grow in a collaborative team environment.',
        source: 'website',
        tags: JSON.stringify(['junior', 'frontend', 'react']),
      },
      {
        firstName: 'David',
        lastName: 'Kim',
        email: 'david.kim@email.com',
        phone: '+1-555-0106',
        location: 'Seattle, WA',
        currentTitle: 'Staff Engineer',
        currentCompany: 'MegaTech',
        experienceYears: 10,
        skills: JSON.stringify(['React', 'TypeScript', 'System Design', 'Leadership', 'Performance', 'Architecture']),
        resumeText: 'Staff-level engineer with 10 years of experience. Led frontend architecture for products with 10M+ users. Expert in React, TypeScript, and performance optimization. Mentored 15+ engineers. Authored internal technical standards and best practices.',
        source: 'referral',
        tags: JSON.stringify(['staff', 'frontend', 'leadership']),
      },
    ]);

    console.log('Candidates created.');

    // Create applications
    const applications = await Application.bulkCreate([
      {
        jobId: jobs[0].id,
        candidateId: candidates[0].id,
        status: 'interview',
        aiScore: 88,
        aiAnalysis: JSON.stringify({ score: 88, summary: 'Strong candidate with relevant experience', recommendation: 'Recommended for next round' }),
        aiStrengths: JSON.stringify(['Strong React/TS skills', 'Performance optimization experience', 'Component library experience']),
        aiWeaknesses: JSON.stringify(['Could have more leadership experience']),
        rating: 4,
        recruiterNotes: 'Very strong technical background. Schedule technical interview.',
      },
      {
        jobId: jobs[0].id,
        candidateId: candidates[4].id,
        status: 'screening',
        aiScore: 52,
        aiAnalysis: JSON.stringify({ score: 52, summary: 'Junior candidate, below experience requirements', recommendation: 'Not recommended' }),
        aiStrengths: JSON.stringify(['Enthusiasm for learning', 'React basics']),
        aiWeaknesses: JSON.stringify(['Only 2 years experience (5+ required)', 'No TypeScript experience', 'No architectural experience']),
        rating: 2,
      },
      {
        jobId: jobs[0].id,
        candidateId: candidates[5].id,
        status: 'offer',
        aiScore: 95,
        aiAnalysis: JSON.stringify({ score: 95, summary: 'Exceptional candidate, staff-level experience', recommendation: 'Strong Hire' }),
        aiStrengths: JSON.stringify(['10 years experience', 'Leadership and mentoring', 'Architecture expertise', 'Performance optimization']),
        aiWeaknesses: JSON.stringify(['May be overqualified', 'Salary expectations may be high']),
        rating: 5,
        recruiterNotes: 'Outstanding candidate. Fast-track to offer.',
      },
      {
        jobId: jobs[1].id,
        candidateId: candidates[1].id,
        status: 'technical',
        aiScore: 91,
        aiAnalysis: JSON.stringify({ score: 91, summary: 'Excellent match for data engineering role', recommendation: 'Strong Hire' }),
        aiStrengths: JSON.stringify(['Spark and Python expertise', 'AWS certified', 'Large-scale pipeline experience']),
        aiWeaknesses: JSON.stringify(['Limited management experience']),
        rating: 5,
      },
      {
        jobId: jobs[2].id,
        candidateId: candidates[2].id,
        status: 'shortlisted',
        aiScore: 82,
        aiAnalysis: JSON.stringify({ score: 82, summary: 'Strong designer with relevant B2B SaaS experience', recommendation: 'Recommended for next round' }),
        aiStrengths: JSON.stringify(['B2B SaaS design experience', 'User research skills', 'Measurable impact on user satisfaction']),
        aiWeaknesses: JSON.stringify(['Could have more design system experience']),
        rating: 4,
      },
      {
        jobId: jobs[3].id,
        candidateId: candidates[3].id,
        status: 'interview',
        aiScore: 85,
        aiAnalysis: JSON.stringify({ score: 85, summary: 'Well-qualified DevOps candidate', recommendation: 'Recommended for next round' }),
        aiStrengths: JSON.stringify(['Kubernetes expertise', 'AWS certified', 'Infrastructure automation']),
        aiWeaknesses: JSON.stringify(['Relatively fewer years of experience']),
        rating: 4,
        recruiterNotes: 'Good cultural fit. Strong technical skills.',
      },
    ]);

    console.log('Applications created.');

    // Update application counts
    await jobs[0].update({ applicationCount: 3 });
    await jobs[1].update({ applicationCount: 1 });
    await jobs[2].update({ applicationCount: 1 });
    await jobs[3].update({ applicationCount: 1 });

    // Create interviews
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(14, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(11, 0, 0, 0);

    await Interview.bulkCreate([
      {
        applicationId: applications[0].id,
        type: 'technical',
        scheduledAt: tomorrow,
        duration: 90,
        meetingLink: 'https://meet.example.com/interview-001',
        interviewers: JSON.stringify(['Emily Davis', 'John Park']),
        status: 'scheduled',
        aiQuestions: JSON.stringify([
          { question: 'Explain how React reconciliation works and its performance implications.', category: 'technical', difficulty: 'hard' },
          { question: 'How would you architect a micro-frontend system?', category: 'architecture', difficulty: 'hard' },
          { question: 'Describe your approach to improving Core Web Vitals.', category: 'performance', difficulty: 'medium' },
        ]),
        scheduledBy: recruiter.id,
      },
      {
        applicationId: applications[3].id,
        type: 'technical',
        scheduledAt: dayAfter,
        duration: 60,
        meetingLink: 'https://meet.example.com/interview-002',
        interviewers: JSON.stringify(['Emily Davis']),
        status: 'scheduled',
        scheduledBy: recruiter.id,
      },
      {
        applicationId: applications[5].id,
        type: 'video',
        scheduledAt: nextWeek,
        duration: 45,
        meetingLink: 'https://meet.example.com/interview-003',
        interviewers: JSON.stringify(['Mike Chen', 'Emily Davis']),
        status: 'scheduled',
        scheduledBy: recruiter.id,
      },
    ]);

    console.log('Interviews created.');
    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest accounts:');
    console.log('  Admin:          admin@ciglobalsolutions.com / password123');
    console.log('  Recruiter:      recruiter@ciglobalsolutions.com / password123');
    console.log('  Hiring Manager: manager@ciglobalsolutions.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
