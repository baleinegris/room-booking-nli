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
  onExplain,
}: Prediction) {
  const [value, setValue] = React.useState(0);
  const [explanation, setExplanation] = React.useState<boolean>(true);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

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
          <div>
            <h2 className="text-xl font-semibold">Explanation</h2>
            <p>Here will be the explanation for the prediction.</p>
          </div>
        </CustomTabPanel>
      </Box>
    </div>
  );
}
