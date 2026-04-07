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

  async generateEmail(type, candidateName, jobTitle, customContext) {
    const systemPrompt = `You are a professional Email drafting assistant for HR teams. Draft a ${type} email that is professional, empathetic, and personalized. Return a JSON object with "subject" and "body" keys.`;

    const userMessage = `Draft a ${type} email for:\nCandidate: ${candidateName}\nPosition: ${jobTitle}\n${customContext ? `Additional context: ${customContext}` : ''}`;

    const result = await this._call(systemPrompt, userMessage);
    try {
      return JSON.parse(result);
    } catch {
      return { subject: `Re: ${jobTitle} Application`, body: result };
    }
  }

  async summarizeCandidate(resumeText, applications) {
    const systemPrompt = `You are a candidate profile summarization AI. Create a concise, insightful summary of the candidate based on their resume and application history. Return a JSON object with: summary (string), topSkills (array), experienceLevel (string), cultureFit (string 1-2 sentences).`;

    const userMessage = `## Resume\n${resumeText}\n\n## Application History\n${JSON.stringify(applications)}`;

    const result = await this._call(systemPrompt, userMessage);
    try {
      return JSON.parse(result);
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
}

module.exports = new ClaudeService();
