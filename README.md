# AI automation: Personalized outreach to new lead

This AI agent takes the email address of a new lead (from a waitlist, newsletter signup or lead magnet), researches the company (based on the email domain if it's from a business), drafts a personalized initial email outreach and hands it to a human.

## Use this agent in 1 minute

Simply click the button below to deploy this AI agent to a Vercel serverless function.  
Then trigger it from our web app or via our API and find the results in your gotoHuman inbox.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgotohuman%2Fgth-demo-vercel-newlead&env=OPENAI_API_KEY&envDescription=This%20agent%20is%20using%20OpenAI's%20GPT-4o%20model&envLink=https%3A%2F%2Fplatform.openai.com%2Fapi-keys&project-name=ai-agent-lead-researcher&repository-name=ai-agent-lead-researcher&redirect-url=https%3A%2F%2Fapp.gotohuman.com%2Fadd-agent-from-template%2Fgth-demo-vercel-newlead)

- When asked for it, enter your [API key from OpenAI](https://platform.openai.com/api-keys) (OpenAI Sidemenu > __API keys__)

- After your agent is deployed to your own serverless function, you are redirected to gotoHuman where you are asked to enter some config to tailor the agent behavior to your own needs.
- Run your agent manually. Or [call our API](https://docs.gotohuman.com/run#trigger-events) when you get a new email from a lead to make the agent act more autonomously.
- Watch your AI automation do its job [in your gotoHuman inbox](https://app.gotohuman.com)

## Extend
Homework: Make the last step of the workflow `sendEmail` send an email automatically.