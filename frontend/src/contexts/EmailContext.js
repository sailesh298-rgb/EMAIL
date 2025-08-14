import React, { createContext, useContext, useState } from "react";
import { mockData } from "../utils/mockData";

const EmailContext = createContext();

export const useEmail = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error("useEmail must be used within an EmailProvider");
  }
  return context;
};

export const EmailProvider = ({ children }) => {
  const [emailAccounts, setEmailAccounts] = useState(mockData.emailAccounts);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [currentFolder, setCurrentFolder] = useState("inbox");

  const createBulkAccounts = (usernames, domain) => {
    const newAccounts = usernames.map((username, index) => ({
      id: `acc_${Date.now()}_${index}`,
      email: `${username}@${domain}`,
      username,
      password: "default123",
      createdAt: new Date().toISOString(),
      status: "active",
      emails: {
        inbox: [],
        sent: [],
        drafts: [],
        trash: [],
      },
    }));

    setEmailAccounts(prev => [...prev, ...newAccounts]);
    return newAccounts;
  };

  const updateAccountPassword = (accountId, newPassword) => {
    setEmailAccounts(prev =>
      prev.map(account =>
        account.id === accountId
          ? { ...account, password: newPassword }
          : account
      )
    );
  };

  const deleteAccount = (accountId) => {
    setEmailAccounts(prev => prev.filter(account => account.id !== accountId));
  };

  const sendEmail = (fromAccountId, emailData) => {
    const sentEmail = {
      id: `email_${Date.now()}`,
      from: emailAccounts.find(acc => acc.id === fromAccountId)?.email,
      to: emailData.to,
      subject: emailData.subject,
      body: emailData.body,
      timestamp: new Date().toISOString(),
      read: true,
    };

    // Add to sent folder of sender
    setEmailAccounts(prev =>
      prev.map(account =>
        account.id === fromAccountId
          ? {
              ...account,
              emails: {
                ...account.emails,
                sent: [sentEmail, ...account.emails.sent],
              },
            }
          : account
      )
    );

    return sentEmail;
  };

  const value = {
    emailAccounts,
    selectedAccount,
    currentFolder,
    setSelectedAccount,
    setCurrentFolder,
    createBulkAccounts,
    updateAccountPassword,
    deleteAccount,
    sendEmail,
  };

  return <EmailContext.Provider value={value}>{children}</EmailContext.Provider>;
};