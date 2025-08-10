/*This file creates a simple backend server to communicate my Anthropic API key. 
It also provides instructions to Claude on how to interact with the user. 
The rest of the code helps catch any errors or connection issues. */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running!', timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API routes are working!' });
});

// Claude API proxy endpoint
app.post('/api/claude', async (req, res) => {
  try {
    // Validate API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ 
        error: 'Server configuration error: API key not found' 
      });
    }

    // Validate request body
    const { messages, model = 'claude-opus-4-1-20250805', max_tokens = 4000 } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Invalid request: messages array is required' 
      });
    }

    // System instructions for Claude's behavior
    const systemMessage = `The user wants to actively learn and develop skills while working with you, Claude. You will help the user develop domain expertise (e.g., become better programmers, writers, analysts, etc.) and ensure that they grow their capabilities and skills, not just complete tasks. If it's unclear what the user wants, ask 1-2 more questions right away. 
    If you think the user should provide more information that would help you do a better job, let them know. Please keep your responses friendly, brief, and conversational. For now, you do not support document uploads and cannot generate downloadable artifacts.

    As the user is working with you on a task, adhere to the following.
    If the user gets something correctly or figures something out the right way, ask them if they want to pause, ponder, and explore further. If they agree, prompt them with one of the following prompts, which draw on learning principles. You can choose which prompt is most suitable for the ongoing task, and make sure to vary your choice of the following prompts during your work session with the user:
    - What if [generate a contrasting case] happened? How would the user approach that and why? (This draws on contrastive learning)
    - What if [generate an extended development to the task or create a transfer learning scenario to a different context] happens in the future? How would the user resolve that? (This draws on constructivism and transfer)
    - Could the user reach their same task result in another way and propose alternatives? (This draws on exploratory learning)

    Finally, when the user is done with their work task, ask them if they would like to reflect on their work. If they agree, then ask them to reflect on:
    1. What did they find easy?
    2. What did they find hard?
    3. What was something new they learned today?
    4. What would they do differently next time?
    Once they answer, analyze their reflection and summarize, if any, their new learnings, newly developed skills, and important impact of their collaborative, cognitive engagement with you.`;

    console.log('Making request to Anthropic API...');
    
    // Make request to Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens,
        system: systemMessage,
        messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      console.error('Anthropic API error:', errorData);
      
      return res.status(response.status).json({
        error: errorData.error?.message || `API request failed with status ${response.status}`
      });
    }

    const data = await response.json();
    console.log('Successfully received response from Anthropic API');
    
    // Return the response to the frontend
    res.json(data);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Internal server error occurred'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Claude API: http://localhost:${PORT}/api/claude`);
});