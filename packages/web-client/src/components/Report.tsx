import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Prediction {
  group_name: string;
  event_title: string;
  event_description: string;
  rule: string;
  contradiction: number;
  entailment: number;
  neutral: number;
  decision: string;
  approval: string;
  onExplain?: () => void;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function Report({
  group_name,
  event_title,
  event_description,
  rule,
  contradiction,
  entailment,
  neutral,
  decision,
  approval,
}: Prediction) {
  const [value, setValue] = React.useState(0);
  const [explanation, setExplanation] = React.useState<boolean>(false);
  const [explanationImage, setExplanationImage] = React.useState<string | null>(null);

  // Cleanup blob URL when component unmounts or image changes
  React.useEffect(() => {
    return () => {
      if (explanationImage) {
        URL.revokeObjectURL(explanationImage);
      }
    };
  }, [explanationImage]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  async function onExplain(){
    const data = {
      group_name: group_name,
      event_title: event_title,
      event_description: event_description,
      rule: rule,
      focus_class: "contradiction",
    }
    
    try {
      const response = await fetch('http://localhost:4494/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        // Check if the response is an image
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.startsWith('image/')) {
          // Handle image response
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          setExplanationImage(imageUrl);
        } else {
          // Handle JSON response (fallback)
          const result = await response.json();
          console.log(result);
        }
        
        setExplanation(true);
        setValue(1);
      } else {
        console.error('Failed to fetch explanation:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching explanation:', error);
    }
  }

  return (
    <div className="bg-gray-200 p-4 rounded-lg shadow-md text-blac my-4">
      <h2 className="text-black text-lg font-bold">
        Report for {event_title} held by {group_name}
      </h2>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="Prediction" {...a11yProps(0)} />
            {explanation && <Tab label="Explanation" {...a11yProps(1)} />}
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <div className="bg-white p-4 rounded-lg shadow-md mt-4 text-black">
            <div>
              <h2 className="text-xl font-semibold">
                {event_title}
              </h2>
              <p>
                <strong>Group:</strong> {group_name}
              </p>
              <p>
                <strong>Description:</strong> {event_description}
              </p>
              <p>
                <strong>Rule:</strong> {rule}
              </p>
              <p>
                <strong>Contradiction:</strong> {contradiction}
              </p>
              <p>
                <strong>Entailment:</strong> {entailment}
              </p>
              <p>
                <strong>Neutral:</strong> {neutral}
              </p>
              <p>
                <strong>Decision:</strong> {decision}
              </p>
              <p>
                <strong>Approval:</strong> {approval}
              </p>
            </div>
            <button 
              onClick={onExplain}
              className="bg-green-500 text-white p-2 rounded mt-2"
            >
              Explain
            </button>
          </div>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-black mb-4">Explanation</h2>
            {explanationImage ? (
              <div className="flex flex-col items-center">
                <img 
                  src={explanationImage} 
                  alt="Explanation visualization" 
                  className="max-w-full h-auto rounded-lg shadow-md"
                />
                <p className="text-gray-600 mt-2 text-sm">
                  Visualization showing the model's reasoning for the prediction
                </p>
              </div>
            ) : (
              <p className="text-gray-500">
                Click "Explain" to generate a visualization of the model's reasoning.
              </p>
            )}
          </div>
        </CustomTabPanel>
      </Box>
    </div>
  );
}
