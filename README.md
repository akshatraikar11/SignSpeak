# 🤟 SignSpeak - AI Sign Language Translator

[![Built with React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Powered by Google AI](https://img.shields.io/badge/Google%20AI-Gemini%201.5-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-00C853?logo=google&logoColor=white)](https://mediapipe.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Platform-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

**Breaking Barriers, Building Bridges**

SignSpeak is a real-time, AI-powered sign language translator that converts American Sign Language (ASL) gestures into natural, grammatically correct spoken sentences. Built with cutting-edge Google technologies, SignSpeak makes communication accessible, instant, and free for everyone.

---

🌐 Firebase Hosting Deployment
Live URL: https://signspeak-devstack.web.app

---

## 🌟 The Problem

- **70 million+** people worldwide use sign language as their primary means of communication
- **Employment barriers**: Deaf individuals face significant challenges in workplace communication
- **Communication gap**: Most people don't understand sign language, creating isolation
- **Limited access**: Interpreters are expensive and not always available

## 💡 Our Solution

SignSpeak leverages production-grade AI to provide:
- ⚡ **Real-time translation** with < 1 second latency
- 🧠 **Context-aware AI** that understands meaning, not just individual signs
- 🎙️ **Voice output** for hands-free communication
- 💰 **100% free** - no subscriptions, no hidden costs
- 🌐 **Web-based** - works in any modern browser, no app installation needed

---

## ✨ Key Features

### 🤖 AI-Powered Recognition
- **MediaPipe Hands**: Real-time hand tracking with 21 high-precision landmarks
- **MediaPipe Gesture Recognizer**: Google's pre-trained AI for accurate gesture recognition
- **Hybrid Recognition System**: Combines multiple AI models for maximum accuracy

### 🧠 Intelligent Translation
- **Gemini 1.5 Flash**: Context-aware AI that translates sign sequences into natural, grammatically correct sentences
- **Temporal Smoothing**: Reduces noise and false positives for reliable detection
- **Sign Buffer**: Accumulates signs to provide meaningful context for translation

### 🎯 User Experience
- **Interactive Sign Guide**: Learn supported ASL signs with visual demonstrations
- **Real-time Feedback**: Visual overlays show hand tracking and recognition confidence
- **Voice Output**: Automatic text-to-speech for seamless communication
- **Gesture Scroll**: Navigate the landing page using hand gestures
- **Translation History**: Review past translations with Firebase integration

### ♿ Accessibility First
- Designed with and for the deaf and hard-of-hearing community
- Privacy-focused: All video processing happens locally in your browser
- No data storage: Your gestures are never recorded or transmitted

---

## 🛠️ Technology Stack

### Frontend
- **React 19.2** - Modern UI framework
- **React Router** - Client-side routing
- **Vite** - Lightning-fast build tool
- **Three.js** - 3D graphics and animations

### AI & Machine Learning
- **Google Gemini 1.5 Flash** - Context-aware language translation
- **MediaPipe Hands** - Real-time hand landmark detection
- **MediaPipe Gesture Recognizer** - Pre-trained gesture recognition
- **TensorFlow.js** - Machine learning in the browser
- **Fingerpose** - Custom gesture recognition

### Backend & Infrastructure
- **Firebase Authentication** - Secure user authentication
- **Cloud Firestore** - NoSQL database for translation history
- **Firebase Hosting** - Fast, secure web hosting

### Development Tools
- **ESLint** - Code quality and consistency
- **Vite** - Modern build tooling
- **npm** - Package management

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- Modern web browser with camera access
- **Firebase account** (for authentication and database features)
- **Google AI API key** (for Gemini translation)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/signspeak.git
   cd signspeak
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

   See `.env.example` for a template.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

---

## 📖 Usage

### Basic Translation Flow

1. **Launch the Translator**
   - Click "Start Translating" on the landing page
   - Grant camera permissions when prompted

2. **Perform ASL Signs**
   - Position your hand(s) in front of the camera
   - Perform signs clearly and deliberately
   - Wait for visual confirmation of recognition

3. **View Translation**
   - Recognized signs appear in the sign buffer
   - Click "Translate" to convert signs to natural language
   - Translation is spoken aloud automatically

4. **Review History** (requires sign-in)
   - View past translations
   - Track your communication sessions

### Supported Signs

Currently supports the following ASL signs:
- **HELLO** - Greeting gesture
- **YES** - Affirmative response
- **NO** - Negative response
- **PLEASE** - Polite request
- **HELP** - Request for assistance
- **I_LOVE_YOU** - Expression of affection

*More signs are continuously being added!*

---

## 🏗️ Project Structure

```
signspeak/
├── src/
│   ├── components/          # React components
│   │   ├── LandingPage.jsx  # Main landing page
│   │   ├── Translator.jsx   # Translation interface
│   │   ├── HandTracker.jsx  # Hand tracking visualization
│   │   ├── SignGuide.jsx    # Interactive sign guide
│   │   └── UserAuth.jsx     # Authentication UI
│   ├── services/            # Business logic
│   │   ├── geminiService.js # Gemini AI integration
│   │   ├── signRecognition.js # Sign detection logic
│   │   ├── aslModel.js      # Custom ASL model
│   │   └── firebaseService.js # Firebase operations
│   ├── config/              # Configuration files
│   │   ├── firebase.js      # Firebase setup
│   │   └── gemini.js        # Gemini API setup
│   ├── hooks/               # Custom React hooks
│   │   └── useGestureScroll.js # Gesture-based scrolling
│   ├── styles/              # CSS stylesheets
│   └── utils/               # Utility functions
├── public/                  # Static assets
├── .env.example             # Environment variables template
├── firebase.json            # Firebase configuration
├── firestore.rules          # Firestore security rules
├── vite.config.js           # Vite configuration
└── package.json             # Project dependencies
```

---

## 🎯 Real-World Impact

### Use Cases
- 💼 **Workplace Communication** - Enable deaf employees to communicate seamlessly
- 🏥 **Healthcare** - Facilitate patient-doctor conversations
- 🎓 **Education** - Support deaf students in classrooms
- 🛒 **Retail & Services** - Improve customer service accessibility
- 👥 **Social Interactions** - Break down communication barriers in daily life
- 📞 **Customer Support** - Provide accessible support channels

### Benefits
- **24/7 Availability** - No need to schedule interpreters
- **Cost-Effective** - Completely free, no subscription fees
- **Privacy-Focused** - All processing happens locally
- **Instant** - Real-time translation without delays
- **Accessible** - Works on any device with a camera and browser

---

## 🔒 Privacy & Security

- **Local Processing**: All video analysis happens in your browser - nothing is sent to servers
- **No Recording**: Your camera feed is never recorded or stored
- **Secure Authentication**: Firebase Authentication with industry-standard security
- **Data Control**: Users can delete their translation history at any time
- **GDPR Compliant**: Respects user privacy and data protection regulations

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Areas for Contribution
- 🆕 Add support for more ASL signs
- 🌍 Internationalization (support for other sign languages)
- 📱 Mobile app development
- 🎨 UI/UX improvements
- 🐛 Bug fixes and performance optimizations
- 📚 Documentation improvements

---

## 🗺️ Roadmap

- [ ] Support for 100+ ASL signs
- [ ] Multi-language support (BSL, ISL, etc.)
- [ ] Mobile app (iOS & Android)
- [ ] Offline mode with local AI models
- [ ] Two-way translation (text/speech to sign language)
- [ ] Video call integration
- [ ] Educational mode with interactive lessons
- [ ] Community-contributed sign database

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👏 Acknowledgments

- **Google AI** for Gemini 1.5 Flash and MediaPipe technologies
- **Firebase** for backend infrastructure
- **The Deaf Community** for inspiration and guidance
- **Open Source Contributors** for making this project possible

---

## 📧 Contact & Support

- **Developer**: DevStack Team
- **Project Link**: [https://github.com/akshatraikar11/SignSpeak](https://github.com/akshatraikar11/SignSpeak)
- **Issues**: [Report a bug or request a feature](https://github.com/yourusername/signspeak/issues)

---

## 🌟 Show Your Support

If SignSpeak helps you or someone you know, please consider:
- ⭐ Starring this repository
- 🐦 Sharing on social media
- 💬 Spreading the word about accessible communication
- 🤝 Contributing to the project

---

**Built with ❤️ for accessibility • Powered by DevStack**

© 2025 SignSpeak - Making communication accessible to everyone
