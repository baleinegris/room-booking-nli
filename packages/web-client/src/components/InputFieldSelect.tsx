interface InputFieldSelectProps {
    label: string;
    name: string;
    options: string[];
}

export default function InputFieldSelect({ label, name, options }: InputFieldSelectProps) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md mr-4 text-black">
            <div>{label}</div>
            <select name={name} id={name}>
                <option value="">Select an option</option>
                {options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
        </div>
    )
}