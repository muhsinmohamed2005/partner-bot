import { Authenticator } from '@aws-amplify/ui-react';
import { useState } from 'react';
import { SelectField, TextField, Button, View } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { fetchAuthSession } from 'aws-amplify/auth'; // brings in the function that fetches the signed-in user's tokens

// the language is TypeScript, the syntax style (<div>Hello</div>) is JSX (a React grammar),
// and the specific tags <SelectField> etc. are Amplify UI's components — one layer of
// library sitting on top of React's underlying mechanism, the same way Pandas
// sits on top of Python without being Python itself.

const COMPANIES: Record<string, string> = {
  'Apple': 'AAPL',
  'Microsoft': 'MSFT',
  'Amazon': 'AMZN',
};

const PERIODS = ['Q1', 'Q2', 'Q3', 'Q4', 'FY'];

const YEARS = [2023, 2024, 2025, 2026];

// A "component": a function that returns JSX (UI structure). Whatever "App()"" returns
// gets painted onto the actual webpage, via main.tsx's render(<App />) call.
function App() {
  const [company, setCompany] = useState(''); // company = current value, setCompany(x) = "update the value to x and re-render."
  const [year, setYear] = useState('');
  const [period, setPeriod] = useState('');
  const [question, setQuestion] = useState('');


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');

  async function handleSubmit() {  // "async" lets this function use "await" to pause on slow operations
    setLoading(true);              // flips loading state to true, triggers re-render showing the spinner
    setError('');                  // clears any leftover error message from a previous attempt
    setAnswer('');                 // clears any leftover answer from a previous attempt

    const requestBody = {
      question,                          // shorthand for question: question — current question state
      ticker: COMPANIES[company],        // looks up selected name in COMPANIES to get its ticker (e.g. "Apple" -> "AAPL")
      year: Number(year),                // converts year from a string (what <select> gives you) into a number
      period,                            // shorthand for period: period — the selected Q1/Q2/Q3/Q4/FY value
    };

    console.log('Request body:', requestBody);  // prints the built request to console, useful for debugging

    try {  // attempt the risky network call; jump to catch below if anything throws
      const session = await fetchAuthSession();          // asks Amplify for the current signed-in user's session/tokens
      const idToken = session.tokens?.idToken?.toString(); // pulls out the ID token specifically, converted to its JWT string form
      const response = await fetch(import.meta.env.VITE_INFERENCE_API, {  // sends the real POST to API Gateway
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
          // NEW — attaches the real JWT. "Bearer" prefix is the standard
          // convention API Gateway's JWT authorizer expects.
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();  // parses the response body (raw text) into a usable JS object

      if (!response.ok) {                              // response.ok is false for any non-2xx status; !response.ok = !false = true
        throw new Error(data.error || 'Request failed'); // manually triggers catch, using Lambda's own error message
      }

      setAnswer(data.answer);  // stores the real Claude-generated answer into state, renders it on screen

    } catch (err) {  // runs if fetch failed outright, or if we manually threw an error above

      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      // stores a user-facing error message — real error text if available, otherwise a generic fallback

    } finally {
      setLoading(false);  // always runs regardless of outcome — turns off the loading spinner
    }
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <View padding="2rem">
          <p>Signed in as: {user?.signInDetails?.loginId}</p>
          <Button onClick={signOut}>Sign out</Button>

          <SelectField
            label="Company"                              
            // "Company" — just the visible text label shown above the dropdown, purely cosmetic

            value={company}                               
            // Tells React: "this dropdown's displayed selection should always match
            // whatever is currently stored in the `company` state variable."
            // This is what makes it a "controlled" input — the DOM doesn't own the
            // value, our state does. If `company` is "", it shows the placeholder;
            // if `company` becomes "Apple", it displays "Apple".
            onChange={(e) => setCompany(e.target.value)}   
            // Runs every time the user picks a different option.
            // `e` = the raw browser "change event" object.
            // `e.targrighet` = the actual <select> DOM element that fired the event.
            // `e.target.value` = whatever option string is now selected (e.g. "Apple").
            // `setCompany(...)` stores that string into React state AND triggers
            // App() to re-run/re-render with the new value.
          >
            <option value="">Select a company</option>     
            // The default/placeholder option; value="" matches the initial
            // useState('') so nothing appears "selected" until the user picks one.
            {Object.keys(COMPANIES).map((name) => (        
              // COMPANIES is our name→ticker lookup object, e.g. { "Apple": "AAPL" }.
              // Object.keys(COMPANIES) pulls out just the names: ["Apple", "Microsoft", "Amazon"].
              // .map(...) loops over that array and transforms each name into
              // one JSX <option> element — this is how we generate a list of
              // options from data, instead of hand-typing three separate <option> tags.
              <option key={name} value={name}>{name}</option>
              // key={name} — React requires a unique identifier on every item
              // in a list, so it can track which option is which across re-renders.
              // value={name} — what gets read by e.target.value if this option is picked.
              // {name} (inside the tags) — the actual visible text shown in the dropdown.
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

          <Button onClick={handleSubmit} isLoading={loading}>
            Ask
          </Button>

          {error && <View color="red">{error}</View>}
          {answer && <View padding="1rem">{answer}</View>}
        </View>
      )}
    </Authenticator>
  );
}

export default App;

// TRACE: click "Ask" → answer appears
// 1. handleSubmit() runs: setLoading(true) → re-render, button shows spinner
// 2. requestBody built from current state (company/year/period/question)
// 3. console.log fires, request body printed
// 4. await pauses 1000ms (fake delay, stands in for a real network call)
// 5. setAnswer(...) stores the stub text → re-render, <View> shows the answer
// 6. finally block: setLoading(false) → re-render, spinner turns off