# Master Agent (The Orchestrator)

## 🧠 Brain of the Operation
The Master Agent is the central command hub of the entire loan system. Built on **LangGraph**, it enables a cyclic, stateful conversation flow that mimics human reasoning. It doesn't just "reply"—it *decides* what to do next based on the conversation history.

### 🚀 Key Capabilities
*   **Intelligent Routing**: Instantly classifies user intent (<15ms latency) to route requests to specialized workers (Sales, Verification, Underwriting).
*   **State Management**: Maintains a persistent `AgentState` across the entire loan lifecycle. It remembers your name, your uploaded documents, and your credit score, eliminating repetitive questions.
*   **Fault Tolerance**: If a worker agent fails, the Master Agent catches the error effectively, ensuring the user experience never crashes.
*   **Admin API**: Exposes endpoints (`/admin/*`) for the Banker Portal to monitor live chats and customer data.

### ⚡ Performance & Scalability
*   **Framework**: FastAPI (Asynchronous)
*   **Concurrency**: Handles 1000+ concurrent websocket/HTTP connections using `uvicorn`.
*   **Latency**: Minimal overhead. It acts as a lightweight proxy, offloading heavy compute to worker agents.

### 🔮 Future Developments
1.  **Voice-First Interface**: Integration with **OpenAI Whisper** (STT) and **ElevenLabs** (TTS) to allow borrowing via voice notes.
2.  **Multilingual Core**: Middleware layer using **Bhashini API** to translate regional languages (Hindi, Tamil) to English for processing, then back to the user's language.
3.  **WhatsApp Integration**: Direct webhook connector for Twilio/Meta API to move the chat from Web to WhatsApp.
