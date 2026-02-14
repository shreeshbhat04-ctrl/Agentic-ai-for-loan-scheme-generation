# Document Processor (The Analyst)

## 📄 AI-Powered Document Understanding
The DocProcessor turns images into data. Using OCR and Layout Analysis, it reads salary slips and bank statements just like a human underwriter would.

### 🚀 Key Capabilities
*   **Multi-Format Support**: Handles PDF, JPG, PNG.
*   **Salary Extraction**: Uses **Tesseract OCR / PyMuPDF** to locate "Net Pay" and "Gross Pay" fields in unstandardized salary slips.
*   **Financial Health Score**: Analyzes bank statements to calculate a proprietary "Credit Health Score" (0-100) based on balance trends and spending habits.

### ⚡ Performance
*   **Async Processing**: Runs in the background (Worker Thread). Does not block the chat interface.
*   **Accuracy**: Tuned for high-contrast financial documents.

### 🔮 Future Developments
1.  **Computer Vision Enhancement**: Integration of **OpenCV** to deskew, denoise, and threshold images *before* OCR to improve accuracy by 30-40%.
2.  **Table Extraction**: Moving to **PaddleOCR** or **LayoutLM** to better understand complex table structures in bank statements.
3.  **Fraud Detection**: Analysis of font metadata to detect edited/forged PDF documents.
