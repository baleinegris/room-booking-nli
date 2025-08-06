interface InputFieldTextProps {
    label: string;
    name: string;
    placeholder: string;
}

export default function InputFieldText({ label, name, placeholder }: InputFieldTextProps) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md mr-4 text-black">
            <div>{label}</div>
            <input
                type="text"
                placeholder={placeholder}
                className="flex-grow mr-2 p-2 rounded border w-full"
                name={name}
            />
        </div>
    )
}
