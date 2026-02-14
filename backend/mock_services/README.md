# Mock Services (The Simulator)

## 🎭 Simulating the Banking Ecosystem
To enable isolated development and testing without reliance on expensive or restricted 3rd-party APIs, this module simulates key external services.

### 🚀 Included Services
1.  **CIBIL Bureau**: Simulates a Credit Information Company. Returns consistent credit scores for test users.
2.  **Banking Core**: Simulates the bank's internal ledger for checking "Pre-Approved Offers".
3.  **Identity Provider**: Simulates NSDL/UIDAI for verifying PAN and Aadhaar inputs.

### ⚡ Benefits
*   **Development Speed**: No waiting for API keys or approval.
*   **Reliability**: No downtime or rate limits during demos.
*   **Cost**: Zero transaction fees.

### 🔮 Future Developments
*   **Contract Testing**: Ensure these mocks strictly adhere to the OpenAPI specs of the real services (e.g., Perfios, Experian) to make swapping them out seamless in production.
