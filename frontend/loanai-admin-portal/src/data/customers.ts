export interface Customer {
  cust_id: string;
  password: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  credit_score: number;
  pre_approved_limit: number;
  interest_options: string[];
  aadhaar: string;
  category: "Good Customer" | "Bargainer" | "Risk" | "Self Employed" | "New Customer";
  loan_status?: "Approved" | "Pending" | "Rejected" | "Under Review";
  loan_amount?: number;
  documents?: {
    salary_slip?: string;
    bank_statement?: string;
    sanction_letter?: string;
  };
}

export interface ChatMessage {
  id: string;
  cust_id: string;
  sender: "customer" | "banker" | "bot";
  message: string;
  timestamp: string;
}

export const customers: Customer[] = [
  {
    cust_id: "201059870",
    password: "Pass@123",
    name: "Rahul Deshmukh",
    age: 32,
    gender: "Male",
    phone: "9876543210",
    address: "402, Sea Breeze Apts, Bandra, Mumbai",
    credit_score: 790,
    pre_approved_limit: 550000,
    interest_options: ["10.5%", "11.0%"],
    aadhaar: "452189563214",
    category: "Good Customer",
    loan_status: "Approved",
    loan_amount: 450000,
    documents: {
      salary_slip: "salary_slip_201059870.pdf",
      bank_statement: "bank_statement_201059870.pdf",
      sanction_letter: "sanction_201059870.pdf"
    }
  },
  {
    cust_id: "201059871",
    name: "Priya Sharma",
    password: "Secure@456",
    age: 28,
    gender: "Female",
    phone: "8765432109",
    address: "12, Green Park, Hauz Khas, Delhi",
    credit_score: 760,
    pre_approved_limit: 300000,
    interest_options: ["11.0%", "11.5%"],
    aadhaar: "895623147852",
    category: "Good Customer",
    loan_status: "Pending",
    loan_amount: 250000,
    documents: {
      salary_slip: "salary_slip_201059871.pdf",
      bank_statement: "bank_statement_201059871.pdf"
    }
  },
  {
    cust_id: "201059873",
    name: "Vikram Singh",
    password: "MyPass@789",
    age: 40,
    gender: "Male",
    phone: "7654321098",
    address: "77, Jubilee Hills, Hyderabad",
    credit_score: 820,
    pre_approved_limit: 1000000,
    interest_options: ["9.5%"],
    aadhaar: "256314789632",
    category: "Bargainer",
    loan_status: "Under Review",
    loan_amount: 800000,
    documents: {
      salary_slip: "salary_slip_201059873.pdf",
      bank_statement: "bank_statement_201059873.pdf"
    }
  },
  {
    cust_id: "201059874",
    name: "Sneha Patel",
    password: "Patel@321",
    age: 35,
    gender: "Female",
    phone: "6543210987",
    address: "B-201, Satellite Road, Ahmedabad",
    credit_score: 740,
    pre_approved_limit: 200000,
    interest_options: ["12.0%", "12.5%"],
    aadhaar: "741258963214",
    category: "Bargainer",
    loan_status: "Approved",
    loan_amount: 180000,
    documents: {
      salary_slip: "salary_slip_201059874.pdf",
      bank_statement: "bank_statement_201059874.pdf",
      sanction_letter: "sanction_201059874.pdf"
    }
  },
  {
    cust_id: "201059875",
    name: "Amit Kumar",
    password: "Kumar@654",
    age: 45,
    gender: "Male",
    phone: "9988776655",
    address: "Sector 18, Noida, UP",
    credit_score: 550,
    pre_approved_limit: 0,
    interest_options: [],
    aadhaar: "369852147852",
    category: "Risk",
    loan_status: "Rejected",
    loan_amount: 100000
  },
  {
    cust_id: "201059876",
    name: "Rohan Gupta",
    password: "Gupta@987",
    age: 29,
    gender: "Male",
    phone: "8877665544",
    address: "Civil Lines, Jaipur",
    credit_score: 720,
    pre_approved_limit: 100000,
    interest_options: ["13.0%"],
    aadhaar: "159753456852",
    category: "Risk",
    loan_status: "Under Review",
    loan_amount: 75000,
    documents: {
      bank_statement: "bank_statement_201059876.pdf"
    }
  },
  {
    cust_id: "201059877",
    name: "Anjali Menon",
    password: "Menon@159",
    age: 33,
    gender: "Female",
    phone: "7766554433",
    address: "Indiranagar, Bangalore",
    credit_score: 780,
    pre_approved_limit: 400000,
    interest_options: ["10.8%", "11.2%"],
    aadhaar: "951753456852",
    category: "Self Employed",
    loan_status: "Approved",
    loan_amount: 350000,
    documents: {
      salary_slip: "salary_slip_201059877.pdf",
      bank_statement: "bank_statement_201059877.pdf",
      sanction_letter: "sanction_201059877.pdf"
    }
  },
  {
    cust_id: "201059878",
    name: "Karthik Iyer",
    password: "Iyer@753",
    age: 38,
    gender: "Male",
    phone: "6655443322",
    address: "T Nagar, Chennai",
    credit_score: 770,
    pre_approved_limit: 500000,
    interest_options: ["10.5%"],
    aadhaar: "357159456852",
    category: "Self Employed",
    loan_status: "Pending",
    loan_amount: 400000,
    documents: {
      salary_slip: "salary_slip_201059878.pdf",
      bank_statement: "bank_statement_201059878.pdf"
    }
  },
  {
    cust_id: "201059879",
    name: "Fatima Ali",
    password: "Ali@258",
    age: 22,
    gender: "Female",
    phone: "5544332211",
    address: "Hazratganj, Lucknow",
    credit_score: 0,
    pre_approved_limit: 50000,
    interest_options: ["14.0%"],
    aadhaar: "852369741258",
    category: "New Customer",
    loan_status: "Pending",
    loan_amount: 40000,
    documents: {
      bank_statement: "bank_statement_201059879.pdf"
    }
  },
  {
    cust_id: "201059880",
    name: "John Doe",
    password: "Doe@147",
    age: 24,
    gender: "Male",
    phone: "4433221100",
    address: "Salt Lake, Kolkata",
    credit_score: 0,
    pre_approved_limit: 0,
    interest_options: [],
    aadhaar: "753951456852",
    category: "New Customer",
    loan_status: "Under Review",
    loan_amount: 30000
  }
];

// Mock chat history data (simulating MongoDB fetch)
export const chatHistory: ChatMessage[] = [
  {
    id: "1",
    cust_id: "201059870",
    sender: "customer",
    message: "Hlo!! can i get my loan options based on my profile",
    timestamp: "2025-01-10T10:30:00"
  },
  {
    id: "2",
    cust_id: "201059870",
    sender: "bot",
    message: "Hello! I'm LoanBot, your personal loan sales assistant. Based on your profile, you have a pre-approved loan offer with a limit of INR 500,000 at an interest rate of 10.5% per annum. What kind of loan are you looking for, or what specific purpose do you have in mind for the loan? I can help you explore various options, including government schemes.",
    timestamp: "2025-01-10T10:30:15"
  },
  {
    id: "3",
    cust_id: "201059870",
    sender: "customer",
    message: "I am looking for loan for a startup i want to burrow amount of 550,000",
    timestamp: "2025-01-10T10:31:00"
  },
  {
    id: "4",
    cust_id: "201059870",
    sender: "bot",
    message: "That's great you're looking to fund a startup! We have several options that could be suitable for your needs. Our sales agent is an expert in various government schemes and loan products tailored for startups. They can provide you with detailed information on programs like MUDRA or PMEGP, which are designed to support new businesses. To help me understand your needs better, could you tell me a little more about your startup? For example: What industry is your startup in? Do you have a business plan ready? What will the loan primarily be used for (e.g., working capital, equipment, expansion)? Knowing more about your specific scenario will allow me to recommend the most suitable options and help you understand the benefits and eligibility criteria for each.",
    timestamp: "2025-01-10T10:31:10"
  },
  {
    id: "5",
    cust_id: "201059870",
    sender: "customer",
    message: "Okay so for now I am not interested in that just give required amount",
    timestamp: "2025-01-10T10:31:10"
  },
  {
    id: "6",
    cust_id: "201059870",
    sender: "bot",
    message: "I understand. Since your requested amount of INR 550,000 is slightly above your pre-approved limit, we'll need to gather a bit more information. Could you please provide your monthly salary? This will help us determine the best possible loan terms for you.",
    timestamp: "2025-01-10T10:31:10"
  },
  {
    id: "7",
    cust_id: "201059870",
    sender: "customer",
    message: "Uploaded salary slip verified his montly salary is 750,000",
    timestamp: "2025-01-10T10:31:11"
  },
   {
    id: "8",
    cust_id: "201059870",
    sender: "bot",
    message: "Great news! Your KYC has been verified, and your loan application for INR 550,000 has been approved! Here are your final loan terms: Approved Loan Amount: INR 550,000 Final Interest Rate: 10.5% per annum Final Tenure: 36 months Your Monthly EMI: INR 17,876 Risk Category: Low Risk Your excellent credit profile and verified salary helped us approve your loan at a favorable interest rate and tenure. Would you like me to generate the sanction letter for you?",
    timestamp: "2025-01-10T10:31:11"
  },
   {
    id: "9",
    cust_id: "201059870",
    sender: "customer",
    message: "Yes,do so",
    timestamp: "2025-01-10T10:31:11"
  },
    {
    id: "9",
    cust_id: "201059870",
    sender: "bot",
    message: "The sanction letter has been successfully generated and will be sent to your registered email address shortly. Please review the letter carefully once you receive it, as it contains important details about your loan terms and conditions. If you have any questions or need further assistance, feel free to reach out. Congratulations once again on your approved loan!",
    timestamp: "2025-01-10T10:31:11"
  },

  
  {
    id: "10",
    cust_id: "201059871",
    sender: "customer",
    message: "When will my loan be approved?",
    timestamp: "2025-01-09T14:20:00"
  },
  {
    id: "11",
    cust_id: "201059871",
    sender: "banker",
    message: "Hi Priya, your application is under final review. We need your latest bank statement.",
    timestamp: "2025-01-09T14:25:00"
  },
  {
    id: "12",
    cust_id: "201059871",
    sender: "customer",
    message: "I've uploaded it now. Please check.",
    timestamp: "2025-01-09T14:30:00"
  },
  {
    id: "13",
    cust_id: "201059873",
    sender: "customer",
    message: "Can I get a lower interest rate? My credit score is 820.",
    timestamp: "2025-01-08T11:00:00"
  },
  {
    id: "14",
    cust_id: "201059873",
    sender: "banker",
    message: "Hello Vikram, given your excellent credit history, we can offer you 9.5% - our best rate.",
    timestamp: "2025-01-08T11:15:00"
  },
  {
    id: "15",
    cust_id: "201059875",
    sender: "customer",
    message: "Why was my loan rejected?",
    timestamp: "2025-01-07T09:00:00"
  },
  {
    id: "16",
    cust_id: "201059875",
    sender: "banker",
    message: "Hi Amit, unfortunately your credit score of 550 doesn't meet our minimum requirement of 650. We recommend improving your credit history.",
    timestamp: "2025-01-07T09:30:00"
  },
  {
    id: "17",
    cust_id: "201059877",
    sender: "customer",
    message: "I'm self-employed. What documents do I need?",
    timestamp: "2025-01-06T16:00:00"
  },
  {
    id: "18",
    cust_id: "201059877",
    sender: "bot",
    message: "For self-employed individuals, we need: ITR for last 2 years, Bank statements (6 months), Business registration proof, and GST returns.",
    timestamp: "2025-01-06T16:00:30"
  }
];

export const getChatHistoryByCustomer = (custId: string): ChatMessage[] => {
  return chatHistory.filter(chat => chat.cust_id === custId);
};

export const getCustomerById = (custId: string): Customer | undefined => {
  return customers.find(c => c.cust_id === custId);
};
