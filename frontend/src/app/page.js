'use client'
import Navbar from "./components/Navbar";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  CopyIcon,
  RefreshCwIcon,
  Shield,
  Zap,
  Lock,
  Mail,
  Clock,
  User,
  Trash2,
  Search,
  Check,
  Crown,
  Loader2,
  FileText,
  X
} from "lucide-react";

export default function Home() {
  const [disposableEmail, setDisposableEmail] = useState("");
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [isLoader, setIsLoader] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState('10');
  const [searchFilter, setSearchFilter] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Toast notification helper
  const displayToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Load email and messages from localStorage on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('emailAddress');
    const storedToken = localStorage.getItem('token');
    const storedMessages = localStorage.getItem('emails');

    if (storedEmail && storedToken) {
      setDisposableEmail(storedEmail);
    }

    if (storedMessages) {
      try {
        const parsed = JSON.parse(storedMessages);
        setMessages(parsed);
        setFilteredMessages(parsed);
      } catch (error) {
        console.error('Failed to parse stored messages:', error);
      }
    }
  }, []);

  // Filter messages based on search
  useEffect(() => {
    if (!searchFilter.trim()) {
      setFilteredMessages(messages);
      return;
    }

    const filtered = messages.filter((msg) => {
      const searchLower = searchFilter.toLowerCase();
      return (
        msg.subject?.toLowerCase().includes(searchLower) ||
        msg.from?.toLowerCase().includes(searchLower) ||
        msg.from_name?.toLowerCase().includes(searchLower) ||
        msg.message_body?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredMessages(filtered);
  }, [searchFilter, messages]);

  // Polling for messages
  useEffect(() => {
    if (!disposableEmail) return;

    const pollingMessage = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        console.log('No token found');
        return;
      }

      try {
        const response = await axios.get(
          'http://localhost:8000/checkMessages',
          {
            headers: {
              'X-Auth-Token': token
            },
            params: {
              timeout: parseInt(autoRefresh) || 30
            }
          }
        );

        if (response.data && response.data.messages && response.data.messages.length > 0) {
          setMessages(response.data.messages);
          setFilteredMessages(response.data.messages);
          localStorage.setItem('emails', JSON.stringify(response.data.messages));
          console.log(`Found ${response.data.count} messages`);
        }

      } catch (error) {
        console.log('Polling error:', error);

        if (error.response?.status === 401) {
          clearSession();
          displayToast('Session expired. Please generate a new email.');
        } else if (error.response?.status === 404) {
          console.log('No messages yet');
        }
      }
    };

    const intervalId = setInterval(pollingMessage, parseInt(autoRefresh || 10) * 1000);
    pollingMessage();

    return () => clearInterval(intervalId);
  }, [disposableEmail, autoRefresh]);

  // Generate new email
  const handleGenerateEmail = async () => {
    setIsLoader(true);
    try {
      const response = await axios.get('http://localhost:8000/generateEmail');
      console.log('Response:', response.data);

      if (response.data && response.data.email && response.data.encryptedData) {
        setDisposableEmail(response.data.email);
        localStorage.setItem('token', response.data.encryptedData);
        localStorage.setItem('emailAddress', response.data.email);
        
        setMessages([]);
        setFilteredMessages([]);
        localStorage.removeItem('emails');

        displayToast('Email generated successfully!');
        console.log('Email generated successfully');
      }
    } catch (error) {
      if (error.response?.status === 429) {
        displayToast(error.response.data.detail);
      } else if (error.response) {
        console.log('Error data:', error.response.data);
        console.log('Error status:', error.response.status);
        displayToast(error.response.data.detail || 'Failed to generate email');
      } else if (error.request) {
        console.log('Request error:', error.request);
        displayToast('Network error: Could not reach server');
      } else {
        console.log('Error:', error.message);
        displayToast(`Error: ${error.message}`);
      }
    } finally {
      setIsLoader(false);
    }
  };

  // Copy email to clipboard
  const handleCopyEmail = async () => {
    if (!disposableEmail) return;

    try {
      // Modern clipboard API
      await navigator.clipboard.writeText(disposableEmail);
      displayToast('Email copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = disposableEmail;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        displayToast('Email copied to clipboard!');
      } catch (fallbackError) {
        console.error('Failed to copy:', fallbackError);
        displayToast('Failed to copy email');
      }
    }
  };

  // Clear session
  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('emailAddress');
    localStorage.removeItem('emails');
    setDisposableEmail('');
    setMessages([]);
    setFilteredMessages([]);
    setSearchFilter('');
    displayToast('Session cleared');
  };

  return (
    <>
      <Navbar />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 shadow-lg flex items-center gap-3 animate-slide-up">
          <Check className="w-5 h-5 text-teal-400" />
          <span className="text-white text-sm">{toastMessage}</span>
          <button 
            onClick={() => setShowToast(false)} 
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 pt-24 md:pt-36 pb-20">
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 mb-6">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-xs font-medium text-teal-400">
              Trusted by 100K+ users
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Protect Your Privacy with <br />
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Disposable Email
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Generate temporary email addresses instantly. Keep your inbox clean
            and your identity safe from spam and trackers.
          </p>

          {/* Email Generator */}
          <div className="max-w-3xl mx-auto bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-lg shadow-teal-600/10">
            <div className="flex justify-between items-center mb-5">
              <span className="text-sm text-slate-400">Your temporary email</span>
              <select
                value={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.value)}
                className="bg-slate-800/80 border border-slate-700 text-slate-300 text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer"
              >
                <option value="">Auto Refresh</option>
                <option value="10">10 sec</option>
                <option value="20">20 sec</option>
                <option value="30">30 sec</option>
              </select>
            </div>

            <div className="relative mb-4">
              <input
                type="text"
                value={disposableEmail}
                readOnly
                placeholder="Click 'Generate' to create your temp email"
                className="w-full px-6 py-5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all cursor-pointer"
                onClick={(e) => e.target.select()}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGenerateEmail}
                disabled={isLoader}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-transform transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoader ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCwIcon className="w-5 h-5" />
                    Generate Email
                  </>
                )}
              </button>

              <button
                onClick={handleCopyEmail}
                disabled={!disposableEmail}
                className="px-6 py-4 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 disabled:cursor-not-allowed border border-slate-700 text-white rounded-xl font-semibold transition-transform flex items-center justify-center gap-2 hover:scale-[1.02] disabled:hover:scale-100"
              >
                <CopyIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Copy</span>
              </button>

              {disposableEmail && (
                <button
                  onClick={clearSession}
                  className="px-6 py-4 bg-slate-800 hover:bg-red-600/20 border border-slate-700 hover:border-red-500/50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-4 mt-12">
          {[
            { icon: Zap, text: "Instant Generation" },
            { icon: Lock, text: "No Registration" },
            { icon: Shield, text: "100% Anonymous" },
          ].map(({ icon: Icon, text }, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-full hover:border-slate-700 transition-all"
            >
              <Icon className="w-4 h-4 text-teal-400" />
              <span className="text-sm text-slate-300">{text}</span>
            </div>
          ))}
        </div>
      </section>

      <hr className="my-24 border-slate-800/70" />

      {/* Inbox Section */}
      <section className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-white">
            Inbox
            <span className="text-teal-400 ml-2 text-2xl">
              ({filteredMessages.length})
            </span>
          </h1>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search by subject, sender, or content..."
            className="w-full pl-12 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      {/* Table Container */}
      <section className="max-w-6xl mx-auto px-4 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl overflow-hidden mb-24">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/60 border-b border-slate-700">
              <tr>
                {["From", "Subject", "Time", "Body"].map((header, i) => (
                  <th
                    key={i}
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                  >
                    <div className="flex items-center gap-2 justify-start">
                      {header === "From" && <User className="w-4 h-4 text-teal-400" />}
                      {header === "Subject" && <Mail className="w-4 h-4 text-amber-400" />}
                      {header === "Time" && <Clock className="w-4 h-4 text-sky-400" />}
                      {header === "Body" && <FileText className="w-4 h-4 text-indigo-400" />}
                      <span className="text-slate-300">{header}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {filteredMessages.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-20 text-center"
                  >
                    <Mail className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-300 text-lg font-medium mb-1">
                      {messages.length === 0 ? "Your inbox is empty" : "No matching emails"}
                    </p>
                    <p className="text-slate-500 text-sm">
                      {messages.length === 0 
                        ? "New messages will appear here automatically" 
                        : "Try adjusting your search filter"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMessages.map((email, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-slate-800/30 transition-colors cursor-pointer ${
                      !email.read ? "bg-slate-800/20" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-teal-400" />
                        </div>
                        <div className="min-w-0">
                          <div
                            className={`text-sm font-medium truncate ${
                              !email.read ? "text-white" : "text-slate-300"
                            }`}
                          >
                            {email.from}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {!email.read && (
                          <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0"></span>
                        )}
                        <span
                          className={`text-sm truncate ${
                            !email.read
                              ? "text-white font-semibold"
                              : "text-slate-400"
                          }`}
                        >
                          {email.subject}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-400">
                        {new Date(email.date).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p
                        className="text-sm text-slate-300 truncate hover:text-white cursor-pointer"
                        title={email.message_body}
                      >
                        {email.message_body || "No content"}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <hr className="my-24 border-slate-800/70" />

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Pricing Plans
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Unlock advanced security and productivity features.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {/* Free */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-all shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                <Zap className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Free</h3>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">$0</span>
                <span className="text-slate-400">/month</span>
              </div>
              <p className="text-slate-400 mt-2">Perfect for casual use</p>
            </div>
            <button className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all mb-8 hover:scale-[1.02]">
              Get Started
            </button>
            <ul className="space-y-3 text-slate-300 text-sm">
              {[
                "1 temporary email",
                "Basic inbox access",
                "Email expiry: 1 hour",
                "No registration required",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-teal-400 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="bg-gradient-to-b from-teal-600/10 to-slate-900/60 border-2 border-teal-500 rounded-2xl p-8 relative md:scale-105 shadow-lg shadow-teal-500/20">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Pro</h3>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">$9</span>
                <span className="text-slate-400">/month</span>
              </div>
              <p className="text-slate-300 mt-2">For power users</p>
            </div>
            <button className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-teal-600/30 transition-all mb-8 hover:scale-[1.02]">
              Upgrade to Pro
            </button>
            <ul className="space-y-3 text-white text-sm">
              {[
                "Unlimited temp emails",
                "Advanced inbox features",
                "Email expiry: 24 hours",
                "Custom domains",
                "Auto-refresh inbox",
                "Priority support",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-teal-400 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Enterprise */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-all shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Enterprise</h3>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">$29</span>
                <span className="text-slate-400">/month</span>
              </div>
              <p className="text-slate-400 mt-2">For teams & businesses</p>
            </div>
            <button className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all mb-8 hover:scale-[1.02]">
              Contact Sales
            </button>
            <ul className="space-y-3 text-slate-300 text-sm">
              {[
                "Everything in Pro",
                "Team management",
                "Email expiry: Unlimited",
                "API access",
                "Analytics & reports",
                "Dedicated support",
                "SLA guarantee",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-teal-400 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-400 text-sm">
            All plans include 256-bit encryption and GDPR compliance
          </p>
        </div>
      </section>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}