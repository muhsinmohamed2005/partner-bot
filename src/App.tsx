import { Authenticator } from '@aws-amplify/ui-react';
import { useState } from 'react';
import { SelectField, TextField, Button, View, Flex } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { fetchAuthSession } from 'aws-amplify/auth';

import { ThemeProvider } from '@aws-amplify/ui-react';
import type { Theme } from '@aws-amplify/ui-react';

const theme: Theme = {
  name: 'partner-bot-finance-theme',
  tokens: {
    colors: {
      brand: {
        primary: {
          10: '#f4f5f7',
          80: '#1c2e4a',
          100: '#111d33',
        },
      },
      font: {
        primary: '#1a1a1a',
        secondary: '#5b6472',
      },
      border: {
        primary: '#6b7280',
      },
      background: {
        primary: '#faf7f0',
        secondary: '#f0ebe0',
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
  'CoStar Group, Inc.': 'CSGP'
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
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setAnswer(data.answer);

    } catch (err) {

      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');

    } finally {
      setLoading(false);
    }
  }

  return (
  <ThemeProvider theme={theme}>
    <Authenticator>
      {({ signOut, user }) => (
        <View padding="2rem" backgroundColor="background.primary">
          <p>Signed in as: {user?.signInDetails?.loginId}</p>
          <Button onClick={signOut} variation="primary" >Sign out</Button> 
          
          <Flex direction="column" gap="1.5rem"></Flex>
          <SelectField
            label="Company"                              

            value={company}                               
            onChange={(e) => setCompany(e.target.value)}   
          >
            <option value="">Select a company</option>     
            // The default/placeholder option; value="" matches the initial
            // useState('') so nothing appears "selected" until the user picks one.
            {Object.keys(COMPANIES).map((name) => (        
              <option key={name} value={name}>{name}</option>
            ))}
          </SelectField>

          <SelectField
            label="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">Select a year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </SelectField>

          <SelectField
            label="Period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="">Select a period</option>
            {PERIODS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </SelectField>

          <TextField
            label="Question"
            placeholder="Ask about the filing..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <Button onClick={handleSubmit} isLoading={loading} variation="primary">
            Ask
          </Button>

          {error && <View color="red">{error}</View>}
          {answer && <View padding="1rem">{answer}</View>}
          <View padding="2rem" backgroundColor="background.primary"></View>
        </View>
      )}
    </Authenticator>
  </ThemeProvider>
);
}

export default App;