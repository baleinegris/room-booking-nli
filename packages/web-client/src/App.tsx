import './App.css'
import InputFieldText from './components/InputFieldText'
import InputFieldSelect from './components/InputFieldSelect'

function App() {

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <>
      <div className="bg-blue-900 p-4 rounded-lg">
        <h1 className="text-3xl font-bold">Uoft Room Booking Escalator</h1>
      </div>
      <form onSubmit={handleSearch} className="flex bg-gray-200 p-4 rounded-lg mt-4">
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
          options={['Rule 1', 'Rule 2', 'Rule 3']}
      />
      <button type='submit'className="bg-blue-500 text-white p-2 rounded">
        Search
      </button>
      </form>
    </>
  )
}

export default App
