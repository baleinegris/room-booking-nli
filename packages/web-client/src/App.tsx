import { useState } from 'react'
import './App.css'
import InputFieldText from './components/InputFieldText'
import InputFieldSelect from './components/InputFieldSelect'
import Report from './components/Report'
import { rules } from './assets/rules'

interface Prediction{
  group_name: string;
  event_title: string;
  event_description: string;
  rule: string;
  contradiction: number;
  entailment: number;
  neutral: number;
  decision: string;
  approval: string;
}

function App() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  async function handlePredict(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      group_name: formData.get('group_name'),
      event_title: formData.get('event_title'),
      event_description: formData.get('event_description'),
      rule: formData.get('rule'),
      should_satisfy_rule: formData.get('should_satisfy_rule'),
    };
    const backendUrl = 'http://localhost:4494/predict'; // Adjust the URL as needed
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.error('Error:', response.statusText);
      return;
    }
    const result = await response.json();
    let approval: string;
    if (data.should_satisfy_rule === 'No' && result.decision !== 'contradiction') {
      approval = 'No';
    } else if (data.should_satisfy_rule === 'Yes' && result.decision !== 'entailment') {
      approval = 'No';
    } else {
      approval = 'Yes';
    }
    const newPrediction: Prediction = {
      group_name: data.group_name as string,
      event_title: data.event_title as string,
      event_description: data.event_description as string,
      rule: data.rule as string,
      contradiction: result.contradiction,
      entailment: result.entailment,
      neutral: result.neutral,
      decision: result.decision,
      approval: approval
    };
    setPredictions(prev => [...prev, newPrediction]);
  }

  async function handleExplain(prediction: Prediction) {
    const backendUrl = 'http://localhost:4494/explain'; // Adjust the URL as needed
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        group_name: prediction.group_name,
        event_title: prediction.event_title,
        event_description: prediction.event_description,
        rule: prediction.rule,
        focus_class: prediction.decision === 'contradiction' ? 'entailment' : 'contradiction',
      }),
    });
    if (!response.ok) {
      console.error('Error:', response.statusText);
      return;
    }
  }

  return (
    <>
      <div className="bg-blue-900 p-4 rounded-lg">
        <h1 className="text-3xl font-bold">Uoft Room Booking Escalation predictor</h1>
      </div>
      <form onSubmit={handlePredict} className="flex bg-gray-200 p-4 rounded-lg mt-4">
      <InputFieldText
          label="Group Name"
          name="group_name"
          placeholder="Enter group name"
      />
      <InputFieldText
          label="Event Title"
          name="event_title"
          placeholder="Enter event title"
      />
      <InputFieldText
          label="Event Description"
          name="event_description"
          placeholder="Enter event description"
      />
      <InputFieldSelect
          label="Rule"
          name="rule"
          options={rules}
      />
      <InputFieldSelect
          label="Should satisfy rule?"
          name="should_satisfy_rule"
          options={['Yes', 'No']}
      />
      <button type='submit'className="bg-blue-500 text-white p-2 rounded">
        Predict
      </button>
      </form>
      {predictions.map((prediction, index) => (
        <Report key={index} {...prediction} />
      ))}
    </>
  )
}

export default App
