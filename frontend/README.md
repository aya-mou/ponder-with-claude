# Ponder with Claude

Ponder with Claude allows users to expand their learning and develop new capabilities while they complete work tasks with Claude. 
It adopts a similar UI to Claude.ai and centers specific learning principles in its interaction with the user. 
Ponder with Claude specifically ensures that users do not passively move on once a task is completed. Rather, Ponder introduces new learning
opportunities to reinforce learning and expand the user's critical thinking and skillsets. Finally, Ponder wraps up with the work session
with a reflection-based activity.

## Tehnical Specifications
The app allows real-time conversations with Claude. It uses Claude Opus 4.1 through the Anthropic API. Its aesthetics/style closely resemble those of Claude.ai. This app is built particularly to prototype the emphasis of certain learning principles for users.
The app requires the following to run:
- Node.js (version 14 or higher)
- npm or yarn
- An Anthropic API key

## Development
This app was developed in collaboration with Claude. The latter generated skeleton code, relying on "Create React App" documentation, to speed up the development of the app and assisted with debugging when needed. The developer defined the features, completed the code, and made changes to support security, ease of use, and new learning opportunities.

## Usage:
You can use Ponder with Claude as follows:
- **New Chat**: Click the "New Chat" button to start a fresh conversation
- **Send Messages**: Type your message and press Enter (or Shift+Enter for new lines)
- **Message History**: All messages in a conversation are available to maintain context
- **Access Code**: Enter the access code provided to you by the developer to gain access to Ponder with Claude.

## Project Code Structure

```
src/
├── frontend
   ├── App.js       # Main React component with chat logic and access code request
   ├── App.css      # Aesthetics that closely resemble the Claude.ai interface
   ├── index.js     # React app entry point
└── backend
   ├── server.js    # Simple backend server that communicates with Claude through the Anthropic API
```

## Available Scripts
- `npm start` - Runs the app frontend in development mode
- `npm run dev` - Runs the app backend in development mode
- In development, you can use the app at `http://localhost:3000`


## License
This project is open source and available under the MIT License.

## Acknowledgments
- Developed by A. Mouallem in collaboration with Claude, August 2025
- Icons by [Lucide React](https://lucide.dev/)
- Inspired by the Claude.ai interface design