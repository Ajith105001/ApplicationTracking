const Anthropic = require('@anthropic-ai/sdk');

class ClaudeService {
  constructor() {
    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-anthropic-api-key') {
      this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    } else {
      this.client = null;
      console.warn('⚠ Claude AI: No valid API key. AI features will return mock data.');
    }
    this.model = 'claude-sonnet-4-20250514';
  }

  async _call(systemPrompt, userMessage, maxTokens = 2048) {
    if (!this.client) {
      return this._mockResponse(systemPrompt);
    }
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });
      return response.content[0].text;
    } catch (error) {
      console.error('Claude API error:', error.message);
      return this._mockResponse(systemPrompt);
    }
  }

  _mockResponse(systemPrompt) {
    // Must check most-specific patterns FIRST before broad ones like 'resume'
    if (systemPrompt.includes('parse') && systemPrompt.includes('extract')) {
      return JSON.stringify({
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'alex.johnson@email.com',
        phone: '+91 98765 43210',
        location: 'Bangalore, India',
        currentTitle: 'Senior Software Engineer',
        currentCompany: 'Tech Innovations Pvt Ltd',
        experienceYears: 5,
        skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB', 'PostgreSQL', 'Docker'],
        linkedinUrl: 'linkedin.com/in/alexjohnson',
        resumeSummary: 'Experienced full-stack engineer with 5 years building scalable web applications. Strong expertise in React and Node.js with cloud deployment experience on AWS.',
      });
    }
    if (systemPrompt.includes('match') && systemPrompt.includes('job')) {
      return JSON.stringify([
        { jobId: null, matchScore: 92, reasons: ['Strong React/Node.js skills match', 'Experience level aligns perfectly', 'Full-stack expertise is a key requirement'], missingSkills: [] },
        { jobId: null, matchScore: 78, reasons: ['Good technical foundation', 'Cloud experience relevant'], missingSkills: ['GraphQL', 'Kubernetes'] },
      ]);
    }
    if (systemPrompt.includes('candidate profile summarization')) {
      return JSON.stringify({
        summary: 'Accomplished senior engineer with 5-6 years of proven expertise in full-stack development. Demonstrates strong technical capabilities across React, Node.js, TypeScript, and cloud platforms. Shows excellent problem-solving skills and has delivered high-impact projects affecting thousands of users. Good potential for leadership roles.',
        topSkills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'],
        experienceLevel: 'Senior (5-6 years)',
        cultureFit: 'Strong collaborative team player with agile experience. Shows initiative and communication skills that align well with cross-functional environments.',
      });
    }
    if (systemPrompt.includes('resume') || systemPrompt.includes('Resume')) {
      return JSON.stringify({
        score: Math.floor(Math.random() * 30) + 65,
        strengths: ['Relevant technical skills', 'Strong educational background', 'Good project experience'],
        weaknesses: ['Limited leadership experience', 'Could improve communication skills'],
        summary: 'Candidate demonstrates solid technical capabilities with relevant industry experience. Good cultural fit potential with areas for growth in leadership.',
        recommendation: 'Recommended for next round',
      });
    }
    if (systemPrompt.includes('interview') || systemPrompt.includes('Interview')) {
      return JSON.stringify({
        questions: [
          { question: 'Describe a challenging project where you had to learn a new technology quickly.', category: 'adaptability', difficulty: 'medium' },
          { question: 'How do you approach code reviews and giving feedback to teammates?', category: 'collaboration', difficulty: 'medium' },
          { question: 'Walk me through your approach to debugging a complex production issue.', category: 'problem-solving', difficulty: 'hard' },
          { question: 'How do you prioritize tasks when working on multiple projects simultaneously?', category: 'time-management', difficulty: 'medium' },
          { question: 'Describe your experience with CI/CD pipelines and deployment strategies.', category: 'technical', difficulty: 'medium' },
        ],
      });
    }
    if (systemPrompt.includes('email') || systemPrompt.includes('Email')) {
      return JSON.stringify({
        subject: 'Update Regarding Your Application',
        body: 'Thank you for your interest in the position and for taking the time to interview with our team. After careful consideration, we have decided to move forward with other candidates whose experience more closely aligns with our current needs. We were impressed with your qualifications and encourage you to apply for future positions. We wish you the best in your career journey.',
      });
    }
    if (systemPrompt.includes('recruiter remarks')) {
      return JSON.stringify({ remarks: '__MOCK__' });
    }
    return JSON.stringify({ result: 'AI analysis completed', details: 'Mock response - configure ANTHROPIC_API_KEY for live AI features.' });
  }

  async screenResume(resumeText, jobDescription, jobRequirements) {
    const systemPrompt = `You are an expert HR recruiter AI assistant for resume screening. Analyze the candidate's resume against the job description and requirements. Return a JSON object with these exact keys:
- score (number 0-100): overall fit score
- strengths (array of strings): top 3-5 strengths
- weaknesses (array of strings): top 2-3 areas of concern
- summary (string): 2-3 sentence candidate summary
- recommendation (string): one of "Strong Hire", "Recommended for next round", "Maybe", "Not recommended"`;

    const userMessage = `## Job Description\n${jobDescription}\n\n## Requirements\n${jobRequirements}\n\n## Candidate Resume\n${resumeText}`;
    
    const result = await this._call(systemPrompt, userMessage);
    try {
      return JSON.parse(result);
    } catch {
      return { score: 0, strengths: [], weaknesses: [], summary: result, recommendation: 'Review manually' };
    }
  }

  async generateInterviewQuestions(jobTitle, jobDescription, skills, interviewType) {
    const systemPrompt = `You are an expert Interview preparation AI. Generate role-specific interview questions. Return a JSON object with a "questions" array, each item having: question (string), category (string), difficulty (easy/medium/hard).`;

    const userMessage = `Generate 5 ${interviewType || 'behavioral and technical'} interview questions for:\nRole: ${jobTitle}\nDescription: ${jobDescription}\nRequired Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}`;

    const result = await this._call(systemPrompt, userMessage);
    try {
      return JSON.parse(result);
    } catch {
      return { questions: [{ question: result, category: 'general', difficulty: 'medium' }] };
    }
  }

  async generateEmail(type, context) {
    // context is a rich object: { candidateName, candidateEmail, jobTitle, jobDepartment, jobLocation,
    //   applicationStatus, aiScore, aiStrengths, aiWeaknesses, aiRecommendation,
    //   upcomingInterview, recruiterNotes, extraContext }
    const c = typeof context === 'string' ? { candidateName: context } : context;
    const candidateName = c.candidateName || 'Candidate';
    const jobTitle = c.jobTitle || 'the position';
    const department = c.jobDepartment ? ` in ${c.jobDepartment}` : '';
    const location = c.jobLocation ? ` (${c.jobLocation})` : '';
    const scoreNote = c.aiScore ? `AI fit score: ${c.aiScore}%.` : '';
    const strengthsSummary = (c.aiStrengths || []).slice(0, 2).join('; ');
    const interview = c.upcomingInterview;

    const systemPrompt = `You are a professional HR email drafting assistant for CI Global Solutions. 
Draft a ${type} email that is:
- Personalized with the candidate's actual name: ${candidateName}
- Specific to the role: ${jobTitle}${department}${location}
- Professional, warm, and brand-consistent
- ${scoreNote}
${strengthsSummary ? `- Highlight these strengths: ${strengthsSummary}` : ''}
Return a JSON object with "subject" (string) and "body" (string, with proper paragraphs separated by \\n\\n).`;

    const userMessage = `Generate a ${type} email.
Candidate: ${candidateName}
Role: ${jobTitle}${department}${location}
Application status: ${c.applicationStatus || 'unknown'}
${c.aiScore ? `AI Fit Score: ${c.aiScore}%` : ''}
${c.aiRecommendation ? `AI Recommendation: ${c.aiRecommendation}` : ''}
${(c.aiStrengths || []).length > 0 ? `Key Strengths: ${c.aiStrengths.join(', ')}` : ''}
${(c.aiWeaknesses || []).length > 0 ? `Areas of concern: ${c.aiWeaknesses.join(', ')}` : ''}
${interview ? `Interview scheduled: ${new Date(interview.scheduledAt).toLocaleString()} (${interview.type}, ${interview.duration} min)` : ''}
${interview?.meetingLink ? `Meeting link: ${interview.meetingLink}` : ''}
${c.recruiterNotes ? `Recruiter notes: ${c.recruiterNotes}` : ''}
${c.extraContext ? `Additional context: ${c.extraContext}` : ''}`;

    if (!this.client) {
      // Personalized mock responses per type
      const firstName = candidateName.split(' ')[0];
      const mocks = {
        rejection: {
          subject: `Your Application for ${jobTitle} at CI Global Solutions`,
          body: `Dear ${candidateName},\n\nThank you for taking the time to apply for the ${jobTitle} role${department} at CI Global Solutions and for your interest in joining our team.\n\nAfter careful review of your application${c.aiScore ? ` (AI fit score: ${c.aiScore}%)` : ''}, we have decided to move forward with other candidates whose experience more closely aligns with our current requirements.\n\n${strengthsSummary ? `We were genuinely impressed by your ${strengthsSummary}. ` : ''}This was a competitive process, and we encourage you to apply for future openings that match your profile.\n\nWe wish you every success in your career journey and hope our paths cross again.\n\nWarm regards,\nTalent Acquisition Team\nCI Global Solutions`,
        },
        offer: {
          subject: `Job Offer — ${jobTitle} at CI Global Solutions`,
          body: `Dear ${candidateName},\n\nI am thrilled to extend a formal offer of employment for the position of ${jobTitle}${department}${location} at CI Global Solutions.\n\n${c.aiScore ? `Your profile stood out with an exceptional fit score of ${c.aiScore}% — ` : ''}You demonstrated outstanding capabilities throughout the process${strengthsSummary ? `, particularly your ${strengthsSummary}` : ''}.\n\nWe will be sending the full offer letter with compensation details, start date, and benefits package via a separate document shortly. Please review and revert with your acceptance within 5 business days.\n\nWe are excited about the prospect of you joining our team and look forward to working together.\n\nCongratulations, ${firstName}!\n\nBest regards,\nTalent Acquisition Team\nCI Global Solutions`,
        },
        'interview invitation': {
          subject: `Interview Invitation — ${jobTitle} | CI Global Solutions`,
          body: `Dear ${candidateName},\n\nThank you for applying for the ${jobTitle} role${department} at CI Global Solutions. We have reviewed your application and are pleased to invite you for an interview.\n\n${interview ? `📅 Date & Time: ${new Date(interview.scheduledAt).toLocaleString()}\n⏱ Duration: ${interview.duration} minutes\n🎙 Format: ${interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} interview${interview.meetingLink ? `\n🔗 Meeting Link: ${interview.meetingLink}` : ''}` : 'We will follow up shortly with the interview schedule and format details.'}\n\nPlease come prepared to discuss your experience${strengthsSummary ? `, especially your background in ${strengthsSummary}` : ''}, and feel free to review the job description beforehand.\n\nKindly confirm your availability by replying to this email.\n\nLooking forward to speaking with you!\n\nBest regards,\nTalent Acquisition Team\nCI Global Solutions`,
        },
        'follow-up': {
          subject: `Following Up — ${jobTitle} Application | CI Global Solutions`,
          body: `Dear ${candidateName},\n\nI hope this message finds you well. I am writing to follow up on your application for the ${jobTitle} position${department} at CI Global Solutions.\n\nWe have been reviewing applications and your profile${c.aiScore ? ` (AI fit score: ${c.aiScore}%)` : ''} has caught our attention${strengthsSummary ? `, particularly your ${strengthsSummary}` : ''}.\n\nOur team is currently in the final stages of review. We aim to get back to all candidates by the end of this week. In the meantime, please do not hesitate to reach out if you have any questions about the role or process.\n\nThank you for your patience and continued interest in CI Global Solutions.\n\nBest regards,\nTalent Acquisition Team\nCI Global Solutions`,
        },
      };
      return mocks[type] || mocks.rejection;
    }

    try {
      const result = await this._call(systemPrompt, userMessage, 1024);
      const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return { subject: `Re: ${jobTitle} Application`, body: `Dear ${candidateName},\n\nThank you for your application for ${jobTitle}.\n\nBest regards,\nTalent Acquisition Team\nCI Global Solutions` };
    }
  }

  async generateRemarks(context) {
    // context: { candidateName, jobTitle, jobDepartment, status, aiScore, aiStrengths, aiWeaknesses, aiSummary, aiRecommendation, recruiterNotes }
    const { candidateName, jobTitle, jobDepartment, status, aiScore, aiStrengths = [], aiWeaknesses = [], aiSummary, aiRecommendation } = context;
    const dept = jobDepartment ? ` (${jobDepartment})` : '';

    const systemPrompt = `You are an experienced HR recruiter writing concise recruiter remarks about a candidate. Write 2-3 factual, specific sentences that summarize: the AI screening outcome, key strengths, any concerns, and a clear next-step recommendation. Be direct and actionable.`;

    const userMessage = `Generate recruiter remarks for this application:
Candidate: ${candidateName}
Role: ${jobTitle}${dept}
Current Status: ${status}
AI Fit Score: ${aiScore || 'Not screened'}%
AI Summary: ${aiSummary || 'N/A'}
Key Strengths: ${aiStrengths.join(', ') || 'None identified'}
Concerns: ${aiWeaknesses.join(', ') || 'None identified'}
AI Recommendation: ${aiRecommendation || 'N/A'}

Return a JSON object with a single key "remarks" (string, 2-3 sentences, plain text).`;

    if (!this.client) {
      // Build a data-driven mock from the actual context
      const firstName = candidateName?.split(' ')[0] || 'Candidate';
      const scoreText = aiScore ? `AI screening score: ${aiScore}%` : 'AI screening not yet completed';
      const strengthText = aiStrengths.length > 0 ? `Key strengths include ${aiStrengths.slice(0, 2).join(' and ')}.` : '';
      const concernText = aiWeaknesses.length > 0 ? `Note: ${aiWeaknesses[0].toLowerCase()}.` : '';
      const recText = aiRecommendation ? ` ${aiRecommendation}.` : '';
      return { remarks: `${firstName}'s application for ${jobTitle}: ${scoreText}.${recText} ${strengthText} ${concernText}`.replace(/\s+/g, ' ').trim() };
    }

    try {
      const result = await this._call(systemPrompt, userMessage, 512);
      const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return { remarks: `${candidateName} — ${jobTitle}: AI fit score ${aiScore || 'N/A'}%. ${aiRecommendation || ''}`.trim() };
    }
  }

  async summarizeCandidate(resumeText, applications) {
    const systemPrompt = `You are a candidate profile summarization AI. Create a concise, insightful summary of the candidate based on their resume and application history. Return a JSON object with: summary (string, 3-4 sentences), topSkills (array of top 5 skills), experienceLevel (string like "Junior (1-2 years)" / "Mid-level (3-4 years)" / "Senior (5+ years)"), cultureFit (string, 1-2 sentences).`;

    const appSummary = (applications || []).map(a => ({
      job: a.Job?.title || 'Unknown',
      status: a.status,
      aiScore: a.aiScore,
    }));

    const userMessage = `## Resume\n${resumeText}\n\n## Application History\n${JSON.stringify(appSummary)}`;

    const result = await this._call(systemPrompt, userMessage);
    try {
      const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return { summary: result, topSkills: [], experienceLevel: 'Unknown', cultureFit: 'Review needed' };
    }
  }

  async analyzeHiringTrends(data) {
    const systemPrompt = `You are an HR Analytics AI. Analyze hiring data and provide insights. Return a JSON object with: insights (array of strings), bottlenecks (array of strings), recommendations (array of strings).`;

    const userMessage = `Analyze this hiring data and provide insights:\n${JSON.stringify(data)}`;

    const result = await this._call(systemPrompt, userMessage);
    try {
      return JSON.parse(result);
    } catch {
      return { insights: [result], bottlenecks: [], recommendations: [] };
    }
  }

  async generateJobDescription({ title, department, location, type, experience, skills }) {
    const dept = department || 'Engineering';
    const loc = location || 'India';
    const exp = experience || '3+ years';
    const skillList = Array.isArray(skills) ? skills.join(', ') : (skills || 'relevant technologies');
    const jobType = type || 'full-time';

    const systemPrompt = `You are an expert HR copywriter for CI Global Solutions. Write a professional, engaging job posting. Return a JSON object with exactly these keys:
- description (string): 3-4 sentence compelling role overview
- requirements (string): 5-7 bullet points starting with "- ", covering education, experience, and technical skills
- responsibilities (string): 6-8 bullet points starting with "- ", covering day-to-day duties`;

    const userMessage = `Generate a complete job posting for:
Title: ${title}
Department: ${dept}
Location: ${loc}
Type: ${jobType}
Experience Required: ${exp}
Key Skills: ${skillList}

Make it specific to the role, professional, and attractive to top candidates.`;

    if (!this.client) {
      // Build a data-driven mock from actual inputs
      return {
        description: `We are seeking an experienced ${title} to join our ${dept} team at CI Global Solutions, ${loc}. In this ${jobType} role, you will design and deliver high-quality solutions that drive measurable business impact. You will collaborate closely with cross-functional teams across product, design, and engineering to build scalable, maintainable systems. This is a fantastic opportunity to grow your career in a fast-paced, innovation-driven environment.`,
        requirements: `- ${exp} of professional experience as a ${title} or in a closely related role\n- Strong proficiency in ${skillList}\n- Proven track record of delivering production-quality work on time\n- Excellent analytical, problem-solving, and communication skills\n- Experience working in agile/scrum development teams\n- Bachelor's degree in Computer Science, Engineering, or equivalent practical experience`,
        responsibilities: `- Design, develop, and maintain robust ${dept.toLowerCase()} solutions aligned with business goals\n- Collaborate with product managers and stakeholders to translate requirements into technical specifications\n- Conduct thorough code reviews and ensure adherence to best practices and coding standards\n- Identify performance bottlenecks and implement optimization strategies\n- Mentor junior team members and contribute to a culture of continuous learning\n- Participate in sprint planning, daily standups, and retrospectives\n- Stay current with industry trends and evaluate new technologies for adoption`,
      };
    }

    try {
      const result = await this._call(systemPrompt, userMessage, 1500);
      const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        description: `We are seeking a ${title} to join our ${dept} team. This is a ${jobType} position based in ${loc} requiring ${exp} of relevant experience.`,
        requirements: `- ${exp} of experience required\n- Proficiency in ${skillList}\n- Strong communication skills`,
        responsibilities: `- Contribute to ${dept} projects\n- Collaborate with cross-functional teams\n- Deliver high-quality solutions`,
      };
    }
  }

  async parseResume(resumeText) {
    const systemPrompt = `You are an expert AI that can parse and extract structured information from resume text. Extract candidate details and return ONLY a valid JSON object with these exact keys:
- firstName (string)
- lastName (string)
- email (string, or empty string if not found)
- phone (string, or empty string if not found)
- location (string, or empty string if not found)
- currentTitle (string: most recent job title)
- currentCompany (string: most recent employer)
- experienceYears (number: total years of professional experience)
- skills (array of strings: technical skills, max 15)
- linkedinUrl (string, or empty string if not found)
- resumeSummary (string: 2-3 sentence professional summary based on the resume)

Be precise and extract only what is explicitly stated in the resume. Do not invent data.`;

    const userMessage = `Parse this resume and return structured JSON data:\n\n${resumeText}`;

    const result = await this._call(systemPrompt, userMessage, 1024);
    try {
      const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        firstName: '', lastName: '', email: '', phone: '', location: '',
        currentTitle: '', currentCompany: '', experienceYears: 0,
        skills: [], linkedinUrl: '', resumeSummary: 'Could not parse resume automatically. Please fill in manually.',
      };
    }
  }

  async matchJobs(candidateProfile, jobs) {
    const systemPrompt = `You are an AI job matching engine. Given a candidate profile and a list of job openings, score how well the candidate matches each job from 0-100. Return a JSON array where each item has:
- jobId (number)
- matchScore (number 0-100)
- reasons (array of 2-3 strings explaining why they match)
- missingSkills (array of strings: skills they lack for that role)

Be realistic and base scores on skills overlap, experience level, and role alignment.`;

    const userMessage = `## Candidate Profile\n${JSON.stringify(candidateProfile)}\n\n## Available Jobs\n${JSON.stringify(jobs)}`;

    const result = await this._call(systemPrompt, userMessage, 2048);
    try {
      const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return jobs.map(j => ({
        jobId: j.id,
        matchScore: Math.floor(Math.random() * 40) + 50,
        reasons: ['Skills partially match role requirements'],
        missingSkills: [],
      }));
    }
  }
}

module.exports = new ClaudeService();
