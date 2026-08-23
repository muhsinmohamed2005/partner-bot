import { Authenticator } from '@aws-amplify/ui-react';
import { useState } from 'react';
import { SelectField, TextField } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { fetchAuthSession } from 'aws-amplify/auth';

import { ThemeProvider } from '@aws-amplify/ui-react';
import type { Theme } from '@aws-amplify/ui-react';
import ReactMarkdown from 'react-markdown';

import './App.css';

const theme: Theme = {
  name: 'partner-bot-finance-theme',
  tokens: {
    colors: {
      brand: {
        primary: {
          10: 'rgba(212, 168, 87, 0.14)',
          80: '#d4a857',
          100: '#e8c384',
        },
      },
      font: {
        primary: '#f3efe6',
        secondary: '#a9b3c4',
      },
      border: {
        primary: 'rgba(255, 255, 255, 0.16)',
      },
      background: {
        primary: 'rgba(255, 255, 255, 0.04)',
        secondary: '#1c2f47',
      },
    },
    fonts: {
      default: {
        variable: { value: "'Inter', -apple-system, sans-serif" },
        static: { value: "'Inter', -apple-system, sans-serif" },
      },
    },
    radii: {
      small: '4px',
      medium: '6px',
    },
    space: {
      medium: '1.25rem',
      large: '2rem',
    },
  },
};

const COMPANIES: Record<string, string> = {
  'Dell Technologies Inc.': 'DELL',
  'Alphabet Inc.': 'GOOGL',
  'American Express Co.': 'AXP',
  'CoStar Group, Inc.': 'CSGP',
};

const PERIODS = ['Q1', 'Q2', 'Q3', 'Q4', 'FY'];

const YEARS = [2023, 2024, 2025, 2026];

function App() {
  const [company, setCompany] = useState('');
  const [year, setYear] = useState('');
  const [period, setPeriod] = useState('');
  const [question, setQuestion] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');

  async function handleSubmit() {
    setLoading(true);
    setError('');
    setAnswer('');

    const requestBody = {
      question,
      ticker: COMPANIES[company],
      year: Number(year),
      period,
    };

    console.log('Request body:', requestBody);

    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      const response = await fetch(import.meta.env.VITE_INFERENCE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

    function cleanAnswer(text: string) {
      return text
        // drop entire metadata blocks (tag + content) — this is
        // pipeline metadata, not something the reader should ever see
        .replace(/<document_metadata>[\s\S]*?<\/document_metadata>/gi, '')
        // for any other stray tag, strip just the markers, keep the text inside
        // (covers <analysis>, <thinking>, etc. if they ever slip through again)
        .replace(/<\/?[a-zA-Z_][\w:-]*\/?>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      }
      
      setAnswer(cleanAnswer(data.answer));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="pb-shell">
        <Authenticator>
          {({ signOut, user }) => (
            <div className="pb-card">
              <div className="pb-header">
                <span className="pb-brand">Partner Bot</span>
                <div className="pb-meta">
                  <span className="pb-signedin">{user?.signInDetails?.loginId}</span>
                  <button className="pb-signout" onClick={signOut} type="button">
                    Sign out
                  </button>
                </div>
              </div>

              <h1 className="pb-title">Ask the filing.</h1>
              <p className="pb-subtitle">
                Pick a company, year, and period, then ask a plain-language question about the filing.
              </p>

              <div className="pb-field pb-field-inline">
                <SelectField
                  label="Company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                >
                  <option value="">Select a company</option>
                  {/* Placeholder option: value="" matches the initial useState('')
                      so nothing appears "selected" until the user picks one. */}
                  {Object.keys(COMPANIES).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </SelectField>
                {company && <span className="pb-ticker">{COMPANIES[company]}</span>}
              </div>

              <div className="pb-field">
                <SelectField
                  label="Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  <option value="">Select a year</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div className="pb-field">
                <SelectField
                  label="Period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="">Select a period</option>
                  {PERIODS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div className="pb-field">
                <TextField
                  label="Question"
                  placeholder="Ask about the filing..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

              <button className="pb-ask" onClick={handleSubmit} disabled={loading} type="button">
                {loading ? 'Asking…' : 'Ask'}
              </button>

              {error && <div className="pb-error">{error}</div>}
              {answer && (
                <div className="pb-answer">
                  <span className="pb-answer-label">Response</span>
                  <div className="pb-answer-text">
                    <ReactMarkdown>{answer}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </Authenticator>
      </div>
    </ThemeProvider>
  );
}

export default App;