const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables

// --- Debugging .env variables (you can remove these lines after verification) ---
console.log('--- Checking Environment Variables ---');
console.log('GEMINI_API_KEY Loaded:', !!process.env.GEMINI_API_KEY);
console.log('EMAIL_USER Loaded:', !!process.env.EMAIL_USER);
console.log('------------------------------------');
// ---------------------------------------------------------------------------------

// Import the Google Generative AI SDK
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors()); // Enable CORS for frontend communication
app.use(bodyParser.json()); // Parse JSON request bodies

const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/summarize', async (req, res) => {
  // --- Debugging Request Reaching Backend (you can remove this line after verification) ---
  console.log('Received summarization request from frontend.');
  // -----------------------------------------------------------------------------------------

  try {
    const { transcript, prompt } = req.body;
    if (!transcript || !prompt) {
      // --- Debugging Missing Data (you can remove this line after verification) ---
      console.log('Missing transcript or prompt, sending 400.');
      // -----------------------------------------------------------------------------
      return res.status(400).json({ message: 'Transcript and prompt are required' });
    }

    // Get the generative model, now specifically using 'gemini-1.5-flash'
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Combine transcript and prompt for Gemini
    const fullPrompt = `Transcript:\n${transcript}\nInstruction:\n${prompt}`;
    
    // Generate content using Gemini
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const summary = response.text(); // Extract the generated text

    res.json({ summary });
  } catch (error) {
    console.error('Error during summarization with Gemini:', error);
    // Log the full error object to help debug specific Gemini API issues
    res.status(500).json({ 
      message: 'Summarization failed', 
      error: error.message || 'An unknown error occurred with Gemini API.'
    });
  }
});

app.post('/send-email', async (req, res) => {
  try {
    const { recipients, subject, content } = req.body;
    if (!recipients || recipients.length === 0 || !content) {
      return res.status(400).json({ message: 'Recipients and content are required' });
    }

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Or your email service (e.g., 'outlook', 'sendgrid')
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipients.join(','), // Join multiple recipients with a comma
      subject: subject || 'Meeting Summary from AI Summarizer',
      text: content, // Plain text body
      // html: '<p>HTML version of the summary</p>' // Optional: for HTML emails
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Email sending failed', error: error.message });
  }
});
