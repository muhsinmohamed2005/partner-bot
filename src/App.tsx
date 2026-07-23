import { useState } from 'react';
import { SelectField, TextField, Button, View } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

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

  // ERROR — goes right after your existing useState lines, still inside App(),
  // still before the `return`.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');

  // ERROR — the handler function. Also inside App(), after all useState lines,
  // still before `return`. Order among these doesn't matter (state vs function),
  // just needs to be inside App() and before return.
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
      // "Attempt this code. If anything inside throws an error, don't crash —
      // jump straight to the catch block instead." Same as Python's try/except.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // new Promise(...) creates a "this will finish later" placeholder.
      // setTimeout(resolve, 1000) tells the browser: "after 1000ms, call resolve()"
      // — resolve is what marks the Promise as "done."
      // `await` pauses this function (only this function, not the whole page)
      // until that Promise resolves — i.e., pause for 1 real second.
      // This whole line exists ONLY to fake a network delay for the stub;
      // once we call the real Lambda next module, this line gets deleted
      // and replaced with an actual `await fetch(...)` call.
      setAnswer(`Stub response for ${requestBody.ticker} ${requestBody.period} ${requestBody.year}: [placeholder answer]`);
      // Runs only if the line above succeeded (didn't throw).
      // Backticks `...` = a "template literal" — JS's version of an f-string.
      // ${requestBody.ticker} etc. get substituted with their actual values,
      // e.g. "Stub response for AAPL Q2 2024: [placeholder answer]"
      // setAnswer(...) stores that string in state, which re-renders the
      // component so the answer <View> now shows this text.

    } catch (err) {
      // Only runs if something inside `try` threw an error.
      // `err` holds whatever the error was (unused here, but Amplify/JS
      // convention is to capture it in case you want to log/inspect it).
      setError('Something went wrong. Please try again.');
      // Stores a user-facing error message, which makes the
      // {error && <View color="red">{error}</View>} line render.
    } finally {
      // Runs no matter what — whether try succeeded or catch fired.
      // Used here to guarantee the loading spinner always turns off,
      // even if something failed. Without `finally`, a thrown error could
      // leave `loading` stuck as `true` forever, freezing the button.
      setLoading(false);
    }
  }

  return (
    <View padding="2rem">
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
        // `e.target` = the actual <select> DOM element that fired the event.
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