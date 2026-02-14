# Sanction Generator (The Closer)

## ✍️ Automated Document Issuance
The Sanction Agent bridges the digital and physical worlds. It converts the abstract loan approval into a legally formatted, printable Sanction Letter.

### 🚀 Key Capabilities
*   **Dynamic Template Filling**: Injects customer details, loan terms, and EMI schedules into a professional PDF template.
*   **Digital Branding**: Applies bank logos, watermarks, and legal disclaimers automatically.
*   **Archival**: Stores a copy of the generated PDF and updates the system of record.

### ⚡ Performance
*   **Generation Time**: ~0.5s per document.
*   **Library**: Uses `FPDF` / `PyMuPDF` for fast, lightweight generation without external dependencies.

### 🔮 Future Developments
1.  **E-Signature**: Integration with **Leegality** or **DocuSign** API to allow users to sign the letter digitally within the chat.
2.  **Email Delivery**: Automatic dispatch of the PDF to the user's registered email via SendGrid/AWS SES.
3.  **Blockchain Notarization**: Hashing the document to a private blockchain for immutable proof of issuance.
