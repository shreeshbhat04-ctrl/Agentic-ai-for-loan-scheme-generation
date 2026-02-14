# Sales Agent (The Expert)

## 💼 Your 24/7 Financial Advisor
The Sales Agent connects users with the best financial products. It solves the "Hallucination" problem common in LLMs by using a **Hybrid Retrieval** system.

### 🚀 Key Capabilities
*   **Hybrid Intelligence**: 
    1.  **Deterministic**: Checks SQL database for "Pre-Approved Offers" first. 100% accurate, 0% hallucination.
    2.  **Generative (RAG)**: If no offer exists, it uses **Gemini 1.5 Flash** grounded with scraped Government Scheme data (JanSamarth) to answer queries like "What is MUDRA loan?".
*   **Persuasive Persona**: System prompted to be empathetic, professional, and sales-driven without being pushy.
*   **Context Aware**: Knows the user's credit profile and tailors the pitch accordingly.

### ⚡ Performance
*   **Latency**: ~50ms for offer retrieval (SQL), ~1.5s for complex scheme explanations (LLM).
*   **Efficiency**: 80% of query volume (checking offers) is handled without expensive LLM calls.

### 🔮 Future Developments
1.  **Real-Time Market Data**: Integration with Bank APIs to fetch live interest rates instead of static DB values.
2.  **Recommendation Engine**: A vector database (Pinecone/Chroma) to recommend schemes based on user persona similarity match.
3.  **Scheduled Scraping**: **Scrapy + Celery** pipeline to auto-update government schemes every 24 hours.
