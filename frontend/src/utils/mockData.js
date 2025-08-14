export const mockData = {
  emailAccounts: [
    {
      id: "acc_1",
      email: "john.doe@yourdomain.com",
      username: "john.doe",
      password: "password123",
      createdAt: "2024-01-15T10:30:00Z",
      status: "active",
      emails: {
        inbox: [
          {
            id: "email_1",
            from: "client@example.com",
            to: "john.doe@yourdomain.com",
            subject: "Welcome to our platform",
            body: "Thank you for joining our platform. We're excited to have you on board!",
            timestamp: "2024-01-20T14:30:00Z",
            read: false,
          },
          {
            id: "email_2",
            from: "support@business.com",
            to: "john.doe@yourdomain.com",
            subject: "Your account has been verified",
            body: "Congratulations! Your account has been successfully verified. You can now access all features.",
            timestamp: "2024-01-19T11:15:00Z",
            read: true,
          },
        ],
        sent: [
          {
            id: "email_3",
            from: "john.doe@yourdomain.com",
            to: "manager@company.com",
            subject: "Project Update",
            body: "Here's the latest update on the project progress...",
            timestamp: "2024-01-18T16:45:00Z",
            read: true,
          },
        ],
        drafts: [],
        trash: [],
      },
    },
    {
      id: "acc_2",
      email: "sarah.wilson@yourdomain.com",
      username: "sarah.wilson",
      password: "secure456",
      createdAt: "2024-01-16T09:15:00Z",
      status: "active",
      emails: {
        inbox: [
          {
            id: "email_4",
            from: "newsletter@tech.com",
            to: "sarah.wilson@yourdomain.com",
            subject: "Weekly Tech Newsletter",
            body: "This week's top tech stories and trends...",
            timestamp: "2024-01-21T08:00:00Z",
            read: false,
          },
        ],
        sent: [],
        drafts: [
          {
            id: "email_5",
            from: "sarah.wilson@yourdomain.com",
            to: "team@project.com",
            subject: "Meeting Notes",
            body: "Draft of meeting notes from yesterday's discussion...",
            timestamp: "2024-01-20T17:30:00Z",
            read: true,
          },
        ],
        trash: [],
      },
    },
  ],

  sampleUsernames: [
    // Indian names
    "amit.sharma", "priya.patel", "rajesh.kumar", "sunita.singh", "vikash.gupta",
    "kavya.reddy", "arjun.mehta", "deepika.agarwal", "rohit.jain", "meera.nair",
    
    // Foreign names
    "john.smith", "emma.johnson", "michael.brown", "sophia.davis", "william.miller",
    "olivia.wilson", "james.moore", "ava.taylor", "benjamin.anderson", "isabella.thomas",
    "lucas.jackson", "mia.white", "henry.harris", "charlotte.martin", "alexander.thompson",
  ],
};