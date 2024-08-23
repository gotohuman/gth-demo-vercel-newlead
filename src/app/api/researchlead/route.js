export const maxDuration = 60;
export const dynamic = 'force-dynamic';

import { AiFlow } from "gotohuman";
import OpenAI from 'openai';
import cheerio from 'cheerio';

export async function POST(request) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const aiFlow = new AiFlow({
    onTrigger: "newLead", agentId: "new-lead-researcher", fetch: fetch.bind(globalThis)
  })
  aiFlow.step({id: "extractDomain", fn: async({flow, input}) => {
    return extractDomain(input[0].text)
  }})
  aiFlow.step({id: "summarizeWebsite", fn: async({input}) => {
    const scrapedWebsite = await readWebsiteContent(input);
    const summarizedWebsite = await summarizeWebsite(openai, scrapedWebsite);
    return summarizedWebsite;
  }})
  aiFlow.step({id: "draftEmail", fn: async({input, config}) => {
    return await draftEmail(openai, input, config.senderName, config.senderCompanyDesc);    
  }})
  aiFlow.gotoHuman({id: "approveDraft"})
  aiFlow.step({id: "sendEmail", fn: async({input}) => {
    // send email if `approved`
    await new Promise(resolve => setTimeout(resolve, 1000));
  }})
  const resp = await aiFlow.executeSteps(await request.json());
  return Response.json(resp)
}

function extractDomain(email) {
  const domain = email.split('@').pop();
  const regex = createDomainRegex();
  return (!regex.test(domain)) ? `https://${domain}` : AiFlow.skipTo('draftEmail')
}

const commonProviders = [
  'gmail', 'yahoo', 'ymail', 'rocketmail',
  'outlook', 'hotmail', 'live', 'msn',
  'icloud', 'me', 'mac', 'aol',
  'zoho', 'protonmail', 'mail', 'gmx'
];

function createDomainRegex() {
  // Escape any special regex characters in the domain names
  const escapedDomains = commonProviders.map(domain => domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  // Join the domains with the alternation operator (|)
  const pattern = `(^|\\.)(${escapedDomains.join('|')})(\\.|$)`;
  return new RegExp(pattern);
}

async function readWebsiteContent(url) {

  const response = await fetch(url);
  const body = await response.text();
  let cheerioBody = await cheerio.load(body);
  const resp = {
    website_body: cheerioBody('p').text(),
    url: url,
  };
  return JSON.stringify(resp);
}

async function summarizeWebsite(openai, webContent) {
  const messages = [
    {
      role: 'system',
      content: "You are a helpful website content summarizer. You will be passed the content of a scraped company website. Please summarize it in 250-300 words focusing on what kind of company this is, the services they offer and how they operate."
    },
    {
      role: 'user',
      content: webContent
    }];
    const summaryCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      temperature: 0.5
    });
    return summaryCompletion.choices[0].message.content;
}

async function draftEmail(openai, websiteContent, senderName, senderCompanyDesc) {
  const noDomain = (websiteContent == null)
  const messages2 = [
    {
      role: 'system',
      content: `You are a helpful sales expert, great at writing enticing emails.
      You will write an email for ${senderName} who wants to reach out to a new prospect who left their email address. ${senderName} workd for the following company:
      ${senderCompanyDesc}
      Write no more than 300 words.
      ${!noDomain ? 'It must be tailored as much as possible to the prospect\'s company based on the website information we fetched. Don\'t mention that we got the information from the website.' : ''}`
    },
    {
      role: 'user', content: (noDomain ? `No additional information found abour the prospect` : `#Company website summary:
      ${websiteContent}`)
    }];
    const emailDrafterCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages2,
      temperature: 0.75
    });
    const draft = emailDrafterCompletion.choices[0].message.content
    return draft;
}