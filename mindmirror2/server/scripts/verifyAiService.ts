import { aiService } from '../src/services/aiService';

async function verifyAiService() {
  console.log('Testing aiService.copilotChat with Gemini API...');
  const chatRes = await aiService.copilotChat({
    message: 'Briefly define the Nyquist-Shannon sampling theorem in 2 sentences.',
  });
  console.log('Copilot Response Source:', chatRes.source);
  console.log('Copilot Reply:\n', chatRes.reply);

  console.log('\nTesting aiService.generateEngineeringStudyPlan with Gemini API...');
  const planRes = await aiService.generateEngineeringStudyPlan({
    courseworkTitle: 'Applied Control Systems',
    studentLevel: 'Undergraduate',
    hoursPerWeek: 10,
  });
  console.log('Plan Source:', planRes.source);
  console.log('Plan Modules count:', planRes.modules?.length);
  console.log('Plan Overview:', planRes.overview);
}

verifyAiService().catch(console.error);
